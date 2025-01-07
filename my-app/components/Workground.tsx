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
import { useToast } from "@/components/ui/use-toast";
import { useOrganizationList } from "@clerk/nextjs";
import Image from "next/image";
import { Send, X, Loader } from "lucide-react";

export default function Workground() {
  const { userMemberships, isLoaded } = useOrganizationList({
    userMemberships: { infinite: true },
  });

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && (file.type === "image/jpeg" || file.type === "image/png")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const { toast } = useToast();
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
      toast({
        title: "Error",
        description: "Could not fetch assistants. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const formData = {
      organization: selectedOrganizationId,
      assistant: selectedAssistantId,
      widget_name: widgetName,
      website_url: websiteUrl,
      avatar_url: avatarUrl,
      brand_color: brandColor,
      greeting_message: greetingMessage,
    };

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/widgets/`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) throw new Error("Failed to create widget");

      toast({
        title: "Success",
        description: "Widget created successfully!",
      });
      setLoading(false);
    } catch (error) {
      console.error("Error submitting widget:", error);
      toast({
        title: "Error",
        description: "Failed to create widget. Please try again.",
        variant: "destructive",
      });
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
              Avatar URL
            </label>
            <Input
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="URL for the avatar"
            />
          </div>
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

          <Button type="submit" className="w-full" disabled={loading}>
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
        <div className="flex flex-col w-full max-w-[400px] mx-auto bg-white rounded-xl overflow-hidden shadow-md">
          <div
            className="flex items-center p-4 text-white"
            style={{ backgroundColor: brandColor }}
          >
            <div className="relative w-8 h-8 rounded-full overflow-hidden mr-3">
              <Image
                src={avatarUrl}
                alt={widgetName}
                fill
                className="object-cover"
              />
            </div>
            <span className="font-semibold">{widgetName}</span>
          </div>

          {showWelcomeDialog && (
            <div className="relative m-4 p-4 bg-white rounded-lg border shadow-sm">
              <button
                onClick={() => setShowWelcomeDialog(false)}
                className="absolute top-2 right-2"
              >
                <X className="h-4 w-4 text-gray-500" />
              </button>
              <h3 className="font-semibold mb-2">Welcome to {widgetName}</h3>
              <p className="text-sm text-gray-600">{greetingMessage}</p>
            </div>
          )}

          <div className="flex-1 p-4">
            <ScrollArea className="h-[400px]">
              {messages.length === 0 ? (
                <div className="flex items-start space-x-2 mb-4">
                  <div className="relative w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                    <Image
                      src={avatarUrl}
                      alt={widgetName}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="bg-gray-100 rounded-lg p-3 max-w-[80%]">
                    <p className="text-sm">{greetingMessage}</p>
                  </div>
                </div>
              ) : (
                messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex items-start space-x-2 mb-4 ${
                      msg.role === "user"
                        ? "flex-row-reverse space-x-reverse"
                        : ""
                    }`}
                  >
                    <div
                      className={`rounded-lg p-3 max-w-[80%] ${
                        msg.role === "user"
                          ? "bg-blue-500 text-white"
                          : "bg-gray-100"
                      }`}
                    >
                      <p className="text-sm">{msg.content}</p>
                    </div>
                  </div>
                ))
              )}
            </ScrollArea>
          </div>

          <div className="border-t p-4">
            <div className="flex items-center space-x-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Chat with your assistant..."
                className="flex-1"
                onKeyPress={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
              <Button
                onClick={handleSendMessage}
                style={{ backgroundColor: brandColor }}
                className="text-white"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
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
