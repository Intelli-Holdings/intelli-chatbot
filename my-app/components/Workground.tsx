"use client";

import { useState, useEffect, useRef, useCallback } from "react";
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
import useActiveOrganizationId from "@/hooks/use-organization-id";

interface Assistant {
  id: number;
  name: string;
  prompt: string;
  assistant_id: string;
  organization: string;
  organization_id: string;
  type: string;
  created_at: string;
  updated_at: string;
}

export default function Workground() {
  const [widgetKey, setWidgetKey] = useState<string>("");
  const [showDeploymentDialog, setShowDeploymentDialog] = useState<boolean>(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  // Use the hook to auto-select organization
  const organizationId = useActiveOrganizationId();

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
  const [isLoadingAssistants, setIsLoadingAssistants] = useState<boolean>(true);
  const [selectedOrganizationId, setSelectedOrganizationId] =
    useState<string>("");
  const [assistants, setAssistants] = useState<Assistant[]>([]);
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

  // Auto-select organization when it's loaded
  useEffect(() => {
    if (organizationId) {
      setSelectedOrganizationId(organizationId);
    }
  }, [organizationId]);

  // Improved fetchAssistants function with validation and error handling
  const fetchAssistants = useCallback(async () => {
    if (!selectedOrganizationId) return;

    setIsLoadingAssistants(true);
    try {
      const response = await fetch(`/api/assistants/${selectedOrganizationId}`);

      if (!response.ok) {
        if (response.status === 404) {
          toast.info("No assistants found. Create one to get started.");
          setAssistants([]);
          return;
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data: Assistant[] = await response.json();

      if (!Array.isArray(data)) {
        console.error("[Workground] API response is not an array:", data);
        throw new Error("Invalid response format: expected array of assistants");
      }

      const validatedAssistants = data.filter((assistant) => {
        const isValid =
          assistant &&
          typeof assistant.id === "number" &&
          typeof assistant.name === "string" &&
          typeof assistant.assistant_id === "string" &&
          typeof assistant.organization === "string" &&
          typeof assistant.prompt === "string";

        if (!isValid) {
          console.warn("[Workground] Invalid assistant object:", assistant);
        }

        return isValid;
      });

      setAssistants(validatedAssistants);

      // Auto-select the first assistant if available
      if (validatedAssistants.length > 0 && !selectedAssistantId) {
        setSelectedAssistantId(validatedAssistants[0].assistant_id);
      
      }

      if (validatedAssistants.length === 0) {
        toast.info("No valid assistants found. Create one to get started.");
      }
    } catch (error) {
      console.error("[Workground] Error fetching assistants:", error);
      toast.error(`Failed to fetch assistants: ${error instanceof Error ? error.message : "Unknown error"}`);
      setAssistants([]);
    } finally {
      setIsLoadingAssistants(false);
    }
  }, [selectedOrganizationId, selectedAssistantId]);

  useEffect(() => {
    fetchAssistants();
  }, [fetchAssistants]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!selectedOrganizationId) {
      toast.error("Organization is required. Please wait for it to load.");
      return;
    }

    if (!selectedAssistantId) {
      toast.error("Please select an assistant.");
      return;
    }

    if (!widgetName.trim()) {
      toast.error("Widget name is required.");
      return;
    }

    if (!websiteUrl.trim()) {
      toast.error("Website URL is required.");
      return;
    }

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

    // Log FormData contents properly
 
    for (const [key, value] of Array.from(formData.entries())) {
    }

    try {
      const response = await fetch("/api/widgets", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setWidgetKey(data.widget_key);
      toast.success("Website Widget created successfully!");
      setShowDeploymentDialog(true);
    } catch (error) {
      console.error("[Workground] Error submitting widget:", error);
      toast.error(`Failed to create widget: ${error instanceof Error ? error.message : "Unknown error"}`);
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

          {/* Show loading state while organization is being fetched */}
          {!selectedOrganizationId && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4">
              <div className="flex items-center space-x-2">
                <Loader className="animate-spin h-4 w-4 text-blue-600" />
                <span className="text-sm text-blue-600">Loading organization...</span>
              </div>
            </div>
          )}

          {/* Organization Selection - Only show if user has multiple organizations */}
          {userMemberships?.data && userMemberships.data.length > 1 && (
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
                    {userMemberships.data.map((membership) => (
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
          )}

          {/* Hidden field to show selected organization if only one exists */}
          {userMemberships?.data && userMemberships.data.length === 1 && (
            <input type="hidden" value={selectedOrganizationId} />
          )}

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Assistant
            </label>
            <Select
              value={selectedAssistantId}
              onValueChange={setSelectedAssistantId}
              disabled={isLoadingAssistants}
            >
              <SelectTrigger>
                <SelectValue placeholder={isLoadingAssistants ? "Loading assistants..." : "Choose an assistant"} />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {assistants.map((assistant) => (
                    <SelectItem key={assistant.assistant_id} value={assistant.assistant_id}>
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

          <Button
            type="submit"
            className="w-full bg-blue-600 bg-blue-600 hover:bg-blue-700"
            disabled={loading || !selectedOrganizationId || !selectedAssistantId || isLoadingAssistants}
          >
            {loading ? (
              <div className="flex items-center justify-center space-x-2">
                <Loader className="animate-spin h-5 w-5" />
                <span>Creating Widget...</span>
              </div>
            ) : isLoadingAssistants ? (
              <div className="flex items-center justify-center space-x-2">
                <Loader className="animate-spin h-5 w-5" />
                <span>Loading Assistants...</span>
              </div>
            ) : !selectedOrganizationId ? (
              "Waiting for Organization..."
            ) : !selectedAssistantId ? (
              "Select an Assistant"
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

