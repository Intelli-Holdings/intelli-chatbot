import type { Metadata } from "next"

export const metadata: Metadata = {
    title: "Notifications | Intelli Documentation",
    description: "Learn how to access and manage notifications in Intelli",
}

export default function NotificationsGuide() {
    return (
        <main className="mx-auto max-w-3xl">
            <h1 className="mb-6 text-4xl font-bold text-[#007fff]">🔔 Accessing Notifications in Intelli</h1>
            <p className="mb-4">
                Learn how to stay updated with your important notifications and time-sensitive messages.
            </p>

            <div className="mb-8 space-y-6">
                <section>
                    <h2 className="mb-4 text-2xl font-semibold">Accessing Notifications</h2>
                    <p className="mb-2">There are two ways to access your notifications:</p>
                    <ul className="list-inside list-disc space-y-2 pl-4">
                        <li>Click the &quot;🔔 View Notifications&quot; card on the dashboard home</li>
                        <li>Click &quot;Notifications&quot; in the app sidebar</li>
                    </ul>
                </section>

                <section>
                    <h2 className="mb-4 text-2xl font-semibold">Managing Notifications</h2>
                    <p>From the notifications page, you can:</p>
                    <ul className="list-inside list-disc space-y-1 pl-4">
                        <li>View all your notifications in one place</li>
                        <li>Mark notifications as read</li>
                        <li>Filter notifications by type</li>
                        <li>Take action on time-sensitive messages</li>
                    </ul>
                </section>
            </div>

            <div className="rounded-lg bg-blue-50 p-4">
                <p className="text-sm text-blue-800">
                    <strong>Note:</strong> The notifications icon will display the number of unread notifications to help you stay on top of important updates.
                </p>
            </div>
        </main>
    )
}
