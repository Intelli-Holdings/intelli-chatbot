import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Channels & Integrations | Intelli Documentation",
  description: "Learn about the communication channels and integrations available in Intelli.",
}

export default function ChannelsPage() {
  return (
    <main className="mx-auto max-w-3xl">
      <h1 className="mb-6 text-4xl font-bold text-[#007fff]">Channels & Integrations</h1>
      <p className="mb-6 text-lg">
        Intelli connects your AI assistant to the channels where your customers already are.
        Manage all your channels from one place in the dashboard.
      </p>

      <section className="mb-8">
        <h2 className="mb-4 mt-8 text-2xl font-semibold">Supported channels</h2>

        <div className="mb-6 rounded-lg border p-4">
          <h3 className="mb-2 text-lg font-semibold">WhatsApp Business API</h3>
          <p className="mb-2">
            Full integration with the WhatsApp Business API. This is Intelli&apos;s most
            feature-rich channel, supporting:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>AI-powered automated conversations</li>
            <li>Live chat with human takeover</li>
            <li>Message templates and broadcast campaigns</li>
            <li>Chatbot flow automation</li>
            <li>Media messages (images, documents, video, audio)</li>
            <li>Read receipts and delivery tracking</li>
            <li>Multiple phone numbers on higher plans</li>
          </ul>
        </div>

        <div className="mb-6 rounded-lg border p-4">
          <h3 className="mb-2 text-lg font-semibold">Website Chat Widget</h3>
          <p className="mb-2">
            An embeddable chat widget for your website. Visitors can talk to your AI assistant
            without leaving the page.
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Customizable colors, avatar, and greeting</li>
            <li>AI-powered responses</li>
            <li>Live chat with human takeover</li>
            <li>Works on any website (WordPress, Shopify, custom, etc.)</li>
          </ul>
        </div>

        <div className="mb-6 rounded-lg border p-4">
          <h3 className="mb-2 text-lg font-semibold">Email</h3>
          <p>
            Connect your email to manage customer emails alongside your other conversations
            in the same dashboard.
          </p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="mb-4 text-2xl font-semibold">Managing channels</h2>
        <p className="mb-4">
          Go to <strong>Channels</strong> in the dashboard sidebar to see all your connected
          channels, add new ones, or update existing connections.
        </p>
        <p className="mb-4">
          Each channel shows its connection status, phone numbers or account details,
          and configuration options.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="mb-4 text-2xl font-semibold">Webhook integrations</h2>
        <p className="mb-4">
          Connect Intelli to your other business tools through webhooks. This lets you
          send data to CRMs like Zoho, HubSpot, or automation platforms like Make and
          Zapier whenever specific events happen (like a new contact or a completed
          conversation).
        </p>
        <p className="mb-4">
          Webhook integration is available as an add-on. See the pricing page for details.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="mb-4 text-2xl font-semibold">Multi-language support</h2>
        <p className="mb-4">
          Your AI assistant can communicate in multiple languages automatically. It detects
          the language your customer is writing in and responds in the same language. This
          works across all channels.
        </p>
        <p className="mb-4">
          For WhatsApp templates, you can create language-specific versions so your broadcast
          messages are sent in the right language.
        </p>
      </section>

      <div className="rounded-lg bg-blue-50 p-4">
        <p className="text-sm text-blue-800">
          <strong>Tip:</strong> Start with the channel where most of your customers reach you.
          You can always add more channels later — your assistant&apos;s knowledge works the same
          across all of them.
        </p>
      </div>
    </main>
  )
}
