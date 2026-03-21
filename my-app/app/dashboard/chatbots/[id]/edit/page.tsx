"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  Play,
  Pause,
  Settings,
  Eye,
  Check,
  AlertCircle,
  ExternalLink,
  Loader2,
  Phone,
  Send,
  RotateCcw,
  Bot,
  User,
  Info,
  Image,
  Video,
  FileText,
  Music,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";

import { ChatbotAutomationService } from "@/services/chatbot-automation";
import {
  ChatbotAutomation,
  ChatbotMenu,
  ChannelConfig,
} from "@/types/chatbot-automation";
import {
  FlowSimulator,
  SimulationState,
  getAvailableTriggers,
} from "@/components/flow-builder/simulation/flow-simulator";
import { backendNodesToFlow, chatbotToFlow } from "@/components/flow-builder/utils/flow-converters";
import { cn } from "@/lib/utils";
import { logger } from "@/lib/logger";
import { WhatsAppIcon } from "@/components/icons/whatsapp-icon";
import dynamic from "next/dynamic";
import { useAppServices } from "@/hooks/use-app-services";

const FlowBuilder = dynamic(
  () => import("@/components/flow-builder/FlowBuilder"),
  { ssr: false, loading: () => <div className="flex items-center justify-center h-[60vh]"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div> }
);

