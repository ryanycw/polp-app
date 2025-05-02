"use client"

import { useState, useEffect } from "react"
import { PlusCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LumaEventCard } from "@/components/luma-event-card"
import { AddEventModal } from "@/components/add-event-modal"
import { createClient } from "@/lib/supabase/client"
import type { LumaEvent } from "@/types/luma-event"

export function EventDashboard() {
  const [lumaEvents, setLumaEvents] = useState<LumaEvent[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    fetchLumaEvents()
  }, [])

  async function fetchLumaEvents() {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('luma_events')
        .select('*')
        .order('created_at', { ascending: false }) as { data: LumaEvent[] | null; error: any }

      if (error) {
        console.error("Error fetching luma events:", error)
        return
      }

      setLumaEvents(data || [])
    } catch (error) {
      console.error("Error fetching luma events:", error)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleAddEvent(newEvent: any) {
    try {
      const { data, error } = await supabase
        .from('luma_events')
        .insert([
          {
            title: newEvent.title,
            description: newEvent.description,
            start_date: new Date(newEvent.event_date).toISOString(),
            end_date: new Date(newEvent.event_date).toISOString(), // Using same date for simplicity
            location: newEvent.location,
            image_url: newEvent.image_url,
          },
        ])
        .select() as { data: LumaEvent[] | null; error: any }

      if (error) {
        console.error("Error adding event:", error)
        return
      }

      if (data) {
        setLumaEvents([...data, ...lumaEvents])
      }

      setIsModalOpen(false)
    } catch (error) {
      console.error("Error adding event:", error)
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Luma Events</h2>
        <Button onClick={() => setIsModalOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Event
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-[220px] rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      ) : lumaEvents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lumaEvents.map((event) => (
            <LumaEventCard key={event.id} event={event} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border rounded-lg bg-muted/20">
          <h3 className="text-lg font-medium">No events found</h3>
          <p className="text-muted-foreground mt-1">Add your first event to get started</p>
          <Button onClick={() => setIsModalOpen(true)} className="mt-4">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Event
          </Button>
        </div>
      )}

      <AddEventModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onAddEvent={handleAddEvent} />
    </div>
  )
}
