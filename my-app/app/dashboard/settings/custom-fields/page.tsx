"use client"

import CustomFieldsManager from "@/components/custom-fields-manager"

export default function CustomFieldsPage() {
  return (
    <>
      <div className="mb-golden-xl">
        <h2 className="text-golden-heading font-semibold tracking-tight">
          Custom Fields
        </h2>
        <p className="mt-golden-3xs text-golden-body-sm text-muted-foreground">
          Manage custom fields for your contacts
        </p>
      </div>
      <CustomFieldsManager />
    </>
  )
}
