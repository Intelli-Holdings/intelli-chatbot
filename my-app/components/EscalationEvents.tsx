"use client";

import React, { useState, useEffect } from "react";
import { Event, EscalationEvent } from "@/types/events";
import { EventCard } from "./EscalationEventCard";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useOrganizationList } from "@clerk/nextjs";
import { MoreVertical, Pencil, Trash, Loader2 } from "lucide-react";

export default function EscalationEvents() {
  const { userMemberships } = useOrganizationList({
    userMemberships: { infinite: true },
  });
  const [events, setEvents] = useState<Event[]>([]);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [deletingEventId, setDeletingEventId] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedOrganizationId, setSelectedOrganizationId] =
    useState<string>("");
  const [organizationEvents, setOrganizationEvents] = useState<Event[]>([]);

  useEffect(() => {
    if (selectedOrganizationId) {
      fetchOrganizationEvents();
    }
  }, [selectedOrganizationId]);

  const fetchOrganizationEvents = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/notifications/events/${selectedOrganizationId}/`
      );
      if (!response.ok) throw new Error("Failed to fetch events");
      const data = await response.json();
      setOrganizationEvents(data);
    } catch (error) {
      console.error("Error fetching events:", error);
      toast.error("Failed to fetch events");
    }
  };

  const handleCreateEvent = async (formData: EscalationEvent) => {
    setIsSubmitting(true);
    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        organization_id: selectedOrganizationId,
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
    if (!editingEvent?.id) return;
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
            organization_id: selectedOrganizationId,
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to update event");

      const updatedEvent = await response.json();
      setOrganizationEvents(
        events.map((event) =>
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
      organization_id: selectedOrganizationId,
      ...(editingEvent?.id ? { id: editingEvent.id } : {}),
    };

    if (editingEvent) {
      await handleEditEvent(eventData);
    } else {
      await handleCreateEvent(eventData);
    }
  };

  return (
    <div className="space-y-8">     
      <Card>
        <CardHeader className="flex justify-between mb-4">
          <CardTitle>Select organization to view events</CardTitle>
      
            <div className="flex items-center gap-4">
            <Select
              value={selectedOrganizationId}
              onValueChange={setSelectedOrganizationId}
            >
              <SelectTrigger className="w-[280px]">
              <SelectValue placeholder="Select an organization" />
              </SelectTrigger>
              <SelectContent>
              {userMemberships?.data?.map((membership) => (
                <SelectItem
                key={membership.organization.id}
                value={membership.organization.id}
                >
                {membership.organization.name}
                </SelectItem>
              ))}
              </SelectContent>
            </Select>
            <Button
              className="w-[140px]"
              onClick={() => {
              setEditingEvent(null);
              setIsDialogOpen(true);
              }}
            >
              Create Event
            </Button>
            </div>
        </CardHeader>
        <CardContent>
          
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
        </CardContent>
      </Card>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingEvent ? "Edit Event" : "Create Event"}
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
              <div>
                <label
                  htmlFor="organization"
                  className="block text-sm font-medium"
                >
                  Organization
                </label>
                <Select
                  value={selectedOrganizationId}
                  onValueChange={setSelectedOrganizationId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select an organization" />
                  </SelectTrigger>
                  <SelectContent>
                    {userMemberships?.data?.map((membership) => (
                      <SelectItem
                        key={membership.organization.id}
                        value={membership.organization.id}
                      >
                        {membership.organization.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                type="submit"
                disabled={isSubmitting || !selectedOrganizationId}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {editingEvent ? "Updating..." : "Creating..."}
                  </>
                ) : editingEvent ? (
                  "Update Event"
                ) : (
                  "Create Event"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
