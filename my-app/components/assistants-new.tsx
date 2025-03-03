"use client";

import React, { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { useOrganizationList } from "@clerk/nextjs";
import { CreateAssistantDialog } from "@/components/create-assistant-dialog";
import {
  Bot,
  CircleDot,
  BadgeCheck,
  Info,
  MoreVertical,
  Pencil,
  Trash,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "./ui/textarea";
import { DeleteAssistantDialog } from "@/components/delete-dialog-assistant";
import useActiveOrganizationId from "@/hooks/use-organization-id";

interface Assistant {
  id: number;
  name: string;
  prompt: string;
  assistant_id: string;
  organization: string;
  organization_id: string;
}

export default function Assistants() {
  const { userMemberships } = useOrganizationList({
    userMemberships: { infinite: true },
  });
  
  const activeOrganizationId = useActiveOrganizationId();

  const [assistants, setAssistants] = useState<Assistant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAssistant, setSelectedAssistant] = useState<Assistant | null>(
    null
  );
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    assistant: Assistant | null;
  }>({ isOpen: false, assistant: null });

  const fetchAssistants = async () => {
    if (!activeOrganizationId) return;

    setIsLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/get/assistants/${activeOrganizationId}/`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch assistants");
      }

      const data: Assistant[] = await response.json();
      setAssistants(data);

      if (data.length === 0) {
        toast.info(
          "No assistants found. Create one to get started."
        );
      }
    } catch (error) {
      console.error("Error fetching assistants:", error);
      toast.error("Failed to fetch assistants. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditAssistant = async (updatedAssistant: Assistant) => {
    setIsEditing(true);
    
   // Backend Payload
    const payload = {
      id: updatedAssistant.id,
      name: updatedAssistant.name,
      prompt: updatedAssistant.prompt,
      assistant_id: updatedAssistant.assistant_id,
      organization: updatedAssistant.organization 
    };
  
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/assistants/${updatedAssistant.id}/`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          body: JSON.stringify(payload),
        }
      );
  
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        throw new Error(errorData.detail || "Failed to edit assistant");
      }
  
      const updatedData = await response.json();
      setAssistants(
        assistants.map((a) => (a.id === updatedData.id ? updatedData : a))
      );
      toast.success("Assistant updated successfully!");
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error("Error editing assistant:", error);
      toast.error("Failed to edit assistant. Please try again.");
    } finally {
      setIsEditing(false);
    }
  };

  const handleDeleteAssistant = async (assistant: Assistant) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/assistants/${assistant.id}/`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) throw new Error("Failed to delete assistant");

      setAssistants(assistants.filter((a) => a.id !== assistant.id));
      setDeleteDialog({ isOpen: false, assistant: null });
      toast.success("Assistant deleted successfully!");
    } catch (error) {
      console.error("Error deleting assistant:", error);
      toast.error("Failed to delete assistant. Please try again.");
    }
  };

  useEffect(() => {
    if (activeOrganizationId) {
      fetchAssistants();
    }
  }, [activeOrganizationId]);

  // Find organization name for display purposes
  const selectedOrgName = userMemberships?.data?.find(
    (membership) => membership.organization.id === activeOrganizationId
  )?.organization.name;

  return (
    <div className="space-y-4">
      {!activeOrganizationId ? (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>No Organization </AlertTitle>
          <AlertDescription>
            Please create or join an organization to manage assistants.
          </AlertDescription>
        </Alert>
      ) : isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="h-[240px] animate-pulse bg-muted" />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {selectedOrgName && (
            <h2 className="text-xl font-semibold">
              {selectedOrgName} assistants
            </h2>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <CreateAssistantDialog onAssistantCreated={fetchAssistants} />

            {assistants.length > 0 && assistants.map((assistant) => (
              <Card key={assistant.id} className="h-[240px] flex flex-col">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <Bot className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">
                          {assistant.name}
                        </CardTitle>
                        <div className="flex items-center space-x-2">
                          <BadgeCheck className="h-4 w-4 text-blue-500" />
                          <span className="text-sm text-muted-foreground">
                            ID: {assistant.assistant_id.slice(0, 12)}...
                          </span>
                        </div>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedAssistant(assistant);
                            setIsEditDialogOpen(true);
                          }}
                          className="cursor-pointer"
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            setDeleteDialog({
                              isOpen: true,
                              assistant: assistant,
                            })
                          }
                          className="cursor-pointer text-red-500"
                        >
                          <Trash className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="flex-grow">
                  <div className="flex items-center space-x-2">
                    <CircleDot className="w-3 h-3 fill-green-500 text-green-500" />
                    <span className="text-sm">Active</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                    {assistant.prompt}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Edit Assistant Dialog */}
      {selectedAssistant && (
        <Dialog
          open={isEditDialogOpen}
          onOpenChange={(open) => {
            setIsEditDialogOpen(open);
            if (!open) setSelectedAssistant(null);
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Assistant</DialogTitle>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (selectedAssistant) {
                  handleEditAssistant(selectedAssistant);
                }
              }}
              className="space-y-4"
            >
              <Input
                value={selectedAssistant.name}
                onChange={(e) =>
                  setSelectedAssistant((prev) =>
                    prev ? { ...prev, name: e.target.value } : null
                  )
                }
                placeholder="Assistant Name"
                required
              />
              <Textarea
                value={selectedAssistant.prompt}
                onChange={(e) =>
                  setSelectedAssistant((prev) =>
                    prev ? { ...prev, prompt: e.target.value } : null
                  )
                }
                placeholder="Prompt"
                required
                className="min-h-[100px]"
              />
              <Input
                value={selectedAssistant.assistant_id}
                onChange={(e) =>
                  setSelectedAssistant((prev) =>
                    prev ? { ...prev, assistant_id: e.target.value } : null
                  )
                }
                placeholder="Assistant ID"
                required
              />
              <Button type="submit" disabled={isEditing}>
                {isEditing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Editing...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Assistant Dialog */}
      <DeleteAssistantDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, assistant: null })}
        onConfirm={() =>
          deleteDialog.assistant &&
          handleDeleteAssistant(deleteDialog.assistant)
        }
        assistantName={deleteDialog.assistant?.name || ""}
      />
    </div>
  );
}
