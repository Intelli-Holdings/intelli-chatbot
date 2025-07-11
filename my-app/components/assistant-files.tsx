"use client";

import React, { useState, useRef } from "react";
import { useDropzone } from "react-dropzone";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Upload, FileText, X, Loader2 } from "lucide-react";
import useActiveOrganizationId from "@/hooks/use-organization-id";

interface Assistant {
  id: number;
  name: string;
  prompt: string;
  assistant_id: string;
  organization: string;
  organization_id: string;
}

export function AssistantFiles() {
  const organizationId = useActiveOrganizationId();
  const [assistants, setAssistants] = useState<Assistant[]>([]);
  const [selectedAssistant, setSelectedAssistant] = useState<string>("");
  const [text, setText] = useState<string>("");
  const [files, setFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingAssistants, setIsFetchingAssistants] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Dropzone configuration
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      setFiles((prevFiles) => [...prevFiles, ...acceptedFiles]);
    },
  });

  // Fetch assistants when component mounts
  React.useEffect(() => {
    if (organizationId) {
      fetchAssistants();
    }
  }, [organizationId]);

  // Fetch assistants from API
  const fetchAssistants = async () => {
    if (!organizationId) return;

    setIsFetchingAssistants(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/get/assistants/${organizationId}/`
      );
      
      if (!response.ok) {
        toast.error("Failed to fetch assistants. Please try again.");
        return;
      }

      const data: Assistant[] = await response.json();
      setAssistants(data);

      if (data.length > 0) {
        setSelectedAssistant(data[0].assistant_id);
      }
    } catch (error) {
      console.error("Error fetching assistants:", error);
      toast.error("Failed to fetch assistants. Please try again.");
    } finally {
      setIsFetchingAssistants(false);
    }
  };

  // Handle file removal
  const removeFile = (index: number) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedAssistant) {
      toast.error("Please select an assistant");
      return;
    }

    if (files.length === 0 && !text.trim()) {
      toast.error("Please add at least one file or text content");
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Create form data
      const formData = new FormData();
      formData.append("assistant_id", selectedAssistant);
      
      // Add files to form data
      files.forEach((file) => {
        formData.append("file", file);
      });
      
      // Add text content if present
      if (text.trim()) {
        // Create a text file from the content
        const textBlob = new Blob([text], { type: "text/plain" });
        const textFile = new File([textBlob], "content.txt", { type: "text/plain" });
        formData.append("file", textFile);
      }
      
      // Send request to API
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/update/assistants/files/`,
        {
          method: "POST",
          body: formData,
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to upload documents");
      }
      
      toast.success("Documents uploaded successfully!");
      
      // Reset form
      setFiles([]);
      setText("");
      
    } catch (error) {
      console.error("Error uploading documents:", error);
      toast.error("Failed to upload documents. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Assistant Selection */}
      <div className="space-y-2">
        <label htmlFor="assistant" className="text-sm font-medium">
          Select Assistant
        </label>
        <Select
          value={selectedAssistant}
          onValueChange={setSelectedAssistant}
          disabled={isFetchingAssistants}
        >
          <SelectTrigger id="assistant">
            <SelectValue placeholder={isFetchingAssistants ? "Loading assistants..." : "Select an assistant"} />
          </SelectTrigger>
          <SelectContent>
            {assistants.map((assistant) => (
              <SelectItem key={assistant.id} value={assistant.assistant_id}>
                {assistant.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Text Input */}
      <div className="space-y-2">
        <label htmlFor="text" className="text-sm font-medium">
          Text Content
        </label>
        <Textarea
          id="text"
          placeholder="Add text knowledge for your assistant..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="min-h-[120px]"
        />
      </div>

      {/* File Upload */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Upload Files</label>
        <div
          {...getRootProps()}
          className={`border border-dotted rounded-xl p-6 text-center cursor-pointer transition-colors ${
            isDragActive 
              ? "border-primary bg-primary/5" 
              : "border-gray-200"
          }`}
        >
          <input {...getInputProps()} />
          <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
          {isDragActive ? (
            <p className="text-sm font-medium text-primary">
              Drop the files here...
            </p>
          ) : (
            <>
              <p className="text-sm font-medium">
                Drag & drop files here, or click to select files
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Supported File Types: .pdf, .doc, .docx, .txt
              </p>
              <p className="text-xs text-muted-foreground mt-1 italic">
                If you are uploading a PDF, make sure you can select/highlight the text.
              </p>
            </>
          )}
        </div>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          <label className="text-sm font-medium">Selected Files</label>
          <ul className="space-y-2">
            {files.map((file, index) => (
              <li
                key={index}
                className="flex items-center justify-between bg-muted p-2 rounded-md"
              >
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm truncate max-w-xs">{file.name}</span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Submit Button */}
      <Button type="submit" className="bg-[#007fff] text-white hover:bg-[#007fff]/100 hover:text-white" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Uploading...
          </>
        ) : (
          "Upload to Assistant"
        )}
      </Button>
    </form>
  );
}