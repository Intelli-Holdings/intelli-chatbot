"use client";

import React, { useState, useMemo } from "react";
import { Event, EscalationEvent } from "@/types/events";
import { EventCard } from "./EscalationEventCard";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, Plus, Search } from "lucide-react";
import useActiveOrganizationId from "@/hooks/use-organization-id";
import { cn } from "@/lib/utils";
import {
  useEscalationEventsCache,
  escalationEventsQueryKey,
} from "@/hooks/use-escalation-events-cache";
import { useQueryClient } from "react-query";

interface EscalationEventsProps {
  variant?: "full" | "panel";
  className?: string;
}

export default function EscalationEvents({
  variant = "full",
  className,
}: EscalationEventsProps) {
  const isPanel = variant === "panel";
  const activeOrganizationId = useActiveOrganizationId() || undefined;
  const queryClient = useQueryClient();
  const {
    events,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useEscalationEventsCache(activeOrganizationId);
  const [searchQuery, setSearchQuery] = useState("");
  const [defaultUpdates, setDefaultUpdates] = useState<Record<number, boolean>>({});
  const isRefreshing = isFetching && events.length > 0;

  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [deletingEventId, setDeletingEventId] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleCreateEvent = async (formData: EscalationEvent) => {
    if (!activeOrganizationId) return;
    
    setIsSubmitting(true);
    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        organization_id: activeOrganizationId,
      };

      const response = await fetch("/api/notifications/events/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to create event: ${response.status} ${errorText}`
        );
      }

      const newEvent = await response.json();
      queryClient.setQueryData<Event[]>(
        escalationEventsQueryKey(activeOrganizationId),
        (old) => [...(old ?? []), newEvent]
      );
      setIsDialogOpen(false);
      toast.success("Event created successfully");
      refetch();
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
      const response = await fetch(`/api/notifications/events/${editingEvent.id}/update`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          organization_id: activeOrganizationId,
        }),
      });

      if (!response.ok) throw new Error("Failed to update event");

      const updatedEvent = await response.json();
      queryClient.setQueryData<Event[]>(
        escalationEventsQueryKey(activeOrganizationId),
        (old) =>
          (old ?? []).map((event) =>
            event.id === updatedEvent.id ? updatedEvent : event
          )
      );
      setEditingEvent(null);
      setIsDialogOpen(false);
      toast.success("Event updated successfully");
      refetch();
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
      const response = await fetch(`/api/notifications/events/${eventId}/delete`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) throw new Error("Failed to delete event");

      queryClient.setQueryData<Event[]>(
        escalationEventsQueryKey(activeOrganizationId),
        (old) => (old ?? []).filter((event) => event.id !== eventId)
      );
      toast.success("Event deleted successfully");
      refetch();
    } catch (error) {
      console.error("Error deleting event:", error);
      toast.error("Failed to delete event");
    } finally {
      setDeletingEventId(null);
    }
  };

  const handleToggleDefaultEvent = async (eventId: number, nextActive: boolean) => {
    if (!activeOrganizationId) return;
    setDefaultUpdates((prev) => ({ ...prev, [eventId]: true }));
    try {
      const response = await fetch(`/api/notifications/events/default/${eventId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organization_id: activeOrganizationId,
          is_active: nextActive,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to update event: ${response.status} ${errorText}`);
      }

      const updatedEvent = await response.json();
      queryClient.setQueryData<Event[]>(
        escalationEventsQueryKey(activeOrganizationId),
        (old) =>
          (old ?? []).map((event) =>
            event.id === eventId
              ? {
                  ...event,
                  is_active: updatedEvent.is_active ?? nextActive,
                }
              : event
          )
      );
      toast.success(
        `Default event ${nextActive ? "enabled" : "disabled"} successfully`
      );
    } catch (error) {
      console.error("Error updating default event:", error);
      toast.error("Failed to update default event");
    } finally {
      setDefaultUpdates((prev) => ({ ...prev, [eventId]: false }));
    }
  };

  const filteredEvents = useMemo(() => {
    const term = searchQuery.trim().toLowerCase();
    if (!term) {
      return events;
    }
    return events.filter((event) =>
      [event.name, event.description, event.system_name]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(term))
    );
  }, [events, searchQuery]);

  const defaultEvents = filteredEvents.filter(
    (event) => event.type_of_es === "default"
  );
  const organizationEvents = filteredEvents.filter(
    (event) => event.type_of_es !== "default"
  );

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

  const organizationEventsList = (
    <div className={cn(isPanel ? "space-y-3" : "space-y-4")}>
      {organizationEvents.map((event) => (
        <EventCard
          key={event.id}
          event={event}
          variant={isPanel ? "compact" : "full"}
          onEdit={() => {
            setEditingEvent(event);
            setIsDialogOpen(true);
          }}
          onDelete={handleDeleteEvent}
        />
      ))}
    </div>
  );

  const defaultEventsList = (
    <div className={cn(isPanel ? "space-y-3" : "space-y-4")}>
      {defaultEvents.map((event) => {
        const isActive = event.is_active !== false;
        const isUpdating = Boolean(defaultUpdates[event.id]);
        return (
          <EventCard
            key={event.id}
            event={event}
            readOnly
            variant={isPanel ? "compact" : "full"}
            actions={
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "text-[11px]",
                    isActive ? "text-[#007fff]" : "text-[#94a3b8]"
                  )}
                >
                  {isActive ? "Active" : "Inactive"}
                </span>
                <Switch
                  checked={isActive}
                  onCheckedChange={(checked) =>
                    handleToggleDefaultEvent(event.id, checked)
                  }
                  disabled={isUpdating}
                  className="data-[state=checked]:bg-[#007fff] data-[state=unchecked]:bg-[#dfe5ec]"
                />
              </div>
            }
          />
        );
      })}
    </div>
  );

  const hasDefaultEvents = events.some(
    (event) => event.type_of_es === "default"
  );
  const hasOrganizationEvents = events.some(
    (event) => event.type_of_es !== "default"
  );

  const eventsContent = (
    <div className="space-y-6">
      {hasDefaultEvents && (
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-[#111b21]">
                Default Events
              </p>
              <p className="text-[11px] text-[#667781]">
                Toggle defaults on or off for this organization.
              </p>
            </div>
            <Badge className="border-[#e6edf4] bg-[#f8fafc] text-[#667781] text-[10px]">
              {defaultEvents.length} shown
            </Badge>
          </div>
          {defaultEvents.length === 0 ? (
            searchQuery ? (
              <p className="text-[12px] text-[#667781]">
                No default events match your search.
              </p>
            ) : null
          ) : (
            defaultEventsList
          )}
        </div>
      )}
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-[#111b21]">
              Custom Events
            </p>
            <p className="text-[11px] text-[#667781]">
              Events created by your team.
            </p>
          </div>
          {hasOrganizationEvents && (
            <Badge className="border-[#cfe1ff] bg-[#e6f2ff] text-[#005cb8] text-[10px]">
              {organizationEvents.length} shown
            </Badge>
          )}
        </div>
        {organizationEvents.length === 0 ? (
          searchQuery ? (
            <p className="text-[12px] text-[#667781]">
              No custom events match your search.
            </p>
          ) : (
            <p className="text-[12px] text-[#667781]">
              No custom events yet. Create one to get started.
            </p>
          )
        ) : (
          organizationEventsList
        )}
      </div>
    </div>
  );

  return (
    <div className={cn("space-y-6", isPanel ? "pt-0" : "pt-4", className)}>
      <Card
        className={cn(
          "border-[#e9edef] shadow-sm",
          isPanel &&
            "rounded-2xl border-[#dfe5ec] bg-white shadow-[0_8px_24px_rgba(17,27,33,0.08)] overflow-hidden"
        )}
      >
        <CardHeader
          className={cn(
            "flex flex-row items-start justify-between gap-3 space-y-0 border-b border-[#e6edf4] px-4 py-3",
            isPanel
              ? "bg-gradient-to-br from-[#f8fafc] via-white to-[#edf3fa]"
              : "bg-[#f0f2f5]",
            !isPanel && "px-6 py-4"
          )}
        >
          <div className="space-y-1">
            <CardTitle
              className={cn(
                "text-[17px] font-semibold text-[#111b21]",
                isPanel && "text-[15px]"
              )}
            >
              Escalation Events
            </CardTitle>
            <CardDescription className="text-[12px] text-[#667781]">
              Events label notifications and drive routing.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {events.length > 0 && (
              <Badge className="border-[#cfe1ff] bg-[#e6f2ff] text-[#005cb8] text-[10px]">
                {events.length} total
              </Badge>
            )}
            {isRefreshing && (
              <span className="text-[11px] text-[#667781]">Updating list...</span>
            )}
            <Button
              size={isPanel ? "sm" : "default"}
              className={cn(
                isPanel &&
                  "h-8 px-3 text-xs bg-[#007fff] hover:bg-[#0067d6] text-white"
              )}
              onClick={() => {
                setEditingEvent(null);
                setIsDialogOpen(true);
              }}
            >
              <Plus className="h-4 w-4" />
              {isPanel ? "Create Event" : "Create Escalation Event"}
            </Button>
          </div>
        </CardHeader>
        <CardContent className={cn(isPanel ? "p-4" : "p-6")}>
          {isPanel && (
            <div className="mb-4 rounded-md border border-[#e9edef] bg-[#f7f9fb] px-3 py-2 text-[12px] text-[#667781]">
              Escalation events appear on notifications and help your team route
              and resolve alerts faster.
            </div>
          )}
          {events.length > 0 && (
            <div className="mb-4 flex items-center gap-2">
              <Search className="h-4 w-4 text-[#667781]" />
              <Input
                type="text"
                placeholder="Search events by name or description..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className={cn("h-8 text-[12px]", isPanel && "bg-white")}
              />
            </div>
          )}
          {isLoading ? (
            <div className="flex justify-center p-6">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : error && events.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-[13px] text-[#667781]">
                Failed to load escalation events
              </p>
              <Button
                variant="ghost"
                size="sm"
                className="mt-2 h-8 px-2 text-[12px]"
                onClick={() => refetch()}
              >
                Retry
              </Button>
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-[13px] text-[#667781]">
                No escalation events found
              </p>
              <p className="text-[12px] text-[#667781]">
                Create your first event to label notifications.
              </p>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-[13px] text-[#667781]">
                No events match &quot;{searchQuery.trim()}&quot;
              </p>
              <Button
                variant="ghost"
                size="sm"
                className="mt-2 h-8 px-2 text-[12px]"
                onClick={() => setSearchQuery("")}
              >
                Clear search
              </Button>
            </div>
          ) : isPanel ? (
            <ScrollArea className="h-[520px] pr-2">
              {eventsContent}
            </ScrollArea>
          ) : (
            <ScrollArea className="h-[calc(100vh-260px)] pr-2">
              {eventsContent}
            </ScrollArea>
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
