"use client";

import React, { useState, useEffect } from "react";
import { Event, EscalationEvent } from "@/types/events";
import { EventCard } from "./EscalationEventCard";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import useActiveOrganizationId from "@/hooks/use-organization-id";

export default function EscalationEvents() {
  const activeOrganizationId = useActiveOrganizationId();
  const [organizationEvents, setOrganizationEvents] = useState<Event[]>([]);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [deletingEventId, setDeletingEventId] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (activeOrganizationId) {
      fetchOrganizationEvents();
    }
  }, [activeOrganizationId]);

  const fetchOrganizationEvents = async () => {
    if (!activeOrganizationId) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/notifications/events/${activeOrganizationId}/`
      );
      if (!response.ok) throw new Error("Failed to fetch events");
      const data = await response.json();
      setOrganizationEvents(data);
    } catch (error) {
      console.error("Error fetching events:", error);
      toast.error("Failed to fetch events");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateEvent = async (formData: EscalationEvent) => {
    if (!activeOrganizationId) return;
    
    setIsSubmitting(true);
    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        organization_id: activeOrganizationId,
      };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/notifications/events/create/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to create event: ${response.status} ${errorText}`
        );
      }

      const newEvent = await response.json();
      setOrganizationEvents([...organizationEvents, newEvent]);
      setIsDialogOpen(false);
      toast.success("Event created successfully");
      fetchOrganizationEvents();
    } catch (error) {
      console.error("Error creating event:", error);
      toast.error("Failed to create event");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditEvent = async (formData: EscalationEvent) => {
    if (!editingEvent?.id || !activeOrganizationId) return;
    
    setIsSubmitting(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/notifications/events/${editingEvent.id}/update/`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formData.name,
            description: formData.description,
            organization_id: activeOrganizationId,
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to update event");

      const updatedEvent = await response.json();
      setOrganizationEvents(
        organizationEvents.map((event) =>
          event.id === updatedEvent.id ? updatedEvent : event
        )
      );
      setEditingEvent(null);
      setIsDialogOpen(false);
      toast.success("Event updated successfully");
      fetchOrganizationEvents();
    } catch (error) {
      console.error("Error updating event:", error);
      toast.error("Failed to update event");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteEvent = async (eventId: number) => {
    setDeletingEventId(eventId);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/notifications/events/${eventId}/delete/`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!response.ok) throw new Error("Failed to delete event");

      setOrganizationEvents(
        organizationEvents.filter((event) => event.id !== eventId)
      );
      toast.success("Event deleted successfully");
      fetchOrganizationEvents();
    } catch (error) {
      console.error("Error deleting event:", error);
      toast.error("Failed to delete event");
    } finally {
      setDeletingEventId(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const eventData: EscalationEvent = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      organization_id: activeOrganizationId || "",
      ...(editingEvent?.id ? { id: editingEvent.id } : {}),
    };

    if (editingEvent) {
      await handleEditEvent(eventData);
    } else {
      await handleCreateEvent(eventData);
    }
  };

  if (!activeOrganizationId) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">No organization selected</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pt-4">     
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Escalation Events</CardTitle>
          <Button
            onClick={() => {
              setEditingEvent(null);
              setIsDialogOpen(true);
            }}
          >
            Create Escalation Event
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center p-6">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : organizationEvents.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-muted-foreground">No escalation events found</p>
              <p className="text-sm text-muted-foreground">Create your first event to get started</p>
            </div>
          ) : (
            <div className="space-y-4">
              {organizationEvents.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  onEdit={() => {
                    setEditingEvent(event);
                    setIsDialogOpen(true);
                  }}
                  onDelete={handleDeleteEvent}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingEvent ? "Edit Escalation Event" : "Create Escalation Event"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium">
                  Name
                </label>
                <Input
                  id="name"
                  name="name"
                  defaultValue={editingEvent?.name}
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium"
                >
                  Description
                </label>
                <Textarea
                  id="description"
                  name="description"
                  defaultValue={editingEvent?.description}
                  required
                />
              </div>
              <Button
                type="submit"
                disabled={isSubmitting || !activeOrganizationId}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {editingEvent ? "Updating..." : "Creating..."}
                  </>
                ) : editingEvent ? (
                  "Update"
                ) : (
                  "Create"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}