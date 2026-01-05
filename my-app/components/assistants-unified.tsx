'use client'

import { useState, useEffect, useCallback } from 'react';
import { useOrganization } from '@clerk/nextjs';
import { toast } from 'sonner';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Bot,
  CircleDot,
  BadgeCheck,
  MoreVertical,
  Pencil,
  Trash,
  Files,
  Plus,
  Loader2,
  Upload,
  X,
  FileText,
  BarChart3,
  History,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  RefreshCw,
  Eye,
  Trash2,
} from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  newFileManagerAPI,
  formatFileSize,
  getFileTypeIcon,
  validateFileUpload,
  isAllowedFileType,
  type FileStatistics,
} from '@/lib/new-file-manager';

interface Assistant {
  id: number;
  name: string;
  prompt: string;
  assistant_id: string;
  organization: string;
}

interface AssistantFile {
  id: number;
  file_name: string;
  file_url: string;
  file_type: string;
  file_size: number;
  azure_file_status: string;
  version: number;
  created_at: string;
  updated_at: string;
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

export default function AssistantsUnified() {
  const { organization } = useOrganization();
  const organizationId = organization?.id;

  const [assistants, setAssistants] = useState<Assistant[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAssistant, setSelectedAssistant] = useState<Assistant | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  // File management state
  const [files, setFiles] = useState<AssistantFile[]>([]);
  const [fileStats, setFileStats] = useState<FileStatistics | null>(null);
  const [isUploadingFiles, setIsUploadingFiles] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [pendingFiles, setPendingFiles] = useState<AssistantFile[]>([]);

  // Form state
  const [formData, setFormData] = useState({ name: '', prompt: '' });

  // Fetch assistants
  const fetchAssistants = useCallback(async () => {
    if (!organizationId) return;

    setIsLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/get/assistants/${organizationId}/`
      );
      if (!response.ok) throw new Error('Failed to fetch assistants');

      const data: Assistant[] = await response.json();
      setAssistants(data);
    } catch (error) {
      console.error('Error fetching assistants:', error);
      toast.error('Failed to fetch assistants');
    } finally {
      setIsLoading(false);
    }
  }, [organizationId]);

  // Fetch files for selected assistant
  const fetchFiles = useCallback(async (assistantId: string) => {
    try {
      const filesData = await newFileManagerAPI.getFiles(assistantId);
      // The API returns { results: [...], count: number }
      setFiles(filesData.results || []);
    } catch (error) {
      console.error('Error fetching files:', error);
      toast.error('Failed to fetch files');
      setFiles([]);
    }
  }, []);

  // Fetch file statistics
  const fetchFileStats = useCallback(async (assistantId: string) => {
    try {
      const stats = await newFileManagerAPI.getFileStatistics(assistantId);
      setFileStats(stats);
    } catch (error) {
      console.error('Error fetching file statistics:', error);
    }
  }, []);

  // Fetch pending files
  const fetchPendingFiles = useCallback(async (assistantId: string) => {
    try {
      const response = await newFileManagerAPI.getPendingFiles(assistantId);
      // The API returns { files: [...], count: number }
      setPendingFiles(response.files || []);
    } catch (error) {
      console.error('Error fetching pending files:', error);
      setPendingFiles([]);
    }
  }, []);

  useEffect(() => {
    fetchAssistants();
  }, [fetchAssistants]);

  // Auto-refresh pending files every 60 seconds
  useEffect(() => {
    if (!selectedAssistant) return;

    const interval = setInterval(() => {
      fetchPendingFiles(selectedAssistant.assistant_id);
    }, 60000);

    return () => clearInterval(interval);
  }, [selectedAssistant, fetchPendingFiles]);

  // Create assistant
  const handleCreateAssistant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!organizationId) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/assistants/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          organization_id: organizationId,
        }),
      });

      if (!response.ok) throw new Error('Failed to create assistant');

      toast.success('Assistant created successfully!');
      setIsCreateDialogOpen(false);
      setFormData({ name: '', prompt: '' });
      fetchAssistants();
    } catch (error) {
      console.error('Error creating assistant:', error);
      toast.error('Failed to create assistant');
    }
  };

  // Edit assistant
  const handleEditAssistant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssistant) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/assistants/${selectedAssistant.assistant_id}/`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name,
            prompt: formData.prompt,
          }),
        }
      );

      if (!response.ok) throw new Error('Failed to update assistant');

      toast.success('Assistant updated successfully!');
      setIsEditDialogOpen(false);
      fetchAssistants();
    } catch (error) {
      console.error('Error updating assistant:', error);
      toast.error('Failed to update assistant');
    }
  };

  // Delete assistant
  const handleDeleteAssistant = async () => {
    if (!selectedAssistant) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/assistants/${selectedAssistant.assistant_id}/`,
        { method: 'DELETE' }
      );

      if (!response.ok) throw new Error('Failed to delete assistant');

      toast.success('Assistant deleted successfully!');
      setIsDeleteDialogOpen(false);
      setSelectedAssistant(null);
      fetchAssistants();
    } catch (error) {
      console.error('Error deleting assistant:', error);
      toast.error('Failed to delete assistant');
    }
  };

  // File upload with dropzone
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!selectedAssistant) return;

    // Validate file limit
    if (files.length + acceptedFiles.length > 20) {
      toast.error(`You can only upload up to 20 files per assistant. Current: ${files.length}`);
      return;
    }

    setIsUploadingFiles(true);

    try {
      for (const file of acceptedFiles) {
        // Validate file
        const validation = validateFileUpload(file);
        if (!validation.isValid) {
          toast.error(validation.error || 'Invalid file');
          continue;
        }

        setUploadProgress(prev => ({ ...prev, [file.name]: 0 }));

        // Use the newFileManagerAPI instead of direct fetch
        try {
          await newFileManagerAPI.uploadFile(selectedAssistant.assistant_id, file);
          setUploadProgress(prev => ({ ...prev, [file.name]: 100 }));
          toast.success(`${file.name} uploaded successfully`);
        } catch (error: any) {
          console.error(`Error uploading ${file.name}:`, error);
          toast.error(`${file.name}: ${error.message || 'Upload failed'}`);
        }
      }

      // Refresh file list and stats
      await fetchFiles(selectedAssistant.assistant_id);
      await fetchFileStats(selectedAssistant.assistant_id);
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Failed to upload files');
    } finally {
      setIsUploadingFiles(false);
      setUploadProgress({});
    }
  }, [selectedAssistant, files, fetchFiles, fetchFileStats]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
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

  // Delete file
  const handleDeleteFile = async (fileId: number) => {
    if (!selectedAssistant) return;

    try {
      await newFileManagerAPI.deleteFile(fileId);
      toast.success('File deleted successfully');
      await fetchFiles(selectedAssistant.assistant_id);
      await fetchFileStats(selectedAssistant.assistant_id);
    } catch (error) {
      console.error('Error deleting file:', error);
      toast.error('Failed to delete file');
    }
  };

  // Retry failed file
  const handleRetryFile = async (fileId: number) => {
    try {
      await newFileManagerAPI.retryFileUpload(fileId);
      toast.success('File retry initiated');
      if (selectedAssistant) {
        await fetchPendingFiles(selectedAssistant.assistant_id);
      }
    } catch (error) {
      console.error('Error retrying file:', error);
      toast.error('Failed to retry file upload');
    }
  };

  // Open view dialog
  const handleViewAssistant = (assistant: Assistant) => {
    setSelectedAssistant(assistant);
    setIsViewDialogOpen(true);
    fetchFiles(assistant.assistant_id);
    fetchFileStats(assistant.assistant_id);
    fetchPendingFiles(assistant.assistant_id);
  };

  if (!organizationId) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <CardTitle className="mt-2">No Organization Selected</CardTitle>
          <CardDescription className="mt-1">
            Please select an organization to manage assistants
          </CardDescription>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">AI Assistants</h2>
          <p className="text-sm text-muted-foreground">
            Create and manage your AI assistants with custom knowledge bases
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Assistant
        </Button>
      </div>

      {/* Assistants Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="h-[240px] animate-pulse bg-muted" />
          ))}
        </div>
      ) : assistants.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {assistants.map((assistant) => (
            <Card key={assistant.id} className="h-[240px] flex flex-col hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <Bot className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{assistant.name}</CardTitle>
                      <div className="flex items-center space-x-2">
                        <BadgeCheck className="h-4 w-4 text-blue-500" />
                        <span className="text-xs text-muted-foreground">
                          {assistant.assistant_id.slice(0, 12)}...
                        </span>
                      </div>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedAssistant(assistant);
                          setFormData({ name: assistant.name, prompt: assistant.prompt });
                          setIsEditDialogOpen(true);
                        }}
                        className="cursor-pointer"
                      >
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedAssistant(assistant);
                          setIsDeleteDialogOpen(true);
                        }}
                        className="cursor-pointer text-red-500"
                      >
                        <Trash className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="flex items-center space-x-2">
                  <CircleDot className="w-3 h-3 fill-green-500 text-green-500" />
                  <span className="text-sm">Active</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                  {assistant.prompt}
                </p>
              </CardContent>
              <CardFooter>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => handleViewAssistant(assistant)}
                >
                  <Files className="h-4 w-4 mr-2" />
                  Manage Files
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="text-center py-12">
          <CardContent>
            <Bot className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <CardTitle className="mt-2">No Assistants Yet</CardTitle>
            <CardDescription className="mt-1">
              Create your first AI assistant to get started
            </CardDescription>
            <Button onClick={() => setIsCreateDialogOpen(true)} className="mt-4">
              <Plus className="h-4 w-4 mr-2" />
              Create Assistant
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Create Assistant Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Assistant</DialogTitle>
            <DialogDescription>
              Create an AI assistant with custom knowledge and capabilities
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateAssistant} className="space-y-4">
            <div>
              <label className="text-sm font-medium">Assistant Name</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Customer Support Bot"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium">System Prompt</label>
              <Textarea
                value={formData.prompt}
                onChange={(e) => setFormData({ ...formData, prompt: e.target.value })}
                placeholder="Define the assistant's behavior and knowledge..."
                className="min-h-[120px]"
                required
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Create Assistant</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Assistant Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-5xl">
          <DialogHeader>
            <DialogTitle>Edit Assistant</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditAssistant} className="space-y-4">
            <div>
              <label className="text-sm font-medium">Assistant Name</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium">System Prompt</label>
              <Textarea
                value={formData.prompt}
                onChange={(e) => setFormData({ ...formData, prompt: e.target.value })}
                className="min-h-[300px]"
                required
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Assistant Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Assistant</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{selectedAssistant?.name}&quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteAssistant}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View & Manage Files Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={(open) => {
        setIsViewDialogOpen(open);
        if (!open) {
          setSelectedAssistant(null);
          setFiles([]);
          setFileStats(null);
        }
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              {selectedAssistant?.name}
            </DialogTitle>
            <DialogDescription>
              Manage knowledge base files for this assistant (up to 20 files, 512MB each)
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="upload" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="upload">
                <Upload className="h-4 w-4 mr-2" />
                Upload Files
              </TabsTrigger>
              <TabsTrigger value="manage">
                <FileText className="h-4 w-4 mr-2" />
                Manage Files ({files.length}/20)
              </TabsTrigger>
              <TabsTrigger value="stats">
                <BarChart3 className="h-4 w-4 mr-2" />
                Statistics
              </TabsTrigger>
            </TabsList>

            {/* Upload Tab */}
            <TabsContent value="upload" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Upload Knowledge Base Files</CardTitle>
                  <CardDescription>
                    Supported: PDF, DOC, DOCX, PPT, PPTX, TXT, MD, JSON, HTML, PY, SH, TEX, TS (max 512MB per file)
                    <br />
                    <span className="text-xs text-muted-foreground">Note: CSV and Excel files are not supported yet</span>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                      isDragActive
                        ? 'border-primary bg-primary/5'
                        : 'border-muted-foreground/25 hover:border-primary/50'
                    }`}
                  >
                    <input {...getInputProps()} />
                    <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    {isDragActive ? (
                      <p className="text-sm">Drop the files here...</p>
                    ) : (
                      <>
                        <p className="text-sm font-medium">
                          Drag & drop files here, or click to select
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {files.length}/20 files uploaded
                        </p>
                      </>
                    )}
                  </div>

                  {/* Upload Progress */}
                  {Object.keys(uploadProgress).length > 0 && (
                    <div className="mt-4 space-y-2">
                      {Object.entries(uploadProgress).map(([filename, progress]) => (
                        <div key={filename} className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <span className="truncate">{filename}</span>
                            <span>{progress}%</span>
                          </div>
                          <Progress value={progress} />
                        </div>
                      ))}
                    </div>
                  )}

                  {isUploadingFiles && (
                    <div className="flex items-center justify-center mt-4">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      <span className="ml-2 text-sm">Uploading files...</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Pending Files */}
              {pendingFiles && pendingFiles.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-orange-500" />
                      Pending & Failed Files
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {pendingFiles.map((file) => (
                        <div
                          key={file.id}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <FileStatusIcon status={file.azure_file_status} />
                            <div>
                              <p className="text-sm font-medium">{file.file_name}</p>
                              <p className="text-xs text-muted-foreground">
                                {formatFileSize(file.file_size)} • {file.azure_file_status}
                              </p>
                            </div>
                          </div>
                          {file.azure_file_status === 'failed' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRetryFile(file.id)}
                            >
                              <RefreshCw className="h-3 w-3 mr-1" />
                              Retry
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Manage Files Tab */}
            <TabsContent value="manage">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Uploaded Files</CardTitle>
                  <CardDescription>
                    Manage your assistant&apos;s knowledge base files
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {files.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>File</TableHead>
                          <TableHead>Size</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Version</TableHead>
                          <TableHead>Uploaded</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {files.map((file) => (
                          <TableRow key={file.id}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {getFileTypeIcon(file.file_type)}
                                <span className="text-sm font-medium truncate max-w-[200px]">
                                  {file.file_name}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {formatFileSize(file.file_size)}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  file.azure_file_status === 'completed'
                                    ? 'default'
                                    : file.azure_file_status === 'failed'
                                    ? 'destructive'
                                    : 'secondary'
                                }
                                className="text-xs"
                              >
                                {file.azure_file_status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm">v{file.version}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {new Date(file.created_at).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDeleteFile(file.id)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No files uploaded yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Statistics Tab */}
            <TabsContent value="stats">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">File Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  {fileStats ? (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 border rounded-lg">
                        <p className="text-sm text-muted-foreground">Total Files</p>
                        <p className="text-2xl font-bold">{fileStats.total_files}/20</p>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <p className="text-sm text-muted-foreground">Total Size</p>
                        <p className="text-2xl font-bold">
                          {formatFileSize(fileStats.total_size_bytes)}
                        </p>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <p className="text-sm text-muted-foreground">Completed</p>
                        <p className="text-2xl font-bold text-green-500">
                          {fileStats.status_breakdown.completed || 0}
                        </p>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <p className="text-sm text-muted-foreground">Processing</p>
                        <p className="text-2xl font-bold text-yellow-500">
                          {fileStats.status_breakdown.processing || 0}
                        </p>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <p className="text-sm text-muted-foreground">Failed</p>
                        <p className="text-2xl font-bold text-red-500">
                          {fileStats.status_breakdown.failed || 0}
                        </p>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <p className="text-sm text-muted-foreground">Available Slots</p>
                        <p className="text-2xl font-bold">
                          {fileStats.max_files_allowed - fileStats.total_files}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
}
