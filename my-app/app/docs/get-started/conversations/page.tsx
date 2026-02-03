import type { Metadata } from "next"

export const metadata: Metadata = {
    title: "Accessing Conversations | Intelli Documentation",
    description: "Learn how to access and manage conversations in Intelli",
}

export default function ConversationsGuide() {
    return (
        <main className="mx-auto max-w-3xl">
            <h1 className="mb-6 text-4xl font-bold text-[#007fff]">💬 Accessing Conversations in Intelli</h1>
            <p className="mb-4">
                Learn how to access and manage your customer conversations across different channels.
            </p>

            <div className="mb-8 space-y-6">
                <section>
                    <h2 className="mb-4 text-2xl font-semibold">Accessing the Conversations Page</h2>
                    <p className="mb-2">There are two ways to access your conversations:</p>
                    <ul className="list-inside list-disc space-y-2 pl-4">
                        <li>Click the &quot;💬 View Conversations&quot; card on the dashboard home</li>
                        <li>Click &quot;Conversations&quot; in the app sidebar</li>
                    </ul>
                </section>

                <section>
                    <h2 className="mb-4 text-2xl font-semibold">Channel-Specific Conversations</h2>
                    <p className="mb-2">On the Conversations page, you&apos;ll see cards for each channel:</p>
                    <div className="space-y-4">
                        <div>
                            <h3 className="mb-2 text-xl font-medium">WhatsApp Interface</h3>
                            <ul className="list-inside list-disc space-y-1 pl-4">
                                <li>Similar to WhatsApp Desktop layout</li>
                                <li>Conversation list with search bar on the left</li>
                                <li>Click any conversation to view the chat history</li>
                                <li>Use the takeover button to respond manually</li>
                                <li>Handover control back to AI when finished</li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="mb-2 text-xl font-medium">Website Widget Interface</h3>
                            <ul className="list-inside list-disc space-y-1 pl-4">
                                <li>Select an organization from the dropdown</li>
                                <li>Choose a website widget</li>
                                <li>Search visitors using the search bar</li>
                                <li>Select a visitor to start chatting</li>
                            </ul>
                        </div>
                    </div>
                </section>

                <section>
                    <h2 className="mb-4 text-2xl font-semibold">Managing Conversations</h2>
                    <p>
                        For both channels, you can:
                    </p>
                    <ul className="list-inside list-disc space-y-1 pl-4">
                        <li>View message history with customers</li>
                        <li>Take manual control of conversations</li>
                        <li>Hand control back to the AI assistant</li>
                        <li>Search through conversations</li>
                    </ul>
                </section>
            </div>

            <div className="rounded-lg bg-blue-50 p-4">
                <p className="text-sm text-blue-800">
                    <strong>Note:</strong> Each channel displays the number of unread messages directly on their respective icons.
                </p>
            </div>
        </main>
    )
}
