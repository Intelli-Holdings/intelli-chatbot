import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Set Up Your Assistant | Intelli Documentation",
  description: "Learn how to create, train, and manage an AI assistant for your business on Intelli.",
}

export default function SetupAssistantPage() {
  return (
    <main className="mx-auto max-w-3xl">
      <h1 className="mb-6 text-4xl font-bold text-[#007fff]">Set Up Your Assistant</h1>
      <p className="mb-6 text-lg">
        Your AI assistant is the core of Intelli. It learns from your business information and
        handles customer conversations across WhatsApp, your website, and email.
      </p>

      <section className="mb-8">
        <h2 className="mb-4 mt-8 text-2xl font-semibold">Step 1: Go to the Assistants page</h2>
        <p className="mb-4">
          From your dashboard, click <strong>Assistants</strong> in the sidebar. Make sure
          you have the right organization selected at the top of the page.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="mb-4 text-2xl font-semibold">Step 2: Create a new assistant</h2>
        <p className="mb-4">
          Click <strong>Create Assistant</strong>. You&apos;ll be asked to provide:
        </p>
        <ul className="mb-4 list-disc pl-6 space-y-2">
          <li><strong>Assistant Name</strong> — A name to identify this assistant (e.g., &quot;Sales Bot&quot; or &quot;Support Agent&quot;).</li>
          <li><strong>Instructions</strong> — Tell the assistant how to behave. For example: &quot;You are a friendly customer support agent for our company. Answer questions about our products and services. If you don&apos;t know something, offer to connect the customer with a human agent.&quot;</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="mb-4 text-2xl font-semibold">Step 3: Train it with your knowledge</h2>
        <p className="mb-4">
          Upload documents to give your assistant the knowledge it needs. Supported formats include
          PDF, DOCX, XLSX, and TXT files. You can upload:
        </p>
        <ul className="mb-4 list-disc pl-6 space-y-2">
          <li>FAQs and help articles</li>
          <li>Product or service descriptions</li>
          <li>Company policies and procedures</li>
          <li>Price lists or catalogs</li>
        </ul>
        <p className="mb-4">
          The assistant processes your documents and uses them to answer customer questions
          accurately. You can add, replace, or remove documents at any time.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="mb-4 text-2xl font-semibold">Step 4: Test and refine</h2>
        <p className="mb-4">
          After creating your assistant, test it by sending it questions. If the answers aren&apos;t
          quite right, you can:
        </p>
        <ul className="mb-4 list-disc pl-6 space-y-2">
          <li>Update the instructions to be more specific.</li>
          <li>Upload additional documents to fill knowledge gaps.</li>
          <li>Remove outdated documents that might cause confusion.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="mb-4 text-2xl font-semibold">Managing your assistants</h2>
        <p className="mb-4">
          From the Assistants page, you can:
        </p>
        <ul className="mb-4 list-disc pl-6 space-y-2">
          <li>Click the three-dot menu on any assistant card to <strong>edit</strong> or <strong>delete</strong> it.</li>
          <li>Create multiple assistants for different purposes (e.g., one for sales, one for support).</li>
          <li>Update documents and instructions as your business evolves.</li>
        </ul>
      </section>

      <div className="rounded-lg bg-blue-50 p-4">
        <p className="text-sm text-blue-800">
          <strong>Tip:</strong> The more specific your instructions and the more complete your uploaded
          documents, the better your assistant will perform. Start with your most common customer
          questions and expand from there.
        </p>
      </div>
    </main>
  )
}
