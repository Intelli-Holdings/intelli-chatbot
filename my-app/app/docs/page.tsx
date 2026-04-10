import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Welcome to Intelli | Documentation",
  description: "Get started with Intelli, the AI-powered customer engagement platform for WhatsApp, website chat, and more.",
}

export default function Home() {
  return (
    <main className="mx-auto max-w-3xl">
      <h1 className="mb-6 text-4xl font-bold text-[#007fff]">Welcome to Intelli</h1>
      <p className="mb-6 text-lg">
        Intelli is an AI-powered customer engagement platform that helps businesses manage conversations
        across WhatsApp, website chat, and email — all from one place. Train an AI assistant on your
        business knowledge, deploy it across channels, and let it handle customer inquiries around the clock.
      </p>

      <h2 className="mb-4 mt-8 text-2xl font-semibold">What you can do with Intelli</h2>
      <ul className="mb-6 list-inside list-disc space-y-3">
        <li>
          <strong>Create an AI Assistant</strong> — Upload your FAQs, documents, and business info. Your
          assistant learns your business and answers customer questions in your brand&apos;s voice.
        </li>
        <li>
          <strong>Add a Website Widget</strong> — Put a chat widget on your website so visitors can talk
          to your AI assistant instantly. Customize the look, greeting, and behavior.
        </li>
        <li>
          <strong>Connect to WhatsApp</strong> — Link your WhatsApp Business number so your assistant can
          handle conversations on WhatsApp automatically.
        </li>
        <li>
          <strong>Build Chatbot Flows</strong> — Use the visual flow builder to design conversation paths
          with buttons, questions, conditions, and media — no coding needed.
        </li>
        <li>
          <strong>Send Broadcasts & Campaigns</strong> — Send bulk messages to your contacts using
          WhatsApp-approved templates. Schedule campaigns and track delivery.
        </li>
        <li>
          <strong>Manage Audiences</strong> — Organize your contacts, create segments, and import contacts
          in bulk from CSV files.
        </li>
        <li>
          <strong>Manage Conversations</strong> — View all customer messages in a shared inbox. Let the AI
          handle routine questions and step in manually whenever needed.
        </li>
        <li>
          <strong>Track Analytics</strong> — See real-time metrics on message volume, response times,
          AI performance, costs, and customer engagement across all channels.
        </li>
        <li>
          <strong>Stay Notified</strong> — Get instant alerts for escalations, time-sensitive messages,
          and important customer activity.
        </li>
      </ul>

      <h2 className="mb-4 mt-8 text-2xl font-semibold">How to get started</h2>
      <p className="mb-4">
        Follow these four steps to go live:
      </p>
      <ol className="mb-6 list-inside list-decimal space-y-2">
        <li><Link href="/docs/get-started/assistant" className="text-[#007fff] underline">Create an AI assistant</Link> and train it on your business knowledge.</li>
        <li><Link href="/docs/get-started/website-widget" className="text-[#007fff] underline">Add a website widget</Link> or <Link href="/docs/get-started/connect-whatsapp" className="text-[#007fff] underline">connect WhatsApp</Link> (or both).</li>
        <li><Link href="/docs/get-started/chatbot-flows" className="text-[#007fff] underline">Build chatbot flows</Link> to automate common conversations.</li>
        <li><Link href="/docs/get-started/analytics" className="text-[#007fff] underline">Track your analytics</Link> to measure performance and improve over time.</li>
      </ol>

      <h2 className="mb-4 mt-8 text-2xl font-semibold">Supported channels</h2>
      <p className="mb-4">
        Intelli currently supports these channels:
      </p>
      <ul className="mb-6 list-inside list-disc space-y-1">
        <li><strong>WhatsApp</strong> — Full Business API integration with AI, templates, broadcasts, and live chat.</li>
        <li><strong>Website Chat</strong> — Embeddable widget with customizable branding and AI responses.</li>
        <li><strong>Email</strong> — Connect your email for unified inbox management.</li>
      </ul>

      <h2 className="mb-4 mt-8 text-2xl font-semibold">For developers</h2>
      <p className="mb-4">
        If you&apos;re looking to integrate Intelli with your own tools or systems, check out the{" "}
        <Link href="/docs/channels" className="text-[#007fff] underline">Channels & Integrations</Link> and{" "}
        <Link href="/docs/api-reference" className="text-[#007fff] underline">API Reference</Link> sections
        in the sidebar.
      </p>
    </main>
  )
}
