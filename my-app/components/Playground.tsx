"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Edit, Send, Trash2, Plus, Upload, X, FileText, ArrowUp, XIcon } from 'lucide-react';
import { ScrollAreaScrollbar } from "@radix-ui/react-scroll-area";
import { CreateWidgetData } from "@/types/widget";
import { createWidget } from "@/lib/widgets";
import { useOrganization, useOrganizationList } from "@clerk/nextjs";

export default function Playground() {
  const [widgetData, setWidgetData] = useState<CreateWidgetData>({
    organizationId: "",
    assistantId: "",
    websiteUrl: "",
    widgetName: "",
    colorPrimaryColor: "#007fff",
    colorBubbleBackground: "#ffffff",
    colorUserBubbleColor: "#007fff",
    colorUserBubbleTextColor: "#ffffff",
    colorTextColor: "#000000",
    colorHeaderBackground: "#f0f0f0",
    stylingBorderRadius: 8,
    stylingBubbleShape: "rounded",
    stylingPosition: "bottom-right",
    stylingWidth: 350,
    avatarUrl: "",
    avatarShape: "circle",
    enableMarkdown: false,
    enableCodeHighlighting: false,
  });

  const [useCustomAssistants, setUseCustomAssistants] = useState<boolean>(false);
  const [selectedAssistant, setSelectedAssistant] = useState<string>("gpt-3.5-turbo");
  const [temperature, setTemperature] = useState<number>(0.7);
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([]);
  const [newMessage, setNewMessage] = useState<string>("");
  const [systemPrompt, setSystemPrompt] = useState<string>("You are a helpful assistant.");
  const [customAssistants, setCustomAssistants] = useState<string[]>(["My Assistant 1", "My Assistant 2"]);
  const [newAssistantName, setNewAssistantName] = useState<string>("");
  const [isAddingAssistant, setIsAddingAssistant] = useState<boolean>(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { organization } = useOrganization();
  const { userMemberships, isLoaded } = useOrganizationList({
    userMemberships: {
      infinite: true,
    },
  });

  const defaultModels = ["gpt-3.5-turbo", "gpt-4", "claude-v1"];

  useEffect(() => {
    if (isLoaded && userMemberships.data && userMemberships.data.length > 0) {
      handleWidgetDataChange("organizationId", userMemberships.data[0].organization.id);
    }
  }, [isLoaded, userMemberships.data]);

  const handleSendMessage = () => {
    if (newMessage) {
      setMessages((prevMessages) => [
        ...prevMessages,
        { role: "user", content: newMessage },
        {
          role: "assistant",
          content: `Response from ${selectedAssistant}: ${newMessage}`,
        },
      ]);
      setNewMessage("");
    }
  };

  const handleClearConversation = () => {
    setMessages([]);
  };

  const handleAddAssistant = () => {
    if (newAssistantName) {
      setCustomAssistants((prev) => [...prev, newAssistantName]);
      setNewAssistantName("");
      setIsAddingAssistant(false);
    }
  };

  const handleFileUpload = useCallback((files: FileList | null) => {
    if (files) {
      const newFiles = Array.from(files);
      setUploadedFiles((prevFiles) => [...prevFiles, ...newFiles]);

      // Save to local storage
      const storedFiles = JSON.parse(localStorage.getItem("uploadedFiles") || "[]");
      const updatedFiles = [...storedFiles, ...newFiles.map((file) => file.name)];
      localStorage.setItem("uploadedFiles", JSON.stringify(updatedFiles));
    }
  }, []);

  const handleRemoveFile = (fileName: string) => {
    setUploadedFiles((prevFiles) => prevFiles.filter((file) => file.name !== fileName));

    // Remove from local storage
    const storedFiles = JSON.parse(localStorage.getItem("uploadedFiles") || "[]");
    const updatedFiles = storedFiles.filter((name: string) => name !== fileName);
    localStorage.setItem("uploadedFiles", JSON.stringify(updatedFiles));
  };

  const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      handleFileUpload(event.dataTransfer.files);
    },
    [handleFileUpload]
  );

  const handleWidgetDataChange = (key: keyof CreateWidgetData, value: any) => {
    setWidgetData((prev) => ({ ...prev, [key]: value }));
  };

  const handleCreateWidget = async () => {
    if (!widgetData.organizationId || !widgetData.assistantId) {
      console.error("Organization and Assistant must be selected");
      return;
    }

    try {
      const response = await createWidget(widgetData);
      console.log("Widget created:", response);
      // Handle success (e.g., show a success message, reset form, etc.)
    } catch (error) {
      console.error("Error creating widget:", error);
      // Handle error (e.g., show an error message)
    }
  };

  return (
    <Card className=" h-[700px]">
      <CardContent className="p-1 sm:p-6">
        <div className=" h-[500px] sm:h-[calc(100vh-8rem)] bg-background">
        <ScrollArea className=" w-full lg:w-[400px] h-[500px] sm:h-[calc(100vh-8rem)] lg:h-[600px] border border-border rounded-lg lg:rounded-l-lg lg:border-r lg:border-b">
          <div className="w-full bg-gray-50 p-4 sm:p-4 border rounded-lg border-b lg:border-b-0 lg:border-r border-border ">
            <h2 className="text-xl font-semibold mb-4">Widget Creator</h2>
          
              <div className="">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Organization</label>
                  <Select 
                    value={widgetData.organizationId} 
                    onValueChange={(value) => handleWidgetDataChange("organizationId", value)}
                    disabled={!isLoaded}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select an organization" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {isLoaded && userMemberships.data && userMemberships.data.map((membership) => (
                          <SelectItem key={membership.organization.id} value={membership.organization.id}>
                            {membership.organization.name}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="assistantId">Assistant ID</Label>
                  <Input
                    id="assistantId"
                    value={widgetData.assistantId}
                    onChange={(e) => handleWidgetDataChange("assistantId", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="websiteUrl">Website URL</Label>
                  <Input
                    id="websiteUrl"
                    value={widgetData.websiteUrl}
                    onChange={(e) => handleWidgetDataChange("websiteUrl", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="widgetName">Widget Name</Label>
                  <Input
                    id="widgetName"
                    value={widgetData.widgetName}
                    onChange={(e) => handleWidgetDataChange("widgetName", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="colorPrimaryColor">Primary Color</Label>
                  <Input
                    id="colorPrimaryColor"
                    type="color"
                    value={widgetData.colorPrimaryColor}
                    onChange={(e) => handleWidgetDataChange("colorPrimaryColor", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="stylingBubbleShape">Bubble Shape</Label>
                  <Select
                    value={widgetData.stylingBubbleShape}
                    onValueChange={(value) => handleWidgetDataChange("stylingBubbleShape", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="square">Square</SelectItem>
                      <SelectItem value="rounded">Rounded</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="stylingPosition">Position</Label>
                  <Select
                    value={widgetData.stylingPosition}
                    onValueChange={(value) => handleWidgetDataChange("stylingPosition", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="top-left">Top Left</SelectItem>
                      <SelectItem value="top-right">Top Right</SelectItem>
                      <SelectItem value="bottom-left">Bottom Left</SelectItem>
                      <SelectItem value="bottom-right">Bottom Right</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="stylingWidth">Width</Label>
                  <Input
                    id="stylingWidth"
                    type="number"
                    value={widgetData.stylingWidth}
                    onChange={(e) => handleWidgetDataChange("stylingWidth", parseInt(e.target.value, 10))}
                  />
                </div>
                <div>
                  <Label htmlFor="avatarUrl">Avatar URL</Label>
                  <Input
                    id="avatarUrl"
                    value={widgetData.avatarUrl}
                    onChange={(e) => handleWidgetDataChange("avatarUrl", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="avatarShape">Avatar Shape</Label>
                  <Select
                    value={widgetData.avatarShape}
                    onValueChange={(value) => handleWidgetDataChange("avatarShape", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="square">Square</SelectItem>
                      <SelectItem value="rounded">Rounded</SelectItem>
                      <SelectItem value="circle">Circle</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="enableMarkdown"
                    checked={widgetData.enableMarkdown}
                    onCheckedChange={(checked) => handleWidgetDataChange("enableMarkdown", checked)}
                  />
                  <Label htmlFor="enableMarkdown">Enable Markdown</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="enableCodeHighlighting"
                    checked={widgetData.enableCodeHighlighting}
                    onCheckedChange={(checked) => handleWidgetDataChange("enableCodeHighlighting", checked)}
                  />
                  <Label htmlFor="enableCodeHighlighting">Enable Code Highlighting</Label>
                </div>
                <Button onClick={handleCreateWidget}>Create Widget</Button>
              </div>
          
          </div>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
}

