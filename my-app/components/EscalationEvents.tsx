"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Filter, Edit, Trash2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { useOrganizationList } from "@clerk/nextjs"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { toast } from "@/components/ui/use-toast"

interface EscalationEvent {
  id?: number
  name: string
  description: string
  organization_id: string
}

const EscalationItem: React.FC<EscalationEvent & { onEdit: () => void; onDelete: () => void }> = ({
  name,
  description,
  onEdit,
  onDelete,
}) => (
  <div className="flex items-center justify-between py-2">
    <div className="flex items-center">
      <Avatar className="h-8 w-8">
        <AvatarFallback>{name[0]}</AvatarFallback>
      </Avatar>
      <div className="ml-3">
        <p className="text-sm font-medium">{name}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
    <div className="flex items-center space-x-2">
      <Button variant="ghost" size="sm" onClick={onEdit}>
        <Edit className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="sm" onClick={onDelete}>
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  </div>
)

export function EscalationEvents() {
  const { userMemberships, isLoaded } = useOrganizationList({
    userMemberships: { infinite: true },
  })

  const [selectedOrganizationId, setSelectedOrganizationId] = useState<string>("")
  const [events, setEvents] = useState<EscalationEvent[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [editingEvent, setEditingEvent] = useState<EscalationEvent | null>(null)
  const [newEvent, setNewEvent] = useState<EscalationEvent>({ name: "", description: "", organization_id: "" })

  useEffect(() => {
    if (selectedOrganizationId) {
      fetchEvents()
      setNewEvent((prev) => ({ ...prev, organization_id: selectedOrganizationId }))
    }
  }, [selectedOrganizationId])

  const fetchEvents = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/notifications/events/${selectedOrganizationId}/`,
      )
      if (!response.ok) throw new Error("Failed to fetch events")
      const data = await response.json()
      setEvents(data)
    } catch (error) {
      console.error("Error fetching events:", error)
      toast({ title: "Error", description: "Failed to fetch events", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  const handleOrganizationChange = (orgId: string) => {
    setSelectedOrganizationId(orgId)
  }

  const handleCreateEvent = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/notifications/events/create/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newEvent),
      })
      if (!response.ok) throw new Error("Failed to create event")
      await fetchEvents()
      setIsCreating(false)
      setNewEvent({ name: "", description: "", organization_id: selectedOrganizationId })
      toast({ title: "Success", description: "Event created successfully" })
    } catch (error) {
      console.error("Error creating event:", error)
      toast({ title: "Error", description: "Failed to create event", variant: "destructive" })
    }
  }

  const handleUpdateEvent = async () => {
    if (!editingEvent || !editingEvent.id) return
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/notifications/events/${editingEvent.id}/update/`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editingEvent),
        },
      )
      if (!response.ok) throw new Error("Failed to update event")
      await fetchEvents()
      setEditingEvent(null)
      toast({ title: "Success", description: "Event updated successfully" })
    } catch (error) {
      console.error("Error updating event:", error)
      toast({ title: "Error", description: "Failed to update event", variant: "destructive" })
    }
  }

  const handleDeleteEvent = async (id: number) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/notifications/events/${id}/delete/`, {
        method: "DELETE",
      })
      if (!response.ok) throw new Error("Failed to delete event")
      await fetchEvents()
      toast({ title: "Success", description: "Event deleted successfully" })
    } catch (error) {
      console.error("Error deleting event:", error)
      toast({ title: "Error", description: "Failed to delete event", variant: "destructive" })
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Escalation Events</CardTitle>
        <div className="flex space-x-2">
          <Select value={selectedOrganizationId} onValueChange={handleOrganizationChange}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select an organization" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {userMemberships?.data?.map((membership) => (
                  <SelectItem key={membership.organization.id} value={membership.organization.id}>
                    {membership.organization.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex justify-between items-center">
          <p className="text-sm text-muted-foreground">You have {events.length} escalation events</p>
          <Dialog>
            <DialogTrigger asChild>
              <Button onClick={() => setIsCreating(true)}>Create Event</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{isCreating ? "Create New Event" : "Edit Event"}</DialogTitle>
              </DialogHeader>
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  isCreating ? handleCreateEvent() : handleUpdateEvent()
                }}
              >
                <div className="space-y-4">
                  <Input
                    placeholder="Name"
                    value={isCreating ? newEvent.name : editingEvent?.name}
                    onChange={(e) =>
                      isCreating
                        ? setNewEvent({ ...newEvent, name: e.target.value })
                        : setEditingEvent({ ...editingEvent!, name: e.target.value })
                    }
                  />
                  <Textarea
                    placeholder="Description"
                    value={isCreating ? newEvent.description : editingEvent?.description}
                    onChange={(e) =>
                      isCreating
                        ? setNewEvent({ ...newEvent, description: e.target.value })
                        : setEditingEvent({ ...editingEvent!, description: e.target.value })
                    }
                  />
                  <Button type="submit">{isCreating ? "Create" : "Update"}</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        {isLoading ? (
          <p>Loading events...</p>
        ) : (
          <div className="space-y-4">
            {events.map((event) => (
              <EscalationItem
                key={event.id}
                {...event}
                onEdit={() => setEditingEvent(event)}
                onDelete={() => event.id && handleDeleteEvent(event.id)}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

