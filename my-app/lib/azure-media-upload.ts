/**
 * Azure Media Upload Utility
 *
 * This module handles large file uploads (videos, images, documents) for WhatsApp
 * by using Azure Blob Storage as an intermediary. This bypasses server body size
 * limits (e.g., Vercel's 4.5MB limit on the free tier).
 *
 * Architecture:
 * ┌─────────┐     ┌─────────────┐     ┌───────┐     ┌──────┐
 * │ Browser │────▶│ get-upload  │────▶│ Azure │     │ Meta │
 * │         │     │    -url     │     │ Blob  │     │      │
 * │         │─────────────────────────▶│       │     │      │
 * │         │     ┌─────────────┐     │       │     │      │
 * │         │────▶│upload-from  │────▶│       │────▶│      │
 * └─────────┘     │   -azure    │     └───────┘     └──────┘
 *
 * Flow:
 * 1. Client requests SAS URL from backend (small JSON request)
 * 2. Client uploads directly to Azure using SAS URL (bypasses server)
 * 3. Client tells backend to transfer from Azure to Meta's WhatsApp API
 *
 * Backend endpoints (Django):
 *   - POST /broadcast/whatsapp/templates/get_upload_url/
 *   - POST /broadcast/whatsapp/templates/upload_from_azure/
 *
 * Next.js proxy routes:
 *   - POST /api/whatsapp/media/get-upload-url
 *   - POST /api/whatsapp/media/upload-from-azure
 *
 * Used by:
 *   - Flow Builder (QuestionNodeEditor, MediaNodeEditor)
 *   - Any component needing large media uploads to WhatsApp
 */

export interface UploadProgress {
  stage: 'preparing' | 'uploading' | 'processing' | 'complete' | 'error';
  progress: number; // 0-100
  message: string;
}

export interface AzureUploadResult {
  success: boolean;
  id?: string;       // Media ID for sending messages
  handle?: string;   // Media handle for templates
  fileType: string;
  fileName: string;
  fileSize: number;
  error?: string;
}

interface GetUploadUrlResponse {
  upload_url: string;
  blob_url: string;
  blob_path: string;
  expires_in: number;
}

interface UploadFromAzureResponse {
  success: boolean;
  id?: string;
  handle?: string;
  file_type: string;
  file_name: string;
  file_size: number;
  error?: string;
}

/**
 * Upload a media file using Azure as intermediary storage.
 * This bypasses server body size limits by uploading directly to Azure.
 *
 * @param file - The file to upload
 * @param options - Upload options
 * @param onProgress - Progress callback
 * @returns Upload result with media ID or handle
 */
export async function uploadMediaViaAzure(
  file: File,
  options: {
    accessToken: string;
    phoneNumberId: string;
    uploadType?: 'media' | 'resumable';
  },
  onProgress?: (progress: UploadProgress) => void
): Promise<AzureUploadResult> {
  const { accessToken, phoneNumberId, uploadType = 'media' } = options;

  try {
    // Stage 1: Get upload URL from backend
    onProgress?.({
      stage: 'preparing',
      progress: 10,
      message: 'Preparing upload...'
    });

    const uploadUrlResponse = await fetch('/api/whatsapp/media/get-upload-url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        file_name: file.name,
        file_type: file.type,
        file_size: file.size,
      }),
    });

    if (!uploadUrlResponse.ok) {
      const error = await uploadUrlResponse.text();
      let errorMessage = 'Failed to get upload URL';
      try {
        const parsed = JSON.parse(error);
        errorMessage = parsed.error || errorMessage;
      } catch {
        if (error) errorMessage = error;
      }
      throw new Error(errorMessage);
    }

    const uploadUrlData: GetUploadUrlResponse = await uploadUrlResponse.json();

    // Stage 2: Upload directly to Azure
    onProgress?.({
      stage: 'uploading',
      progress: 30,
      message: 'Uploading to cloud storage...'
    });

    const azureUploadResponse = await fetch(uploadUrlData.upload_url, {
      method: 'PUT',
      headers: {
        'x-ms-blob-type': 'BlockBlob',
        'Content-Type': file.type,
      },
      body: file,
    });

    if (!azureUploadResponse.ok) {
      const errorText = await azureUploadResponse.text();
      throw new Error(`Azure upload failed: ${errorText || azureUploadResponse.statusText}`);
    }

    onProgress?.({
      stage: 'uploading',
      progress: 70,
      message: 'Upload complete, processing...'
    });

    // Stage 3: Transfer from Azure to Meta
    onProgress?.({
      stage: 'processing',
      progress: 80,
      message: 'Processing media...'
    });

    const metaUploadResponse = await fetch('/api/whatsapp/media/upload-from-azure', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        blob_url: uploadUrlData.blob_url,
        file_name: file.name,
        file_type: file.type,
        file_size: file.size,
        upload_type: uploadType,
        accessToken,
        phoneNumberId,
      }),
    });

    if (!metaUploadResponse.ok) {
      const error = await metaUploadResponse.text();
      let errorMessage = 'Failed to process media';
      try {
        const parsed = JSON.parse(error);
        errorMessage = parsed.error || errorMessage;
      } catch {
        if (error) errorMessage = error;
      }
      throw new Error(errorMessage);
    }

    const result: UploadFromAzureResponse = await metaUploadResponse.json();

    onProgress?.({
      stage: 'complete',
      progress: 100,
      message: 'Upload complete!'
    });

    return {
      success: true,
      id: result.id,
      handle: result.handle,
      fileType: result.file_type,
      fileName: result.file_name,
      fileSize: result.file_size,
    };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Upload failed';

    onProgress?.({
      stage: 'error',
      progress: 0,
      message: errorMessage
    });

    return {
      success: false,
      error: errorMessage,
      fileType: file.type,
      fileName: file.name,
      fileSize: file.size,
    };
  }
}

/**
 * Check if a file should use Azure upload (large files)
 * Files over 4MB should use Azure to avoid server limits
 */
export function shouldUseAzureUpload(file: File): boolean {
  const THRESHOLD = 4 * 1024 * 1024; // 4MB
  return file.size > THRESHOLD;
}
