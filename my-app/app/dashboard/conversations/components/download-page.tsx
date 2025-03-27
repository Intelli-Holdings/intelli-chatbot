import Image from "next/image"
import { MessageSquare } from "lucide-react"

export default function NoConversationSelected() {
  return (
    <div className="flex flex-col items-center justify-center h-full p-6">
      <div className="max-w-md text-center">

        <h1 className="text-2xl font-medium text-gray-800 mb-2">No conversation selected</h1>

        <p className="text-gray-600 mb-4">
          Select a chat from the sidebar to view your messages
        </p>

        <div className="mt-8 flex items-center justify-center text-sm text-gray-500">
          <MessageSquare className="h-4 w-4 mr-2" />
          Your messages will appear here
        </div>
      </div>
    </div>
  )
}