// Main Page Component
export default function ChatbotEditorPage() {
  const params = useParams();
  const router = useRouter();
  const chatbotId = params.id as string;

  const [chatbot, setChatbot] = useState<ChatbotAutomation | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Settings sheet
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // WhatsApp channel dialog
  const [isWhatsAppDialogOpen, setIsWhatsAppDialogOpen] = useState(false);

  // WhatsApp services
  const { appServices, loading: loadingServices, refetch: refetchServices } = useAppServices();

  // Preview dialog - Flow-based simulation
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewInput, setPreviewInput] = useState("");
  const [simulationState, setSimulationState] = useState<SimulationState>({
    isRunning: false,
    currentNodeId: null,
    messages: [],
    variables: {},
    waitingForInput: false,
    pendingVariableName: null,
    visitedNodes: [],
  });
  const simulatorRef = useRef<FlowSimulator | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Validation
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Fetch chatbot
  const fetchChatbot = useCallback(async () => {
    // Validate chatbot ID before making request
    if (!chatbotId || chatbotId === 'undefined' || chatbotId === 'null') {
      logger.warn("Invalid chatbot ID", { chatbotId });
      toast.error("Invalid chatbot ID");
      router.push("/dashboard/chatbots");
      return;
    }

    setLoading(true);
    try {
      const data = await ChatbotAutomationService.getChatbot(chatbotId);
      setChatbot(data);
    } catch (error) {
      logger.error("Error fetching chatbot", { error: error instanceof Error ? error.message : String(error) });
      toast.error("Failed to load chatbot");
      router.push("/dashboard/chatbots");
    } finally {
      setLoading(false);
    }
  }, [chatbotId, router]);

  useEffect(() => {
    fetchChatbot();
  }, [fetchChatbot]);

  // Update chatbot locally
  const updateChatbot = (updates: Partial<ChatbotAutomation>) => {
    if (!chatbot) return;
    setChatbot({ ...chatbot, ...updates });
    setHasChanges(true);
  };

  // Validate before save
  const validate = (): boolean => {
    if (!chatbot) return false;
    const errors = ChatbotAutomationService.validateChatbot(chatbot);
    setValidationErrors(errors);
    return errors.length === 0;
  };

  // Save chatbot
  const handleSave = async () => {
    if (!chatbot || !validate()) {
      toast.error("Please fix validation errors before saving");
      return;
    }

    setSaving(true);
    try {
      await ChatbotAutomationService.updateChatbot(chatbot.id, {
        name: chatbot.name,
        description: chatbot.description,
        triggers: chatbot.triggers,
        menus: chatbot.menus,
        settings: chatbot.settings,
        channels: chatbot.channels,
        flowLayout: chatbot.flowLayout,
      });
      toast.success("Chatbot saved successfully");
      setHasChanges(false);
    } catch (error) {
      logger.error("Error saving chatbot", { error: error instanceof Error ? error.message : String(error) });
      toast.error("Failed to save chatbot");
    } finally {
      setSaving(false);
    }
  };

  // Toggle active status
  const handleToggle = async () => {
    if (!chatbot) return;

    try {
      await ChatbotAutomationService.toggleChatbot(chatbot.id, !chatbot.isActive);
      setChatbot({ ...chatbot, isActive: !chatbot.isActive });
      toast.success(`Chatbot ${chatbot.isActive ? "paused" : "activated"}`);
    } catch (error) {
      logger.error("Error toggling chatbot", { error: error instanceof Error ? error.message : String(error) });
      toast.error("Failed to update status");
    }
  };

  // Get flow nodes and edges from chatbot
  // Uses raw backend data if available, otherwise falls back to legacy conversion
  const getFlowNodesAndEdges = useCallback(() => {
    if (!chatbot) {
      return { nodes: [], edges: [] };
    }

    const rawNodes = chatbot.flowLayout?.rawNodes;
    const rawEdges = chatbot.flowLayout?.rawEdges;

    if (rawNodes && rawNodes.length > 0) {
      return backendNodesToFlow(rawNodes, rawEdges || []);
    }

    // Fall back to legacy menu-based format
    return chatbotToFlow(chatbot);
  }, [chatbot]);

  // Get available trigger keywords
  const availableTriggers = chatbot ? getAvailableTriggers(getFlowNodesAndEdges().nodes) : [];

  // Initialize simulator when preview opens (only once, not on chatbot changes)
  useEffect(() => {
    if (isPreviewOpen && chatbot && !simulatorRef.current) {
      const { nodes, edges } = getFlowNodesAndEdges();
      if (nodes.length > 0) {
        simulatorRef.current = new FlowSimulator(nodes, edges, setSimulationState);
      }
    }
    // Cleanup when preview closes
    if (!isPreviewOpen) {
      simulatorRef.current = null;
    }
  }, [isPreviewOpen, chatbot, getFlowNodesAndEdges]);

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [simulationState.messages]);

  // Start simulation with keyword
  const startSimulation = (keyword: string) => {
    if (simulatorRef.current) {
      simulatorRef.current.start(keyword);
    }
    setPreviewInput("");
  };

  // Handle user input during simulation
  const handleSimulationInput = (input: string, optionId?: string) => {
    if (simulatorRef.current) {
      simulatorRef.current.handleUserInput(input, optionId);
    }
    setPreviewInput("");
  };

  // Reset simulation
  const resetSimulation = () => {
    if (simulatorRef.current) {
      simulatorRef.current.reset();
    }
    setSimulationState({
      isRunning: false,
      currentNodeId: null,
      messages: [],
      variables: {},
      waitingForInput: false,
      pendingVariableName: null,
      visitedNodes: [],
    });
  };

  // Handle form submit in preview
  const handlePreviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!previewInput.trim()) return;

    if (!simulationState.isRunning && simulationState.messages.length === 0) {
      // Start simulation with keyword
      startSimulation(previewInput.trim());
    } else if (simulationState.waitingForInput) {
      // Send user response
      handleSimulationInput(previewInput.trim());
    }
  };

  // Handle option click
  const handleOptionClick = (optionId: string, title: string) => {
    handleSimulationInput(title, optionId);
  };

  // Get media icon for message
  const getMediaIcon = (type?: string) => {
    switch (type) {
      case "image": return Image;
      case "video": return Video;
      case "document": return FileText;
      case "audio": return Music;
      default: return Image;
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex flex-col">
        <div className="flex items-center gap-4 p-4 border-b">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <Skeleton className="h-8 w-64 mx-auto" />
            <Skeleton className="h-4 w-48 mx-auto" />
          </div>
        </div>
      </div>
    );
  }

  if (!chatbot) return null;

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between px-4 py-3 border-b bg-background z-30">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard/chatbots")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <Input
                value={chatbot.name}
                onChange={(e) => updateChatbot({ name: e.target.value })}
                className="text-xl font-semibold border-none p-0 h-auto focus-visible:ring-0 max-w-[300px]"
              />
              <Badge variant="outline" className={chatbot.isActive ? "border-green-500 text-green-600 bg-green-50 dark:bg-green-950/30" : "border-amber-500 text-amber-600 bg-amber-50 dark:bg-amber-950/30"}>
                {chatbot.isActive ? "Active" : "Paused"}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Drag nodes from the toolbar to build your flow
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setIsPreviewOpen(true)}>
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button variant="outline" size="sm" onClick={() => setIsSettingsOpen(true)}>
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button variant="outline" size="sm" onClick={handleToggle}>
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
          </Button>
          <Button size="sm" onClick={handleSave} disabled={saving || !hasChanges}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <div className="flex-shrink-0 px-4 py-2 bg-destructive/10">
          <Alert variant="destructive" className="py-2">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <ul className="list-disc list-inside text-sm">
                {validationErrors.map((error, i) => (
                  <li key={i}>{error}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Flow Builder Canvas */}
      <div className="flex-1 relative">
        <FlowBuilder chatbot={chatbot} onUpdate={updateChatbot} />
      </div>

      {/* Settings Sheet */}
      <Sheet open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <SheetContent className="w-full sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>Chatbot Settings</SheetTitle>
            <SheetDescription>Configure behavior and fallback options</SheetDescription>
          </SheetHeader>
          <ScrollArea className="h-[calc(100vh-8rem)] pr-4">
            <div className="space-y-6 py-4">
              {/* Basic Info */}
              <div className="space-y-4">
                <h3 className="font-medium">Basic Information</h3>
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input
                    value={chatbot.name}
                    onChange={(e) => updateChatbot({ name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={chatbot.description || ""}
                    onChange={(e) => updateChatbot({ description: e.target.value })}
                    rows={2}
                  />
                </div>
              </div>

              {/* WhatsApp Channel */}
              <div className="space-y-4">
                <h3 className="font-medium">WhatsApp Channel</h3>
                {(() => {
                  const whatsappConfig = chatbot.channels?.find((c) => c.channel === "whatsapp");
                  const isConnected = whatsappConfig?.enabled;
                  const connectedService = whatsappConfig?.appServiceId
                    ? appServices.find((s) => s.id === whatsappConfig.appServiceId)
                    : null;

                  return (
                    <div
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                        isConnected
                          ? "border-green-500 bg-green-50 dark:bg-green-900/10"
                          : "border-muted hover:bg-muted/50"
                      }`}
                      onClick={() => setIsWhatsAppDialogOpen(true)}
                    >
                      <WhatsAppIcon className="h-5 w-5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">WhatsApp</p>
                        {isConnected && connectedService ? (
                          <p className="text-xs text-green-600 dark:text-green-400 truncate">
                            {connectedService.phone_number || connectedService.name}
                          </p>
                        ) : (
                          <p className="text-xs text-muted-foreground">
                            Connect a WhatsApp Business number
                          </p>
                        )}
                      </div>
                      {isConnected && (
                        <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                      )}
                    </div>
                  );
                })()}
              </div>


            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>

      {/* Preview Dialog - Flow-based Simulation */}
      <Dialog open={isPreviewOpen} onOpenChange={(open) => {
        setIsPreviewOpen(open);
        if (!open) {
          resetSimulation();
        }
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Play className="h-4 w-4 text-primary" />
              Preview Chatbot
              {simulationState.isRunning && (
                <Badge variant="secondary" className="text-xs">Running</Badge>
              )}
            </DialogTitle>
            <DialogDescription>Test your chatbot flow with sample inputs</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <ScrollArea className="h-[350px] border rounded-lg p-4">
              {simulationState.messages.length === 0 ? (
                <div className="space-y-4">
                  <div className="text-center text-sm text-muted-foreground py-4">
                    Type a trigger keyword to start testing
                  </div>

                  {availableTriggers.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground text-center">
                        Available triggers:
                      </p>
                      <div className="flex flex-wrap gap-2 justify-center">
                        {availableTriggers.slice(0, 8).map((trigger, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            size="sm"
                            className="text-xs"
                            onClick={() => startSimulation(trigger)}
                          >
                            {trigger}
                          </Button>
                        ))}
                      </div>
                      {availableTriggers.length > 8 && (
                        <p className="text-xs text-muted-foreground text-center">
                          +{availableTriggers.length - 8} more
                        </p>
                      )}
                    </div>
                  )}

                  {availableTriggers.length === 0 && (
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">
                        No triggers configured. Add keywords to a Trigger node.
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {simulationState.messages.map((message) => {
                    const isBot = message.type === "bot";
                    const isUser = message.type === "user";
                    const isSystem = message.type === "system";
                    const MediaIcon = message.mediaType ? getMediaIcon(message.mediaType) : null;

                    if (isSystem) {
                      return (
                        <div key={message.id} className="flex justify-center">
                          <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-full text-xs text-muted-foreground">
                            <Info className="h-3 w-3" />
                            {message.content}
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={message.id}
                        className={cn(
                          "flex gap-2",
                          isUser ? "flex-row-reverse" : "flex-row"
                        )}
                      >
                        {/* Avatar */}
                        <div
                          className={cn(
                            "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
                            isBot ? "bg-primary text-primary-foreground" : "bg-muted"
                          )}
                        >
                          {isBot ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
                        </div>

                        {/* Message Content */}
                        <div className={cn("max-w-[80%] space-y-2", isUser ? "items-end" : "items-start")}>
                          <div
                            className={cn(
                              "rounded-lg px-3 py-2",
                              isBot
                                ? "bg-muted text-foreground"
                                : "bg-primary text-primary-foreground"
                            )}
                          >
                            {/* Media indicator */}
                            {MediaIcon && (
                              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                                <MediaIcon className="h-4 w-4" />
                                <span className="text-xs capitalize">{message.mediaType}</span>
                              </div>
                            )}

                            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                          </div>

                          {/* Options/Buttons */}
                          {message.options && message.options.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {message.options.map((option) => (
                                <Button
                                  key={option.id}
                                  variant="outline"
                                  size="sm"
                                  className="text-xs"
                                  onClick={() => handleOptionClick(option.id, option.title)}
                                >
                                  {option.title}
                                </Button>
                              ))}
                            </div>
                          )}

                          {/* Timestamp */}
                          <p className="text-[10px] text-muted-foreground">
                            {message.timestamp.toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </ScrollArea>
            <form onSubmit={handlePreviewSubmit} className="flex gap-2">
              <Input
                value={previewInput}
                onChange={(e) => setPreviewInput(e.target.value)}
                placeholder={
                  simulationState.messages.length === 0
                    ? "Type a trigger keyword..."
                    : simulationState.waitingForInput
                    ? "Type your response..."
                    : "Simulation ended"
                }
                disabled={simulationState.messages.length > 0 && !simulationState.waitingForInput}
              />
              <Button
                type="submit"
                size="icon"
                disabled={
                  !previewInput.trim() ||
                  (simulationState.messages.length > 0 && !simulationState.waitingForInput)
                }
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
            <Button
              variant="outline"
              className="w-full"
              onClick={resetSimulation}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset Preview
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* WhatsApp Channel Dialog */}
      <Dialog open={isWhatsAppDialogOpen} onOpenChange={setIsWhatsAppDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <WhatsAppIcon className="h-5 w-5" />
              Connect WhatsApp
            </DialogTitle>
            <DialogDescription>
              {appServices.length > 0
                ? "Select a WhatsApp number to use with this chatbot"
                : "Connect your WhatsApp Business account"}
            </DialogDescription>
          </DialogHeader>

          {loadingServices ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : appServices.length > 0 ? (
            <div className="space-y-4">
              <div className="space-y-2">
                {appServices.map((service) => {
                  const isSelected = chatbot.channels?.some(
                    (c) => c.channel === "whatsapp" && c.appServiceId === service.id && c.enabled
                  );

                  return (
                    <div
                      key={service.id}
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                        isSelected
                          ? "border-green-500 bg-green-50 dark:bg-green-900/10"
                          : "border-muted hover:bg-muted/50"
                      }`}
                      onClick={() => {
                        const currentChannels = chatbot.channels || [];
                        const existingIndex = currentChannels.findIndex(
                          (c) => c.channel === "whatsapp"
                        );

                        let newChannels: ChannelConfig[];
                        if (existingIndex >= 0) {
                          const existing = currentChannels[existingIndex];
                          if (existing.appServiceId === service.id && existing.enabled) {
                            newChannels = currentChannels.map((c, i) =>
                              i === existingIndex ? { ...c, enabled: false } : c
                            );
                          } else {
                            newChannels = currentChannels.map((c, i) =>
                              i === existingIndex
                                ? {
                                    ...c,
                                    enabled: true,
                                    appServiceId: service.id,
                                    phoneNumberId: service.phone_number_id,
                                  }
                                : c
                            );
                          }
                        } else {
                          newChannels = [
                            ...currentChannels,
                            {
                              channel: "whatsapp",
                              enabled: true,
                              appServiceId: service.id,
                              phoneNumberId: service.phone_number_id,
                            },
                          ];
                        }

                        updateChatbot({ channels: newChannels });
                        setIsWhatsAppDialogOpen(false);
                        toast.success(
                          isSelected
                            ? "WhatsApp disconnected from chatbot"
                            : `Connected to ${service.phone_number || service.name}`
                        );
                      }}
                    >
                      <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                        <Phone className="h-5 w-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{service.name || "WhatsApp Business"}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {service.phone_number}
                        </p>
                      </div>
                      {isSelected && (
                        <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="pt-2 border-t">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => router.push("/dashboard/channels/whatsapp")}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Connect Another Number
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-center py-6">
                <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
                  <WhatsAppIcon className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  You haven&apos;t connected any WhatsApp Business numbers yet.
                  Connect your first number to enable this channel.
                </p>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsWhatsAppDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => router.push("/dashboard/channels/whatsapp")}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <WhatsAppIcon className="h-4 w-4 mr-2" />
                  Connect WhatsApp
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
