"use client"

import { useState } from "react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"

const formSchema = z.object({
  slugOrUrl: z.string().url("Please enter a valid Luma event URL.").min(1, "Luma event URL is required"),
  poapMintLink: z.string().url("Please enter a valid POAP mint URL").min(1, "POAP mint link is required"),
})

interface AddEventModalProps {
  isOpen: boolean
  onClose: () => void
  onAddEvent: (event: { slugOrUrl: string; poapMintLink: string }) => void
}

export function AddEventModal({ isOpen, onClose, onAddEvent }: AddEventModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      slugOrUrl: "",
      poapMintLink: "",
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)
    const slug = extractLumaSlug(values.slugOrUrl)
    if (!slug) {
      alert("Please enter a valid Luma event URL.")
      return
    }
    onAddEvent({ slugOrUrl: slug, poapMintLink: values.poapMintLink })
    form.reset()
    setIsSubmitting(false)
  }

  function extractLumaSlug(urlOrSlug: string): string | null {
    // Try to match a slug from a Luma URL
    const match = urlOrSlug.trim().match(/(?:https?:\/\/)?(?:www\.)?lu\.ma\/([a-zA-Z0-9\-]+)/)
    if (match) return match[1]
    // If not a URL, assume it's a slug
    if (/^[a-zA-Z0-9\-]+$/.test(urlOrSlug.trim())) return urlOrSlug.trim()
    return null
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Luma Event</DialogTitle>
          <DialogDescription>
            Enter the Luma event URL and POAP mint link to add it to your dashboard.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="slugOrUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Luma Event URL</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. https://lu.ma/9og6xeq4" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="poapMintLink"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>POAP Mint Link</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. https://poap.xyz/claim/abc123" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Adding..." : "Add Event"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
