"use client"

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { type WhatsAppTemplate } from '@/services/whatsapp';

interface DeleteTemplateDialogProps {
  template: WhatsAppTemplate | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  appService: any;
}

export function DeleteTemplateDialog({
  template,
  isOpen,
  onClose,
  onSuccess,
  appService
}: DeleteTemplateDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmationText, setConfirmationText] = useState('');

  const handleDelete = async () => {
    if (!template || !appService) return;

    if (confirmationText !== template.name) {
      toast.error('Template name does not match');
      return;
    }

    setIsDeleting(true);

    try {
      const response = await fetch('/api/whatsapp/templates', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: template.name,
          wabaId: appService.whatsapp_business_account_id,
          accessToken: appService.access_token
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete template');
      }

      toast.success(`Template "${template.name}" deleted successfully`);
      setConfirmationText('');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete template');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClose = () => {
    if (!isDeleting) {
      setConfirmationText('');
      onClose();
    }
  };

  if (!template) return null;

  const canDelete = template.status !== 'APPROVED' || 
                    (template.status === 'APPROVED' && 
                     (!template.last_updated || 
                      Date.now() - new Date(template.last_updated).getTime() > 24 * 60 * 60 * 1000));

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Delete Template
          </DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete the template.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!canDelete && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Cannot delete an approved template that has been sent in the last 24 hours.
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <div className="rounded-lg border p-3 bg-muted/50">
              <div className="text-sm font-medium">Template Details</div>
              <div className="mt-2 space-y-1 text-sm">
                <div><span className="text-muted-foreground">Name:</span> <span className="font-mono">{template.name}</span></div>
                <div><span className="text-muted-foreground">Category:</span> {template.category}</div>
                <div><span className="text-muted-foreground">Status:</span> {template.status}</div>
                <div><span className="text-muted-foreground">Language:</span> {template.language}</div>
              </div>
            </div>
          </div>

          {canDelete && (
            <>
              <Alert>
                <AlertDescription>
                  To confirm deletion, please type the template name: <span className="font-mono font-semibold">{template.name}</span>
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label htmlFor="confirmation">Template Name</Label>
                <Input
                  id="confirmation"
                  placeholder="Enter template name"
                  value={confirmationText}
                  onChange={(e) => setConfirmationText(e.target.value)}
                  disabled={isDeleting}
                  className="font-mono"
                />
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          {canDelete && (
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting || confirmationText !== template.name}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete Template'
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}