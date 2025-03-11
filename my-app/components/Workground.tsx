"use client";

import { useState, useEffect, useRef } from "react";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { useOrganizationList } from "@clerk/nextjs";
import Image from "next/image";
import { Send, X, Loader } from 'lucide-react';
import { toast } from "sonner";
import { DeploymentDialog } from "@/components/deployment-dialog";
import { WidgetCommunication } from "@/components/widget-communication";

export default function Workground() {
  const [widgetKey, setWidgetKey] = useState<string>("");
  const [showDeploymentDialog, setShowDeploymentDialog] = useState<boolean>(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const { userMemberships, isLoaded } = useOrganizationList({
    userMemberships: { infinite: true },
  });

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && (file.type === "image/jpeg" || file.type === "image/png")) {
      setAvatarFile(file); // Store the actual file
      // Create a preview URL for the UI
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const [loading, setLoading] = useState<boolean>(false);
  const [selectedOrganizationId, setSelectedOrganizationId] =
    useState<string>("");
  const [assistants, setAssistants] = useState<{ id: string; name: string }[]>(
    []
  );
  const [selectedAssistantId, setSelectedAssistantId] = useState<string>("");
  const [websiteUrl, setWebsiteUrl] = useState<string>(
    "https://yourwebsite.com"
  );
  const [widgetName, setWidgetName] = useState<string>("Your widget name");
  const [avatarUrl, setAvatarUrl] = useState<string>("/Avatar.png");
  const [brandColor, setBrandColor] = useState<string>("#007fff");
  const [greetingMessage, setGreetingMessage] = useState<string>(
    "Hello! I'm here to help."
  );
  const [messages, setMessages] = useState<
    { role: "user" | "assistant"; content: string }[]
  >([]);
  const [newMessage, setNewMessage] = useState<string>("");
  const [showWelcomeDialog, setShowWelcomeDialog] = useState<boolean>(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isLoaded && userMemberships.data.length > 0) {
      setSelectedOrganizationId(userMemberships.data[0].organization.id);
    }
  }, [isLoaded, userMemberships.data]);

  useEffect(() => {
    if (selectedOrganizationId) {
      fetchAssistants(selectedOrganizationId);
    }
  }, [selectedOrganizationId]);  

  const fetchAssistants = async (organizationId: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/get/assistants/${organizationId}/`
      );
      if (!response.ok) throw new Error("Failed to fetch assistants");
      const data = await response.json();
      setAssistants(
        data.map((assistant: any) => ({
          id: assistant.assistant_id,
          name: assistant.name,
        }))
      );
    } catch (error) {
      console.error("Error fetching assistants:", error);
      setAssistants([]);
      toast.info("Selected organisation does not have any assistants. Please create assistant to get started.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
  
    const formData = new FormData();
    formData.append("organization_id", selectedOrganizationId);
    formData.append("assistant_id", selectedAssistantId);
    formData.append("widget_name", widgetName);
    formData.append("website_url", websiteUrl);
    formData.append("brand_color", brandColor);
    formData.append("greeting_message", greetingMessage);
    
    // Append the actual image file if it exists
    if (avatarFile) {
      formData.append("avatar_url", avatarFile);
    }
    
    console.log("Payload being sent to the backend:", formData);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/widgets/`, {
        method: "POST",
        body: formData,
      });
  
      if (!response.ok) throw new Error("Failed to create widget");
  
      const data = await response.json();
      setWidgetKey(data.widget_key); 
      toast.success("Website Widget created successfully!");
      setShowDeploymentDialog(true); 
    } catch (error) {
      console.error("Error submitting widget:", error);
      toast.error("Failed to create widget. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = () => {
    if (newMessage) {
      setMessages((prev) => [
        ...prev,
        { role: "user", content: newMessage },
        { role: "assistant", content: `Response: ${newMessage}` },
      ]);
      setNewMessage("");
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 p-2 border border-dotted border-2 rounded-lg">
      {/* Left Side: Form */}
      <div className="md:w-1/2 bg-white shadow-md p-6 rounded-lg border border-gray-200 rounded-xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <h2 className="text-xl font-semibold mb-4">
            Create a Website Widget
          </h2>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
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
                <SelectGroup>
                  {userMemberships?.data?.map((membership) => (
                    <SelectItem
                      key={membership.organization.id}
                      value={membership.organization.id}
                    >
                      {membership.organization.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Assistant
            </label>
            <Select
              value={selectedAssistantId}
              onValueChange={setSelectedAssistantId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose an assistant" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {assistants.map((assistant) => (
                    <SelectItem key={assistant.id} value={assistant.id}>
                      {assistant.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <InputField
            label="Widget Name"
            value={widgetName}
            onChange={setWidgetName}
          />
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Avatar
            </label>
            <div className="flex items-center space-x-4">
              <div className="relative w-12 h-12 rounded-full overflow-hidden">
                <Image
                  src={avatarUrl}
                  alt="Assistant Avatar"
                  fill
                  className="object-cover"
                />
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
              >
                Upload Avatar
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/jpeg,image/png"
                onChange={handleAvatarUpload}
              />
            </div>
          </div>
          <InputField
            label="Website URL"
            value={websiteUrl}
            onChange={setWebsiteUrl}
          />

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Brand Color
            </label>
            <div className="flex items-center space-x-2">
              <Input
                type="color"
                value={brandColor}
                onChange={(e) => setBrandColor(e.target.value)}
                className="w-12 h-10 p-1 border border-rounded-xl border-gray-300 rounded-md cursor-pointer"
                title="Pick a color"
              />
              <Input
                type="text"
                value={brandColor}
                onChange={(e) => setBrandColor(e.target.value)}
                placeholder="#007fff"
                title="Enter color code"
                className="flex-1"
              />
            </div>
          </div>

          <InputField
            label="Greeting Message"
            value={greetingMessage}
            onChange={setGreetingMessage}
          />

          <Button type="submit" className="w-full bg-blue-600 bg-blue-600 hover:bg-blue-700" disabled={loading}>
            {loading ? (
              <div className="flex items-center justify-center space-x-2">
                <Loader className="animate-spin h-5 w-5" />
                <span>Creating Widget...</span>
              </div>
            ) : (
              "Create Widget"
            )}
          </Button>
        </form>
      </div>

      {/* Right Side: Preview */}
      <div className="md:w-1/2 flex items-center justify-center">
        <WidgetCommunication
          widgetKey={widgetKey}
          widgetName={widgetName}
          avatarUrl={avatarUrl}
          brandColor={brandColor}
          greetingMessage={greetingMessage}
        />
      </div>

      {/* Deployment Dialog */}
      {showDeploymentDialog && (
        <DeploymentDialog 
          onClose={() => setShowDeploymentDialog(false)}
          widgetKey={widgetKey}
          websiteUrl={websiteUrl}
        />
      )}
    </div>
  );
}

function InputField({ label, value, onChange, type = "text" }: any) {
  return (
    <div>
      <label className="block text-sm font-medium text-foreground mb-1">
        {label}
      </label>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        type={type}
        placeholder={`Enter ${label.toLowerCase()}`}
      />
    </div>
  );
}

