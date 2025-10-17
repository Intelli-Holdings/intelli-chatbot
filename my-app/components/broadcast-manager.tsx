"use client";

import React, { useState } from "react";
import {
  Send,
  Users,
  MessageSquare,
  Eye,
  Calendar,
  ExternalLink,
  Phone,
  Video,
  MoreVertical,
  CheckCheck,
  Search,
  BookOpenCheck,
  MapPin,
  Image as ImageIcon,
  Upload,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import Link from "next/link";
import { WhatsAppService, type WhatsAppTemplate, type AppService } from "@/services/whatsapp";

interface BroadcastManagerProps {
  appService: AppService;
  templates: WhatsAppTemplate[];
  onSendTest: (
    templateName: string,
    phoneNumber: string,
    parameters: string[],
    language: string,
    locationData?: {
      latitude: string;
      longitude: string;
      name: string;
      address: string;
    },
    mediaHandle?: string
  ) => Promise<boolean>;
  loading: boolean;
}

export default function BroadcastManager({
  appService,
  templates,
  onSendTest,
  loading,
}: BroadcastManagerProps) {
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [parameters, setParameters] = useState<string[]>([]);
  const [locationData, setLocationData] = useState({
    latitude: "",
    longitude: "",
    name: "",
    address: "",
  });
  const [isSending, setIsSending] = useState(false);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [previewTemplate, setPreviewTemplate] =
    useState<WhatsAppTemplate | null>(null);

  // Media handling state
  const [mediaHandle, setMediaHandle] = useState<string | null>(null);
  const [useCustomMedia, setUseCustomMedia] = useState(false);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [mediaFileInput, setMediaFileInput] = useState<File | null>(null);

  const selectedTemplate = templates.find((t) => t.id === selectedTemplateId);
  const approvedTemplates = templates.filter((t) => t.status === "APPROVED");

  // Extract parameters from template
  const getTemplateParameters = (template: WhatsAppTemplate) => {
    const params: string[] = [];
    template.components?.forEach((component) => {
      if (component.type === "BODY" && component.text) {
        const matches = component.text.match(/\{\{(\d+)\}\}/g) || [];
        matches.forEach((match: string) => {
          const paramNum = parseInt(match.replace(/[{}]/g, ""));
          if (!params[paramNum - 1]) {
            params[paramNum - 1] = "";
          }
        });
      }
    });
    return params;
  };

  // Check if template has location header
  const hasLocationHeader = (template: WhatsAppTemplate) => {
    const hasLocation = template.components?.some(
      (c) =>
        c.type === "HEADER" &&
        (c.format?.toUpperCase() === "LOCATION")
    );
    return hasLocation;
  };

  const handleTemplateSelect = async (templateId: string) => {
    setSelectedTemplateId(templateId);
    const template = templates.find((t) => t.id === templateId);

    if (template) {
      const templateParams = getTemplateParameters(template);
      setParameters(new Array(templateParams.length).fill(""));

      // Reset states
      setLocationData({
        latitude: "",
        longitude: "",
        name: "",
        address: "",
      });
      setMediaHandle(null);
      setUseCustomMedia(false);
      setMediaFileInput(null);

      // Fetch media handle for templates with media headers
      if (WhatsAppService.hasMediaHeader(template)) {
        try {
          const templateDetails = await WhatsAppService.fetchTemplateDetails(
            appService,
            templateId
          );
          const existingHandle = WhatsAppService.extractMediaHandle(templateDetails);

          if (existingHandle) {
            setMediaHandle(existingHandle);
            toast.success("Template media loaded from Meta");
          } else {
            toast.info("No media found. You can upload new media.");
            setUseCustomMedia(true);
          }
        } catch (error) {
          console.error("Failed to fetch template media:", error);
          toast.warning("Couldn't fetch template media. You can upload new media.");
          setUseCustomMedia(true);
        }
      }
    }
  };

  const handleParameterChange = (index: number, value: string) => {
    const newParams = [...parameters];
    newParams[index] = value;
    setParameters(newParams);
  };

  const handleLocationChange = (
    field: keyof typeof locationData,
    value: string
  ) => {
    setLocationData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Media upload handler
  const handleMediaUpload = async () => {
    if (!mediaFileInput || !appService?.access_token) {
      toast.error("Missing file or access token");
      return;
    }

    setUploadingMedia(true);
    try {
      const result = await WhatsAppService.uploadMediaToMeta(
        mediaFileInput,
        appService.access_token
      );

      setMediaHandle(result.handle);
      toast.success("Media uploaded successfully to Meta!");
    } catch (error) {
      console.error("Media upload failed:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to upload media"
      );
    } finally {
      setUploadingMedia(false);
    }
  };

  // Helper functions for media
  const getAcceptedFileTypes = (mediaType: string): string => {
    switch (mediaType) {
      case "IMAGE":
        return "image/jpeg,image/jpg,image/png";
      case "VIDEO":
        return "video/mp4,video/3gpp";
      case "DOCUMENT":
        return "application/pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx";
      default:
        return "*";
    }
  };

  const getMediaTypeHelperText = (mediaType: string): string => {
    switch (mediaType) {
      case "IMAGE":
        return "Supported: JPG, PNG (max 5MB)";
      case "VIDEO":
        return "Supported: MP4, 3GPP (max 16MB)";
      case "DOCUMENT":
        return "Supported: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX (max 100MB)";
      default:
        return "Upload your file";
    }
  };

  const handleSendMessage = async () => {
    if (!selectedTemplate || !phoneNumber.trim()) {
      toast.error("Please select a template and enter a phone number");
      return;
    }

    // Validate media for templates with media headers
    if (WhatsAppService.hasMediaHeader(selectedTemplate) && !mediaHandle) {
      toast.error("Please upload media or use template's existing media");
      return;
    }

    // Validate location data if template has location header
    if (hasLocationHeader(selectedTemplate)) {
      if (
        !locationData.latitude ||
        !locationData.longitude ||
        !locationData.name ||
        !locationData.address
      ) {
        toast.error(
          "Please fill in all location fields (latitude, longitude, name, and address)"
        );
        return;
      }
    }

    setIsSending(true);
    try {
      // Pass location data and media handle
      const success = await onSendTest(
        selectedTemplate.name,
        phoneNumber,
        parameters,
        selectedTemplate.language,
        hasLocationHeader(selectedTemplate) ? locationData : undefined,
        mediaHandle || undefined
      );

      if (success) {
        toast.success("Test message sent successfully!");
        setPhoneNumber("");
        setParameters([]);
        setLocationData({
          latitude: "",
          longitude: "",
          name: "",
          address: "",
        });
        setMediaHandle(null);
        setUseCustomMedia(false);
        setMediaFileInput(null);
      }
    } catch (error) {
      toast.error("Failed to send test message");
    } finally {
      setIsSending(false);
    }
  };

  const handlePreviewTemplate = (template: WhatsAppTemplate) => {
    setPreviewTemplate(template);
    setShowTemplateDialog(true);
  };

  const replaceVariables = (
    text: string,
    params: string[] = parameters
  ): string => {
    let result = text;
    params.forEach((param, index) => {
      const placeholder = `{{${index + 1}}}`;
      result = result.replace(placeholder, param || `[Variable ${index + 1}]`);
    });
    // Replace any remaining placeholders
    result = result.replace(/\{\{(\d+)\}\}/g, "[Variable $1]");
    return result;
  };

  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const renderWhatsAppPreview = (
    template: WhatsAppTemplate,
    customParams?: string[]
  ) => {
    const headerComponent = template.components?.find(
      (c) => c.type === "HEADER"
    );
    const bodyComponent = template.components?.find((c) => c.type === "BODY");
    const footerComponent = template.components?.find(
      (c) => c.type === "FOOTER"
    );
    const buttonsComponent = template.components?.find(
      (c) => c.type === "BUTTONS"
    );
    const displayParams = customParams || parameters;
    const hasLocation = headerComponent?.format?.toUpperCase() === "LOCATION";

    return (
      <div className="w-full rounded-lg overflow-hidden shadow-xl">
        {/* WhatsApp Header */}
        <div className="bg-[#008069] text-white">
          <div className="flex items-center justify-between p-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-6 h-6 text-gray-600">
                  <path
                    fill="currentColor"
                    d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <div className="font-medium text-base">Business Account</div>
                <div className="text-xs opacity-80">online</div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button className="p-2 hover:bg-black/10 rounded-full transition-colors">
                <Video className="h-5 w-5" />
              </button>
              <button className="p-2 hover:bg-black/10 rounded-full transition-colors">
                <Phone className="h-5 w-5" />
              </button>
              <button className="p-2 hover:bg-black/10 rounded-full transition-colors">
                <MoreVertical className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div
          className="min-h-[350px] max-h-[400px] overflow-y-auto"
          style={{
            background: "#e5ddd5",
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d4d4d8' fill-opacity='0.15'%3E%3Cpath d='M50 50c0-5.5 4.5-10 10-10s10 4.5 10 10-4.5 10-10 10c-5.5 0-10-4.5-10-10zm10-7c-3.9 0-7 3.1-7 7s3.1 7 7 7 7-3.1 7-7-3.1-7-7-7zm-30 7c0-5.5 4.5-10 10-10s10 4.5 10 10-4.5 10-10 10c-5.5 0-10-4.5-10-10zm10-7c-3.9 0-7 3.1-7 7s3.1 7 7 7 7-3.1 7-7-3.1-7-7-7zM10 50c0-5.5 4.5-10 10-10s10 4.5 10 10-4.5 10-10 10c-5.5 0-10-4.5-10-10zm10-7c-3.9 0-7 3.1-7 7s3.1 7 7 7 7-3.1 7-7-3.1-7-7-7z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        >
          <div className="p-4 space-y-3">
            {/* Encryption Notice */}
            <div className="flex justify-center mb-4">
              <div
                className="text-xs px-3 py-1 rounded-full"
                style={{
                  backgroundColor: "#fef8c7",
                  color: "#54656f",
                }}
              >
                🔒 Messages are end-to-end encrypted
              </div>
            </div>

            {/* Business Message - Incoming */}
            <div className="flex justify-start">
              <div
                className="relative max-w-[75%]"
                style={{ marginLeft: "8px" }}
              >
                <div
                  className="rounded-lg shadow-sm"
                  style={{
                    backgroundColor: "#ffffff",
                    borderTopLeftRadius: "7px",
                    borderTopRightRadius: "7px",
                    borderBottomRightRadius: "7px",
                    borderBottomLeftRadius: "0px",
                  }}
                >
                  <div className="px-3 pt-2 pb-1">
                    {/* Header */}
                    {headerComponent && (
                      <div className="mb-2">
                        {/* Location Header */}
                        {hasLocation && (
                          <div className="bg-gray-100 rounded-md overflow-hidden mb-2">
                            {/* Map Area */}
                            <div className="relative h-32 w-full overflow-hidden">
                              {/* Background map pattern */}
                              <div
                                className="absolute inset-0"
                                style={{
                                  background:
                                    locationData.latitude &&
                                    locationData.longitude
                                      ? "linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 50%, #a5d6a7 100%)"
                                      : "linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 50%, #d0d0d0 100%)",
                                }}
                              >
                                {/* Grid pattern for map effect */}
                                <svg
                                  className="absolute inset-0 w-full h-full opacity-20"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <defs>
                                    <pattern
                                      id="grid"
                                      width="20"
                                      height="20"
                                      patternUnits="userSpaceOnUse"
                                    >
                                      <path
                                        d="M 20 0 L 0 0 0 20"
                                        fill="none"
                                        stroke="white"
                                        strokeWidth="0.5"
                                      />
                                    </pattern>
                                  </defs>
                                  <rect
                                    width="100%"
                                    height="100%"
                                    fill="url(#grid)"
                                  />
                                </svg>

                                {/* Road lines for map effect - only show when coordinates exist */}
                                {locationData.latitude &&
                                  locationData.longitude && (
                                    <svg
                                      className="absolute inset-0 w-full h-full opacity-30"
                                      xmlns="http://www.w3.org/2000/svg"
                                    >
                                      <path
                                        d="M0,40 Q60,50 120,45 T240,50"
                                        stroke="#81c784"
                                        strokeWidth="3"
                                        fill="none"
                                      />
                                      <path
                                        d="M20,80 Q80,75 140,82 T260,78"
                                        stroke="#81c784"
                                        strokeWidth="2"
                                        fill="none"
                                      />
                                      <path
                                        d="M40,20 L40,120"
                                        stroke="#81c784"
                                        strokeWidth="2"
                                        fill="none"
                                      />
                                      <path
                                        d="M100,10 L100,130"
                                        stroke="#81c784"
                                        strokeWidth="1.5"
                                        fill="none"
                                      />
                                    </svg>
                                  )}
                              </div>

                              {/* Location Pin */}
                              <div className="absolute inset-0 flex items-center justify-center">
                                {locationData.latitude &&
                                locationData.longitude ? (
                                  <div className="relative animate-bounce">
                                    <svg
                                      className="w-12 h-12 drop-shadow-lg"
                                      fill="#dc2626"
                                      viewBox="0 0 24 24"
                                    >
                                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                                    </svg>
                                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1 w-8 h-2 bg-black/20 rounded-full blur-sm"></div>
                                  </div>
                                ) : (
                                  <div className="text-center p-4">
                                    <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                                    <p className="text-xs text-gray-500">
                                      Enter coordinates to preview
                                    </p>
                                  </div>
                                )}
                              </div>

                              {/* Map controls overlay */}
                              <div className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md">
                                <svg
                                  className="w-4 h-4 text-blue-600"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                  />
                                </svg>
                              </div>

                              {/* Zoom controls */}
                              {locationData.latitude &&
                                locationData.longitude && (
                                  <div className="absolute bottom-2 right-2 flex flex-col gap-1">
                                    <div className="bg-white rounded shadow-sm p-1 w-6 h-6 flex items-center justify-center text-xs font-bold text-gray-600">
                                      +
                                    </div>
                                    <div className="bg-white rounded shadow-sm p-1 w-6 h-6 flex items-center justify-center text-xs font-bold text-gray-600">
                                      -
                                    </div>
                                  </div>
                                )}
                            </div>

                            {/* Location Details Card */}
                            {(locationData.name || locationData.address) && (
                              <div className="p-3 bg-white border-t border-gray-200">
                                {locationData.name && (
                                  <div className="font-semibold text-sm text-gray-900 mb-1">
                                    {locationData.name}
                                  </div>
                                )}
                                {locationData.address && (
                                  <div className="text-xs text-gray-600 mb-1">
                                    {locationData.address}
                                  </div>
                                )}
                                {(locationData.latitude ||
                                  locationData.longitude) && (
                                  <div className="flex items-center gap-1 text-xs text-gray-500">
                                    <MapPin className="w-3 h-3" />
                                    {locationData.latitude &&
                                    locationData.longitude
                                      ? `${parseFloat(locationData.latitude).toFixed(4)}, ${parseFloat(locationData.longitude).toFixed(4)}`
                                      : "Coordinates incomplete"}
                                  </div>
                                )}
                              </div>
                            )}

                            {!locationData.name && !locationData.address && (
                              <div className="p-3 text-center text-sm text-gray-500 bg-white border-t border-gray-200">
                                Location details will appear here
                              </div>
                            )}
                          </div>
                        )}

                        {headerComponent.format === "TEXT" &&
                          headerComponent.text && (
                            <div className="font-semibold text-[#111b21] text-sm">
                              {replaceVariables(
                                headerComponent.text,
                                displayParams
                              )}
                            </div>
                          )}
                        {headerComponent.format === "IMAGE" && (
                          <div className="bg-gray-200 rounded-md h-32 w-full mb-2 flex items-center justify-center">
                            <svg
                              className="w-12 h-12 text-gray-400"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                          </div>
                        )}
                        {headerComponent.format === "VIDEO" && (
                          <div className="bg-gray-900 rounded-md h-32 w-full mb-2 flex items-center justify-center">
                            <svg
                              className="w-12 h-12 text-white"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                          </div>
                        )}
                        {headerComponent.format === "DOCUMENT" && (
                          <div className="bg-gray-100 rounded-md p-3 mb-2 flex items-center gap-2">
                            <svg
                              className="w-8 h-8 text-gray-600"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                              />
                            </svg>
                            <span className="text-sm text-gray-700">
                              Document.pdf
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Body */}
                    {bodyComponent && bodyComponent.text && (
                      <div
                        className="text-[#111b21] text-[14px] leading-[19px] whitespace-pre-wrap"
                        style={{ wordBreak: "break-word" }}
                      >
                        {replaceVariables(bodyComponent.text, displayParams)}
                      </div>
                    )}

                    {/* Footer */}
                    {footerComponent && footerComponent.text && (
                      <div className="text-xs text-[#667781] mt-2">
                        {footerComponent.text}
                      </div>
                    )}

                    {/* Buttons */}
                    {buttonsComponent?.buttons &&
                      buttonsComponent.buttons.length > 0 && (
                        <div className="mt-3 -mx-3 px-3 border-t border-gray-200 pt-2 space-y-1">
                          {buttonsComponent.buttons.map(
                            (button: any, index: number) => (
                              <div
                                key={index}
                                className="w-full py-2 text-center text-[#00a5f4] text-sm font-medium hover:bg-gray-50 rounded cursor-pointer transition-colors flex items-center justify-center gap-1"
                              >
                                {button.type === "URL" && (
                                  <>
                                    <svg
                                      className="w-4 h-4"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                      />
                                    </svg>
                                    {button.text}
                                  </>
                                )}
                                {button.type === "PHONE_NUMBER" && (
                                  <>
                                    <Phone className="w-4 h-4" />
                                    {button.text}
                                  </>
                                )}
                                {button.type === "QUICK_REPLY" && button.text}
                              </div>
                            )
                          )}
                        </div>
                      )}

                    <div className="flex items-center justify-end gap-1 mt-1">
                      <span className="text-[11px] text-[#667781]">
                        {getCurrentTime()}
                      </span>
                      <CheckCheck className="w-4 h-4 text-[#53bdeb]" />
                    </div>
                  </div>
                </div>
                {/* Message tail */}
                <div
                  className="absolute -left-2 top-0 w-3 h-3"
                  style={{
                    background: "#ffffff",
                    clipPath: "polygon(100% 0, 100% 100%, 0 0)",
                  }}
                />
              </div>
            </div>

            {/* Template Badge */}
            <div className="flex justify-center mt-4">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[#00a884] text-white">
                {template.category} Template
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "bg-green-100 text-green-800 hover:bg-green-200";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200";
      case "REJECTED":
        return "bg-red-100 text-red-800 hover:bg-red-200";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200";
    }
  };

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case "MARKETING":
        return "bg-blue-100 text-blue-800";
      case "UTILITY":
        return "bg-purple-100 text-purple-800";
      case "AUTHENTICATION":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p>Loading templates...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (templates.length === 0) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="text-center">
            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              No templates available
            </h3>
            <p className="text-muted-foreground mb-4">
              Create templates in your Meta Business Manager to use them for
              broadcasts
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Quick Broadcast Section */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpenCheck className="h-5 w-5" />
              Send Broadcast Messages
            </CardTitle>
            <CardDescription>
              Send messages using approved templates
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="template-select">Select Template</Label>
              <div className="flex gap-2">
                <Select
                  value={selectedTemplateId}
                  onValueChange={handleTemplateSelect}
                >
                  <SelectTrigger id="template-select">
                    <SelectValue placeholder="Choose a template" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {approvedTemplates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        <div className="flex items-center gap-2">
                          <span>{template.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {template.category}
                          </Badge>
                          {hasLocationHeader(template) && (
                              <span className="text-sm">📍</span>
                            )}
                          </div>
                        </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {selectedTemplate && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="phone-number">Recipient Phone Number</Label>
                  <Input
                    id="phone-number"
                    placeholder="254712345678"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Include country code without plus sign (e.g., 254 for Kenya,
                    233 for Ghana)
                  </p>
                </div>

                {/* Media Upload Section */}
                {selectedTemplate && WhatsAppService.hasMediaHeader(selectedTemplate) && (
                  <div className="space-y-3 p-4 border-2 rounded-lg bg-blue-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-blue-900 font-medium">
                        <ImageIcon className="w-5 h-5" />
                        {WhatsAppService.getMediaType(selectedTemplate)} Header
                      </div>
                      {mediaHandle && !useCustomMedia && (
                        <Badge variant="outline" className="bg-green-100 text-green-800">
                          ✓ Media Loaded from Template
                        </Badge>
                      )}
                    </div>

                    {!useCustomMedia && mediaHandle ? (
                      <div className="space-y-2">
                        <Alert>
                          <AlertDescription className="text-sm">
                            This template&apos;s existing media will be used automatically.
                          </AlertDescription>
                        </Alert>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setUseCustomMedia(true)}
                          className="w-full"
                        >
                          Upload Different Media
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="bg-white rounded-lg border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors">
                          <Label
                            htmlFor="media-upload"
                            className="flex flex-col items-center justify-center py-8 px-4 cursor-pointer"
                          >
                            <ImageIcon className="w-8 h-8 text-gray-400 mb-3" />
                            <div className="text-center mb-2">
                              <span className="text-sm font-medium text-gray-700">
                                Drag and drop files
                              </span>
                              <div className="text-sm text-blue-600 hover:text-blue-700">
                                Or choose file on your device
                              </div>
                            </div>
                            <Input
                              id="media-upload"
                              type="file"
                              accept={getAcceptedFileTypes(WhatsAppService.getMediaType(selectedTemplate))}
                              onChange={(e) => setMediaFileInput(e.target.files?.[0] || null)}
                              disabled={uploadingMedia}
                              className="hidden"
                            />
                          </Label>

                          {!mediaFileInput && (
                            <div className="px-4 pb-4">
                              <div className="flex items-center gap-2 text-red-600 text-sm mb-2">
                                <div className="w-4 h-4 rounded-full border-2 border-red-600 flex items-center justify-center">
                                  <span className="text-xs">✕</span>
                                </div>
                                <span>An {WhatsAppService.getMediaType(selectedTemplate).toLowerCase()} must be selected</span>
                              </div>
                              <div className="text-xs text-gray-600">
                                {getMediaTypeHelperText(WhatsAppService.getMediaType(selectedTemplate))}
                              </div>
                            </div>
                          )}

                          {mediaFileInput && !mediaHandle && (
                            <div className="px-4 pb-4 border-t border-gray-200">
                              <div className="flex items-center justify-between py-3">
                                <div className="flex items-center gap-2">
                                  <ImageIcon className="w-5 h-5 text-blue-600" />
                                  <span className="text-sm font-medium text-gray-700">
                                    {mediaFileInput.name}
                                  </span>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setMediaFileInput(null)}
                                  className="h-8 w-8 p-0"
                                >
                                  ✕
                                </Button>
                              </div>
                              <Button
                                variant="default"
                                size="sm"
                                onClick={handleMediaUpload}
                                disabled={uploadingMedia}
                                className="w-full"
                              >
                                {uploadingMedia ? (
                                  <>
                                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                    Uploading to Meta...
                                  </>
                                ) : (
                                  <>
                                    <Upload className="h-4 w-4 mr-2" />
                                    Upload to Meta
                                  </>
                                )}
                              </Button>
                            </div>
                          )}
                        </div>

                        {mediaHandle && useCustomMedia && (
                          <Alert className="bg-green-50 border-green-200">
                            <AlertDescription className="text-sm text-green-800 flex items-center gap-2">
                              <div className="w-4 h-4 rounded-full bg-green-600 flex items-center justify-center text-white text-xs">
                                ✓
                              </div>
                              Media uploaded successfully and ready to use
                            </AlertDescription>
                          </Alert>
                        )}

                        {!mediaHandle && useCustomMedia && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setUseCustomMedia(false);
                              handleTemplateSelect(selectedTemplateId);
                            }}
                            className="w-full"
                          >
                            Use Template&apos;s Original Media
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Location Header Fields */}
                {hasLocationHeader(selectedTemplate) && (
                  <div className="space-y-4 p-4 border-2 rounded-lg">
                    <div className="flex items-center gap-2 text-blue-900 font-medium">
                      <MapPin className="w-5 h-5" />
                      Location Header Details (Required)
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label
                          htmlFor="latitude"
                          className="text-sm font-medium"
                        >
                          Latitude *
                        </Label>
                        <Input
                          id="latitude"
                          type="text"
                          placeholder="37.4847483"
                          value={locationData.latitude}
                          onChange={(e) =>
                            handleLocationChange("latitude", e.target.value)
                          }
                          className="bg-white"
                        />
                        <p className="text-xs text-blue-700">
                          Decimal degrees only (e.g., 37.4847483) don&apos;t include the sign and N/S
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor="longitude"
                          className="text-sm font-medium"
                        >
                          Longitude *
                        </Label>
                        <Input
                          id="longitude"
                          type="text"
                          placeholder="-122.1477419"
                          value={locationData.longitude}
                          onChange={(e) =>
                            handleLocationChange("longitude", e.target.value)
                          }
                          className="bg-white"
                        />
                        <p className="text-xs text-blue-700">
                          Decimal degrees only (e.g., -122.1477419) don&apos;t include the sign and N/S
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="location-name"
                        className="text-sm font-medium"
                      >
                        Location Name *
                      </Label>
                      <Input
                        id="location-name"
                        placeholder="Meta Headquarters"
                        value={locationData.name}
                        onChange={(e) =>
                          handleLocationChange("name", e.target.value)
                        }
                        className="bg-white"
                      />
                      <p className="text-xs text-blue-700">
                        Name of the place (e.g., store name, landmark)
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="location-address"
                        className="text-sm font-medium"
                      >
                        Address *
                      </Label>
                      <Input
                        id="location-address"
                        placeholder="1 Hacker Way, Menlo Park, CA 94025"
                        value={locationData.address}
                        onChange={(e) =>
                          handleLocationChange("address", e.target.value)
                        }
                        className="bg-white"
                      />
                      <p className="text-xs text-blue-700">
                        Full street address
                      </p>
                    </div>
                    <Alert>
                      <AlertDescription className="text-xs">
                        💡 <strong>Tip:</strong> When the recipient taps the
                        location, it will open in their default maps app with
                        these coordinates.
                      </AlertDescription>
                    </Alert>
                  </div>
                )}

                {/* Template Parameters */}
                {getTemplateParameters(selectedTemplate).map((_, index) => (
                  <div key={index} className="space-y-2">
                    <Label htmlFor={`param-${index}`}>
                      Parameter {index + 1}
                    </Label>
                    <Input
                      id={`param-${index}`}
                      placeholder={`Enter value for parameter ${index + 1}`}
                      value={parameters[index] || ""}
                      onChange={(e) =>
                        handleParameterChange(index, e.target.value)
                      }
                    />
                  </div>
                ))}

                <Button
                  onClick={handleSendMessage}
                  disabled={isSending || !phoneNumber.trim()}
                  className="w-full"
                >
                  {isSending ? (
                    <>
                      <Send className="h-4 w-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Send Test Message
                    </>
                  )}
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {/* WhatsApp Preview - Sticky with scroll */}
        <div className="lg:sticky lg:top-6 h-fit">
          <Card className="overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center justify-between">
                <span>Live Preview</span>
                {selectedTemplate && (
                  <Badge variant="outline" className="text-xs">
                    {selectedTemplate.name}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-[600px] overflow-y-auto">
                {selectedTemplate ? (
                  renderWhatsAppPreview(selectedTemplate)
                ) : (
                  <div className="text-center p-12 text-muted-foreground bg-gray-50">
                    <MessageSquare className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                    <p className="font-medium mb-1">No template selected</p>
                    <p className="text-sm">
                      Select a template to see the preview
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Template Preview Dialog */}
      <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Template Preview: {previewTemplate?.name}</DialogTitle>
          </DialogHeader>
          {previewTemplate && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Category</Label>
                  <div className="mt-1">
                    <Badge
                      className={getCategoryBadge(previewTemplate.category)}
                    >
                      {previewTemplate.category}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label>Status</Label>
                  <div className="mt-1">
                    <Badge className={getStatusBadge(previewTemplate.status)}>
                      {previewTemplate.status}
                    </Badge>
                  </div>
                </div>
              </div>

              <div>
                <Label className="mb-3 block">WhatsApp Preview</Label>
                {renderWhatsAppPreview(previewTemplate, [])}
              </div>

              <Alert>
                <AlertDescription>
                  This template{" "}
                  {previewTemplate.status === "APPROVED"
                    ? "is approved and ready"
                    : "is not yet approved"}{" "}
                  for broadcast campaigns.
                </AlertDescription>
              </Alert>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}