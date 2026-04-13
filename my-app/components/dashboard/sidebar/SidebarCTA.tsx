'use client';

import Link from 'next/link';
import { CalendarClock, ArrowRight } from 'lucide-react';

export function SidebarCTA() {
  return (
    <Link
      href="https://cal.com/intelli-demo/30min"
      target="_blank"
      rel="noopener noreferrer"
      className="flex w-full items-center gap-2 rounded-squircle-md border border-border bg-muted/50 px-3 py-2 text-sm font-medium transition-colors hover:bg-muted"
    >
      <CalendarClock className="size-4 shrink-0 text-muted-foreground" />
      <span className="truncate">Talk to our Team</span>
      <ArrowRight className="ml-auto size-3.5 shrink-0 text-muted-foreground" />
    </Link>
  );
}
