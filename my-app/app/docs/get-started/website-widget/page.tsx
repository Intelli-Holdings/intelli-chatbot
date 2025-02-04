import type { Metadata } from "next"

export const metadata: Metadata = {
    title: "Create Website Widget | Integration Guide",
    description: "Learn how to create and deploy a website widget for your assistant",
}

export default function WebsiteWidgetPage() {
    return (
        <main className="max-w-3xl mx-auto">
            <h1 className="text-4xl font-bold mb-6">🌐 Creating a Website Widget</h1>
            <p className="text-xl mb-4">
                Follow these steps to create and deploy a website widget for your assistant.
            </p>

            <section className="mb-8">
                <h2 className="text-2xl font-semibold mt-8 mb-4">Step 1: Access the Playground</h2>
                <p className="mb-4">
                    Navigate to the <code className="bg-gray-100 px-2 py-1 rounded">/dashboard/playground</code> route by either:
                </p>
                <ul className="list-disc ml-6 mb-4">
                    <li className="mb-2">Clicking &quot;Playground&quot; on the app sidebar</li>
                    <li className="mb-2">Directly accessing the URL in your browser</li>
                </ul>
            </section>

            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">Step 2: Configure Widget Settings</h2>
                <p className="mb-4">Fill out the form on the left with the following details:</p>
                <ul className="list-disc ml-6 mb-4">
                    <li className="mb-2">Organization: Select your organization from the dropdown</li>
                    <li className="mb-2">Assistant: Choose the assistant you want to use</li>
                    <li className="mb-2">Widget Name: Enter a descriptive name for your widget</li>
                    <li className="mb-2">Avatar: Upload an assistant avatar image</li>
                    <li className="mb-2">Website URL: Enter your website URL (e.g., https://yourwebsite.com)</li>
                    <li className="mb-2">Brand Color: Choose your brand color (default: #007fff)</li>
                    <li className="mb-2">Greeting Message: Customize the initial message (e.g., &quot;Hello! I&apos;m here to help.&quot;)</li>
                </ul>
            </section>

            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">Step 3: Create and Deploy</h2>
                <p className="mb-4">
                    Click the &quot;Create Widget&quot; button to generate your widget. You&apos;ll receive deployment
                    instructions that you can copy and use to integrate the widget on your chosen platform.
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">Step 4: View Your Widgets</h2>
                <p className="mb-4">
                    To manage or view your created widgets:
                </p>
                <ul className="list-disc ml-6 mb-4">
                    <li className="mb-2">Visit the widgets page through the dashboard sidebar</li>
                    <li className="mb-2">Or navigate to <code className="bg-gray-100 px-2 py-1 rounded">/dashboard/widgets</code></li>
                </ul>
            </section>
        </main>
    )
}
