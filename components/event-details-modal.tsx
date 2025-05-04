import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ExternalLink, Copy, Mail } from "lucide-react"
import type { LumaEvent } from "@/types/luma-event"
import { useState } from "react"

interface EventDetailsModalProps {
  event: LumaEvent
  isOpen: boolean
  onClose: () => void
}

export function EventDetailsModal({ event, isOpen, onClose }: EventDetailsModalProps) {
  const [copied, setCopied] = useState(false)
  const emailQuery = `from:mail.anthropic.com`

  const handleCopy = () => {
    navigator.clipboard.writeText(emailQuery)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
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
        <div className="mt-8 p-6 rounded-lg border bg-muted/40">
          <h2 className="text-lg font-semibold mb-1">Connect emails</h2>
          <p className="text-sm text-muted-foreground mb-1">Connect your Gmail or upload an .eml file</p>
          <p className="text-xs text-muted-foreground mb-3"><strong>Note:</strong> All email processing occurs locally on your device. We never receive or store your email data.</p>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm font-mono bg-muted px-2 py-1 rounded">Email Query: <span className="text-black/80">{emailQuery}</span></span>
            <Button size="icon" variant="ghost" onClick={handleCopy} title="Copy email query">
              <Copy className="h-4 w-4" />
            </Button>
            {copied && <span className="text-xs text-green-600 ml-1">Copied!</span>}
          </div>
          <Button className="w-full flex items-center justify-center gap-2 bg-black hover:bg-neutral-800 text-white">
            <Mail className="h-5 w-5" />
            Connect Gmail Account
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
} 