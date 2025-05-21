"use client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ExternalLink, Mail } from "lucide-react"
import type { LumaEvent } from "@/types/luma-event"
import { useState, useEffect } from "react"
import { signIn, signOut, useSession } from "next-auth/react"
import zkeSDK from "@zk-email/sdk"
import { useToast } from "@/components/ui/use-toast"
import { QRCodeSVG } from 'qrcode.react'

interface EventDetailsModalProps {
  event: LumaEvent
  isOpen: boolean
  onClose: () => void
}

export function EventDetailsModal({ event, isOpen, onClose }: EventDetailsModalProps) {
  const { data: session, status } = useSession()
  const [emails, setEmails] = useState<any[]>([]);
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);
  const [loadingEmails, setLoadingEmails] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatingProof, setGeneratingProof] = useState<string | null>(null);
  const [poapMintLink, setPoapMintLink] = useState<string | null>(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const { toast } = useToast();
  
  // Helper to check if session and accessToken are valid
  const isSessionValid = () =>
    status === "authenticated" &&
    session &&
    typeof session.accessToken === "string" &&
    session.accessToken.length > 0;

  const fetchEmails = async (pageToken?: string) => {
    setLoadingEmails(true);
    setError(null);

    if (!isSessionValid()) {
      setLoadingEmails(false);
      setEmails([]);
      setError("Session expired or invalid. Please sign in again.");
      return;
    }

    const url = `/api/email?eventName=${encodeURIComponent(event.name)}${pageToken ? `&pageToken=${pageToken}` : ""}`;
    const res = await fetch(url);
    if (res.status === 401) {
      setLoadingEmails(false);
      setEmails([]);
      setError("Session expired or invalid. Please sign in again.");
      await signOut({ redirect: false });
      return;
    }
    const data = await res.json();
    if (pageToken) {
      setEmails((prev) => [...prev, ...(data.emails || [])]);
    } else {
      setEmails(data.emails || []);
    }
    setNextPageToken(data.nextPageToken || null);
    setLoadingEmails(false);
  };

  useEffect(() => {
    if (isOpen && isSessionValid()) {
      fetchEmails();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, isOpen, event.name]);

  const handleSignIn = async () => {
    await signIn("google");
  }

  const handleLoadMore = () => {
    if (nextPageToken) {
      fetchEmails(nextPageToken);
    }
  };

  const handleGenerateProof = async (email: any) => {
    if (!email.raw) {
      toast({
        title: "Error",
        description: "Email raw data not available",
        variant: "destructive",
      });
      return;
    }

    setGeneratingProof(email.id);
    try {
      const sdk = zkeSDK();
      const blueprint = await sdk.getBlueprint("ryanycw/real_world_zk@v1");
      const prover = blueprint.createProver();
      
      // Generate the proof
      const proof = await prover.generateProof(email.raw);
      
      // Verify the proof off chain
      const verification = await blueprint.verifyProof(proof);
      
      if (verification) {
        if (!event.poap_mint_link) {
          throw new Error('POAP mint link not found for this event');
        }
        setPoapMintLink(event.poap_mint_link);
        setShowQRModal(true);
        
        toast({
          title: "Success",
          description: "Proof generated and verified successfully",
        });
      } else {
        toast({
          title: "Error",
          description: "Proof verification failed",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error generating proof:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate proof",
        variant: "destructive",
      });
    } finally {
      setGeneratingProof(null);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{event.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="relative h-48 bg-muted rounded-lg overflow-hidden">
              {event.cover_url && (
                <img src={event.cover_url} alt={event.name} className="w-full h-full object-cover" />
              )}
            </div>
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">
                <strong>Start:</strong> {new Date(event.start_at).toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">
                <strong>End:</strong> {new Date(event.end_at).toLocaleString()}
              </div>
            </div>
            <Button asChild variant="outline" className="w-full">
              <a href={`https://lu.ma/${event.slug}`} target="_blank" rel="noopener noreferrer">
                View on Luma <ExternalLink className="ml-2 h-4 w-4" />
              </a>
            </Button>
            {poapMintLink && (
              <div className="mt-4 p-4 border rounded-lg bg-muted/40">
                <h3 className="text-lg font-semibold mb-2">Claim Your POAP</h3>
                <div className="flex flex-col items-center gap-4">
                  <QRCodeSVG value={poapMintLink} size={200} />
                  <p className="text-sm text-muted-foreground text-center">
                    Scan this QR code to claim your POAP
                  </p>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => window.open(poapMintLink, '_blank')}
                  >
                    Open Mint Link <ExternalLink className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
          {/* Connect emails section */}
          {status !== "authenticated" && (
            <div className="mt-8 p-6 rounded-lg border bg-muted/40">
              <h2 className="text-lg font-semibold mb-1">Connect emails</h2>
              <p className="text-xs text-muted-foreground mb-3"><strong>Note:</strong> All email processing occurs locally on your device. We never receive or store your email data.</p>
              <Button
                className="w-full flex items-center justify-center gap-2 bg-black hover:bg-neutral-800 text-white"
                onClick={handleSignIn}
              >
                <Mail className="h-5 w-5" />
                Connect Gmail Account
              </Button>
            </div>
          )}
          {status === "authenticated" && (
            <div className="mt-8">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold">Select Emails</span>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => fetchEmails()}
                    disabled={loadingEmails}
                    className="flex items-center gap-1"
                  >
                    {loadingEmails ? (
                      <span className="animate-spin mr-1">⟳</span>
                    ) : (
                      <span className="mr-1">⟳</span>
                    )}
                    Refresh
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => signOut()}
                  >
                    Disconnect Gmail
                  </Button>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-1">
                Choose the emails you want to create proofs for.
              </p>
              {/* <p className="text-xs text-muted-foreground mb-3">
                <strong>Note</strong> – If you select to create the proofs remotely, your emails will be sent to our secured service for proof generation. Emails will be deleted once the proofs are generated
              </p> */}
              <div className="overflow-x-auto min-w-[350px] min-h-[120px] mt-4">
                <table className="min-w-full text-sm table-fixed">
                  <colgroup>
                    <col style={{ width: "30%" }} />
                    <col style={{ width: "50%" }} />
                    <col style={{ width: "20%" }} />
                  </colgroup>
                  <thead>
                    <tr className="border-b">
                      <th className="px-2 py-2 text-left">Sent on</th>
                      <th className="px-2 py-2 text-left">Subject</th>
                      <th className="px-2 py-2 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingEmails ? (
                      <tr>
                        <td colSpan={3} className="py-2 text-center text-muted-foreground" style={{ height: 48 }}>
                          Loading emails...
                        </td>
                      </tr>
                    ) : error ? (
                      <tr>
                        <td colSpan={3} className="py-4 text-center text-red-600">
                          {error}
                          <div>
                            <Button onClick={() => signIn("google")}>Sign in again</Button>
                          </div>
                        </td>
                      </tr>
                    ) : emails.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="text-center py-4">No emails found.</td>
                      </tr>
                    ) : (
                      emails.map((email: any) => (
                        <tr key={email.id} className="border-b">
                          <td className="px-2 py-2 whitespace-nowrap">
                            {email.date
                              ? new Date(email.date).toLocaleDateString() +
                                " " +
                                new Date(email.date).toLocaleTimeString()
                              : ""}
                          </td>
                          <td className="px-2 py-2">{email.subject}</td>
                          <td className="px-2 py-2 text-center">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleGenerateProof(email)}
                              disabled={generatingProof === email.id}
                            >
                              {generatingProof === email.id ? "Generating..." : "Prove"}
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              {/* Optionally, add a "Load More Emails" button */}
              {nextPageToken && emails.length >= 1 && (
                <div className="flex justify-center mt-4">
                  <button
                    className="flex items-center gap-2 text-muted-foreground hover:underline"
                    onClick={handleLoadMore}
                    disabled={loadingEmails}
                  >
                    {loadingEmails ? <span className="animate-spin">⟳</span> : <span>⟳</span>} Load More Emails
                  </button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* QR Code Modal */}
      <Dialog open={showQRModal} onOpenChange={setShowQRModal}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Claim Your POAP</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-6 py-4">
            {poapMintLink && (
              <>
                <div className="p-4 bg-white rounded-lg">
                  <QRCodeSVG value={poapMintLink} size={200} />
                </div>
                <p className="text-sm text-muted-foreground text-center">
                  Scan this QR code to claim your POAP
                </p>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => window.open(poapMintLink, '_blank')}
                >
                  Open Mint Link <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
} 