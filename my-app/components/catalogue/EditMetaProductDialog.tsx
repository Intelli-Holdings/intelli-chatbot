'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Loader2, Upload, X, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CatalogueService } from '@/services/catalogue';
import type { AppService } from '@/services/whatsapp';
import type { MetaProduct, UpdateMetaProductPayload, ProductAvailability } from '@/types/ecommerce';
import { toast } from 'sonner';

const CURRENCIES = [
  { value: 'KES', label: 'KES - Kenyan Shilling' },
  { value: 'NGN', label: 'NGN - Nigerian Naira' },
  { value: 'GHS', label: 'GHS - Ghanaian Cedi' },
  { value: 'UGX', label: 'UGX - Ugandan Shilling' },
  { value: 'TZS', label: 'TZS - Tanzanian Shilling' },
  { value: 'ZAR', label: 'ZAR - South African Rand' },
  { value: 'USD', label: 'USD - US Dollar' },
  { value: 'EUR', label: 'EUR - Euro' },
  { value: 'GBP', label: 'GBP - British Pound' },
];

const AVAILABILITY_OPTIONS: { value: ProductAvailability; label: string }[] = [
  { value: 'in stock', label: 'In Stock' },
  { value: 'out of stock', label: 'Out of Stock' },
  { value: 'available for order', label: 'Available for Order' },
];

const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

/**
 * Upload an image to Azure Blob Storage via the existing SAS URL flow.
 * Returns a publicly accessible blob URL.
 */
