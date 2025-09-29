import type { Metadata } from "next"
import Assistants from "@/components/assistants-new"

export const metadata: Metadata = {
  title: "Assistants | Dashboard",
  description: "Manage your AI assistants",
}

export default function AssistantsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-4 sm:mb-6">Assistants</h1>
      <Assistants />
    </div>
  )
}
