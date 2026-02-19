"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  RefreshCw,
  MoreHorizontal,
  Play,
  Pause,
  Copy,
  Trash2,
  Pencil,
  Bot,
  Zap,
  Search,
  CircleDot,
  Workflow,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";

import useActiveOrganizationId from "@/hooks/use-organization-id";
import { ChatbotAutomationService } from "@/services/chatbot-automation";
import { ChatbotAutomation } from "@/types/chatbot-automation";

export default function ChatbotsPage() {
  const router = useRouter();
  const organizationId = useActiveOrganizationId();

  const [chatbots, setChatbots] = useState<ChatbotAutomation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDuplicateDialogOpen, setIsDuplicateDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedChatbot, setSelectedChatbot] = useState<ChatbotAutomation | null>(null);

  // Form states
  const [newChatbotName, setNewChatbotName] = useState("");
  const [newChatbotDescription, setNewChatbotDescription] = useState("");
  const [duplicateName, setDuplicateName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch chatbots
  const fetchChatbots = useCallback(async () => {
    if (!organizationId) return;

    setLoading(true);
    try {
      const data = await ChatbotAutomationService.getChatbots(organizationId);
      setChatbots(data);
    } catch (error) {
      console.error("Error fetching chatbots:", error);
      toast.error("Failed to load chatbots");
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  useEffect(() => {
    fetchChatbots();
  }, [fetchChatbots]);

  // Create chatbot
  const handleCreate = async () => {
    if (!organizationId || !newChatbotName.trim()) return;

    setIsSubmitting(true);
    try {
      const chatbot = await ChatbotAutomationService.createChatbot({
        organizationId,
        name: newChatbotName.trim(),
        description: newChatbotDescription.trim(),
      });

      toast.success("Chatbot created successfully");
      setIsCreateDialogOpen(false);
      setNewChatbotName("");
      setNewChatbotDescription("");

      // Navigate to flow builder
      router.push(`/dashboard/chatbots/${chatbot.id}/edit`);
    } catch (error) {
      console.error("Error creating chatbot:", error);
      toast.error("Failed to create chatbot");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle chatbot status
  const handleToggle = async (chatbot: ChatbotAutomation) => {
    try {
      await ChatbotAutomationService.toggleChatbot(chatbot.id, !chatbot.isActive);
      toast.success(`Chatbot ${chatbot.isActive ? "paused" : "activated"}`);
      fetchChatbots();
    } catch (error) {
      console.error("Error toggling chatbot:", error);
      toast.error("Failed to update chatbot status");
    }
  };

  // Duplicate chatbot
  const handleDuplicate = async () => {
    if (!selectedChatbot || !duplicateName.trim()) return;

    setIsSubmitting(true);
    try {
      await ChatbotAutomationService.duplicateChatbot(selectedChatbot.id, duplicateName.trim());
      toast.success("Chatbot duplicated successfully");
      setIsDuplicateDialogOpen(false);
      setDuplicateName("");
      setSelectedChatbot(null);
      fetchChatbots();
    } catch (error) {
      console.error("Error duplicating chatbot:", error);
      toast.error("Failed to duplicate chatbot");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete chatbot
  const handleDelete = async () => {
    if (!selectedChatbot) return;

    setIsSubmitting(true);
    try {
      await ChatbotAutomationService.deleteChatbot(selectedChatbot.id);
      toast.success("Chatbot deleted successfully");
      setIsDeleteDialogOpen(false);
      setSelectedChatbot(null);
      fetchChatbots();
    } catch (error) {
      console.error("Error deleting chatbot:", error);
      toast.error("Failed to delete chatbot");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter chatbots
  const filteredChatbots = chatbots.filter(
    (chatbot) =>
      chatbot.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chatbot.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Chatbot Flows</h1>
          <p className="text-sm text-muted-foreground">
            Create no-code chatbot flows for WhatsApp
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchChatbots} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
          <Button size="sm" onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            Create Chatbot
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search chatbots..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Chatbots Grid */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-3">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredChatbots.length === 0 ? (
        <Card className="p-12">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="rounded-full bg-muted p-4 mb-4">
              <Bot className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">
              {searchQuery ? "No chatbots found" : "No chatbots yet"}
            </h3>
            <p className="text-sm text-muted-foreground mb-4 max-w-sm">
              {searchQuery
                ? "Try adjusting your search query"
                : "Create your first chatbot to automate customer interactions across channels"}
            </p>
            {!searchQuery && (
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Chatbot
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredChatbots.map((chatbot) => (
            <Card
              key={chatbot.id}
              className="group hover:shadow-md transition-shadow cursor-pointer flex flex-col"
              onClick={() => router.push(`/dashboard/chatbots/${chatbot.id}/edit`)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                      <Workflow className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <CardTitle className="text-base truncate">{chatbot.name}</CardTitle>
                      <div className="flex items-center space-x-1.5 mt-0.5">
                        {chatbot.isActive ? (
                          <>
                            <CircleDot className="w-3 h-3 fill-green-500 text-green-500" />
                            <span className="text-xs text-green-600">Active</span>
                          </>
                        ) : (
                          <>
                            <CircleDot className="w-3 h-3 fill-amber-500 text-amber-500" />
                            <span className="text-xs text-amber-600">Paused</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/dashboard/chatbots/${chatbot.id}/edit`);
                        }}
                      >
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit Flow
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggle(chatbot);
                        }}
                      >
                        {chatbot.isActive ? (
                          <>
                            <Pause className="h-4 w-4 mr-2" />
                            Pause
                          </>
                        ) : (
                          <>
                            <Play className="h-4 w-4 mr-2" />
                            Activate
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedChatbot(chatbot);
                          setDuplicateName(`${chatbot.name} (Copy)`);
                          setIsDuplicateDialogOpen(true);
                        }}
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedChatbot(chatbot);
                          setIsDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="flex-grow space-y-3">
                {chatbot.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {chatbot.description}
                  </p>
                )}
                <div className="pt-1 border-t">
                  <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5 mb-1.5">
                    <Zap className="h-3 w-3" />
                    Triggers
                  </span>
                  {chatbot.triggers?.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {chatbot.triggers.slice(0, 3).map((trigger, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs font-normal">
                          {trigger.type === 'keyword'
                            ? trigger.keywords?.join(', ') || 'keyword'
                            : trigger.type === 'first_message'
                            ? 'First message'
                            : 'Button click'}
                        </Badge>
                      ))}
                      {chatbot.triggers.length > 3 && (
                        <span className="text-xs text-muted-foreground self-center">
                          +{chatbot.triggers.length - 3} more
                        </span>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground italic">No triggers configured</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Chatbot</DialogTitle>
            <DialogDescription>
              Set up a new chatbot automation flow for your channels
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="e.g., Customer Support Bot"
                value={newChatbotName}
                onChange={(e) => setNewChatbotName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                placeholder="Describe what this chatbot does..."
                value={newChatbotDescription}
                onChange={(e) => setNewChatbotDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={!newChatbotName.trim() || isSubmitting}>
              {isSubmitting ? "Creating..." : "Create & Edit Flow"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Duplicate Dialog */}
      <Dialog open={isDuplicateDialogOpen} onOpenChange={setIsDuplicateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Duplicate Chatbot</DialogTitle>
            <DialogDescription>
              Create a copy of &quot;{selectedChatbot?.name}&quot;
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="duplicateName">New Name</Label>
              <Input
                id="duplicateName"
                value={duplicateName}
                onChange={(e) => setDuplicateName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDuplicateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleDuplicate} disabled={!duplicateName.trim() || isSubmitting}>
              {isSubmitting ? "Duplicating..." : "Duplicate"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Chatbot</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{selectedChatbot?.name}&quot;? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}
