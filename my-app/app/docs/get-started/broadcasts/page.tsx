import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Broadcasts & Campaigns | Intelli Documentation",
  description: "Learn how to send bulk WhatsApp messages, manage templates, and run broadcast campaigns with Intelli.",
}

export default function BroadcastsPage() {
  return (
    <main className="mx-auto max-w-3xl">
      <h1 className="mb-6 text-4xl font-bold text-[#007fff]">Broadcasts & Campaigns</h1>
      <p className="mb-6 text-lg">
        Send bulk WhatsApp messages to your contacts using approved templates. Create campaigns
        to deliver promotions, updates, reminders, and more — and track how they perform.
      </p>

      <section className="mb-8">
        <h2 className="mb-4 mt-8 text-2xl font-semibold">How it works</h2>
        <p className="mb-4">
          Broadcasting on WhatsApp requires pre-approved message templates (this is a WhatsApp
          requirement, not an Intelli limitation). Here&apos;s the basic flow:
        </p>
        <ol className="mb-4 list-decimal pl-6 space-y-2">
          <li>Create or choose a <strong>message template</strong>.</li>
          <li>Select the <strong>contacts</strong> you want to send it to.</li>
          <li>Send it immediately or <strong>schedule</strong> it for later.</li>
          <li><strong>Track results</strong> — delivery, read receipts, and engagement.</li>
        </ol>
      </section>

      <section className="mb-8">
        <h2 className="mb-4 text-2xl font-semibold">Message templates</h2>
        <p className="mb-4">
          Go to <strong>Messaging &gt; Templates</strong> in the dashboard sidebar.
        </p>
        <ul className="mb-4 list-disc pl-6 space-y-2">
          <li><strong>Browse default templates</strong> — Start with pre-designed templates for common use cases.</li>
          <li><strong>Create custom templates</strong> — Build your own with text, headers, buttons, and media.</li>
          <li><strong>Template categories</strong> — Choose from Marketing, Utility, or Authentication templates depending on your use case.</li>
          <li><strong>Language support</strong> — Create templates in multiple languages to reach a wider audience.</li>
        </ul>
        <p className="mb-4">
          Templates need to be approved by WhatsApp before you can use them. The approval status
          (Approved, Pending, or Rejected) is shown on each template.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="mb-4 text-2xl font-semibold">Creating a campaign</h2>
        <p className="mb-4">
          Go to <strong>Messaging &gt; Campaigns</strong> to create and manage your broadcast campaigns.
        </p>
        <ol className="mb-4 list-decimal pl-6 space-y-2">
          <li>Click <strong>Create Campaign</strong>.</li>
          <li>Choose an approved template.</li>
          <li>Select your target audience (all contacts, a segment, or specific contacts).</li>
          <li>Personalize the message with dynamic fields if your template supports them.</li>
          <li>Send now or schedule for a specific date and time.</li>
        </ol>
      </section>

      <section className="mb-8">
        <h2 className="mb-4 text-2xl font-semibold">Quick Send</h2>
        <p className="mb-4">
          Need to send a quick one-off message? Use <strong>Messaging &gt; Quick Send</strong> to send
          a message to individual contacts without setting up a full campaign.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="mb-4 text-2xl font-semibold">Managing campaigns</h2>
        <p className="mb-4">
          From the Campaigns page, you can:
        </p>
        <ul className="mb-4 list-disc pl-6 space-y-2">
          <li>View campaign status — Draft, Scheduled, Active, Paused, or Completed.</li>
          <li>Pause and resume active campaigns.</li>
          <li>See delivery metrics and engagement for each campaign.</li>
          <li>Search and filter campaigns by status or channel.</li>
        </ul>
      </section>

      <div className="rounded-lg bg-blue-50 p-4">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> WhatsApp charges per-conversation fees for broadcast messages. These are
          charged by Meta separately from your Intelli subscription. Check Meta&apos;s pricing page
          for current rates.
        </p>
      </div>
    </main>
  )
}
