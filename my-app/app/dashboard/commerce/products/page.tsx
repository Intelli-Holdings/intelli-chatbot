'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import Image from 'next/image';
import {
  Search,
  Plus,
  RefreshCw,
  MoreVertical,
  Package,
  PackageCheck,
  PackageX,
  Star,
  Pencil,
  Trash2,
  Upload,
  X,
  ImageIcon,
  LayoutGrid,
  List,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { useProductsCrud } from '@/hooks/use-products-crud';
import { ProductService } from '@/services/product';
import type {
  ProductData,
  CreateProductRequest,
  ProductImageData,
} from '@/services/product';
import useActiveOrganizationId from '@/hooks/use-organization-id';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// ── Types & Constants ──────────────────────────────────────────────

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

const AVAILABILITY_OPTIONS = [
  { value: 'in_stock', label: 'In Stock' },
  { value: 'out_of_stock', label: 'Out of Stock' },
  { value: 'available_for_order', label: 'Available for Order' },
];

const availabilityConfig: Record<
  string,
  { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }
> = {
  in_stock: { label: 'In Stock', variant: 'default' },
  out_of_stock: { label: 'Out of Stock', variant: 'destructive' },
  available_for_order: { label: 'Available for Order', variant: 'secondary' },
};

interface ProductFormState {
  name: string;
  description: string;
  sku: string;
  price: string;
  sale_price: string;
  currency: string;
  category: string;
  brand: string;
  availability: string;
  track_inventory: boolean;
  quantity: string;
  is_featured: boolean;
}

const defaultFormState: ProductFormState = {
  name: '',
  description: '',
  sku: '',
  price: '',
  sale_price: '',
  currency: 'KES',
  category: '',
  brand: '',
  availability: 'in_stock',
  track_inventory: false,
  quantity: '0',
  is_featured: false,
};

function formatPrice(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat('en', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

// ── Main Page ──────────────────────────────────────────────────────

export default function ProductsPage() {
  const organizationId = useActiveOrganizationId();
  const {
    products,
    total,
    loading,
    error,
    refetch,
    filters,
    setFilters,
    createProduct,
    updateProduct,
    deleteProduct,
    saving,
  } = useProductsCrud();

  // Local UI state
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductData | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<ProductData | null>(null);
  const [formState, setFormState] = useState<ProductFormState>(defaultFormState);
  const [pendingImages, setPendingImages] = useState<File[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Stats computed from products
  const stats = {
    total,
    inStock: products.filter((p) => p.availability === 'in_stock').length,
    outOfStock: products.filter((p) => p.availability === 'out_of_stock').length,
    featured: products.filter((p) => p.is_featured).length,
  };

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setFilters({
        ...filters,
        search: searchQuery || undefined,
      });
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // ── Filter handlers ──────────────────────────────────────────────

  const handleCategoryFilter = useCallback(
    (category: string) => {
      setFilters({
        ...filters,
        category: category === 'all' ? undefined : category,
      });
    },
    [filters, setFilters]
  );

  const handleAvailabilityFilter = useCallback(
    (availability: string) => {
      setFilters({
        ...filters,
        availability: availability === 'all' ? undefined : availability,
      });
    },
    [filters, setFilters]
  );

  // ── Get unique categories from products ──────────────────────────

  const categories = Array.from(
    new Set(products.map((p) => p.category).filter(Boolean))
  );

  // ── Form helpers ─────────────────────────────────────────────────

  const openAddSheet = () => {
    setEditingProduct(null);
    setFormState(defaultFormState);
    setPendingImages([]);
    setSheetOpen(true);
  };

  const openEditSheet = (product: ProductData) => {
    setEditingProduct(product);
    setFormState({
      name: product.name,
      description: product.description || '',
      sku: product.sku || '',
      price: String(product.price),
      sale_price: product.sale_price ? String(product.sale_price) : '',
      currency: product.currency || 'KES',
      category: product.category || '',
      brand: product.brand || '',
      availability: product.availability || 'in_stock',
      track_inventory: product.track_inventory ?? false,
      quantity: String(product.quantity ?? 0),
      is_featured: product.is_featured ?? false,
    });
    setPendingImages([]);
    setSheetOpen(true);
  };

  const updateForm = (updates: Partial<ProductFormState>) => {
    setFormState((prev) => ({ ...prev, ...updates }));
  };

  const handleSave = async () => {
    if (!formState.name.trim()) {
      toast.error('Product name is required');
      return;
    }
    if (!formState.price || Number(formState.price) <= 0) {
      toast.error('Price must be greater than 0');
      return;
    }

    try {
      const payload: CreateProductRequest = {
        name: formState.name.trim(),
        description: formState.description.trim(),
        sku: formState.sku.trim(),
        price: Number(formState.price),
        sale_price: formState.sale_price ? Number(formState.sale_price) : null,
        currency: formState.currency,
        category: formState.category.trim(),
        brand: formState.brand.trim(),
        availability: formState.availability,
        track_inventory: formState.track_inventory,
        quantity: formState.track_inventory ? Number(formState.quantity) : 0,
        is_featured: formState.is_featured,
      };

      let savedProduct: ProductData;

      if (editingProduct) {
        savedProduct = await updateProduct(editingProduct.id, payload);
        toast.success('Product updated');
      } else {
        savedProduct = await createProduct(payload);
        toast.success('Product created');
      }

      // Upload pending images
      if (pendingImages.length > 0 && organizationId) {
        setUploadingImages(true);
        try {
          for (let i = 0; i < pendingImages.length; i++) {
            await ProductService.uploadImage(
              organizationId,
              savedProduct.id,
              pendingImages[i],
              i === 0 && savedProduct.images.length === 0 // first image is primary if none exist
            );
          }
          toast.success(`${pendingImages.length} image(s) uploaded`);
          refetch();
        } catch {
          toast.error('Some images failed to upload');
        } finally {
          setUploadingImages(false);
        }
      }

      setSheetOpen(false);
      setEditingProduct(null);
      setPendingImages([]);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Failed to save product'
      );
    }
  };

  // ── Delete ──────────────────────────────────────────────────────

  const openDeleteDialog = (product: ProductData) => {
    setProductToDelete(product);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!productToDelete) return;
    try {
      await deleteProduct(productToDelete.id);
      toast.success('Product deleted');
      setDeleteDialogOpen(false);
      setProductToDelete(null);
    } catch {
      toast.error('Failed to delete product');
    }
  };

  // ── Image handling (for existing products) ────────────────────────

  const handleDeleteImage = async (product: ProductData, imageId: string) => {
    if (!organizationId) return;
    try {
      await ProductService.deleteImage(organizationId, product.id, imageId);
      toast.success('Image deleted');
      refetch();
    } catch {
      toast.error('Failed to delete image');
    }
  };

  // ── File drop / select for pending images ─────────────────────────

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;
    const newFiles = Array.from(files).filter((f) =>
      f.type.startsWith('image/')
    );
    if (newFiles.length === 0) {
      toast.error('Please select image files only');
      return;
    }
    setPendingImages((prev) => [...prev, ...newFiles]);
  };

  const removePendingImage = (index: number) => {
    setPendingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    handleFileSelect(e.dataTransfer.files);
  };

  // ── Render ────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Products</h1>
          <p className="text-muted-foreground">
            Manage your product catalogue
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={refetch} disabled={loading}>
            <RefreshCw
              className={cn('h-4 w-4 mr-2', loading && 'animate-spin')}
            />
            Refresh
          </Button>
          <Button onClick={openAddSheet}>
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </div>
      </div>

      {/* Tabs: My Products | Meta Catalogue Sync */}
      <Tabs defaultValue="products" className="space-y-6">
        <TabsList>
          <TabsTrigger value="products" className="gap-2">
            <Package className="h-4 w-4" />
            My Products
          </TabsTrigger>
          <TabsTrigger value="meta-sync" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Meta Catalogue
          </TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-6">

      {/* Stats Cards */}
      {loading && products.length === 0 ? (
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-7 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Products
              </CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Stock</CardTitle>
              <PackageCheck className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats.inStock}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Out of Stock
              </CardTitle>
              <PackageX className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {stats.outOfStock}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Featured</CardTitle>
              <Star className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {stats.featured}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {categories.length > 0 && (
          <Select
            value={filters.category || 'all'}
            onValueChange={handleCategoryFilter}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <Select
          value={filters.availability || 'all'}
          onValueChange={handleAvailabilityFilter}
        >
          <SelectTrigger className="w-[170px]">
            <SelectValue placeholder="Availability" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Availability</SelectItem>
            {AVAILABILITY_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex items-center rounded-md border">
          <Button
            variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
            size="icon"
            className="rounded-r-none"
            onClick={() => setViewMode('grid')}
            aria-label="Grid view"
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'table' ? 'secondary' : 'ghost'}
            size="icon"
            className="rounded-l-none"
            onClick={() => setViewMode('table')}
            aria-label="Table view"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Product List */}
      {loading && products.length === 0 ? (
        viewMode === 'grid' ? (
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i}>
                <Skeleton className="h-48 w-full rounded-t-lg rounded-b-none" />
                <CardContent className="p-4 space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-1/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-0">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Availability</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead className="w-[50px]" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Skeleton className="h-10 w-10 rounded" />
                            <Skeleton className="h-4 w-32" />
                          </div>
                        </TableCell>
                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                        <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )
      ) : products.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400 mb-5">
              <Package className="h-7 w-7" />
            </div>
            <h3 className="text-lg font-semibold tracking-tight mb-2">
              No products yet
            </h3>
            <p className="text-sm text-muted-foreground max-w-sm mb-6">
              Add your first product to start building your catalogue. Products
              can be shared with customers on WhatsApp.
            </p>
            <Button onClick={openAddSheet}>
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </CardContent>
        </Card>
      ) : viewMode === 'grid' ? (
        /* ── Grid View ─────────────────────────────────────────────── */
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => {
            const primaryImage =
              product.primary_image ||
              product.images?.find((img) => img.is_primary)?.image_url ||
              product.images?.[0]?.image_url;
            const avail =
              availabilityConfig[product.availability] ||
              availabilityConfig.in_stock;

            return (
              <Card
                key={product.id}
                className="group overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Image */}
                <div className="relative h-48 bg-muted flex items-center justify-center overflow-hidden">
                  {primaryImage ? (
                    <Image
                      src={primaryImage}
                      alt={product.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                  ) : (
                    <Package className="h-12 w-12 text-muted-foreground/40" />
                  )}
                  {product.is_featured && (
                    <Badge className="absolute top-2 left-2 bg-yellow-500 text-white hover:bg-yellow-600">
                      <Star className="h-3 w-3 mr-1" />
                      Featured
                    </Badge>
                  )}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="secondary"
                          size="icon"
                          className="h-8 w-8 shadow-sm"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => openEditSheet(product)}
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => openDeleteDialog(product)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* Details */}
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="font-semibold truncate">{product.name}</h3>
                      {product.sku && (
                        <p className="text-xs text-muted-foreground font-mono">
                          SKU: {product.sku}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {product.is_on_sale && product.sale_price ? (
                      <>
                        <span className="font-bold text-red-600">
                          {formatPrice(product.sale_price, product.currency)}
                        </span>
                        <span className="text-sm text-muted-foreground line-through">
                          {formatPrice(product.price, product.currency)}
                        </span>
                      </>
                    ) : (
                      <span className="font-bold">
                        {formatPrice(product.price, product.currency)}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <Badge variant={avail.variant}>{avail.label}</Badge>
                    {product.track_inventory && (
                      <span className="text-xs text-muted-foreground">
                        {product.quantity} in stock
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        /* ── Table View ────────────────────────────────────────────── */
        <Card>
          <CardContent className="p-0">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Availability</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead className="w-[50px]" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => {
                    const primaryImage =
                      product.primary_image ||
                      product.images?.find((img) => img.is_primary)
                        ?.image_url ||
                      product.images?.[0]?.image_url;
                    const avail =
                      availabilityConfig[product.availability] ||
                      availabilityConfig.in_stock;

                    return (
                      <TableRow key={product.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="relative h-10 w-10 rounded bg-muted flex items-center justify-center overflow-hidden shrink-0">
                              {primaryImage ? (
                                <Image
                                  src={primaryImage}
                                  alt={product.name}
                                  fill
                                  className="object-cover"
                                  sizes="40px"
                                />
                              ) : (
                                <Package className="h-5 w-5 text-muted-foreground/40" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium truncate">
                                {product.name}
                              </p>
                              {product.category && (
                                <p className="text-xs text-muted-foreground">
                                  {product.category}
                                </p>
                              )}
                            </div>
                            {product.is_featured && (
                              <Star className="h-4 w-4 text-yellow-500 shrink-0" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-sm text-muted-foreground">
                          {product.sku || '-'}
                        </TableCell>
                        <TableCell>
                          {product.is_on_sale && product.sale_price ? (
                            <div>
                              <span className="font-medium text-red-600">
                                {formatPrice(
                                  product.sale_price,
                                  product.currency
                                )}
                              </span>
                              <br />
                              <span className="text-xs text-muted-foreground line-through">
                                {formatPrice(product.price, product.currency)}
                              </span>
                            </div>
                          ) : (
                            <span className="font-medium">
                              {formatPrice(product.price, product.currency)}
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={avail.variant}>{avail.label}</Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {product.track_inventory
                            ? `${product.quantity}`
                            : '-'}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                aria-label="Product actions"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => openEditSheet(product)}
                              >
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => openDeleteDialog(product)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

        </TabsContent>

        <TabsContent value="meta-sync" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Meta Commerce Catalogue</CardTitle>
              <p className="text-sm text-muted-foreground">
                Connect your Meta Commerce catalogue to enable native WhatsApp product cards and cart experience.
                Products from your catalogue above can be synced to Meta automatically.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Meta catalogue sync allows your products to appear as native product cards in WhatsApp.
                  Customers can browse, add to cart, and checkout directly in the chat.
                  Go to{' '}
                  <a
                    href="/dashboard/commerce/catalogue"
                    className="font-medium underline"
                  >
                    Catalogue Settings
                  </a>{' '}
                  to connect and manage your Meta catalogue.
                </AlertDescription>
              </Alert>
              <div className="flex gap-3">
                <Button variant="outline" asChild>
                  <a href="/dashboard/commerce/catalogue">
                    Configure Meta Catalogue
                  </a>
                </Button>
                <Button variant="outline" asChild>
                  <a
                    href="https://business.facebook.com/commerce"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Open Meta Commerce Manager
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ── Add/Edit Product Sheet ──────────────────────────────── */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>
              {editingProduct ? 'Edit Product' : 'Add Product'}
            </SheetTitle>
            <SheetDescription>
              {editingProduct
                ? 'Update the product details below.'
                : 'Fill in the details to add a new product.'}
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-6 py-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="product-name">Name *</Label>
                <Input
                  id="product-name"
                  placeholder="Product name"
                  value={formState.name}
                  onChange={(e) => updateForm({ name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="product-description">Description</Label>
                <Textarea
                  id="product-description"
                  placeholder="Product description..."
                  value={formState.description}
                  onChange={(e) =>
                    updateForm({ description: e.target.value })
                  }
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="product-sku">SKU</Label>
                <Input
                  id="product-sku"
                  placeholder="e.g. PROD-001"
                  value={formState.sku}
                  onChange={(e) => updateForm({ sku: e.target.value })}
                />
              </div>
            </div>

            {/* Pricing */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Pricing</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="product-price">Price *</Label>
                  <Input
                    id="product-price"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={formState.price}
                    onChange={(e) => updateForm({ price: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="product-sale-price">Sale Price</Label>
                  <Input
                    id="product-sale-price"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={formState.sale_price}
                    onChange={(e) =>
                      updateForm({ sale_price: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="product-currency">Currency</Label>
                <Select
                  value={formState.currency}
                  onValueChange={(v) => updateForm({ currency: v })}
                >
                  <SelectTrigger id="product-currency">
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

            {/* Organization */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Organization</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="product-category">Category</Label>
                  <Input
                    id="product-category"
                    placeholder="e.g. Electronics"
                    value={formState.category}
                    onChange={(e) =>
                      updateForm({ category: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="product-brand">Brand</Label>
                  <Input
                    id="product-brand"
                    placeholder="e.g. Samsung"
                    value={formState.brand}
                    onChange={(e) => updateForm({ brand: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Availability & Inventory */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Availability & Inventory</h4>
              <div className="space-y-2">
                <Label htmlFor="product-availability">Availability</Label>
                <Select
                  value={formState.availability}
                  onValueChange={(v) => updateForm({ availability: v })}
                >
                  <SelectTrigger id="product-availability">
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

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="track-inventory">Track Inventory</Label>
                  <p className="text-xs text-muted-foreground">
                    Enable to track stock quantities
                  </p>
                </div>
                <Switch
                  id="track-inventory"
                  checked={formState.track_inventory}
                  onCheckedChange={(checked) =>
                    updateForm({ track_inventory: checked })
                  }
                />
              </div>

              {formState.track_inventory && (
                <div className="space-y-2">
                  <Label htmlFor="product-quantity">Quantity</Label>
                  <Input
                    id="product-quantity"
                    type="number"
                    min="0"
                    value={formState.quantity}
                    onChange={(e) =>
                      updateForm({ quantity: e.target.value })
                    }
                  />
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="is-featured">Featured</Label>
                  <p className="text-xs text-muted-foreground">
                    Highlight this product in your catalogue
                  </p>
                </div>
                <Switch
                  id="is-featured"
                  checked={formState.is_featured}
                  onCheckedChange={(checked) =>
                    updateForm({ is_featured: checked })
                  }
                />
              </div>
            </div>

            {/* Images */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Images</h4>

              {/* Existing images (when editing) */}
              {editingProduct &&
                editingProduct.images &&
                editingProduct.images.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">
                      Current images
                    </p>
                    <div className="grid grid-cols-4 gap-2">
                      {editingProduct.images.map((img) => (
                        <div
                          key={img.id}
                          className="relative group rounded-md overflow-hidden border aspect-square"
                        >
                          <Image
                            src={img.image_url}
                            alt={img.alt_text || 'Product image'}
                            fill
                            className="object-cover"
                            sizes="80px"
                          />
                          {img.is_primary && (
                            <Badge
                              variant="secondary"
                              className="absolute bottom-1 left-1 text-[10px] px-1 py-0"
                            >
                              Primary
                            </Badge>
                          )}
                          <button
                            type="button"
                            onClick={() =>
                              handleDeleteImage(editingProduct, img.id)
                            }
                            className="absolute top-1 right-1 h-5 w-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            aria-label="Delete image"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* Pending images preview */}
              {pendingImages.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">
                    New images to upload
                  </p>
                  <div className="grid grid-cols-4 gap-2">
                    {pendingImages.map((file, idx) => (
                      <div
                        key={idx}
                        className="relative group rounded-md overflow-hidden border aspect-square bg-muted"
                      >
                        <Image
                          src={URL.createObjectURL(file)}
                          alt={file.name}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                        <button
                          type="button"
                          onClick={() => removePendingImage(idx)}
                          className="absolute top-1 right-1 h-5 w-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          aria-label="Remove image"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Upload area */}
              <div
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 hover:bg-muted/50 transition-colors"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => handleFileSelect(e.target.files)}
                />
                <Upload className="h-8 w-8 mx-auto text-muted-foreground/60 mb-2" />
                <p className="text-sm text-muted-foreground">
                  Click or drag images here to upload
                </p>
                <p className="text-xs text-muted-foreground/60 mt-1">
                  PNG, JPG, WEBP up to 5MB
                </p>
              </div>
            </div>

            {/* Save Button */}
            <Button
              onClick={handleSave}
              disabled={saving || uploadingImages}
              className="w-full"
              size="lg"
            >
              {saving || uploadingImages ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {uploadingImages ? 'Uploading images...' : 'Saving...'}
                </>
              ) : editingProduct ? (
                'Update Product'
              ) : (
                'Create Product'
              )}
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* ── Delete Confirmation Dialog ─────────────────────────── */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Product</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{productToDelete?.name}
              &quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={saving}
            >
              {saving ? 'Deleting...' : 'Delete Product'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
