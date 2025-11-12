// File management utility functions for the Assistant File Management System

export interface FileUploadResponse {
  id: number;
  file_name: string;
  file_url: string;
  file_id: string;
  file_type: string;
  file_size: number;
  file_size_mb: number;
  file_hash: string;
  azure_file_status: 'pending' | 'processing' | 'completed' | 'failed';
  version: number;
  parent_file: number | null;
  is_deleted: boolean;
  metadata: Record<string, any>;
  assistant: number;
  uploaded_by: number;
  uploaded_by_name: string;
  created_at: string;
  updated_at: string;
}

export interface FileListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: FileUploadResponse[];
}

export interface FileStatistics {
  total_files: number;
  total_size_bytes: number;
  total_size_mb: number;
  max_files_allowed: number;
  remaining_slots: number;
  status_breakdown: {
    pending: number;
    processing: number;
    completed: number;
    failed: number;
  };
  file_types: Record<string, number>;
  assistant_id: string;
  assistant_name?: string;
}

export interface BulkUploadResponse {
  message: string;
  uploaded: number;
  failed: number;
  uploaded_files: Array<{
    id: number;
    file_name: string;
    status: string;
  }>;
  failed_files: Array<{
    file_name: string;
    error: string;
  }>;
  assistant_id: string;
}

export class FileManagerAPI {
  private baseUrl = '/api/assistants/files';

  /**
   * Upload a single file to an assistant
   */
  async uploadFile(assistantId: string, file: File): Promise<FileUploadResponse> {
    const formData = new FormData();
    formData.append('assistant_id', assistantId);
    formData.append('file', file);

    const response = await fetch(this.baseUrl, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  /**
   * Upload multiple files to an assistant
   */
  async bulkUploadFiles(assistantId: string, files: File[]): Promise<BulkUploadResponse> {
    const formData = new FormData();
    formData.append('assistant_id', assistantId);
    
    files.forEach(file => {
      formData.append('files', file);
    });

    const response = await fetch(`${this.baseUrl}/bulk-upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  /**
   * Get list of files for an assistant
   */
  async getFiles(
    assistantId: string, 
    page: number = 1, 
    pageSize: number = 20
  ): Promise<FileListResponse> {
    const params = new URLSearchParams({
      assistant_id: assistantId,
      page: page.toString(),
      page_size: pageSize.toString(),
    });

    const response = await fetch(`${this.baseUrl}?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  /**
   * Get file statistics for an assistant
   */
  async getFileStatistics(assistantId: string): Promise<FileStatistics> {
    const params = new URLSearchParams({
      assistant_id: assistantId,
    });

    const response = await fetch(`${this.baseUrl}/statistics?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  /**
   * Get details of a specific file
   */
  async getFileDetails(fileId: number): Promise<FileUploadResponse> {
    const response = await fetch(`${this.baseUrl}/${fileId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  /**
   * Delete a file (soft delete)
   */
  async deleteFile(fileId: number): Promise<{ message: string }> {
    const response = await fetch(`${this.baseUrl}/${fileId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  /**
   * Create a new version of an existing file
   */
  async createFileVersion(fileId: number, file: File): Promise<FileUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${this.baseUrl}/${fileId}/create-version`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  /**
   * Get all versions of a file
   */
  async getFileVersions(fileId: number): Promise<FileUploadResponse[]> {
    const response = await fetch(`${this.baseUrl}/${fileId}/versions`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  /**
   * Get test file statistics (for development)
   */
  async getTestFileStatistics(assistantId: string): Promise<FileStatistics> {
    const params = new URLSearchParams({
      assistant_id: assistantId,
    });

    const response = await fetch(`${this.baseUrl}/test/file-stats?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }
}

// Export a singleton instance
export const fileManagerAPI = new FileManagerAPI();

// Helper functions
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const getFileTypeIcon = (fileType: string): string => {
  if (fileType.includes('pdf')) return '📄';
  if (fileType.includes('word') || fileType.includes('document')) return '📝';
  if (fileType.includes('excel') || fileType.includes('spreadsheet')) return '📊';
  if (fileType.includes('powerpoint') || fileType.includes('presentation')) return '📊';
  if (fileType.includes('text')) return '📄';
  if (fileType.includes('csv')) return '📊';
  if (fileType.includes('json')) return '📋';
  if (fileType.includes('markdown')) return '📝';
  return '📁';
};

export const isAllowedFileType = (fileType: string): boolean => {
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'text/csv',
    'text/markdown',
    'application/json',
  ];
  
  return allowedTypes.includes(fileType);
};

export const validateFileUpload = (file: File): { isValid: boolean; error?: string } => {
  // Check file type
  if (!isAllowedFileType(file.type)) {
    return {
      isValid: false,
      error: 'Invalid file type. Allowed types: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, CSV, MD, JSON'
    };
  }
  
  // Check file size (512MB limit)
  const maxSize = 512 * 1024 * 1024; // 512MB in bytes
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: 'File size exceeds maximum limit of 512MB'
    };
  }
  
  return { isValid: true };
};
