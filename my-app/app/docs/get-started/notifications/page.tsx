import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Notifications | Intelli Documentation",
  description: "Learn how to use notifications and escalation alerts in Intelli.",
}

export default function NotificationsGuide() {
  return (
    <main className="mx-auto max-w-3xl">
      <h1 className="mb-6 text-4xl font-bold text-[#007fff]">Notifications</h1>
      <p className="mb-6 text-lg">
        Stay on top of important customer activity with real-time notifications. Intelli alerts you
        when something needs your attention, like an escalation or a time-sensitive message.
      </p>

      <section className="mb-8">
        <h2 className="mb-4 mt-8 text-2xl font-semibold">How to access notifications</h2>
        <p className="mb-4">
          Click <strong>Notifications</strong> in the dashboard sidebar. The notification icon
          shows a badge with the number of unread items so you always know when something is waiting.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="mb-4 text-2xl font-semibold">What you get notified about</h2>
        <ul className="mb-4 list-disc pl-6 space-y-2">
          <li><strong>Escalations</strong> — When the AI detects that a customer needs human help, or when a keyword-based escalation rule is triggered.</li>
          <li><strong>Time-sensitive messages</strong> — Messages that need a quick response, like urgent customer requests.</li>
          <li><strong>Team assignments</strong> — When a conversation or task is assigned to you by another team member.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="mb-4 text-2xl font-semibold">Managing notifications</h2>
        <p className="mb-4">From the notifications page, you can:</p>
        <ul className="mb-4 list-disc pl-6 space-y-2">
          <li>View all notifications in one place.</li>
          <li>Mark notifications as read.</li>
          <li>Assign notifications to team members.</li>
          <li>Resolve notifications once the issue has been handled.</li>
          <li>Filter by type to focus on what matters most.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="mb-4 text-2xl font-semibold">Escalation rules</h2>
        <p className="mb-4">
          You can set up escalation events to automatically flag conversations that need human
          attention. For example, create rules based on specific keywords (like &quot;cancel&quot; or
          &quot;complaint&quot;) so you get notified immediately when a customer mentions them.
        </p>
        <p className="mb-4">
          To manage escalation rules, go to the escalation events section where you can create,
          edit, or remove rules.
        </p>
      </section>

      <div className="rounded-lg bg-blue-50 p-4">
        <p className="text-sm text-blue-800">
          <strong>Tip:</strong> Set up escalation rules early. They help you catch important conversations
          before they become problems, even when the AI is handling most of the work.
        </p>
      </div>
    </main>
  )
}
