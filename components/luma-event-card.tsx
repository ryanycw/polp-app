import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { LumaEvent } from "@/types/luma-event"
import { ExternalLink } from "lucide-react"

export function LumaEventCard({ event }: { event: LumaEvent }) {
  return (
    <Card className="flex flex-col h-full">
      <div className="relative h-40 bg-muted">
        {event.cover_url && (
          <img src={event.cover_url} alt={event.name} className="w-full h-full object-cover" />
        )}
      </div>
      <CardHeader>
        <CardTitle>{event.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-muted-foreground">
          {new Date(event.start_at).toLocaleString()} - {new Date(event.end_at).toLocaleString()}
        </div>
      </CardContent>
      <CardFooter>
        <Button asChild variant="outline" className="w-full">
          <a href={`https://lu.ma/${event.slug}`} target="_blank" rel="noopener noreferrer">
            View on Luma <ExternalLink className="ml-2 h-4 w-4" />
          </a>
        </Button>
      </CardFooter>
    </Card>
  )
}
