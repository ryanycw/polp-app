import { CalendarDays, Clock, ExternalLink, MapPin } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { LumaEvent } from "@/types/luma-event"

interface LumaEventCardProps {
  event: LumaEvent
}

export function LumaEventCard({ event }: LumaEventCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const formatTime = (startDate: string, endDate: string) => {
    const start = new Date(startDate)
    const end = new Date(endDate)

    return `${start.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })} - ${end.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })}`
  }

  return (
    <Card className="overflow-hidden flex flex-col h-full">
      <div className="relative h-40 bg-muted">
        {event.image_url ? (
          <img src={event.image_url || "/placeholder.svg"} alt={event.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-purple-100 to-pink-100">
            <span className="text-lg font-medium text-muted-foreground">{event.title.substring(0, 1)}</span>
          </div>
        )}
      </div>
      <CardHeader className="pb-2">
        <CardTitle className="line-clamp-1">{event.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 flex-grow">
        <div className="flex items-center text-sm text-muted-foreground">
          <CalendarDays className="mr-2 h-4 w-4" />
          <span>{formatDate(event.start_date)}</span>
        </div>
        {event.location && (
          <div className="flex items-center text-sm text-muted-foreground">
            <MapPin className="mr-2 h-4 w-4" />
            <span className="line-clamp-1">{event.location}</span>
          </div>
        )}
        {event.start_date && event.end_date && (
          <div className="flex items-center text-sm text-muted-foreground">
            <Clock className="mr-2 h-4 w-4" />
            <span>{formatTime(event.start_date, event.end_date)}</span>
          </div>
        )}
        {event.description && <p className="text-sm text-muted-foreground line-clamp-2 mt-2">{event.description}</p>}
      </CardContent>
      <CardFooter className="pt-2">
        {event.event_link ? (
          <Button variant="outline" className="w-full" asChild>
            <a href={event.event_link} target="_blank" rel="noopener noreferrer">
              View on Luma
              <ExternalLink className="ml-2 h-4 w-4" />
            </a>
          </Button>
        ) : (
          <Button variant="outline" className="w-full">
            View Details
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
