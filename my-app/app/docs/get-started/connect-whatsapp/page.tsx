import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Connect WhatsApp | Intelli Documentation",
  description: "Learn how to connect your WhatsApp Business number to Intelli for AI-powered messaging.",
}

export default function WhatsAppConnection() {
  return (
    <main className="mx-auto max-w-3xl">
      <h1 className="mb-6 text-4xl font-bold text-[#007fff]">Connect WhatsApp</h1>
      <p className="mb-6 text-lg">
        Connect your WhatsApp Business number to Intelli so your AI assistant can handle
        customer conversations on WhatsApp automatically.
      </p>

      <section className="mb-8">
        <h2 className="mb-4 mt-8 text-2xl font-semibold">Before you start</h2>
        <p className="mb-4">You&apos;ll need:</p>
        <ul className="mb-4 list-disc pl-6 space-y-2">
          <li>A <strong>Facebook Business account</strong> (also called Meta Business Suite).</li>
          <li>A <strong>phone number</strong> that isn&apos;t already registered with WhatsApp Business or the regular WhatsApp app.</li>
          <li>An <strong>AI assistant</strong> already created in Intelli (see &quot;Set Up Your Assistant&quot;).</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="mb-4 text-2xl font-semibold">Step 1: Go to Channels</h2>
        <p className="mb-4">
          From your dashboard, click <strong>Channels</strong> in the sidebar. You can also click
          the <strong>Create a WhatsApp Package</strong> card on the dashboard home page.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="mb-4 text-2xl font-semibold">Step 2: Connect your account</h2>
        <p className="mb-4">You have two options:</p>

        <div className="mb-4 rounded-lg border p-4">
          <h3 className="mb-2 text-lg font-medium">Option A: Login with Facebook (recommended)</h3>
          <p>
            Click the <strong>Login with Facebook</strong> button. This walks you through connecting
            your Meta Business account in a few clicks. It&apos;s the fastest and easiest way.
          </p>
        </div>

        <div className="rounded-lg border p-4">
          <h3 className="mb-2 text-lg font-medium">Option B: Manual setup</h3>
          <p className="mb-2">
            If you prefer, you can enter your WhatsApp Business API credentials manually:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Account Name</li>
            <li>Phone Number</li>
            <li>Access Token</li>
            <li>Phone Number ID</li>
            <li>Business Account ID</li>
            <li>App Secret</li>
          </ul>
          <p className="mt-2">
            Click <strong>Create WhatsApp Package</strong> when done.
          </p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="mb-4 text-2xl font-semibold">Step 3: You&apos;re connected</h2>
        <p className="mb-4">
          Once connected, Intelli automatically links your WhatsApp number with your AI assistant.
          Incoming messages will be handled by the assistant, and you can view all conversations
          in your dashboard inbox.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="mb-4 text-2xl font-semibold">Managing your WhatsApp connection</h2>
        <p className="mb-4">
          From the Channels page, you can:
        </p>
        <ul className="mb-4 list-disc pl-6 space-y-2">
          <li>View your connected phone numbers and their status.</li>
          <li>See messaging limits and quality ratings.</li>
          <li>Update your access credentials if needed.</li>
          <li>Connect additional WhatsApp numbers (available on higher plans).</li>
        </ul>
      </section>

      <div className="rounded-lg bg-blue-50 p-4">
        <p className="text-sm text-blue-800">
          <strong>Tip:</strong> The Facebook Login method is recommended for most users. It handles the
          technical setup automatically so you can get started faster.
        </p>
      </div>
    </main>
  )
}
