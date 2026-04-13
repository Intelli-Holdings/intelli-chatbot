"use client"

import Link from "next/link"
import { Bot, List, ShieldAlert, Webhook } from "lucide-react"

const settingsCards = [
  {
    title: "Automation",
    description: "Configure chatbot and AI assistant modes",
    href: "/dashboard/settings/automation",
    icon: Bot,
  },
  {
    title: "Custom Fields",
    description: "Manage custom fields for contacts & campaigns",
    href: "/dashboard/settings/custom-fields",
    icon: List,
  },
  {
    title: "Escalation Events",
    description: "Manage escalation rules for your business",
    href: "/dashboard/settings/escalation-events",
    icon: ShieldAlert,
  },
  {
    title: "Webhooks",
    description: "Configure outbound & inbound webhooks",
    href: "/dashboard/settings/webhooks",
    icon: Webhook,
  },
]

export default function SettingsPage() {
  return (
    <>
      {/* Page header */}
      <div className="mb-golden-xl ">
        <h2 className="text-golden-heading font-semibold tracking-tight">
          General
        </h2>
        <p className="mt-golden-3xs text-golden-body-sm text-muted-foreground">
          Configure your application settings and preferences
        </p>
      </div>

      {/* Application settings group — macOS-style inset group */}
      <section className="mb-golden-xl">
        <h3 className="mb-golden-sm px-golden-3xs text-golden-label font-medium uppercase tracking-wide text-muted-foreground">
          Application
        </h3>
        <div className="rounded-squircle-md border border-border/60 bg-card">
          <div className="px-golden-lg py-golden-md">
            <p className="text-golden-body-sm font-medium">Application Settings</p>
            <p className="mt-golden-3xs text-golden-label text-muted-foreground">
              Manage your general application settings here.
            </p>
          </div>
        </div>
      </section>

      {/* Quick access grid */}
      <section>
        <h3 className="mb-golden-sm px-golden-3xs text-golden-label font-medium uppercase tracking-wide text-muted-foreground">
          Configure
        </h3>
        <div className="grid gap-golden-sm sm:grid-cols-2">
          {settingsCards.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className="group flex items-start gap-golden-md rounded-squircle-md border border-border/60 bg-card p-golden-lg transition-all hover:border-primary/40 hover:shadow-sm"
            >
              <div className="flex size-9 shrink-0 items-center justify-center rounded-squircle-sm bg-primary/8">
                <card.icon className="size-[18px] text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-golden-body-sm font-medium group-hover:text-primary transition-colors">
                  {card.title}
                </p>
                <p className="mt-golden-3xs text-golden-label text-muted-foreground">
                  {card.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  )
}
