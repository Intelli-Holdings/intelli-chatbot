'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Package, ShoppingBag, Wallet, BarChart3 } from 'lucide-react';

const commerceNavigation = [
  { title: 'Orders', href: '/dashboard/commerce/orders', icon: Package },
  { title: 'Products', href: '/dashboard/commerce/products', icon: ShoppingBag },
  { title: 'Payments', href: '/dashboard/commerce/payments', icon: Wallet },
  { title: 'Analytics', href: '/dashboard/commerce/analytics', icon: BarChart3 },
];

export default function CommerceLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-background">
      {/* Mobile navigation */}
      <div className="lg:hidden border-b border-border bg-card">
        <div className="flex items-center justify-between px-4 py-3">
          <h2 className="font-semibold">Commerce</h2>
          <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground">
            ← Dashboard
          </Link>
        </div>
        <nav className="flex overflow-x-auto px-4 pb-2 gap-1">
          {commerceNavigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-1.5 whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-colors shrink-0',
                  pathname === item.href || pathname.startsWith(item.href + '/')
                    ? 'bg-primary text-primary-foreground'
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
      <aside className="hidden lg:block w-64 border-r border-border bg-card">
        <div className="sticky top-0 flex h-screen flex-col">
          <div className="border-b border-border p-6">
            <h1 className="text-2xl font-bold">Commerce</h1>
            <Link href="/dashboard" className="mt-2 flex items-center text-sm text-muted-foreground hover:text-foreground">
              <span>← Go to Dashboard</span>
            </Link>
          </div>
          <nav className="flex-1 space-y-1 overflow-y-auto p-4">
            {commerceNavigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                    pathname === item.href || pathname.startsWith(item.href + '/')
                      ? 'bg-primary text-primary-foreground'
                      : 'text-foreground hover:bg-accent hover:text-accent-foreground'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.title}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
