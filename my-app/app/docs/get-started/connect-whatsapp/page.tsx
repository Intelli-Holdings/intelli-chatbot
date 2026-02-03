import type { Metadata } from "next"

export const metadata: Metadata = {
    title: "Connect WhatsApp | Intelli Documentation",
    description: "Learn how to connect your WhatsApp Business account to Intelli",
}

export default function WhatsAppConnection() {
    return (
        <main className="mx-auto max-w-3xl">
            <h1 className="mb-6 text-4xl font-bold text-[#007fff]">📦 Connect WhatsApp to Intelli</h1>
            <p className="mb-4">
                Follow these steps to connect your WhatsApp Business account to your Intelli assistant.
            </p>

            <div className="mb-8 space-y-6">
                <section>
                    <h2 className="mb-4 text-2xl font-semibold">Step 1: Access WhatsApp Setup</h2>
                    <p className="mb-2">There are two ways to access the WhatsApp setup:</p>
                    <ul className="list-inside list-disc space-y-2 pl-4">
                        <li>Navigate to the Channels tab in the app sidebar</li>
                        <li>Click the &quot;📦 Create a WhatsApp Package&quot; card on the dashboard home</li>
                    </ul>
                </section>

                <section>
                    <h2 className="mb-4 text-2xl font-semibold">Step 2: Choose Connection Method</h2>
                    <div className="space-y-4">
                        <div>
                            <h3 className="mb-2 text-xl font-medium">Option A: Manual Setup</h3>
                            <p className="mb-2">Fill in the following WhatsApp Business Account details:</p>
                            <ul className="list-inside list-disc space-y-1 pl-4">
                                <li>Organization (select from dropdown)</li>
                                <li>Account Name</li>
                                <li>Phone Number</li>
                                <li>Access Token</li>
                                <li>Phone Number ID</li>
                                <li>Business Account ID</li>
                                <li>App Secret</li>
                            </ul>
                            <p className="mt-2">Click &quot;Create WhatsApp Package&quot; when complete.</p>
                        </div>

                        <div>
                            <h3 className="mb-2 text-xl font-medium">Option B: Facebook Login (Recommended)</h3>
                            <p>Click the &quot;Login with Facebook&quot; button to connect through Meta Business Suite for a simplified setup process.</p>
                        </div>
                    </div>
                </section>

                <section>
                    <h2 className="mb-4 text-2xl font-semibold">Step 3: Package Provisioning</h2>
                    <p>
                        Once configured, we&apos;ll automatically provision a package to connect your WhatsApp number with your existing assistant.
                    </p>
                </section>
            </div>

            <div className="rounded-lg bg-blue-50 p-4">
                <p className="text-sm text-blue-800">
                    <strong>Tip:</strong> The Facebook Login method is recommended for most users as it provides a simpler and more
                    streamlined setup process.
                </p>
            </div>
        </main>
    )
}
