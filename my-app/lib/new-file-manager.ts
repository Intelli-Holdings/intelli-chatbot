export interface FileUploadResponse {
  id: number;
  file_name: string;
  file_url?: string;
  file_id?: string;
  file_type: string;
  file_size: number;
  file_size_mb?: number;
  file_hash?: string;
  azure_file_status: string;
  version: number;
  parent_file: number | null;
  is_deleted: boolean;
  metadata: Record<string, any> | null;
  assistant?: number;
  assistant_id?: string;
  uploaded_by?: number;
  uploaded_by_name?: string;
  created_at: string;
  updated_at: string;
}

export interface FileListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: FileUploadResponse[];
}

export interface PendingFilesResponse {
  count: number;
  files: FileUploadResponse[];
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

export class NewFileManagerAPI {
  private baseUrl = '/api/files';

  /**
   * Get list of files for an assistant
   */
  async getFiles(assistantId: string): Promise<FileListResponse> {
    const response = await fetch(`${this.baseUrl}?assistant_id=${assistantId}`, {
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
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorData.detail || errorMessage;
      } catch (e) {
        // If response is not JSON, use the status text or default message
        errorMessage = response.statusText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    try {
      return await response.json();
    } catch (e) {
      throw new Error('Server returned invalid response');
    }
  }

  /**
   * Get file detail by ID
   */
  async getFileDetail(fileId: number): Promise<FileUploadResponse> {
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
   * Update file metadata (used when uploading new versions)
   */
  async updateFile(fileId: number, data: Partial<FileUploadResponse>): Promise<FileUploadResponse> {
    const response = await fetch(`${this.baseUrl}/${fileId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  /**
   * Delete a file
   */
  async deleteFile(fileId: number): Promise<void> {
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
  }

  /**
   * Get file statistics for an assistant
   */
  async getFileStatistics(assistantId: string): Promise<FileStatistics> {
    const response = await fetch(`${this.baseUrl}/statistics?assistant_id=${assistantId}`, {
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
   * Get pending and failed files for an assistant
   */
  async getPendingFiles(assistantId: string): Promise<PendingFilesResponse> {
    const response = await fetch(`${this.baseUrl}/pending_files?assistant_id=${assistantId}`, {
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
   * Retry failed or pending file upload
   */
  async retryFileUpload(fileId: number): Promise<FileUploadResponse> {
    const response = await fetch(`${this.baseUrl}/${fileId}/retry_upload`, {
      method: 'POST',
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
   * Upload multiple files to an assistant
   */
  async bulkUploadFiles(assistantId: string, files: File[]): Promise<BulkUploadResponse> {
    const formData = new FormData();
    formData.append('assistant_id', assistantId);
    
    files.forEach(file => {
      formData.append('files', file);
    });

    const response = await fetch(`${this.baseUrl}/bulk_upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorData.detail || errorMessage;
      } catch (e) {
        // If response is not JSON, use the status text or default message
        errorMessage = response.statusText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    try {
      return await response.json();
    } catch (e) {
      throw new Error('Server returned invalid response');
    }
  }

  /**
   * Get file versions
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
   * Create file version
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
}

// Utility functions
export const formatFileSize = (bytes: number | undefined | null): string => {
  if (!bytes || bytes === 0 || isNaN(bytes)) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const getFileTypeIcon = (fileType: string): string => {
  const typeMap: Record<string, string> = {
    'application/pdf': '📄',
    'application/msword': '📝',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '📝',
    'application/vnd.ms-powerpoint': '📊',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': '📊',
    'text/plain': '📄',
    'application/json': '🔧',
    'text/markdown': '📝',
    'text/html': '🌐',
    'application/x-python': '🐍',
    'text/x-python': '🐍',
    'application/x-sh': '⚙️',
    'text/x-sh': '⚙️',
    'application/x-tex': '📐',
    'text/x-tex': '📐',
    'application/typescript': '📘',
    'text/typescript': '📘',
  };
  return typeMap[fileType] || '📎';
};

export const validateFileUpload = (file: File): { isValid: boolean; error?: string } => {
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'text/markdown',
    'application/json',
    'text/html',
    'application/x-python',
    'text/x-python',
    'application/x-sh',
    'text/x-sh',
    'application/x-tex',
    'text/x-tex',
    'application/typescript',
    'text/typescript',
  ];

  if (!allowedTypes.includes(file.type)) {
    return { isValid: false, error: 'File type not allowed' };
  }

  const maxSize = 512 * 1024 * 1024; // 512MB
  if (file.size > maxSize) {
    return { isValid: false, error: 'File size exceeds 512MB limit' };
  }

  return { isValid: true };
};

export const isAllowedFileType = (fileType: string): boolean => {
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'text/markdown',
    'application/json',
    'text/html',
    'application/x-python',
    'text/x-python',
    'application/x-sh',
    'text/x-sh',
    'application/x-tex',
    'text/x-tex',
    'application/typescript',
    'text/typescript',
  ];
  return allowedTypes.includes(fileType);
};

// Create instance for export
export const newFileManagerAPI = new NewFileManagerAPI();
