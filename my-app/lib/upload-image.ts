/**
 * Upload an image to Azure Blob Storage via the SAS URL flow.
 *
 * Flow:
 * 1. Request a write SAS URL from the backend
 * 2. Upload directly to Azure Blob Storage (bypasses server size limits)
 * 3. Return the publicly accessible blob URL (with read SAS token)
 *
 * @param file - Image file to upload
 * @returns Publicly accessible URL for the uploaded image
 */
export async function uploadImage(file: File): Promise<string> {
  // Step 1: Get a SAS upload URL from the backend
  const sasResponse = await fetch('/api/whatsapp/media/get-upload-url', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      file_name: file.name,
      file_type: file.type,
      file_size: file.size,
    }),
  });

  if (!sasResponse.ok) {
    const err = await sasResponse.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to get upload URL');
  }

  const { upload_url, blob_url } = await sasResponse.json();

  if (!upload_url || !blob_url) {
    throw new Error('Invalid upload URL response');
  }

  // Step 2: Upload directly to Azure Blob Storage
  const uploadResponse = await fetch(upload_url, {
    method: 'PUT',
    headers: {
      'x-ms-blob-type': 'BlockBlob',
      'Content-Type': file.type,
    },
    body: file,
  });

  if (!uploadResponse.ok) {
    throw new Error('Failed to upload image to storage');
  }

  return blob_url;
}

export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

/**
 * Validate an image file before upload.
 * @returns Error message or null if valid.
 */
export function validateImageFile(file: File): string | null {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    return 'Please select a JPEG, PNG, or WebP image';
  }
  if (file.size > MAX_IMAGE_SIZE) {
    return 'Image must be under 5MB';
  }
  return null;
}
