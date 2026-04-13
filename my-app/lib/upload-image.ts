/**
 * Upload an image via the backend proxy.
 *
 * Uses a server-side API route that uploads to Azure Blob Storage,
 * avoiding CORS issues with direct browser-to-Azure uploads.
 *
 * @param file - Image file to upload
 * @returns Publicly accessible URL for the uploaded image
 */
export async function uploadImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('/api/commerce/upload-image', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to upload image');
  }

  const data = await response.json();
  return data.url;
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
