import type { Metadata } from "next"
import AssistantsUnified from "@/components/assistants-unified"

export const metadata: Metadata = {
  title: "Assistants | Dashboard",
  description: "Manage your AI assistants and knowledge base files",
}

export default function AssistantsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <AssistantsUnified />
    </div>
  )
}
