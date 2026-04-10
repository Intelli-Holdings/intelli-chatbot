import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Analytics | Intelli Documentation",
  description: "Learn how to use the real-time analytics dashboard in Intelli to track performance.",
}

export default function AnalyticsGuide() {
  return (
    <main className="mx-auto max-w-3xl">
      <h1 className="mb-6 text-4xl font-bold text-[#007fff]">Analytics</h1>
      <p className="mb-6 text-lg">
        The analytics dashboard gives you real-time visibility into how your AI assistant
        is performing, how customers are engaging, and where you can improve.
      </p>

      <section className="mb-8">
        <h2 className="mb-4 mt-8 text-2xl font-semibold">How to access analytics</h2>
        <p className="mb-4">
          Click <strong>Analytics</strong> in the dashboard sidebar to open the analytics dashboard.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="mb-4 text-2xl font-semibold">Real-time metrics</h2>
        <p className="mb-4">
          At the top of the dashboard, you&apos;ll see live numbers updated in real time:
        </p>
        <ul className="mb-4 list-disc pl-6 space-y-2">
          <li><strong>Total Messages</strong> — How many messages are being sent and received.</li>
          <li><strong>Active Conversations</strong> — Conversations happening right now.</li>
          <li><strong>Cost</strong> — How much your AI usage is costing in the current period.</li>
          <li><strong>Tokens Used</strong> — The amount of AI processing power being used.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="mb-4 text-2xl font-semibold">Channel breakdown</h2>
        <p className="mb-4">
          See how your messages are distributed across channels. The dashboard shows a
          breakdown between WhatsApp, website widget, and other connected channels, so you
          know where most of your customer conversations are happening.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="mb-4 text-2xl font-semibold">Trend analysis</h2>
        <p className="mb-4">
          View message volume over time with different time ranges — hourly, daily, or weekly.
          This helps you spot patterns like peak hours, busy days, or growth trends.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="mb-4 text-2xl font-semibold">Cost breakdown</h2>
        <p className="mb-4">
          Track your AI costs by model type. The cost chart shows you exactly how your
          AI credits are being used, helping you manage your budget and optimize usage.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="mb-4 text-2xl font-semibold">Customer insights</h2>
        <p className="mb-4">
          Understand your customers better with metrics like:
        </p>
        <ul className="mb-4 list-disc pl-6 space-y-2">
          <li>Total unique customers.</li>
          <li>Average messages per session.</li>
          <li>Peak activity hours.</li>
        </ul>
      </section>

      <div className="rounded-lg bg-blue-50 p-4">
        <p className="text-sm text-blue-800">
          <strong>Tip:</strong> Check your analytics regularly to find opportunities. For example, if you
          see a spike in messages at certain hours, you might want to have a team member
          available during those peak times for takeovers.
        </p>
      </div>
    </main>
  )
}
