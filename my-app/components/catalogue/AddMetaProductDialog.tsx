'use client';

import { useState, useRef, useCallback } from 'react';
import { Plus, Loader2, Upload, X, ImageIcon } from 'lucide-react';
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
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CatalogueService } from '@/services/catalogue';
import type { AppService } from '@/services/whatsapp';
import type { CreateMetaProductPayload, ProductAvailability } from '@/types/ecommerce';
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
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

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

interface AddMetaProductDialogProps {
  appService: AppService;
  catalogId: string;
  onProductCreated: () => void;
}

export function AddMetaProductDialog({
  appService,
  catalogId,
  onProductCreated,
}: AddMetaProductDialogProps) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState('');
  const [retailerId, setRetailerId] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [currency, setCurrency] = useState('KES');
  const [availability, setAvailability] = useState<ProductAvailability>('in stock');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState('');

  // Image state
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [imageMode, setImageMode] = useState<'upload' | 'url'>('upload');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetForm = () => {
    setName('');
    setRetailerId('');
    setDescription('');
    setPrice('');
    setCurrency('KES');
    setAvailability('in stock');
    setBrand('');
    setCategory('');
    setImageFile(null);
    setImagePreview(null);
    setImageUrl('');
    setImageMode('upload');
  };

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
  }, []);

  const removeImage = useCallback(() => {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImageFile(null);
    setImagePreview(null);
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
    if (!retailerId.trim()) {
      toast.error('SKU / Retailer ID is required');
      return;
    }
    if (!price || Number(price) <= 0) {
      toast.error('Price must be greater than 0');
      return;
    }

    setSaving(true);
    try {
      // Resolve image URL
      let resolvedImageUrl = '';

      if (imageMode === 'upload' && imageFile) {
        setUploading(true);
        try {
          resolvedImageUrl = await uploadImageToStorage(imageFile);
        } catch {
          toast.error('Failed to upload image. Product will be created without an image.');
        } finally {
          setUploading(false);
        }
      } else if (imageMode === 'url' && imageUrl.trim()) {
        resolvedImageUrl = imageUrl.trim();
      }

      // Convert price to cents for Meta API
      const priceInCents = Math.round(Number(price) * 100);

      const payload: CreateMetaProductPayload = {
        name: name.trim(),
        retailer_id: retailerId.trim(),
        price: priceInCents,
        currency,
        availability,
      };

      if (description.trim()) payload.description = description.trim();
      if (resolvedImageUrl) payload.image_url = resolvedImageUrl;
      if (brand.trim()) payload.brand = brand.trim();
      if (category.trim()) payload.category = category.trim();

      await CatalogueService.createProduct(appService, catalogId, payload);
      toast.success('Product added to Meta catalogue');
      resetForm();
      setOpen(false);
      onProductCreated();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Failed to create product'
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Product to Meta Catalogue</DialogTitle>
          <DialogDescription>
            This product will be created directly in your connected Meta Commerce catalogue.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="meta-product-name">Name *</Label>
            <Input
              id="meta-product-name"
              placeholder="Product name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* SKU / Retailer ID */}
          <div className="space-y-2">
            <Label htmlFor="meta-product-sku">SKU / Retailer ID *</Label>
            <Input
              id="meta-product-sku"
              placeholder="e.g. PROD-001"
              value={retailerId}
              onChange={(e) => setRetailerId(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Unique identifier used in WhatsApp product messages
            </p>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="meta-product-desc">Description</Label>
            <Textarea
              id="meta-product-desc"
              placeholder="Product description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          {/* Price + Currency */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="meta-product-price">Price *</Label>
              <Input
                id="meta-product-price"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="meta-product-currency">Currency</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger id="meta-product-currency">
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
            <Label htmlFor="meta-product-availability">Availability</Label>
            <Select
              value={availability}
              onValueChange={(v) => setAvailability(v as ProductAvailability)}
            >
              <SelectTrigger id="meta-product-availability">
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
            <div className="flex items-center justify-between">
              <Label>Product Image</Label>
              <div className="flex items-center rounded-md border text-xs">
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
                      onClick={removeImage}
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
                    <div className="text-center">
                      <p className="text-sm font-medium">
                        Click to upload or drag & drop
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        JPEG, PNG, or WebP (max 5MB)
                      </p>
                    </div>
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
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
              />
            )}
          </div>

          {/* Brand + Category */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="meta-product-brand">Brand</Label>
              <Input
                id="meta-product-brand"
                placeholder="e.g. Samsung"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="meta-product-category">Category</Label>
              <Input
                id="meta-product-category"
                placeholder="e.g. Electronics"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {uploading ? 'Uploading image...' : 'Creating...'}
              </>
            ) : (
              'Create Product'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
