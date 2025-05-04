import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { LumaEvent } from "@/types/luma-event"
import { useState } from "react"
import { EventDetailsModal } from "./event-details-modal"

export function LumaEventCard({ event }: { event: LumaEvent }) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <Card className="flex flex-col h-full">
        <div className="relative h-32 bg-muted rounded-t-lg overflow-hidden">
          {event.cover_url && (
            <img src={event.cover_url} alt={event.name} className="w-full h-full object-cover" />
          )}
        </div>
        <CardHeader className="pb-2">
          <CardTitle className="line-clamp-2 text-base">{event.name}</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-sm text-muted-foreground">
            {new Date(event.start_at).toLocaleDateString()}
          </div>
        </CardContent>
        <CardContent className="pt-0">
          <Button onClick={() => setIsModalOpen(true)} className="w-full">
            View Details
          </Button>
        </CardContent>
      </Card>
      <EventDetailsModal 
        event={event} 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  )
}
