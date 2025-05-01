"use client"

import { useState } from 'react'
import { addLumaEvent } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/use-toast'

export function AddEventModal({ onEventAdded }: { onEventAdded: () => void }) {
  const [isOpen, setIsOpen] = useState(false)
  const [eventLink, setEventLink] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await addLumaEvent(eventLink)
      toast({
        title: 'Success',
        description: 'Event added successfully',
      })
      setEventLink('')
      setIsOpen(false)
      onEventAdded()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add event',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>Add Event</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Luma Event</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="eventLink" className="text-sm font-medium">
              Event Link
            </label>
            <Input
              id="eventLink"
              value={eventLink}
              onChange={(e) => setEventLink(e.target.value)}
              placeholder="https://lu.ma/..."
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Adding...' : 'Add Event'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
} 