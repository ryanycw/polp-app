"use client"

import { useEffect, useState } from 'react'
import { getLumaEvents, type LumaEvent } from '@/lib/supabase'
import { AddEventModal } from '@/components/AddEventModal'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ExternalLink } from 'lucide-react'

export default function Home() {
  const [events, setEvents] = useState<LumaEvent[]>([])

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const data = await getLumaEvents()
        setEvents(data)
      } catch (error) {
        console.error('Failed to fetch events:', error)
      }
    }
    fetchEvents()
  }, [])

  const handleEventAdded = async () => {
    try {
      const data = await getLumaEvents()
      setEvents(data)
    } catch (error) {
      console.error('Failed to fetch events:', error)
    }
  }

  return (
    <main className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Luma Events</h1>
        <AddEventModal onEventAdded={handleEventAdded} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {events.map((event) => (
          <Card key={event.id}>
            <CardHeader>
              <CardTitle className="text-lg">Luma Event</CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => window.open(event.event_link, '_blank')}
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                View Event
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  )
}
