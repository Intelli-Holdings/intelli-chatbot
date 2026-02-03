'use client';

import { useState, useEffect } from 'react';
import { Upload, Loader2, Check, Image, Video, FileText, Music } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { MediaNodeData, MediaType } from '../nodes/MediaNode';
import { toast } from 'sonner';
import { useAppServices } from '@/hooks/use-app-services';

interface MediaNodeEditorProps {
  data: MediaNodeData;
  onUpdate: (data: Partial<MediaNodeData>) => void;
}

const MEDIA_CONFIG: Record<MediaType, { accept: string; label: string; formats: string }> = {
  image: {
    accept: 'image/jpeg,image/jpg,image/png',
    label: 'Upload Image',
    formats: 'JPG, PNG (max 100MB)',
  },
  video: {
    accept: 'video/mp4',
    label: 'Upload Video',
    formats: 'MP4 (max 100MB)',
  },
  document: {
    accept: 'application/pdf',
    label: 'Upload Document',
    formats: 'PDF (max 100MB)',
  },
  audio: {
    accept: 'audio/mpeg,audio/mp3,audio/ogg,audio/amr',
    label: 'Upload Audio',
    formats: 'MP3, OGG, AMR (max 100MB)',
  },
};

export default function MediaNodeEditor({ data, onUpdate }: MediaNodeEditorProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [caption, setCaption] = useState(data.caption || '');
  const [hasChanges, setHasChanges] = useState(false);

  const { selectedAppService } = useAppServices();
  const config = MEDIA_CONFIG[data.mediaType];

  useEffect(() => {
    setCaption(data.caption || '');
    setHasChanges(false);
  }, [data.caption]);

  const handleFileUpload = async (file: File) => {
    if (!selectedAppService) {
      toast.error('No WhatsApp service configured');
      return;
    }

    if (!selectedAppService.access_token || !selectedAppService.phone_number_id) {
      toast.error('WhatsApp service is not properly configured');
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('accessToken', selectedAppService.access_token);
      formData.append('phoneNumberId', selectedAppService.phone_number_id);
      formData.append('uploadType', 'media');

      const response = await fetch('/api/whatsapp/upload-media', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to upload file');
      }

      const result = await response.json();

      // Validate result has required id
      if (!result || !result.id) {
        throw new Error('Invalid response: missing media ID');
      }

      onUpdate({
        mediaId: result.id,
        fileName: file.name,
      });
      toast.success('File uploaded successfully');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to upload file');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
    e.target.value = '';
  };

  const handleCaptionChange = (value: string) => {
    setCaption(value);
    setHasChanges(true);
  };

  const handleSave = () => {
    onUpdate({ caption });
    setHasChanges(false);
    toast.success('Caption saved');
  };

  const getIcon = () => {
    switch (data.mediaType) {
      case 'image': return Image;
      case 'video': return Video;
      case 'document': return FileText;
      case 'audio': return Music;
    }
  };

  const Icon = getIcon();

  return (
    <div className="space-y-4">
      {/* File Upload */}
      <div className="space-y-2">
        <Label>Media File</Label>
        <div className="flex flex-col gap-2">
          <input
            type="file"
            accept={config.accept}
            onChange={handleFileSelect}
            className="hidden"
            id={`media-upload-${data.mediaType}`}
          />
          <Button
            variant="outline"
            onClick={() => document.getElementById(`media-upload-${data.mediaType}`)?.click()}
            disabled={isUploading}
            className="w-full"
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                {data.fileName || config.label}
              </>
            )}
          </Button>
          {data.mediaId && (
            <div className="flex items-center gap-2 text-sm text-green-600">
              <Check className="h-4 w-4" />
              <span>File uploaded</span>
            </div>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          Supported: {config.formats}
        </p>
      </div>

      {/* Caption (not for audio) */}
      {data.mediaType !== 'audio' && (
        <div className="space-y-2">
          <Label>Caption (optional)</Label>
          <Textarea
            value={caption}
            onChange={(e) => handleCaptionChange(e.target.value)}
            placeholder="Add a caption..."
            rows={2}
          />
        </div>
      )}

      {/* Save Button */}
      {hasChanges && (
        <Button onClick={handleSave} size="sm" className="w-full">
          <Check className="h-4 w-4 mr-2" />
          Save Caption
        </Button>
      )}

      {/* Info */}
      <div className="p-3 bg-muted/50 rounded-lg text-sm">
        <div className="flex items-center gap-2 mb-2">
          <Icon className="h-4 w-4" />
          <span className="font-medium">{data.mediaType.charAt(0).toUpperCase() + data.mediaType.slice(1)} Message</span>
        </div>
        <p className="text-xs text-muted-foreground">
          This node sends a {data.mediaType} file to the user when reached in the flow.
        </p>
      </div>
    </div>
  );
}
