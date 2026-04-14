"use client"

import { Instagram } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { InstagramAppService } from "@/lib/types/instagram"

interface ConnectedAccountBannerProps {
  appServices: InstagramAppService[]
  selectedAccountId: string
  onAccountChange: (accountId: string) => void
  loading?: boolean
}

export default function ConnectedAccountBanner({
  appServices,
  selectedAccountId,
  onAccountChange,
  loading,
}: ConnectedAccountBannerProps) {
  return (
    <section>
      <h3 className="mb-golden-sm px-golden-3xs text-golden-label font-medium uppercase tracking-wide text-muted-foreground">
        Connected Instagram Account:
      </h3>
      <div className="rounded-squircle-md border border-border/60 bg-card px-golden-lg py-golden-md">
        {loading ? (
          <Skeleton className="h-[34px] w-full" />
        ) : appServices.length === 0 ? (
          <p className="text-golden-body-sm text-muted-foreground">
            No accounts connected. Connect an Instagram account first.
          </p>
        ) : (
          <Select value={selectedAccountId} onValueChange={onAccountChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select a channel" />
            </SelectTrigger>
            <SelectContent>
              {appServices.map((service) => (
                <SelectItem
                  key={service.id}
                  value={service.instagram_business_account_id || ""}
                >
                  <span className="flex items-center gap-golden-xs">
                    <Instagram className="size-3.5 text-pink-500" />
                    {service.instagram_page_name ||
                      service.instagram_business_account_id ||
                      `Instagram ${service.id}`}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
    </section>
  )
}
