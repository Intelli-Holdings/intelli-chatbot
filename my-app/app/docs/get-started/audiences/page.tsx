import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Audiences & Contacts | Intelli Documentation",
  description: "Learn how to manage contacts, create segments, and import audiences in Intelli.",
}

export default function AudiencesPage() {
  return (
    <main className="mx-auto max-w-3xl">
      <h1 className="mb-6 text-4xl font-bold text-[#007fff]">Audiences & Contacts</h1>
      <p className="mb-6 text-lg">
        Keep track of everyone your business talks to. Add contacts manually, import them
        in bulk, and organize them into segments for targeted campaigns.
      </p>

      <section className="mb-8">
        <h2 className="mb-4 mt-8 text-2xl font-semibold">Contacts</h2>
        <p className="mb-4">
          Go to <strong>Audiences &gt; Contacts</strong> in the dashboard sidebar to see all your contacts.
        </p>
        <ul className="mb-4 list-disc pl-6 space-y-2">
          <li>View your full contact list with names, phone numbers, and WhatsApp status.</li>
          <li>Add new contacts manually using the <strong>Add Contact</strong> button.</li>
          <li>Search for specific contacts by name or number.</li>
          <li>See at a glance how many contacts have WhatsApp enabled.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="mb-4 text-2xl font-semibold">Segments</h2>
        <p className="mb-4">
          Segments let you group contacts based on shared characteristics, so you can send
          targeted messages to the right people.
        </p>
        <ul className="mb-4 list-disc pl-6 space-y-2">
          <li>Go to <strong>Audiences &gt; Segments</strong> to create and manage segments.</li>
          <li>Create dynamic segments that update automatically as contacts match your criteria.</li>
          <li>Use segments when creating broadcast campaigns to target specific groups.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="mb-4 text-2xl font-semibold">Importing contacts</h2>
        <p className="mb-4">
          Have a list of contacts in a spreadsheet? Import them in bulk:
        </p>
        <ol className="mb-4 list-decimal pl-6 space-y-2">
          <li>Go to <strong>Audiences &gt; Imports</strong>.</li>
          <li>Upload a CSV file with your contact data.</li>
          <li>Map the columns to the right fields (name, phone number, email, etc.).</li>
          <li>Import — your contacts will be added to your list.</li>
        </ol>
        <p className="mb-4">
          You can view your import history to track previous uploads and their status.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="mb-4 text-2xl font-semibold">Custom fields</h2>
        <p className="mb-4">
          Beyond the standard fields (name, email, phone), you can create custom fields to
          store any additional information about your contacts. Custom fields can be filled
          automatically through chatbot flows when customers provide their details.
        </p>
      </section>

      <div className="rounded-lg bg-blue-50 p-4">
        <p className="text-sm text-blue-800">
          <strong>Tip:</strong> Use segments to organize your contacts before sending broadcasts.
          Sending relevant messages to the right audience gets much better engagement than
          blasting everyone with the same message.
        </p>
      </div>
    </main>
  )
}
