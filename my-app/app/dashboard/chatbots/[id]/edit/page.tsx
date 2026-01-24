"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  Play,
  Pause,
  Settings,
  Eye,
  Globe,
  Check,
  AlertCircle,
  ExternalLink,
  Loader2,
  Phone,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  ChatbotChannel,
} from "@/types/chatbot-automation";
import { WhatsAppIcon } from "@/components/icons/whatsapp-icon";
import { MessengerIcon } from "@/components/icons/messenger-icon";
import { InstagramIcon } from "@/components/icons/instagram-icon";
import FlowBuilder from "@/components/flow-builder/FlowBuilder";
import { useAppServices } from "@/hooks/use-app-services";

// Channel configuration
const AVAILABLE_CHANNELS: { id: ChatbotChannel; name: string; icon: React.ComponentType<{ className?: string }>; description: string }[] = [
  { id: "whatsapp", name: "WhatsApp", icon: WhatsAppIcon, description: "WhatsApp Business API" },
  { id: "widget", name: "Website Widget", icon: Globe, description: "Embed on your website" },
  { id: "messenger", name: "Messenger", icon: MessengerIcon, description: "Facebook Messenger" },
  { id: "instagram", name: "Instagram", icon: InstagramIcon, description: "Instagram DMs" },
];

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

  // Channel setup dialog
  const [channelSetupDialog, setChannelSetupDialog] = useState<{
    open: boolean;
    channel: ChatbotChannel | null;
  }>({ open: false, channel: null });

  // WhatsApp services
  const { appServices, loading: loadingServices, refetch: refetchServices } = useAppServices();

  // Preview dialog
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewInput, setPreviewInput] = useState("");
  const [previewMessages, setPreviewMessages] = useState<
    { type: "user" | "bot"; content: string; menu?: ChatbotMenu }[]
  >([]);

  // Validation
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Fetch chatbot
  const fetchChatbot = useCallback(async () => {
    setLoading(true);
    try {
      const data = await ChatbotAutomationService.getChatbot(chatbotId);
      setChatbot(data);
    } catch (error) {
      console.error("Error fetching chatbot:", error);
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
      console.error("Error saving chatbot:", error);
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
      console.error("Error toggling chatbot:", error);
      toast.error("Failed to update status");
    }
  };

  // Preview simulation
  const simulatePreview = () => {
    if (!chatbot || !previewInput.trim()) return;

    // Add user message
    setPreviewMessages((prev) => [...prev, { type: "user", content: previewInput }]);

    // Find matching menu
    const menu = ChatbotAutomationService.findMenuByKeyword(chatbot, previewInput);

    if (menu) {
      setPreviewMessages((prev) => [...prev, { type: "bot", content: menu.body, menu }]);
    } else {
      setPreviewMessages((prev) => [
        ...prev,
        { type: "bot", content: chatbot.settings.fallbackMessage || "I'll connect you with support." },
      ]);
    }

    setPreviewInput("");
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
              <Badge variant={chatbot.isActive ? "default" : "secondary"}>
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

              {/* Channels */}
              <div className="space-y-4">
                <h3 className="font-medium">Channels</h3>
                <p className="text-sm text-muted-foreground">
                  Select which channels this chatbot should be active on.
                </p>
                <div className="space-y-2">
                  {AVAILABLE_CHANNELS.map((channel) => {
                    const channelConfig = chatbot.channels?.find(
                      (c) => c.channel === channel.id
                    );
                    const isEnabled = channelConfig?.enabled;
                    const IconComponent = channel.icon;

                    // For WhatsApp, show connected phone number
                    const connectedService = channel.id === "whatsapp" && channelConfig?.appServiceId
                      ? appServices.find((s) => s.id === channelConfig.appServiceId)
                      : null;

                    return (
                      <div
                        key={channel.id}
                        className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                          isEnabled
                            ? "border-primary bg-primary/5"
                            : "border-muted hover:bg-muted/50"
                        }`}
                        onClick={() => {
                          // Open channel setup dialog
                          setChannelSetupDialog({ open: true, channel: channel.id });
                        }}
                      >
                        <IconComponent className="h-5 w-5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{channel.name}</p>
                          {isEnabled && connectedService ? (
                            <p className="text-xs text-primary truncate">
                              {connectedService.phone_number || connectedService.name}
                            </p>
                          ) : (
                            <p className="text-xs text-muted-foreground truncate">
                              {channel.description}
                            </p>
                          )}
                        </div>
                        {isEnabled && (
                          <Check className="h-4 w-4 text-primary flex-shrink-0" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Welcome Message */}
              <div className="space-y-4">
                <h3 className="font-medium">Welcome Message</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Enable Welcome Message</Label>
                    <p className="text-xs text-muted-foreground">
                      Automatically greet new conversations
                    </p>
                  </div>
                  <Switch
                    checked={chatbot.settings.welcomeEnabled}
                    onCheckedChange={(checked) =>
                      updateChatbot({
                        settings: { ...chatbot.settings, welcomeEnabled: checked },
                      })
                    }
                  />
                </div>
                {chatbot.settings.welcomeEnabled && (
                  <div className="space-y-2">
                    <Label>Welcome Menu</Label>
                    <Select
                      value={chatbot.settings.welcomeMenuId || ""}
                      onValueChange={(value) =>
                        updateChatbot({
                          settings: { ...chatbot.settings, welcomeMenuId: value },
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select welcome menu" />
                      </SelectTrigger>
                      <SelectContent>
                        {chatbot.menus.map((m) => (
                          <SelectItem key={m.id} value={m.id}>
                            {m.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              {/* Fallback Settings */}
              <div className="space-y-4">
                <h3 className="font-medium">Fallback Behavior</h3>
                <div className="space-y-2">
                  <Label>Unknown Input Behavior</Label>
                  <Select
                    value={chatbot.settings.unknownInputBehavior}
                    onValueChange={(value: "repeat_menu" | "fallback_ai") =>
                      updateChatbot({
                        settings: { ...chatbot.settings, unknownInputBehavior: value },
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="repeat_menu">Repeat Current Menu</SelectItem>
                      <SelectItem value="fallback_ai">Hand off to AI</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Fallback Message</Label>
                  <Textarea
                    value={chatbot.settings.fallbackMessage}
                    onChange={(e) =>
                      updateChatbot({
                        settings: { ...chatbot.settings, fallbackMessage: e.target.value },
                      })
                    }
                    placeholder="Message shown before AI takes over"
                    rows={2}
                  />
                </div>
              </div>

              {/* Session Settings */}
              <div className="space-y-4">
                <h3 className="font-medium">Session Settings</h3>
                <div className="space-y-2">
                  <Label>Session Timeout (minutes)</Label>
                  <Input
                    type="number"
                    min={1}
                    max={1440}
                    value={chatbot.settings.sessionTimeoutMinutes}
                    onChange={(e) =>
                      updateChatbot({
                        settings: {
                          ...chatbot.settings,
                          sessionTimeoutMinutes: parseInt(e.target.value) || 30,
                        },
                      })
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    How long before a session expires and restarts
                  </p>
                </div>
              </div>
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>

      {/* Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Preview Chatbot</DialogTitle>
            <DialogDescription>Test your chatbot flow with sample inputs</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <ScrollArea className="h-[300px] border rounded-lg p-4">
              {previewMessages.length === 0 ? (
                <div className="text-center text-sm text-muted-foreground py-8">
                  Send a message to start testing
                </div>
              ) : (
                <div className="space-y-3">
                  {previewMessages.map((msg, i) => (
                    <div
                      key={i}
                      className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                          msg.type === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}
                      >
                        <p>{msg.content}</p>
                        {msg.menu && msg.menu.options.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {msg.menu.options.map((opt) => (
                              <Button
                                key={opt.id}
                                variant="outline"
                                size="sm"
                                className="w-full h-7 text-xs"
                                onClick={() => {
                                  setPreviewMessages((prev) => [
                                    ...prev,
                                    { type: "user", content: opt.title },
                                  ]);
                                  // Handle option action
                                  if (opt.action.type === "show_menu") {
                                    const targetMenu = chatbot.menus.find(
                                      (m) => m.id === opt.action.targetMenuId
                                    );
                                    if (targetMenu) {
                                      setPreviewMessages((prev) => [
                                        ...prev,
                                        { type: "bot", content: targetMenu.body, menu: targetMenu },
                                      ]);
                                    }
                                  } else if (opt.action.type === "send_message") {
                                    setPreviewMessages((prev) => [
                                      ...prev,
                                      { type: "bot", content: opt.action.message || "Message sent" },
                                    ]);
                                  } else if (opt.action.type === "fallback_ai") {
                                    setPreviewMessages((prev) => [
                                      ...prev,
                                      { type: "bot", content: "Connecting to AI assistant..." },
                                    ]);
                                  } else {
                                    setPreviewMessages((prev) => [
                                      ...prev,
                                      { type: "bot", content: "Conversation ended. Thank you!" },
                                    ]);
                                  }
                                }}
                              >
                                {opt.title}
                              </Button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
            <div className="flex gap-2">
              <Input
                value={previewInput}
                onChange={(e) => setPreviewInput(e.target.value)}
                placeholder="Type a message..."
                onKeyDown={(e) => e.key === "Enter" && simulatePreview()}
              />
              <Button onClick={simulatePreview}>Send</Button>
            </div>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setPreviewMessages([])}
            >
              Clear Chat
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Channel Setup Dialog */}
      <Dialog
        open={channelSetupDialog.open}
        onOpenChange={(open) => setChannelSetupDialog({ open, channel: open ? channelSetupDialog.channel : null })}
      >
        <DialogContent className="max-w-md">
          {channelSetupDialog.channel === "whatsapp" && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <WhatsAppIcon className="h-5 w-5" />
                  Connect WhatsApp
                </DialogTitle>
                <DialogDescription>
                  {appServices.length > 0
                    ? "Select a WhatsApp number to use with this chatbot"
                    : "Connect your WhatsApp Business account to use this channel"}
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
                              ? "border-primary bg-primary/5"
                              : "border-muted hover:bg-muted/50"
                          }`}
                          onClick={() => {
                            const currentChannels = chatbot.channels || [];
                            const existingIndex = currentChannels.findIndex(
                              (c) => c.channel === "whatsapp"
                            );

                            let newChannels: ChannelConfig[];
                            if (existingIndex >= 0) {
                              // Toggle off if clicking same service, or update to new service
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
                            setChannelSetupDialog({ open: false, channel: null });
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
                            <Check className="h-4 w-4 text-primary flex-shrink-0" />
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
                      onClick={() => setChannelSetupDialog({ open: false, channel: null })}
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
            </>
          )}

          {channelSetupDialog.channel === "widget" && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Website Widget
                </DialogTitle>
                <DialogDescription>
                  Enable the website widget for this chatbot
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  When enabled, this chatbot will be available through website widgets
                  embedded on your site.
                </p>

                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setChannelSetupDialog({ open: false, channel: null })}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => {
                      const currentChannels = chatbot.channels || [];
                      const existingIndex = currentChannels.findIndex(
                        (c) => c.channel === "widget"
                      );
                      const isCurrentlyEnabled =
                        existingIndex >= 0 && currentChannels[existingIndex].enabled;

                      let newChannels: ChannelConfig[];
                      if (existingIndex >= 0) {
                        newChannels = currentChannels.map((c, i) =>
                          i === existingIndex ? { ...c, enabled: !c.enabled } : c
                        );
                      } else {
                        newChannels = [
                          ...currentChannels,
                          { channel: "widget", enabled: true },
                        ];
                      }

                      updateChatbot({ channels: newChannels });
                      setChannelSetupDialog({ open: false, channel: null });
                      toast.success(
                        isCurrentlyEnabled
                          ? "Widget channel disabled"
                          : "Widget channel enabled"
                      );
                    }}
                  >
                    {chatbot.channels?.some((c) => c.channel === "widget" && c.enabled)
                      ? "Disable Widget"
                      : "Enable Widget"}
                  </Button>
                </DialogFooter>
              </div>
            </>
          )}

          {(channelSetupDialog.channel === "messenger" ||
            channelSetupDialog.channel === "instagram") && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {channelSetupDialog.channel === "messenger" ? (
                    <MessengerIcon className="h-5 w-5" />
                  ) : (
                    <InstagramIcon className="h-5 w-5" />
                  )}
                  {channelSetupDialog.channel === "messenger" ? "Messenger" : "Instagram"}
                </DialogTitle>
                <DialogDescription>
                  Connect your {channelSetupDialog.channel === "messenger" ? "Facebook Page" : "Instagram account"}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="text-center py-6">
                  <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                    {channelSetupDialog.channel === "messenger" ? (
                      <MessengerIcon className="h-8 w-8" />
                    ) : (
                      <InstagramIcon className="h-8 w-8" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {channelSetupDialog.channel === "messenger"
                      ? "Connect your Facebook Page to enable Messenger integration."
                      : "Connect your Instagram account to enable DM integration."}
                  </p>
                </div>

                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setChannelSetupDialog({ open: false, channel: null })}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() =>
                      router.push(
                        channelSetupDialog.channel === "messenger"
                          ? "/dashboard/conversations/messenger"
                          : "/dashboard/conversations/instagram"
                      )
                    }
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Go to Setup
                  </Button>
                </DialogFooter>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
