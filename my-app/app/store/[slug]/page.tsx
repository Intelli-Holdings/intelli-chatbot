'use client';

import { useEffect, useState, useMemo } from 'react';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import {
  ShoppingBag,
  Search,
  ShoppingCart,
  Package,
  Globe,
  MessageCircle,
  ChevronDown,
  X,
} from 'lucide-react';
import type { StorefrontData } from '@/services/storefront';
import type { ProductData } from '@/services/product';
import { API_BASE } from '@/lib/commerce-api';

// ─── Social Icons ────────────────────────────────────────────
function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  );
}

function XTwitterIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
    </svg>
  );
}

// ─── Types ───────────────────────────────────────────────────
interface PublicStoreResponse {
  store: StorefrontData;
  products: ProductData[];
  total: number;
  whatsapp_number: string;
}

type SortOption = 'default' | 'price_asc' | 'price_desc' | 'name_asc' | 'newest';

// ─── Format currency (standalone for public page) ────────────
function formatPrice(amount: number, currency: string): string {
  const symbols: Record<string, string> = {
    KES: 'KES ', NGN: '\u20A6', GHS: 'GH\u20B5', UGX: 'UGX ',
    TZS: 'TZS ', USD: '$', EUR: '\u20AC', GBP: '\u00A3',
  };
  const symbol = symbols[currency] || `${currency} `;
  return `${symbol}${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// ─── Main Page ───────────────────────────────────────────────
export default function StorefrontPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [data, setData] = useState<PublicStoreResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState<SortOption>('default');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    fetch(`${API_BASE}/commerce/store/${slug}/`, {
      headers: { Accept: 'application/json' },
    })
      .then((r) => {
        if (!r.ok) throw new Error('Store not found');
        return r.json();
      })
      .then((d: PublicStoreResponse) => setData(d))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [slug]);

  // Extract unique categories
  const categories = useMemo(() => {
    if (!data) return ['All'];
    const cats = new Set(data.products.map((p) => p.category).filter(Boolean));
    return ['All', ...Array.from(cats)];
  }, [data]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    if (!data) return [];
    let products = [...data.products];

    // Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      products = products.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.category?.toLowerCase().includes(q)
      );
    }

    // Category filter
    if (selectedCategory !== 'All') {
      products = products.filter((p) => p.category === selectedCategory);
    }

    // Sort
    switch (sortBy) {
      case 'price_asc':
        products.sort((a, b) => (a.sale_price ?? a.price) - (b.sale_price ?? b.price));
        break;
      case 'price_desc':
        products.sort((a, b) => (b.sale_price ?? b.price) - (a.sale_price ?? a.price));
        break;
      case 'name_asc':
        products.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'newest':
        products.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
    }

    return products;
  }, [data, searchQuery, selectedCategory, sortBy]);

  // Social links
  const socialLinks = useMemo(() => {
    const s = data?.store;
    if (!s) return [];
    const links: { url: string; icon: React.ComponentType<{ className?: string }>; label: string }[] = [];
    if (s.facebook_url) links.push({ url: s.facebook_url, icon: FacebookIcon, label: 'Facebook' });
    if (s.instagram_url) links.push({ url: s.instagram_url, icon: InstagramIcon, label: 'Instagram' });
    if (s.twitter_url) links.push({ url: s.twitter_url, icon: XTwitterIcon, label: 'X' });
    if (s.tiktok_url) links.push({ url: s.tiktok_url, icon: TikTokIcon, label: 'TikTok' });
    if (s.website_url) links.push({ url: s.website_url, icon: Globe, label: 'Website' });
    return links;
  }, [data]);

  // ─── Loading State ─────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Banner skeleton */}
        <div className="h-56 sm:h-72 bg-gray-200 animate-pulse" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 -mt-16">
          <div className="flex items-end gap-4 mb-6">
            <div className="w-24 h-24 rounded-2xl bg-gray-300 animate-pulse border-4 border-white shadow-lg" />
            <div className="space-y-2 pb-2">
              <div className="h-6 w-48 bg-gray-300 rounded animate-pulse" />
              <div className="h-4 w-72 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mt-8">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm">
                <div className="aspect-square bg-gray-200 animate-pulse" />
                <div className="p-4 space-y-2">
                  <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse" />
                  <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ─── Error State ───────────────────────────────────────────
  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 mx-auto rounded-full bg-gray-100 flex items-center justify-center">
            <ShoppingBag className="w-10 h-10 text-gray-400" />
          </div>
          <h1 className="text-2xl font-semibold text-gray-900">Store not found</h1>
          <p className="text-gray-500">This store may not exist or is currently unavailable.</p>
        </div>
      </div>
    );
  }

  const store = data.store;
  const primaryColor = store.primary_color || '#007fff';

  const sortLabels: Record<SortOption, string> = {
    default: 'All',
    price_asc: 'Price: Low to High',
    price_desc: 'Price: High to Low',
    name_asc: 'Name: A-Z',
    newest: 'Newest',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ─── Top Navigation Bar ───────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Logo + Name */}
          <div className="flex items-center gap-3 min-w-0">
            {store.logo_url ? (
              <Image
                src={store.logo_url}
                alt={store.name}
                className="w-9 h-9 rounded-lg object-cover flex-shrink-0"
                width={36}
                height={36}
                unoptimized
              />
            ) : (
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 text-white font-bold text-sm"
                style={{ backgroundColor: primaryColor }}
              >
                {store.name.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="font-semibold text-gray-900 truncate hidden sm:block">
              {store.name}
            </span>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-10 pr-4 rounded-full bg-gray-100 border-0 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 transition-shadow"
                style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Cart & WhatsApp */}
          <div className="flex items-center gap-2">
            {data.whatsapp_number && (
              <a
                href={`https://wa.me/${data.whatsapp_number.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 h-10 rounded-full text-white text-sm font-medium transition-opacity hover:opacity-90"
                style={{ backgroundColor: '#25D366' }}
              >
                <MessageCircle className="w-4 h-4" />
                <span className="hidden sm:inline">Chat</span>
              </a>
            )}
            <button
              className="relative inline-flex items-center gap-2 px-4 h-10 rounded-full text-white text-sm font-medium transition-opacity hover:opacity-90"
              style={{ backgroundColor: primaryColor }}
              onClick={() => {
                // Cart functionality - navigate to checkout
                if (slug) {
                  window.location.href = `/checkout?store=${slug}`;
                }
              }}
            >
              <ShoppingCart className="w-4 h-4" />
              <span className="hidden sm:inline">Cart</span>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* ─── Hero Banner ──────────────────────────────────────── */}
      <div className="relative">
        {store.banner_url ? (
          <div className="h-56 sm:h-72 lg:h-80 overflow-hidden">
            <Image
              src={store.banner_url}
              alt={`${store.name} banner`}
              className="w-full h-full object-cover"
              width={1200}
              height={400}
              unoptimized
            />
            {/* Gradient overlay for readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent" />
          </div>
        ) : (
          <div
            className="h-56 sm:h-72 lg:h-80"
            style={{
              background: `linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor}dd 50%, ${primaryColor}99 100%)`,
            }}
          >
            {/* Decorative pattern */}
            <div className="absolute inset-0 opacity-10">
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: `radial-gradient(circle at 25% 50%, white 1px, transparent 1px), radial-gradient(circle at 75% 50%, white 1px, transparent 1px)`,
                  backgroundSize: '60px 60px',
                }}
              />
            </div>
            {/* Large store name watermark */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-white/20 text-[8rem] sm:text-[12rem] font-black tracking-tighter leading-none select-none">
                {store.name.charAt(0)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ─── Store Info Section ────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="-mt-14 sm:-mt-16 relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4">
            {/* Logo */}
            <div className="flex-shrink-0">
              {store.logo_url ? (
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-4 border-white shadow-lg bg-white">
                  <Image
                    src={store.logo_url}
                    alt={store.name}
                    className="w-full h-full object-cover"
                    width={112}
                    height={112}
                    unoptimized
                  />
                </div>
              ) : (
                <div
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl border-4 border-white shadow-lg flex items-center justify-center text-white text-4xl font-black"
                  style={{ backgroundColor: primaryColor }}
                >
                  {store.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            {/* Store details + Social links */}
            <div className="flex-1 min-w-0 pb-1">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div className="min-w-0">
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 truncate">
                    {store.name}
                  </h1>
                  {store.tagline && (
                    <p className="text-sm text-gray-500 mt-0.5">{store.tagline}</p>
                  )}
                </div>

                {/* Social Links */}
                {socialLinks.length > 0 && (
                  <div className="flex items-center gap-3">
                    {socialLinks.map((link) => (
                      <a
                        key={link.label}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 hover:text-gray-900 transition-colors"
                        title={link.label}
                      >
                        <link.icon className="w-4 h-4" />
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          {store.description && (
            <p className="mt-4 text-gray-600 text-sm sm:text-base max-w-2xl leading-relaxed">
              {store.description}
            </p>
          )}
        </div>

        {/* ─── Product Count + Sort ─────────────────────────────── */}
        <div className="mt-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-white"
              style={{ backgroundColor: primaryColor }}
            >
              <ShoppingBag className="w-4 h-4" />
              Products
              <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">
                {filteredProducts.length}
              </span>
            </div>
          </div>

          {/* Sort Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowSortMenu(!showSortMenu)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 bg-white text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Sort by: {sortLabels[sortBy]}
              <ChevronDown className={`w-4 h-4 transition-transform ${showSortMenu ? 'rotate-180' : ''}`} />
            </button>
            {showSortMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowSortMenu(false)} />
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-20">
                  {(Object.entries(sortLabels) as [SortOption, string][]).map(([key, label]) => (
                    <button
                      key={key}
                      onClick={() => {
                        setSortBy(key);
                        setShowSortMenu(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                        sortBy === key
                          ? 'font-medium'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                      style={sortBy === key ? { color: primaryColor } : undefined}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* ─── Divider ────────────────────────────────────────── */}
        <div className="border-b border-gray-200 mt-4" />

        {/* ─── Category Pills ─────────────────────────────────── */}
        {categories.length > 1 && (
          <div className="mt-6 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                  selectedCategory === cat
                    ? 'text-white border-transparent shadow-md'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:shadow-sm'
                }`}
                style={
                  selectedCategory === cat
                    ? { backgroundColor: primaryColor }
                    : undefined
                }
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* ─── Product Grid ───────────────────────────────────── */}
        {filteredProducts.length === 0 ? (
          <div className="py-20 text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <Package className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No products found</h3>
            <p className="text-gray-500 text-sm">
              {searchQuery
                ? 'Try adjusting your search or filter.'
                : 'This store has no products yet.'}
            </p>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {filteredProducts.map((product) => (
              <StorefrontProductCard
                key={product.id}
                product={product}
                storeSlug={slug}
                primaryColor={primaryColor}
                whatsappNumber={data.whatsapp_number}
              />
            ))}
          </div>
        )}

        {/* ─── Footer ─────────────────────────────────────────── */}
        <footer className="mt-16 mb-8 pt-8 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-400">
            <p>
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
            {socialLinks.length > 0 && (
              <div className="flex items-center gap-3">
                {socialLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                    title={link.label}
                  >
                    <link.icon className="w-4 h-4" />
                  </a>
                ))}
              </div>
            )}
          </div>
        </footer>
      </div>
    </div>
  );
}

// ─── Product Card Component ──────────────────────────────────
function StorefrontProductCard({
  product,
  storeSlug,
  primaryColor,
  whatsappNumber,
}: {
  product: ProductData;
  storeSlug: string;
  primaryColor: string;
  whatsappNumber: string;
}) {
  const isOnSale = product.sale_price != null && product.sale_price < product.price;
  const isOutOfStock = product.availability === 'out_of_stock';
  const displayPrice = isOnSale ? product.sale_price! : product.price;
  const primaryImage = product.images?.find((img) => img.is_primary)?.image_url || product.images?.[0]?.image_url;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;

    // Build WhatsApp message for "Buy on WhatsApp" flow
    if (whatsappNumber) {
      const msg = `Hi! I'd like to order: ${product.name} (${formatPrice(displayPrice, product.currency)})`;
      window.open(
        `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(msg)}`,
        '_blank'
      );
    }
  };

  return (
    <a
      href={`/store/${storeSlug}/product/${product.slug}`}
      className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col"
    >
      {/* Image */}
      <div className="aspect-square relative bg-gray-100 overflow-hidden">
        {primaryImage ? (
          <Image
            src={primaryImage}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            width={500}
            height={500}
            unoptimized
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <Package className="w-12 h-12 text-gray-300" />
          </div>
        )}

        {/* Sale badge */}
        {isOnSale && (
          <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
            SALE
          </span>
        )}

        {/* Out of stock overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-white/90 text-gray-900 text-sm font-medium px-4 py-1.5 rounded-full">
              Out of Stock
            </span>
          </div>
        )}

        {/* Quick action overlay */}
        {!isOutOfStock && (
          <div className="absolute inset-x-0 bottom-0 p-3 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
            <button
              onClick={handleAddToCart}
              className="w-full py-2.5 rounded-xl text-white text-sm font-medium transition-opacity hover:opacity-90 backdrop-blur-sm"
              style={{ backgroundColor: primaryColor }}
            >
              {whatsappNumber ? 'Buy on WhatsApp' : 'Add to Cart'}
            </button>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="font-medium text-gray-900 text-sm line-clamp-2 mb-1 group-hover:text-gray-700 transition-colors">
          {product.name}
        </h3>
        {product.category && (
          <p className="text-xs text-gray-400 mb-2">{product.category}</p>
        )}
        <div className="mt-auto">
          {isOnSale ? (
            <div className="flex items-baseline gap-2">
              <span className="font-bold text-base" style={{ color: primaryColor }}>
                {formatPrice(product.sale_price!, product.currency)}
              </span>
              <span className="text-xs text-gray-400 line-through">
                {formatPrice(product.price, product.currency)}
              </span>
            </div>
          ) : (
            <span className="font-bold text-base text-gray-900">
              {formatPrice(product.price, product.currency)}
            </span>
          )}
        </div>
      </div>
    </a>
  );
}
