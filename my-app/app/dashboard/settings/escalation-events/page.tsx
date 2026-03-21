"use client"

import EscalationEvents from "@/components/EscalationEvents"

export default function EscalationEventsPage() {
  return (
    <>
      <div className="mb-golden-xl">
        <h2 className="text-golden-heading font-semibold tracking-tight">
          Escalation Events
        </h2>
        <p className="mt-golden-3xs text-golden-body-sm text-muted-foreground">
          Manage escalation event rules for your business
        </p>
      </div>
      <EscalationEvents />
    </>
  )
}
