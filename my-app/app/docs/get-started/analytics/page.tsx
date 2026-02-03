import type { Metadata } from "next"

export const metadata: Metadata = {
    title: "Analytics | Intelli Documentation",
    description: "Learn how to access and understand your analytics in Intelli",
}

export default function AnalyticsGuide() {
    return (
        <main className="mx-auto max-w-3xl">
            <h1 className="mb-6 text-4xl font-bold text-[#007fff]">📈 Track Your Analytics</h1>
            <p className="mb-4">
                Learn how to access and monitor your business metrics through the analytics dashboard.
            </p>

            <div className="mb-8 space-y-6">
                <section>
                    <h2 className="mb-4 text-2xl font-semibold">Accessing Analytics</h2>
                    <p className="mb-2">There are two ways to access your analytics:</p>
                    <ul className="list-inside list-disc space-y-2 pl-4">
                        <li>Click the &quot;Analytics&quot; tab in the app sidebar</li>
                        <li>Click the &quot;📊 View Your Analytics&quot; card from the dashboard</li>
                    </ul>
                </section>

                <section>
                    <h2 className="mb-4 text-2xl font-semibold">Available Metrics</h2>
                    <p className="mb-2">The analytics dashboard currently shows:</p>
                    <ul className="list-inside list-disc space-y-2 pl-4">
                        <li>Total Assistants</li>
                        <li>Total Conversations</li>
                        <li>Total Leads</li>
                    </ul>
                </section>

                <section>
                    <h2 className="mb-4 text-2xl font-semibold">Future Updates</h2>
                    <p className="mb-2">
                        We regularly enhance our analytics capabilities to provide you with more 
                        insights into your business performance.
                    </p>
                </section>
            </div>

            <div className="rounded-lg bg-blue-50 p-4">
                <p className="text-sm text-blue-800">
                    <strong>Note:</strong> Additional analytics metrics and visualizations will be added periodically 
                    to help you better understand your business performance.
                </p>
            </div>
        </main>
    )
}
