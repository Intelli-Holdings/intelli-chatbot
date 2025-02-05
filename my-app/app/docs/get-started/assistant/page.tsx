import type { Metadata } from "next"

export const metadata: Metadata = {
    title: "Create Assistant | Organization Setup",
    description: "Learn how to create and manage assistants for your organization",
}

export default function SetupAssistantPage() {
    return (
        <main className="max-w-3xl mx-auto">
            <h1 className="mb-6 text-4xl font-bold text-[#007fff]">🪄 Creating an Assistant</h1>
            <p className="text-xl mb-4">
                Follow these steps to create and manage an assistant for your organization.
            </p>

            <section className="mb-8">
                <h2 className="text-2xl font-semibold mt-8 mb-4">Step 1: Select Organization</h2>
                <p className="mb-4">
                    From the dashboard, locate the organization selector dropdown at the top of the page.
                    Select your desired organization from the list.
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">Step 2: Access Assistant Creation</h2>
                <p className="mb-4">
                    Locate and click the &quot;Create Assistant&quot; card on your dashboard.
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">Step 3: Fill Assistant Details</h2>
                <p className="mb-4">In the popup form, you&apos;ll need to fill out the following fields:</p>
                <ul className="list-disc ml-6 mb-4">
                    <li className="mb-2">Organization: &quot;heavenly for samson&quot; (pre-selected)</li>
                    <li className="mb-2">Assistant Name: Enter a descriptive name for your assistant</li>
                    <li className="mb-2">Assistant Prompt/Instructions: Provide detailed instructions for your assistant</li>
                </ul>
                <p className="mb-4">Click the &quot;Create Assistant&quot; button to complete the process.</p>
            </section>

            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">Step 4: Confirmation</h2>
                <p className="mb-4">
                    Once created, you&apos;ll see a success notification and your new assistant will appear in the list.
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">Managing Your Assistant</h2>
                <p className="mb-4">
                    To manage your assistant:
                </p>
                <ul className="list-disc ml-6 mb-4">
                    <li className="mb-2">Locate your assistant card in the list</li>
                    <li className="mb-2">Click the three dots (⋮) menu on the assistant card</li>
                    <li className="mb-2">Select &quot;Edit&quot; to modify settings or &quot;Delete&quot; to remove the assistant</li>
                </ul>
            </section>
        </main>
    )
}
