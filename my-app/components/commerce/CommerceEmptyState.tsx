"use client";

import Link from "next/link";
import {
  Package,
  ShoppingBag,
  Wallet,
  DollarSign,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CommerceEmptyStateProps {
  type: "orders" | "catalogue" | "payments" | "transactions";
  className?: string;
}

const config = {
  orders: {
    icon: Package,
    iconBg: "bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400",
    title: "No orders yet",
    description:
      "When customers place orders through WhatsApp, they'll appear here. Make sure your catalogue is set up and visible.",
    action: {
      label: "Set up Catalogue",
      href: "/dashboard/commerce/catalogue",
      external: false,
    },
  },
  catalogue: {
    icon: ShoppingBag,
    iconBg:
      "bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400",
    title: "Connect your catalogue",
    description:
      "Connect your Meta Commerce catalogue to start selling on WhatsApp. You'll need a WhatsApp Business Account with a catalogue set up in Meta Commerce Manager.",
    action: {
      label: "Open Meta Commerce Manager",
      href: "https://business.facebook.com/commerce",
      external: true,
    },
    secondaryText: "Once connected, your products will appear here",
  },
  payments: {
    icon: Wallet,
    iconBg:
      "bg-green-50 text-green-600 dark:bg-green-950 dark:text-green-400",
    title: "Set up a payment provider",
    description:
      "Connect M-PESA, Flutterwave, Paystack, or MTN MoMo to accept payments from your customers.",
    providers: ["M-PESA", "Flutterwave", "Paystack", "MTN MoMo"],
  },
  transactions: {
    icon: DollarSign,
    iconBg:
      "bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400",
    title: "No transactions yet",
    description:
      "Transactions will appear here once customers start making payments.",
  },
} as const;

export function CommerceEmptyState({ type, className }: CommerceEmptyStateProps) {
  const {
    icon: Icon,
    iconBg,
    title,
    description,
  } = config[type];

  const entry = config[type];
  const action = "action" in entry ? (entry as { action: { label: string; href: string; external: boolean } }).action : undefined;
  const secondaryText =
    "secondaryText" in entry ? (entry as { secondaryText: string }).secondaryText : undefined;
  const providers =
    "providers" in entry ? (entry as { providers: readonly string[] }).providers : undefined;

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-16 px-6 text-center",
        className
      )}
    >
      <div
        className={cn(
          "flex h-14 w-14 items-center justify-center rounded-full mb-5",
          iconBg
        )}
      >
        <Icon className="h-7 w-7" />
      </div>

      <h3 className="text-lg font-semibold tracking-tight mb-2">{title}</h3>

      <p className="text-sm text-muted-foreground max-w-sm mb-6">
        {description}
      </p>

      {providers && (
        <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
          {providers.map((provider) => (
            <span
              key={provider}
              className="inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium text-muted-foreground"
            >
              {provider}
            </span>
          ))}
        </div>
      )}

      {action &&
        (action.external ? (
          <Button asChild variant="outline">
            <a
              href={action.href}
              target="_blank"
              rel="noopener noreferrer"
            >
              {action.label}
              <ExternalLink className="ml-2 h-4 w-4" />
            </a>
          </Button>
        ) : (
          <Button asChild>
            <Link href={action.href}>{action.label}</Link>
          </Button>
        ))}

      {secondaryText && (
        <p className="text-xs text-muted-foreground/60 italic mt-4">
          {secondaryText}
        </p>
      )}
    </div>
  );
}
