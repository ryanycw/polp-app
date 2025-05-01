import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { AddEventModal } from "./components/add-event-modal"
import { EventCard } from "./components/event-card"
import { createClient } from "@/utils/supabase/client"

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: events } = await supabase
    .from("luma_events")
    .select("*")
    .order("created_at", { ascending: false })

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Luma Events</h1>
        <AddEventModal>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Event
          </Button>
        </AddEventModal>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events?.map((event) => (
          <EventCard key={event.id} eventLink={event.event_link} />
        ))}
      </div>
    </div>
  )
} 