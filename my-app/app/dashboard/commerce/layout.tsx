'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Package, ShoppingBag, Wallet, BarChart3, ChevronLeft } from 'lucide-react';

const commerceNavigation = [
  { title: 'Orders', href: '/dashboard/commerce/orders', icon: Package },
  { title: 'Products', href: '/dashboard/commerce/products', icon: ShoppingBag },
  { title: 'Payments', href: '/dashboard/commerce/payments', icon: Wallet },
  { title: 'Analytics', href: '/dashboard/commerce/analytics', icon: BarChart3 },
];

export default function CommerceLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-[calc(100vh-55px)] border border-border/60 rounded-md">
      {/* macOS-style sidebar */}
      <aside className="hidden md:flex w-[220px] shrink-0 flex-col border-r border-border/60 bg-muted/30">
        <div className="sticky top-0 flex h-full flex-col">
          {/* Header */}
          <div className="px-golden-lg pt-golden-lg pb-golden-md">
            <Link
              href="/dashboard"
              className="group inline-flex items-center gap-golden-3xs text-golden-body-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronLeft className="size-3.5 transition-transform group-hover:-translate-x-0.5" />
              <span>Dashboard</span>
            </Link>
            <h1 className="mt-golden-sm text-golden-heading font-semibold tracking-tight">
              Commerce
            </h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-golden-sm pb-golden-lg">
            <div className="flex flex-col gap-golden-3xs">
              {commerceNavigation.map((item) => {
                const isActive =
                  pathname === item.href || pathname.startsWith(item.href + '/');

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-golden-sm rounded-squircle-sm px-golden-sm py-golden-xs text-golden-body-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                    )}
                  >
                    <item.icon className="size-4 shrink-0" />
                    {item.title}
                  </Link>
                );
              })}
            </div>
          </nav>
        </div>
      </aside>

      {/* Mobile navigation */}
      <div className="md:hidden fixed top-[55px] left-0 right-0 z-10 border-b border-border/60 bg-background">
        <nav className="flex overflow-x-auto px-4 py-2 gap-1">
          {commerceNavigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-1.5 whitespace-nowrap rounded-squircle-sm px-3 py-1.5 text-sm font-medium transition-colors shrink-0',
                  pathname === item.href || pathname.startsWith(item.href + '/')
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {item.title}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Main content area */}
      <div className="flex-1 min-w-0 overflow-y-auto">
        <div className="mx-auto px-golden-lg py-golden-xl">
          {children}
        </div>
      </div>
    </div>
  );
}
