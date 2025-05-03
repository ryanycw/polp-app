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

  function extractLumaSlug(urlOrSlug: string): string | null {
    // Try to match a slug from a Luma URL
    const match = urlOrSlug.trim().match(/(?:https?:\/\/)?(?:www\.)?lu\.ma\/([a-zA-Z0-9\-]+)/)
    if (match) return match[1]
    // If not a URL, assume it's a slug
    if (/^[a-zA-Z0-9\-]+$/.test(urlOrSlug.trim())) return urlOrSlug.trim()
    return null
  }

  async function handleAddEvent({ slugOrUrl }: { slugOrUrl: string }) {
    const slug = extractLumaSlug(slugOrUrl)
    if (!slug) {
      alert("Please enter a valid Luma event URL or slug.")
      return
    }

    try {
      const res = await fetch('/api/luma', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ slug }),
      })

      if (!res.ok) {
        const error = await res.json()
        alert(error.error || 'Failed to fetch event')
        return
      }

      const { event } = await res.json()

      // Insert into Supabase
      const { data, error } = await supabase
        .from("luma_events")
        .insert([{
          api_id: event.api_id,
          name: event.name,
          slug: event.slug,
          cover_url: event.cover_url,
          start_at: event.start_at,
          end_at: event.end_at,
        }])
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
      alert("Failed to add event")
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
