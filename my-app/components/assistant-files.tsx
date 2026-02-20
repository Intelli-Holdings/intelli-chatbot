"use client";

import React, { useState, useRef, useCallback } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { 
  Upload, 
  FileText, 
  X, 
  Loader2, 
  Trash2, 
  Eye, 
  BarChart3,
  History,
  FileUp,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle
} from "lucide-react";
import useActiveOrganizationId from "@/hooks/use-organization-id";
import { 
  fileManagerAPI, 
  type FileUploadResponse, 
  type FileStatistics,
  type BulkUploadResponse,
  formatFileSize,
  getFileTypeIcon,
  validateFileUpload,
  isAllowedFileType
} from "@/lib/file-manager";
import { logger } from "@/lib/logger";

interface Assistant {
  id: number;
  name: string;
  prompt: string;
  assistant_id: string;
  organization: string;
  organization_id: string;
}

const FileStatusIcon = ({ status }: { status: string }) => {
  switch (status) {
    case 'completed':
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case 'processing':
      return <Clock className="h-4 w-4 text-yellow-500" />;
    case 'pending':
      return <Clock className="h-4 w-4 text-blue-500" />;
    case 'failed':
      return <XCircle className="h-4 w-4 text-red-500" />;
    default:
      return <AlertCircle className="h-4 w-4 text-gray-500" />;
  }
};

