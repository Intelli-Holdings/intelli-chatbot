import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Manage Conversations | Intelli Documentation",
  description: "Learn how to manage customer conversations across WhatsApp and website chat in Intelli.",
}

export default function ConversationsGuide() {
  return (
    <main className="mx-auto max-w-3xl">
      <h1 className="mb-6 text-4xl font-bold text-[#007fff]">Manage Conversations</h1>
      <p className="mb-6 text-lg">
        Your conversations inbox is where you see every customer message across all your channels.
        The AI handles routine questions automatically, and you can jump in whenever you need to.
      </p>

      <section className="mb-8">
        <h2 className="mb-4 mt-8 text-2xl font-semibold">How to access conversations</h2>
        <p className="mb-4">
          Click <strong>Conversations</strong> in the dashboard sidebar. You&apos;ll see your connected
          channels — select one to view its messages.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="mb-4 text-2xl font-semibold">WhatsApp conversations</h2>
        <p className="mb-4">
          The WhatsApp inbox has a familiar layout similar to WhatsApp Desktop:
        </p>
        <ul className="mb-4 list-disc pl-6 space-y-2">
          <li>A <strong>conversation list</strong> on the left with search and filtering.</li>
          <li>Click any conversation to see the <strong>full chat history</strong> on the right.</li>
          <li>If you have multiple WhatsApp numbers, use the selector at the top to switch between them.</li>
          <li>Unread messages are highlighted so you know what&apos;s new.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="mb-4 text-2xl font-semibold">Website widget conversations</h2>
        <p className="mb-4">
          For website chat, select your organization and widget to see visitor conversations:
        </p>
        <ul className="mb-4 list-disc pl-6 space-y-2">
          <li>Browse and search through visitor conversations.</li>
          <li>Click a visitor to see their full chat history.</li>
          <li>Reply directly to continue the conversation.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="mb-4 text-2xl font-semibold">Taking over from the AI</h2>
        <p className="mb-4">
          Sometimes you&apos;ll want to respond personally instead of letting the AI handle it. Here&apos;s how:
        </p>
        <ol className="mb-4 list-decimal pl-6 space-y-2">
          <li>Open the conversation you want to take over.</li>
          <li>Click the <strong>Takeover</strong> button to pause the AI and start replying manually.</li>
          <li>Type your messages and send them directly to the customer.</li>
          <li>When you&apos;re done, click <strong>Hand back to AI</strong> to let the assistant resume.</li>
        </ol>
      </section>

      <section className="mb-8">
        <h2 className="mb-4 text-2xl font-semibold">Sending media</h2>
        <p className="mb-4">
          You can send images, documents, and other files directly in a conversation.
          Use the attachment button in the message composer to share files with customers.
        </p>
      </section>

      <div className="rounded-lg bg-blue-50 p-4">
        <p className="text-sm text-blue-800">
          <strong>Tip:</strong> The AI keeps working on other conversations while you&apos;re handling one
          manually. You only need to take over the specific conversation that needs your personal touch.
        </p>
      </div>
    </main>
  )
}
