"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
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
  newFileManagerAPI, 
  type FileUploadResponse, 
  type FileStatistics,
  type BulkUploadResponse,
  formatFileSize,
  getFileTypeIcon,
  validateFileUpload,
  isAllowedFileType
} from "@/lib/new-file-manager";

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

export function NewAssistantFiles() {
  const organizationId = useActiveOrganizationId();
  const [assistants, setAssistants] = useState<Assistant[]>([]);
  const [selectedAssistant, setSelectedAssistant] = useState<string>("");
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
    onDrop: (acceptedFiles, rejectedFiles) => {
      // Validate accepted files
      const validFiles: File[] = [];
      
      acceptedFiles.forEach((file) => {
        const validation = validateFileUpload(file);
        if (validation.isValid) {
          validFiles.push(file);
        } else {
          toast.error(`${file.name}: ${validation.error}`);
        }
      });
      
      // Handle rejected files
      rejectedFiles.forEach((fileRejection) => {
        const errorMessages = fileRejection.errors.map(e => e.message).join(', ');
        toast.error(`${fileRejection.file.name}: ${errorMessages}`);
      });
      
      setFiles((prevFiles) => [...prevFiles, ...validFiles]);
    },
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-powerpoint': ['.ppt'],
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
      'text/plain': ['.txt'],
      'text/csv': ['.csv'],
      'text/markdown': ['.md'],
      'application/json': ['.json'],
    },
    maxSize: 512 * 1024 * 1024, // 512MB
  });

  // Fetch assistants from new API endpoint
  const fetchAssistants = useCallback(async () => {
    if (!organizationId) return;

    setIsFetchingAssistants(true);
    try {
      const response = await fetch(`/api/get/assistants/${organizationId}`);
      
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
  }, [organizationId]);

  // Fetch files for selected assistant
  const fetchFiles = useCallback(async () => {
    if (!selectedAssistant) return;

    setIsLoadingFiles(true);
    try {
      const data = await newFileManagerAPI.getFiles(selectedAssistant);
      setFileList(data.results);
    } catch (error) {
      console.error("Error fetching files:", error);
      toast.error("Failed to fetch files. Please try again.");
    } finally {
      setIsLoadingFiles(false);
    }
  }, [selectedAssistant]);

  // Fetch file statistics
  const fetchFileStats = useCallback(async () => {
    if (!selectedAssistant) return;

    setIsLoadingStats(true);
    try {
      const data = await newFileManagerAPI.getFileStatistics(selectedAssistant);
      setFileStats(data);
    } catch (error) {
      console.error("Error fetching file stats:", error);
      toast.error("Failed to fetch file statistics. Please try again.");
    } finally {
      setIsLoadingStats(false);
    }
  }, [selectedAssistant]);

  // Fetch file versions
  const fetchFileVersions = useCallback(async (fileId: number) => {
    setIsLoadingVersions(true);
    try {
      const data = await newFileManagerAPI.getFileVersions(fileId);
      setFileVersions(data);
    } catch (error) {
      console.error("Error fetching file versions:", error);
      toast.error("Failed to fetch file versions. Please try again.");
    } finally {
      setIsLoadingVersions(false);
    }
  }, []);

  // Effects
  useEffect(() => {
    if (organizationId) {
      fetchAssistants();
    }
  }, [organizationId, fetchAssistants]);

  useEffect(() => {
    if (selectedAssistant) {
      fetchFiles();
      fetchFileStats();
    }
  }, [selectedAssistant, fetchFiles, fetchFileStats]);

  // Handle file removal
  const removeFile = (index: number) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  // Handle file upload
  const handleUpload = async () => {
    if (!selectedAssistant) {
      toast.error("Please select an assistant first.");
      return;
    }

    if (files.length === 0) {
      toast.error("Please select files to upload.");
      return;
    }

    setIsLoading(true);

    try {
      let uploadPromise;

      if (uploadMode === 'bulk' && files.length > 1) {
        uploadPromise = newFileManagerAPI.bulkUploadFiles(selectedAssistant, files);
      } else {
        // Single file upload or single file in bulk mode
        uploadPromise = Promise.all(
          files.map(file => newFileManagerAPI.uploadFile(selectedAssistant, file))
        );
      }

      await uploadPromise;
      
      toast.success(
        files.length === 1 
          ? "File uploaded successfully!" 
          : `${files.length} files uploaded successfully!`
      );
      
      setFiles([]);
      fetchFiles(); // Refresh file list
      fetchFileStats(); // Refresh statistics
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to upload files. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle file deletion
  const handleDeleteFile = async (fileId: number, fileName: string) => {
    if (!confirm(`Are you sure you want to delete "${fileName}"?`)) return;

    try {
      await newFileManagerAPI.deleteFile(fileId);
      toast.success("File deleted successfully!");
      fetchFiles(); // Refresh file list
      fetchFileStats(); // Refresh statistics
    } catch (error) {
      console.error("Delete error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to delete file.");
    }
  };

  // Handle view file versions
  const handleViewVersions = (file: FileUploadResponse) => {
    setSelectedFileForVersions(file);
    fetchFileVersions(file.id);
  };

  if (isFetchingAssistants) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p>Loading assistants...</p>
        </div>
      </div>
    );
  }

  if (assistants.length === 0) {
    return (
      <div className="text-center p-8">
        <p className="text-muted-foreground">
          No assistants found. Please create an assistant first.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upload">Upload Files</TabsTrigger>
          <TabsTrigger value="manage">Manage Files</TabsTrigger>
          <TabsTrigger value="statistics">Statistics</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upload Files to Assistant</CardTitle>
              <CardDescription>
                Select an assistant and upload files that will help improve its responses.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Assistant Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Assistant</label>
                <Select
                  value={selectedAssistant}
                  onValueChange={setSelectedAssistant}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose an assistant" />
                  </SelectTrigger>
                  <SelectContent>
                    {assistants.map((assistant) => (
                      <SelectItem key={assistant.assistant_id} value={assistant.assistant_id}>
                        {assistant.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Upload Mode Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Upload Mode</label>
                <Select
                  value={uploadMode}
                  onValueChange={(value: 'single' | 'bulk') => setUploadMode(value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">Single File Upload</SelectItem>
                    <SelectItem value="bulk">Bulk Upload</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* File Upload Area */}
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                  isDragActive
                    ? "border-primary bg-primary/5"
                    : "border-gray-300 hover:border-primary/50"
                }`}
              >
                <input {...getInputProps()} />
                <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                {isDragActive ? (
                  <p>Drop the files here...</p>
                ) : (
                  <div>
                    <p>Drag and drop files here, or click to select</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Supports: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, CSV, MD, JSON (Max: 512MB)
                    </p>
                  </div>
                )}
              </div>

              {/* Selected Files */}
              {files.length > 0 && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Selected Files</label>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {files.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded border"
                      >
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">{getFileTypeIcon(file.type)}</span>
                          <div>
                            <p className="text-sm font-medium">{file.name}</p>
                            <p className="text-xs text-gray-500">
                              {formatFileSize(file.size)}
                            </p>
                          </div>
                        </div>
                        <Button
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
            </CardContent>
            <CardFooter>
              <Button
                onClick={handleUpload}
                disabled={!selectedAssistant || files.length === 0 || isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload {files.length > 0 ? `${files.length} ` : ""}Files
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="manage" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Manage Assistant Files</CardTitle>
              <CardDescription>
                View, download, and manage files for your assistants.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Assistant Selection for File Management */}
              <div className="space-y-4 mb-4">
                <Select
                  value={selectedAssistant}
                  onValueChange={setSelectedAssistant}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose an assistant" />
                  </SelectTrigger>
                  <SelectContent>
                    {assistants.map((assistant) => (
                      <SelectItem key={assistant.assistant_id} value={assistant.assistant_id}>
                        {assistant.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Files Table */}
              {isLoadingFiles ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>File</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Size</TableHead>
                        <TableHead>Version</TableHead>
                        <TableHead>Uploaded</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {fileList.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8">
                            No files found for this assistant.
                          </TableCell>
                        </TableRow>
                      ) : (
                        fileList.map((file) => (
                          <TableRow key={file.id}>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <span className="text-lg">{getFileTypeIcon(file.file_type)}</span>
                                <span className="font-medium">{file.file_name}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary">
                                {file.file_type.split('/')[1]?.toUpperCase() || 'Unknown'}
                              </Badge>
                            </TableCell>
                            <TableCell>{formatFileSize(file.file_size)}</TableCell>
                            <TableCell>v{file.version}</TableCell>
                            <TableCell>
                              {new Date(file.created_at).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleViewVersions(file)}
                                >
                                  <History className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => window.open(file.file_url, '_blank')}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteFile(file.id, file.file_name)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="statistics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>File Statistics</CardTitle>
              <CardDescription>
                Overview of file usage and storage for your assistants.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Assistant Selection for Statistics */}
              <div className="space-y-4 mb-4">
                <Select
                  value={selectedAssistant}
                  onValueChange={setSelectedAssistant}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose an assistant" />
                  </SelectTrigger>
                  <SelectContent>
                    {assistants.map((assistant) => (
                      <SelectItem key={assistant.assistant_id} value={assistant.assistant_id}>
                        {assistant.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {isLoadingStats ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : fileStats ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-2xl font-bold">{fileStats.total_files}</div>
                        <p className="text-xs text-muted-foreground">Total Files</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-2xl font-bold">
                          {formatFileSize(fileStats.total_size_bytes)}
                        </div>
                        <p className="text-xs text-muted-foreground">Total Size</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-2xl font-bold">{fileStats.max_files_allowed}</div>
                        <p className="text-xs text-muted-foreground">Max Files</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-2xl font-bold">{fileStats.remaining_slots}</div>
                        <p className="text-xs text-muted-foreground">Remaining</p>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="mt-4">
                    <h3 className="text-lg font-semibold mb-2">Status Breakdown</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {Object.entries(fileStats.status_breakdown).map(([status, count]) => (
                        <div key={status} className="flex items-center space-x-2">
                          <FileStatusIcon status={status} />
                          <span className="capitalize">{status}:</span>
                          <span className="font-semibold">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No statistics available.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* File Versions Dialog */}
      <Dialog
        open={!!selectedFileForVersions}
        onOpenChange={() => setSelectedFileForVersions(null)}
      >
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              File Versions: {selectedFileForVersions?.file_name}
            </DialogTitle>
            <DialogDescription>
              View all versions of this file.
            </DialogDescription>
          </DialogHeader>
          
          {isLoadingVersions ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Version</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Uploaded</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fileVersions.map((version) => (
                    <TableRow key={version.id}>
                      <TableCell>v{version.version}</TableCell>
                      <TableCell>{formatFileSize(version.file_size)}</TableCell>
                      <TableCell>
                        {new Date(version.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(version.file_url, '_blank')}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
