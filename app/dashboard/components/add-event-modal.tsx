"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { createClient } from "@/utils/supabase/client"

interface AddEventModalProps {
  children: React.ReactNode
}

export function AddEventModal({ children }: AddEventModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [eventLink, setEventLink] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { error } = await supabase
        .from("luma_events")
        .insert([{ event_link: eventLink }])

      if (error) throw error

      setEventLink("")
      setIsOpen(false)
    } catch (error) {
      console.error("Error adding event:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Luma Event</DialogTitle>
          <DialogDescription>
            Enter the Luma event link to add it to your dashboard.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="url"
            placeholder="https://lu.ma/event-id"
            value={eventLink}
            onChange={(e) => setEventLink(e.target.value)}
            required
          />
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Adding..." : "Add Event"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
} 