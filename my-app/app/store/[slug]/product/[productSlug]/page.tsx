'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ShoppingBag,
  Package,
  MessageCircle,
  Minus,
  Plus,
  ChevronLeft,
  ChevronRight,
  Share2,
  Check,
} from 'lucide-react';
import type { StorefrontData } from '@/services/storefront';
import type { ProductData } from '@/services/product';
import { API_BASE } from '@/lib/commerce-api';

function formatPrice(amount: number, currency: string): string {
  const symbols: Record<string, string> = {
    KES: 'KES ', NGN: '\u20A6', GHS: 'GH\u20B5', UGX: 'UGX ',
    TZS: 'TZS ', USD: '$', EUR: '\u20AC', GBP: '\u00A3',
  };
  const symbol = symbols[currency] || `${currency} `;
  return `${symbol}${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

interface PublicProductResponse {
  store: StorefrontData;
  product: ProductData;
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const productSlug = params.productSlug as string;

  const [data, setData] = useState<PublicProductResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!slug || !productSlug) return;
    setLoading(true);
    fetch(`${API_BASE}/commerce/store/${slug}/product/${productSlug}/`, {
      headers: { Accept: 'application/json' },
    })
      .then((r) => {
        if (!r.ok) throw new Error('Product not found');
        return r.json();
      })
      .then((d: PublicProductResponse) => setData(d))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [slug, productSlug]);

  const store = data?.store;
  const product = data?.product;
  const primaryColor = store?.primary_color || '#007fff';

  const images = product?.images?.sort((a, b) => {
    if (a.is_primary) return -1;
    if (b.is_primary) return 1;
    return a.sort_order - b.sort_order;
  }) || [];

  const isOnSale = product && product.sale_price != null && product.sale_price < product.price;
  const isOutOfStock = product?.availability === 'out_of_stock';
  const displayPrice = product ? (isOnSale ? product.sale_price! : product.price) : 0;

  const handleBuyOnWhatsApp = () => {
    if (!product || !store?.whatsapp_number) return;
    const msg = `Hi! I'd like to order:\n\n*${product.name}*\nQty: ${quantity}\nPrice: ${formatPrice(displayPrice * quantity, product.currency)}`;
    window.open(
      `https://wa.me/${store.whatsapp_number.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(msg)}`,
      '_blank'
    );
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: product?.name, url });
    } else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <div className="h-8 w-32 bg-gray-200 rounded animate-pulse mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            <div className="aspect-square bg-gray-200 rounded-2xl animate-pulse" />
            <div className="space-y-4">
              <div className="h-8 w-3/4 bg-gray-200 rounded animate-pulse" />
              <div className="h-6 w-1/3 bg-gray-200 rounded animate-pulse" />
              <div className="h-20 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data || !product || !store) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 mx-auto rounded-full bg-gray-100 flex items-center justify-center">
            <Package className="w-10 h-10 text-gray-400" />
          </div>
          <h1 className="text-2xl font-semibold text-gray-900">Product not found</h1>
          <p className="text-gray-500">This product may not exist or is currently unavailable.</p>
          <button
            onClick={() => router.push(`/store/${slug}`)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: primaryColor }}
          >
            <ArrowLeft className="w-4 h-4" /> Back to Store
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <button
            onClick={() => router.push(`/store/${slug}`)}
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to {store.name}</span>
            <span className="sm:hidden">Back</span>
          </button>

          <div className="flex items-center gap-3">
            {store.logo_url ? (
              <Image src={store.logo_url} alt={store.name} className="w-8 h-8 rounded-lg object-cover" width={32} height={32} unoptimized />
            ) : (
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-xs"
                style={{ backgroundColor: primaryColor }}
              >
                {store.name.charAt(0)}
              </div>
            )}
            <span className="font-semibold text-gray-900 text-sm hidden sm:block">{store.name}</span>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {/* ─── Image Gallery ─────────────────────────────────── */}
          <div className="space-y-4">
            <div className="aspect-square relative bg-white rounded-2xl overflow-hidden shadow-sm">
              {images.length > 0 ? (
                <>
                  <Image
                    src={images[selectedImageIndex]?.image_url}
                    alt={images[selectedImageIndex]?.alt_text || product.name}
                    className="w-full h-full object-cover"
                    width={500}
                    height={500}
                    unoptimized
                  />
                  {images.length > 1 && (
                    <>
                      <button
                        onClick={() => setSelectedImageIndex((prev) => (prev - 1 + images.length) % images.length)}
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm shadow-md flex items-center justify-center hover:bg-white transition-colors"
                      >
                        <ChevronLeft className="w-5 h-5 text-gray-700" />
                      </button>
                      <button
                        onClick={() => setSelectedImageIndex((prev) => (prev + 1) % images.length)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm shadow-md flex items-center justify-center hover:bg-white transition-colors"
                      >
                        <ChevronRight className="w-5 h-5 text-gray-700" />
                      </button>
                    </>
                  )}
                  {isOnSale && (
                    <span className="absolute top-4 left-4 bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full">
                      SALE
                    </span>
                  )}
                </>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <Package className="w-20 h-20 text-gray-300" />
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-1">
                {images.map((img, idx) => (
                  <button
                    key={img.id}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                      idx === selectedImageIndex ? 'shadow-md' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                    style={idx === selectedImageIndex ? { borderColor: primaryColor } : undefined}
                  >
                    <Image src={img.image_url} alt={img.alt_text || ''} className="w-full h-full object-cover" width={64} height={64} unoptimized />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ─── Product Info ──────────────────────────────────── */}
          <div className="space-y-6">
            <div>
              {product.category && (
                <p className="text-sm text-gray-400 mb-1">{product.category}</p>
              )}
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{product.name}</h1>
            </div>

            {/* Price */}
            <div>
              {isOnSale ? (
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-bold" style={{ color: primaryColor }}>
                    {formatPrice(product.sale_price!, product.currency)}
                  </span>
                  <span className="text-lg text-gray-400 line-through">
                    {formatPrice(product.price, product.currency)}
                  </span>
                  <span className="text-sm font-medium text-red-500 bg-red-50 px-2 py-0.5 rounded-full">
                    {Math.round(((product.price - product.sale_price!) / product.price) * 100)}% off
                  </span>
                </div>
              ) : (
                <span className="text-3xl font-bold text-gray-900">
                  {formatPrice(product.price, product.currency)}
                </span>
              )}
            </div>

            {/* Availability */}
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 text-sm font-medium ${
                  isOutOfStock ? 'text-red-600' : 'text-green-600'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${isOutOfStock ? 'bg-red-500' : 'bg-green-500'}`} />
                {isOutOfStock ? 'Out of Stock' : 'In Stock'}
              </span>
              {product.track_inventory && !isOutOfStock && product.quantity > 0 && product.quantity <= 10 && (
                <span className="text-sm text-amber-600">Only {product.quantity} left</span>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <div className="border-t border-gray-100 pt-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-2">Description</h3>
                <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">
                  {product.description}
                </p>
              </div>
            )}

            {/* Quantity + Buy */}
            {!isOutOfStock && (
              <div className="border-t border-gray-100 pt-6 space-y-4">
                {/* Quantity selector */}
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-gray-700">Quantity</span>
                  <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 transition-colors"
                    >
                      <Minus className="w-4 h-4 text-gray-600" />
                    </button>
                    <span className="w-12 h-10 flex items-center justify-center text-sm font-medium border-x border-gray-200">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 transition-colors"
                    >
                      <Plus className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                </div>

                {/* Buy buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  {store.whatsapp_number && (
                    <button
                      onClick={handleBuyOnWhatsApp}
                      className="flex-1 inline-flex items-center justify-center gap-2 h-12 rounded-xl text-white text-sm font-medium transition-opacity hover:opacity-90"
                      style={{ backgroundColor: '#25D366' }}
                    >
                      <MessageCircle className="w-5 h-5" />
                      Buy on WhatsApp
                    </button>
                  )}
                  <button
                    onClick={() => {
                      window.location.href = `/checkout?store=${slug}&product=${productSlug}&qty=${quantity}`;
                    }}
                    className="flex-1 inline-flex items-center justify-center gap-2 h-12 rounded-xl text-white text-sm font-medium transition-opacity hover:opacity-90"
                    style={{ backgroundColor: primaryColor }}
                  >
                    <ShoppingBag className="w-5 h-5" />
                    Add to Cart
                  </button>
                </div>
              </div>
            )}

            {/* Share */}
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-green-500" /> : <Share2 className="w-4 h-4" />}
              {copied ? 'Link copied!' : 'Share this product'}
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto px-4 sm:px-6 mt-16 mb-8 pt-8 border-t border-gray-200">
        <p className="text-center text-sm text-gray-400">
          Powered by{' '}
          <a
            href="https://intelliconcierge.com"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-gray-500 hover:text-gray-700 transition-colors"
          >
            Intelli
          </a>
        </p>
      </footer>
    </div>
  );
}
