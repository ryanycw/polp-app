"use client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ExternalLink, Mail } from "lucide-react"
import type { LumaEvent } from "@/types/luma-event"
import { useState, useEffect } from "react"
import { signIn, signOut, useSession } from "next-auth/react"

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

  return (
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
                  <col style={{ width: "40%" }} />
                  <col style={{ width: "60%" }} />
                </colgroup>
                <thead>
                  <tr className="border-b">
                    <th className="px-2 py-2 text-left">Sent on</th>
                    <th className="px-2 py-2 text-left">Subject</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingEmails ? (
                    <tr>
                      <td colSpan={2} className="py-2 text-center text-muted-foreground" style={{ height: 48 }}>
                        Loading emails...
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan={2} className="py-4 text-center text-red-600">
                        {error}
                        <div>
                          <Button onClick={() => signIn("google")}>Sign in again</Button>
                        </div>
                      </td>
                    </tr>
                  ) : emails.length === 0 ? (
                    <tr>
                      <td colSpan={2} className="text-center py-4">No emails found.</td>
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
  )
} 