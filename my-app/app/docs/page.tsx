import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Welcome to Intelli | Documentation",
  description: "Get started with Intelli, your AI-powered business assistant",
}

export default function Home() {
  return (
    <main className="mx-auto max-w-3xl">
      <h1 className="mb-6 text-4xl font-bold text-[#007fff]">👋 Welcome to Intelli</h1>
      <p className="mb-4">
        Welcome to your Command Center—the heart of all your business interactions. From here, you&apos;ll manage everything
        to create a seamless experience for your customers. Let&apos;s get started!
      </p>
      <h2 className="mb-4 mt-8 text-2xl font-semibold">Key Features</h2>
      <ul className="mb-4 list-inside list-disc space-y-2">
        <li>
          <strong>Set Up Your Assistant:</strong> Upload information about your business, customize the assistant&apos;s
          prompts to match your brand&apos;s voice, and update details easily whenever your needs change.
        </li>
        <li>
          <strong>Add a Website Widget:</strong> Bring your assistant to life on your website! Customize its color,
          name, and greeting to reflect your brand and connect with your audience.
        </li>
        <li>
          <strong>Connect to WhatsApp:</strong> Link your assistant to WhatsApp to handle inquiries effortlessly. Watch
          as it manages conversations and simplifies communication behind the scenes.
        </li>
        <li>
          <strong>Stay Notified:</strong> Stay on top of time-sensitive messages with instant notifications. Resolve
          your customers&apos; concerns quickly and efficiently to keep them satisfied.
        </li>
        <li>
          <strong>Manage Conversations:</strong> Take control whenever needed. Use your inbox to view and respond to
          customer messages in real time, stepping in to guide the conversation when necessary.
        </li>
        <li>
          <strong>Track Your Analytics:</strong> Monitor essential metrics like response times, engagement rates, and
          customer satisfaction. Use this data to continuously improve your business performance.
        </li>
      </ul>
      <h2 className="mb-4 mt-8 text-2xl font-semibold">Getting Started</h2>
      <p className="mb-4">
        To get started with Intelli, navigate through the sections using the sidebar on the left. Each section provides
        detailed information on how to set up and use the various features of Intelli.
      </p>
      <h2 className="mb-4 mt-8 text-2xl font-semibold">For Developers</h2>
      <p className="mb-4">
        If you&apos;re a developer looking to integrate Intelli into your applications, check out our Developer Documentation
        section in the sidebar. You&apos;ll find detailed information about our API, assistant creation workflow, and
        onboarding flow.
      </p>
    </main>
  )
}

