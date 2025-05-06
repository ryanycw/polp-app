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
  const [loadingEmails, setLoadingEmails] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Helper to check if session and accessToken are valid
  const isSessionValid = () =>
    status === "authenticated" &&
    session &&
    typeof session.accessToken === "string" &&
    session.accessToken.length > 0;

  const fetchEmails = async () => {
    setLoadingEmails(true);
    setError(null);

    // Check session validity before querying
    if (!isSessionValid()) {
      setLoadingEmails(false);
      setEmails([]);
      setError("Session expired or invalid. Please sign in again.");
      return;
    }

    const res = await fetch(`/api/email?eventName=${encodeURIComponent(event.name)}`);
    if (res.status === 401) {
      setLoadingEmails(false);
      setEmails([]);
      setError("Session expired or invalid. Please sign in again.");
      // Optionally, sign out to clear session
      await signOut({ redirect: false });
      return;
    }
    const data = await res.json();
    setEmails(data.emails || []);
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
                  onClick={fetchEmails}
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
            <p className="text-xs text-muted-foreground mb-3">
              <strong>Note</strong> – If you select to create the proofs remotely, your emails will be sent to our secured service for proof generation. Emails will be deleted once the proofs are generated
            </p>
            <div className="overflow-x-auto">
              {loadingEmails && <div>Loading emails...</div>}
              {error && (
                <div className="text-red-600 my-2">
                  {error}
                  <Button onClick={() => signIn("google")}>Sign in again</Button>
                </div>
              )}
              {emails.length === 0 ? (
                <div className="text-center py-4">No emails found.</div>
              ) : (
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="px-2 py-2 text-left">Sent on</th>
                      <th className="px-2 py-2 text-left">Subject</th>
                    </tr>
                  </thead>
                  <tbody>
                    {emails.map((email: any) => (
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
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            {/* Optionally, add a "Load More Emails" button */}
            <div className="flex justify-center mt-4">
              <button
                className="flex items-center gap-2 text-muted-foreground hover:underline"
                // onClick={handleLoadMore}
                disabled
              >
                <span className="animate-spin">⟳</span> Load More Emails
              </button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
} 