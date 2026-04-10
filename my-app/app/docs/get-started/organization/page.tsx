import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Manage Your Organization | Intelli Documentation",
  description: "Learn how to create and manage organizations, invite team members, and set roles in Intelli.",
}

export default function OrganizationGuide() {
  return (
    <main className="mx-auto max-w-3xl">
      <h1 className="mb-6 text-4xl font-bold text-[#007fff]">Manage Your Organization</h1>
      <p className="mb-6 text-lg">
        Organizations in Intelli keep everything separated. Each organization has its own
        assistants, conversations, contacts, analytics, and team members. This is useful if
        you manage multiple businesses or brands.
      </p>

      <section className="mb-8">
        <h2 className="mb-4 mt-8 text-2xl font-semibold">Viewing your organizations</h2>
        <p className="mb-4">
          Click <strong>Organization</strong> in the dashboard sidebar. You&apos;ll see a list of
          all your organizations with their name, member count, and creation date. Use the search
          bar to find a specific one.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="mb-4 text-2xl font-semibold">Switching between organizations</h2>
        <p className="mb-4">
          Use the organization selector at the top of the dashboard to switch between organizations.
          When you switch, all the data you see (conversations, analytics, assistants, etc.)
          updates to show only that organization&apos;s information.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="mb-4 text-2xl font-semibold">Managing team members</h2>
        <p className="mb-4">
          Select an organization to see its details. From there you can:
        </p>
        <ul className="mb-4 list-disc pl-6 space-y-2">
          <li><strong>Invite new members</strong> — Add team members by email so they can access the dashboard and manage conversations.</li>
          <li><strong>Manage roles</strong> — Assign roles to control what each team member can see and do.</li>
          <li><strong>Remove members</strong> — Remove team members who no longer need access.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="mb-4 text-2xl font-semibold">Organization settings</h2>
        <p className="mb-4">
          Within an organization, you can:
        </p>
        <ul className="mb-4 list-disc pl-6 space-y-2">
          <li>View organization details and configuration.</li>
          <li>See how many team members are active.</li>
          <li>Delete an organization if it&apos;s no longer needed (this requires admin permissions).</li>
        </ul>
      </section>

      <div className="rounded-lg bg-blue-50 p-4">
        <p className="text-sm text-blue-800">
          <strong>Tip:</strong> Create separate organizations for each business or brand you manage.
          This keeps customer data, assistants, and analytics cleanly separated.
        </p>
      </div>
    </main>
  )
}