export function AssistantFiles() {
  const organizationId = useActiveOrganizationId();
  const [assistants, setAssistants] = useState<Assistant[]>([]);
  const [selectedAssistant, setSelectedAssistant] = useState<string>("");
  const [text, setText] = useState<string>("");
  const [files, setFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingAssistants, setIsFetchingAssistants] = useState(true);
  const [uploadMode, setUploadMode] = useState<'single' | 'bulk'>('single');
  
  // File management states
  const [fileList, setFileList] = useState<FileUploadResponse[]>([]);
  const [fileStats, setFileStats] = useState<FileStatistics | null>(null);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [selectedFileForVersions, setSelectedFileForVersions] = useState<FileUploadResponse | null>(null);
  const [fileVersions, setFileVersions] = useState<FileUploadResponse[]>([]);
  const [isLoadingVersions, setIsLoadingVersions] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Dropzone configuration with enhanced validation
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      setFiles((prevFiles) => [...prevFiles, ...acceptedFiles]);
    },
    accept: {
      // Only file types supported by OpenAI's Vector Store API
      // CSV and Excel files are NOT supported by OpenAI
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.ms-powerpoint': ['.ppt'],
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
      'text/plain': ['.txt'],
      'text/markdown': ['.md'],
      'application/json': ['.json'],
      'text/html': ['.html'],
      'application/x-python': ['.py'],
      'text/x-python': ['.py'],
      'application/x-sh': ['.sh'],
      'text/x-sh': ['.sh'],
      'application/x-tex': ['.tex'],
      'text/x-tex': ['.tex'],
      'application/typescript': ['.ts'],
      'text/typescript': ['.ts'],
    },
    maxSize: 512 * 1024 * 1024, // 512MB
  });

  // Fetch assistants from API
  const fetchAssistants = useCallback(async () => {
    if (!organizationId) return;

    setIsFetchingAssistants(true);
    try {
      const response = await fetch(`/api/assistants/${organizationId}`);
      
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
      logger.error("Error fetching assistants", { error: error instanceof Error ? error.message : String(error) });
      toast.error("Failed to fetch assistants. Please try again.");
    } finally {
      setIsFetchingAssistants(false);
    }
  }, [organizationId]);

  // Fetch assistants when component mounts
  React.useEffect(() => {
    if (organizationId) {
      fetchAssistants();
    }
  }, [organizationId, fetchAssistants]);

  // Fetch files for selected assistant
  const fetchFiles = useCallback(async () => {
    if (!selectedAssistant) return;

    setIsLoadingFiles(true);
    try {
      const response = await fileManagerAPI.getFiles(selectedAssistant);
      setFileList(response.results);
    } catch (error) {
      logger.error("Error fetching files", { error: error instanceof Error ? error.message : String(error) });
      toast.error("Failed to fetch files. Please try again.");
    } finally {
      setIsLoadingFiles(false);
    }
  }, [selectedAssistant]);

  // Fetch file statistics for selected assistant
  const fetchFileStats = useCallback(async () => {
    if (!selectedAssistant) return;

    setIsLoadingStats(true);
    try {
      const stats = await fileManagerAPI.getFileStatistics(selectedAssistant);
      setFileStats(stats);
    } catch (error) {
      logger.error("Error fetching file statistics", { error: error instanceof Error ? error.message : String(error) });
      toast.error("Failed to fetch file statistics. Please try again.");
    } finally {
      setIsLoadingStats(false);
    }
  }, [selectedAssistant]);

  // Fetch file versions
  const fetchFileVersions = async (fileId: number) => {
    setIsLoadingVersions(true);
    try {
      const versions = await fileManagerAPI.getFileVersions(fileId);
      setFileVersions(versions);
    } catch (error) {
      logger.error("Error fetching file versions", { error: error instanceof Error ? error.message : String(error) });
      toast.error("Failed to fetch file versions. Please try again.");
    } finally {
      setIsLoadingVersions(false);
    }
  };

  // Fetch files and stats when selected assistant changes
  React.useEffect(() => {
    if (selectedAssistant) {
      fetchFiles();
      fetchFileStats();
    }
  }, [selectedAssistant, fetchFiles, fetchFileStats]);

  // Handle file removal
  const removeFile = (index: number) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  // Handle file deletion
  const handleDeleteFile = async (fileId: number) => {
    try {
      await fileManagerAPI.deleteFile(fileId);
      toast.success("File deleted successfully!");
      fetchFiles(); // Refresh file list
      fetchFileStats(); // Refresh stats
    } catch (error) {
      logger.error("Error deleting file", { error: error instanceof Error ? error.message : String(error) });
      toast.error("Failed to delete file. Please try again.");
    }
  };

  // Handle single file upload
  const handleSingleUpload = async () => {
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
      const uploadPromises: Promise<FileUploadResponse>[] = [];
      
      // Upload files
      files.forEach((file) => {
        uploadPromises.push(fileManagerAPI.uploadFile(selectedAssistant, file));
      });
      
      // Upload text content if present
      if (text.trim()) {
        const textBlob = new Blob([text], { type: "text/plain" });
        const textFile = new File([textBlob], "content.txt", { type: "text/plain" });
        uploadPromises.push(fileManagerAPI.uploadFile(selectedAssistant, textFile));
      }
      
      await Promise.all(uploadPromises);
      
      toast.success("Files uploaded successfully!");
      
      // Reset form and refresh data
      setFiles([]);
      setText("");
      fetchFiles();
      fetchFileStats();
      
    } catch (error) {
      logger.error("Error uploading files", { error: error instanceof Error ? error.message : String(error) });
      toast.error("Failed to upload files. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle bulk file upload
  const handleBulkUpload = async () => {
    if (!selectedAssistant) {
      toast.error("Please select an assistant");
      return;
    }

    if (files.length === 0) {
      toast.error("Please add at least one file");
      return;
    }
    
    setIsLoading(true);
    
    try {
      const result = await fileManagerAPI.bulkUploadFiles(selectedAssistant, files);
      
      if (result.failed > 0) {
        toast.warning(`Upload completed with ${result.failed} failures. ${result.uploaded} files uploaded successfully.`);
      } else {
        toast.success(`All ${result.uploaded} files uploaded successfully!`);
      }
      
      // Reset form and refresh data
      setFiles([]);
      setText("");
      fetchFiles();
      fetchFileStats();
      
    } catch (error) {
      logger.error("Error bulk uploading files", { error: error instanceof Error ? error.message : String(error) });
      toast.error("Failed to upload files. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (uploadMode === 'bulk') {
      await handleBulkUpload();
    } else {
      await handleSingleUpload();
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Assistant File Management</CardTitle>
          <CardDescription>
            Upload and manage files for your AI assistants. Maximum 20 files per assistant, 512MB per file.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={uploadMode} onValueChange={(value) => setUploadMode(value as 'single' | 'bulk')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="single">Single Upload</TabsTrigger>
              <TabsTrigger value="bulk">Bulk Upload</TabsTrigger>
            </TabsList>
            
            <TabsContent value="single" className="space-y-4">
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
                    Text Content (Optional)
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
                          Supported: PDF, DOC, DOCX, PPT, PPTX, TXT, MD, JSON, HTML, PY, SH, TEX, TS
                        </p>
                        <p className="text-xs text-muted-foreground italic">
                          Note: CSV and Excel files not supported by OpenAI
                        </p>
                        <p className="text-xs text-muted-foreground mt-1 italic">
                          Max 512MB per file, 20 files per assistant
                        </p>
                      </>
                    )}
                  </div>
                </div>

                {/* File List */}
                {files.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Selected Files ({files.length})</label>
                    <div className="max-h-48 overflow-y-auto space-y-2">
                      {files.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between bg-muted p-3 rounded-md"
                        >
                          <div className="flex items-center space-x-3 flex-1">
                            <span className="text-lg">{getFileTypeIcon(file.type)}</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{file.name}</p>
                              <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <Button 
                  type="submit" 
                  className="w-full bg-[#007fff] text-white hover:bg-[#007fff]/90" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Upload to Assistant
                    </>
                  )}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="bulk" className="space-y-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Assistant Selection */}
                <div className="space-y-2">
                  <label htmlFor="assistant-bulk" className="text-sm font-medium">
                    Select Assistant
                  </label>
                  <Select
                    value={selectedAssistant}
                    onValueChange={setSelectedAssistant}
                    disabled={isFetchingAssistants}
                  >
                    <SelectTrigger id="assistant-bulk">
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

                {/* Bulk File Upload */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Upload Multiple Files (Max 20)</label>
                  <div
                    {...getRootProps()}
                    className={`border border-dotted rounded-xl p-8 text-center cursor-pointer transition-colors ${
                      isDragActive 
                        ? "border-primary bg-primary/5" 
                        : "border-gray-200"
                    }`}
                  >
                    <input {...getInputProps()} />
                    <FileUp className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    {isDragActive ? (
                      <p className="text-lg font-medium text-primary">
                        Drop the files here...
                      </p>
                    ) : (
                      <>
                        <p className="text-lg font-medium">
                          Drag & drop multiple files here
                        </p>
                        <p className="text-sm text-muted-foreground mt-2">
                          Or click to select multiple files for bulk upload
                        </p>
                        <p className="text-xs text-muted-foreground mt-4">
                          Supported: PDF, DOC, DOCX, PPT, PPTX, TXT, MD, JSON, HTML, PY, SH, TEX, TS
                        </p>
                        <p className="text-xs text-muted-foreground italic">
                          Note: CSV and Excel files not supported by OpenAI
                        </p>
                      </>
                    )}
                  </div>
                </div>

                {/* Bulk File List */}
                {files.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-sm font-medium">
                        Selected Files ({files.length}/20)
                      </label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setFiles([])}
                      >
                        Clear All
                      </Button>
                    </div>
                    <div className="max-h-64 overflow-y-auto space-y-1 border rounded-md p-2">
                      {files.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between bg-background p-2 rounded border"
                        >
                          <div className="flex items-center space-x-2 flex-1">
                            <span className="text-sm">{getFileTypeIcon(file.type)}</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm truncate">{file.name}</p>
                              <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(index)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Bulk Submit Button */}
                <Button 
                  type="submit" 
                  className="w-full bg-[#007fff] text-white hover:bg-[#007fff]/90" 
                  disabled={isLoading || files.length === 0}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Bulk Uploading...
                    </>
                  ) : (
                    <>
                      <FileUp className="mr-2 h-4 w-4" />
                      Bulk Upload {files.length} Files
                    </>
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* File Statistics */}
      {selectedAssistant && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              File Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingStats ? (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : fileStats ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">{fileStats.total_files}</p>
                  <p className="text-sm text-muted-foreground">Total Files</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">{fileStats.total_size_mb.toFixed(1)}MB</p>
                  <p className="text-sm text-muted-foreground">Total Size</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">{fileStats.remaining_slots}</p>
                  <p className="text-sm text-muted-foreground">Remaining Slots</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">{fileStats.status_breakdown.completed}</p>
                  <p className="text-sm text-muted-foreground">Completed</p>
                </div>
              </div>
            ) : (
              <p className="text-center text-muted-foreground">No statistics available</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* File List */}
      {selectedAssistant && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Assistant Files
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingFiles ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : fileList.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>File</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Version</TableHead>
                    <TableHead>Uploaded</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fileList.map((file) => (
                    <TableRow key={file.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span>{getFileTypeIcon(file.file_type)}</span>
                          <span className="font-medium">{file.file_name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{file.file_size_mb.toFixed(2)} MB</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <FileStatusIcon status={file.azure_file_status} />
                          <Badge variant="outline">{file.azure_file_status}</Badge>
                        </div>
                      </TableCell>
                      <TableCell>v{file.version}</TableCell>
                      <TableCell>{new Date(file.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => {
                                  setSelectedFileForVersions(file);
                                  fetchFileVersions(file.id);
                                }}
                              >
                                <History className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>File Versions</DialogTitle>
                                <DialogDescription>
                                  Version history for {file.file_name}
                                </DialogDescription>
                              </DialogHeader>
                              {isLoadingVersions ? (
                                <div className="flex items-center justify-center p-4">
                                  <Loader2 className="h-6 w-6 animate-spin" />
                                </div>
                              ) : (
                                <div className="space-y-2">
                                  {fileVersions.map((version) => (
                                    <div key={version.id} className="flex items-center justify-between p-2 border rounded">
                                      <div>
                                        <p className="font-medium">v{version.version}</p>
                                        <p className="text-sm text-muted-foreground">
                                          {new Date(version.created_at).toLocaleString()}
                                        </p>
                                      </div>
                                      <Badge variant="outline">{version.azure_file_status}</Badge>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDeleteFile(file.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center p-8">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium">No files uploaded yet</p>
                <p className="text-muted-foreground">Upload your first file to get started</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
