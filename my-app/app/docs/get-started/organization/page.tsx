import type { Metadata } from "next"

export const metadata: Metadata = {
    title: "Organizations | Intelli Documentation",
    description: "Learn how to access and manage organizations in Intelli",
}

export default function OrganizationGuide() {
    return (
        <main className="mx-auto max-w-3xl">
            <h1 className="mb-6 text-4xl font-bold text-[#007fff]">Managing Organizations in Intelli</h1>
            <p className="mb-4">
                Learn how to access, create, and manage your organizations and their members.
            </p>

            <div className="mb-8 space-y-6">
                <section>
                    <h2 className="mb-4 text-2xl font-semibold">Accessing Organizations</h2>
                    <p className="mb-2">To access your organizations:</p>
                    <ul className="list-inside list-disc space-y-2 pl-4">
                        <li>Click the &quot;Organization&quot; tab in the app sidebar</li>
                        <li>You&apos;ll see the &quot;Manage Organizations&quot; interface</li>
                    </ul>
                </section>

                <section>
                    <h2 className="mb-4 text-2xl font-semibold">Organization Interface</h2>
                    <p className="mb-2">The organization page includes:</p>
                    <ul className="list-inside list-disc space-y-2 pl-4">
                        <li>A search bar to find specific organizations</li>
                        <li>A sort/filter button (default: &quot;Sort by: Created&quot;)</li>
                        <li>A table displaying your organizations with columns for:
                            <ul className="list-inside list-circle space-y-1 pl-8">
                                <li>Name</li>
                                <li>ID</li>
                                <li>Members count</li>
                                <li>Creation date</li>
                            </ul>
                        </li>
                    </ul>
                </section>

                <section>
                    <h2 className="mb-4 text-2xl font-semibold">Managing Organization Details</h2>
                    <p className="mb-2">After selecting an organization, you can:</p>
                    <ul className="list-inside list-disc space-y-2 pl-4">
                        <li>View organization details and member count</li>
                        <li>Manage member roles through the members table</li>
                        <li>Invite new members</li>
                        <li>Delete the organization using the actions button</li>
                    </ul>
                </section>
            </div>

            <div className="rounded-lg bg-blue-50 p-4">
                <p className="text-sm text-blue-800">
                    <strong>Note:</strong> You need appropriate permissions to manage organization settings and members.
                </p>
            </div>
        </main>
    )
}