async function uploadImageToStorage(file: File): Promise<string> {
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

interface EditMetaProductDialogProps {
  product: MetaProduct;
  appService: AppService;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProductUpdated: () => void;
  onProductDeleted: () => void;
}

export function EditMetaProductDialog({
  product,
  appService,
  open,
  onOpenChange,
  onProductUpdated,
  onProductDeleted,
}: EditMetaProductDialogProps) {
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [currency, setCurrency] = useState('KES');
  const [availability, setAvailability] = useState<ProductAvailability>('in stock');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState('');

  // Image state
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState('');
  const [imageMode, setImageMode] = useState<'keep' | 'upload' | 'url'>('keep');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Populate form when product changes
  useEffect(() => {
    if (product && open) {
      setName(product.name || '');
      setDescription(product.description || '');
      // Meta API returns price in cents, convert to display
      setPrice(product.price ? String(product.price / 100) : '');
      setCurrency(product.currency || 'KES');
      setAvailability(product.availability || 'in stock');
      setBrand(product.brand || '');
      setCategory(product.category || '');
      setCurrentImageUrl(product.image_url || '');
      setImageMode('keep');
      setImageFile(null);
      setImagePreview(null);
      setNewImageUrl('');
    }
  }, [product, open]);

  const handleFileSelect = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      toast.error('Please select a JPEG, PNG, or WebP image');
      return;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      toast.error('Image must be under 5MB');
      return;
    }

    setImageFile(file);
    const url = URL.createObjectURL(file);
    setImagePreview(url);
    setImageMode('upload');
  }, []);

  const removeNewImage = useCallback(() => {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImageFile(null);
    setImagePreview(null);
    setImageMode('keep');
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [imagePreview]);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      handleFileSelect(e.dataTransfer.files);
    },
    [handleFileSelect]
  );

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('Product name is required');
      return;
    }
    if (!price || Number(price) <= 0) {
      toast.error('Price must be greater than 0');
      return;
    }

    setSaving(true);
    try {
      const payload: UpdateMetaProductPayload = {};

      if (name.trim() !== product.name) payload.name = name.trim();
      if (description.trim() !== (product.description || ''))
        payload.description = description.trim();

      const priceInCents = Math.round(Number(price) * 100);
      if (priceInCents !== product.price) payload.price = priceInCents;
      if (currency !== product.currency) payload.currency = currency;
      if (availability !== product.availability) payload.availability = availability;
      if (brand.trim() !== (product.brand || '')) payload.brand = brand.trim();
      if (category.trim() !== (product.category || '')) payload.category = category.trim();

      // Handle image
      if (imageMode === 'upload' && imageFile) {
        setUploading(true);
        try {
          payload.image_url = await uploadImageToStorage(imageFile);
        } catch {
          toast.error('Failed to upload image. Other changes will still be saved.');
        } finally {
          setUploading(false);
        }
      } else if (imageMode === 'url' && newImageUrl.trim()) {
        payload.image_url = newImageUrl.trim();
      }

      if (Object.keys(payload).length === 0) {
        toast.info('No changes to save');
        onOpenChange(false);
        return;
      }

      await CatalogueService.updateProduct(appService, product.id, payload);
      toast.success('Product updated');
      onOpenChange(false);
      onProductUpdated();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Failed to update product'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await CatalogueService.deleteProduct(appService, product.id);
      toast.success('Product deleted from Meta catalogue');
      setDeleteConfirmOpen(false);
      onOpenChange(false);
      onProductDeleted();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Failed to delete product'
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Meta Product</DialogTitle>
            <DialogDescription>
              Update this product in your Meta Commerce catalogue.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="edit-meta-name">Name *</Label>
              <Input
                id="edit-meta-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            {/* SKU (read-only) */}
            <div className="space-y-2">
              <Label>SKU / Retailer ID</Label>
              <Input value={product.retailer_id} disabled className="opacity-60" />
              <p className="text-xs text-muted-foreground">
                Cannot be changed after creation
              </p>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="edit-meta-desc">Description</Label>
              <Textarea
                id="edit-meta-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            {/* Price + Currency */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="edit-meta-price">Price *</Label>
                <Input
                  id="edit-meta-price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Currency</Label>
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCIES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Availability */}
            <div className="space-y-2">
              <Label>Availability</Label>
              <Select
                value={availability}
                onValueChange={(v) => setAvailability(v as ProductAvailability)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {AVAILABILITY_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Product Image */}
            <div className="space-y-2">
              <Label>Product Image</Label>

              {/* Current image */}
              {currentImageUrl && imageMode === 'keep' && (
                <div className="relative rounded-lg border overflow-hidden">
                  <img
                    src={currentImageUrl}
                    alt={product.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute bottom-2 right-2 flex gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        setImageMode('upload');
                      }}
                      className="rounded-md bg-black/60 px-2 py-1 text-xs text-white hover:bg-black/80 transition-colors"
                    >
                      Change
                    </button>
                  </div>
                </div>
              )}

              {/* Upload / URL mode */}
              {imageMode !== 'keep' && (
                <>
                  <div className="flex items-center gap-2 text-xs">
                    <div className="flex items-center rounded-md border">
                      <button
                        type="button"
                        className={`px-2.5 py-1 rounded-l-md transition-colors ${
                          imageMode === 'upload'
                            ? 'bg-primary text-primary-foreground'
                            : 'hover:bg-accent'
                        }`}
                        onClick={() => setImageMode('upload')}
                      >
                        Upload
                      </button>
                      <button
                        type="button"
                        className={`px-2.5 py-1 rounded-r-md transition-colors ${
                          imageMode === 'url'
                            ? 'bg-primary text-primary-foreground'
                            : 'hover:bg-accent'
                        }`}
                        onClick={() => setImageMode('url')}
                      >
                        URL
                      </button>
                    </div>
                    {currentImageUrl && (
                      <button
                        type="button"
                        onClick={() => {
                          removeNewImage();
                          setImageMode('keep');
                        }}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        Cancel
                      </button>
                    )}
                  </div>

                  {imageMode === 'upload' ? (
                    <>
                      {imagePreview ? (
                        <div className="relative rounded-lg border overflow-hidden">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="w-full h-48 object-cover"
                          />
                          <button
                            type="button"
                            onClick={removeNewImage}
                            className="absolute top-2 right-2 rounded-full bg-black/60 p-1 text-white hover:bg-black/80 transition-colors"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <div
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={handleDrop}
                          onClick={() => fileInputRef.current?.click()}
                          className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-muted-foreground/25 p-6 cursor-pointer hover:border-muted-foreground/50 transition-colors"
                        >
                          <div className="rounded-full bg-muted p-3">
                            <Upload className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <p className="text-sm font-medium">
                            Click to upload or drag & drop
                          </p>
                          <p className="text-xs text-muted-foreground">
                            JPEG, PNG, or WebP (max 5MB)
                          </p>
                        </div>
                      )}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={(e) => handleFileSelect(e.target.files)}
                        className="hidden"
                      />
                    </>
                  ) : (
                    <Input
                      type="url"
                      placeholder="https://example.com/image.jpg"
                      value={newImageUrl}
                      onChange={(e) => setNewImageUrl(e.target.value)}
                    />
                  )}
                </>
              )}

              {/* No current image and in keep mode */}
              {!currentImageUrl && imageMode === 'keep' && (
                <button
                  type="button"
                  onClick={() => setImageMode('upload')}
                  className="flex items-center gap-2 rounded-lg border-2 border-dashed border-muted-foreground/25 p-4 w-full cursor-pointer hover:border-muted-foreground/50 transition-colors text-sm text-muted-foreground"
                >
                  <Upload className="h-4 w-4" />
                  Add an image
                </button>
              )}
            </div>

            {/* Brand + Category */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="edit-meta-brand">Brand</Label>
                <Input
                  id="edit-meta-brand"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-meta-category">Category</Label>
                <Input
                  id="edit-meta-category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                />
              </div>
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setDeleteConfirmOpen(true)}
              disabled={saving}
              className="sm:mr-auto"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {uploading ? 'Uploading...' : 'Saving...'}
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete product?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove &quot;{product.name}&quot; from your Meta catalogue.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
