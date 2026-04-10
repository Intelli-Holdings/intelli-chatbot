import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Add a Website Widget | Intelli Documentation",
  description: "Learn how to create and add an AI chat widget to your website with Intelli.",
}

export default function WebsiteWidgetPage() {
  return (
    <main className="mx-auto max-w-3xl">
      <h1 className="mb-6 text-4xl font-bold text-[#007fff]">Add a Website Widget</h1>
      <p className="mb-6 text-lg">
        Put an AI-powered chat widget on your website so visitors can get instant answers.
        Customize its look to match your brand and connect it to your assistant.
      </p>

      <section className="mb-8">
        <h2 className="mb-4 mt-8 text-2xl font-semibold">Step 1: Open the Playground</h2>
        <p className="mb-4">
          In your dashboard, click <strong>Playground</strong> in the sidebar. This is where
          you create and preview your widgets.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="mb-4 text-2xl font-semibold">Step 2: Configure your widget</h2>
        <p className="mb-4">Fill in the following details:</p>
        <ul className="mb-4 list-disc pl-6 space-y-2">
          <li><strong>Organization</strong> — Select your organization from the dropdown.</li>
          <li><strong>Assistant</strong> — Choose which AI assistant should power this widget.</li>
          <li><strong>Widget Name</strong> — Give it a name you&apos;ll recognize (e.g., &quot;Main Website Chat&quot;).</li>
          <li><strong>Avatar</strong> — Upload an image for the chat avatar (your logo works great).</li>
          <li><strong>Website URL</strong> — Enter the website where you&apos;ll embed this widget.</li>
          <li><strong>Brand Color</strong> — Pick a color that matches your website design.</li>
          <li><strong>Greeting Message</strong> — Set the first message visitors see when they open the chat (e.g., &quot;Hi there! How can I help you today?&quot;).</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="mb-4 text-2xl font-semibold">Step 3: Create and embed</h2>
        <p className="mb-4">
          Click <strong>Create Widget</strong>. You&apos;ll get a small code snippet to copy and
          paste into your website. Add it just before the closing <code className="rounded bg-gray-100 px-2 py-1">&lt;/body&gt;</code> tag
          on any page where you want the chat to appear.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="mb-4 text-2xl font-semibold">Step 4: Manage your widgets</h2>
        <p className="mb-4">
          To view or edit your widgets later, go to the <strong>Widgets</strong> section from the
          dashboard. You can update the settings, change the assistant, or remove a widget at any time.
        </p>
      </section>

      <div className="rounded-lg bg-blue-50 p-4">
        <p className="text-sm text-blue-800">
          <strong>Tip:</strong> The widget works on any website — WordPress, Shopify, Wix, custom-built sites,
          or anything else. Just paste the code snippet and it works.
        </p>
      </div>
    </main>
  )
}
