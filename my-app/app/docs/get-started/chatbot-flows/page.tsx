import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Chatbot Flows | Intelli Documentation",
  description: "Learn how to build automated chatbot conversation flows with Intelli's visual flow builder.",
}

export default function ChatbotFlowsPage() {
  return (
    <main className="mx-auto max-w-3xl">
      <h1 className="mb-6 text-4xl font-bold text-[#007fff]">Chatbot Flows</h1>
      <p className="mb-6 text-lg">
        The flow builder lets you design automated conversation paths for your WhatsApp
        assistant — no coding needed. Create multi-step flows with buttons, questions,
        branching logic, and more.
      </p>

      <section className="mb-8">
        <h2 className="mb-4 mt-8 text-2xl font-semibold">Getting started</h2>
        <p className="mb-4">
          Go to <strong>Chatbots</strong> in the dashboard sidebar. Click <strong>Create Chatbot</strong> to
          start a new flow, or click an existing one to edit it.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="mb-4 text-2xl font-semibold">How the flow builder works</h2>
        <p className="mb-4">
          The flow builder is a visual canvas where you connect different types of blocks
          (called nodes) to create a conversation. The flow moves from left to right:
        </p>
        <ol className="mb-4 list-decimal pl-6 space-y-2">
          <li>A customer sends a message that matches your <strong>trigger</strong>.</li>
          <li>The flow walks through each block in order, sending messages, asking questions, or making decisions.</li>
          <li>The flow ends when it reaches a final action, like handing off to the AI assistant or ending the conversation.</li>
        </ol>
      </section>

      <section className="mb-8">
        <h2 className="mb-4 text-2xl font-semibold">Types of blocks</h2>
        <p className="mb-4">You can add these blocks to your flow:</p>
        <ul className="mb-4 list-disc pl-6 space-y-3">
          <li>
            <strong>Start</strong> — The entry point. Set which keywords or events trigger this flow
            (e.g., when someone sends &quot;hello&quot; or &quot;pricing&quot;).
          </li>
          <li>
            <strong>Text Message</strong> — Send a text message to the customer.
          </li>
          <li>
            <strong>Question</strong> — Ask a question with buttons or a list of options. Each option
            leads to a different path in the flow.
          </li>
          <li>
            <strong>Condition</strong> — Branch the flow based on a rule (e.g., if the customer selected
            option A, go left; if option B, go right).
          </li>
          <li>
            <strong>Media</strong> — Send an image, video, document, or audio file.
          </li>
          <li>
            <strong>User Input</strong> — Collect information from the customer, like their name, email,
            or phone number. Answers can be saved to contact fields.
          </li>
          <li>
            <strong>Action</strong> — End the flow with an action, such as handing off to the AI assistant
            or closing the conversation.
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="mb-4 text-2xl font-semibold">Building a flow</h2>
        <ol className="mb-4 list-decimal pl-6 space-y-2">
          <li>Drag blocks from the toolbar onto the canvas.</li>
          <li>Connect blocks by dragging from one block&apos;s output to another block&apos;s input.</li>
          <li>Click any block to edit its content in the side panel.</li>
          <li>Click <strong>Save</strong> to keep your changes.</li>
        </ol>
        <p className="mb-4">
          You can also create blocks by dragging from an output handle into empty space — a
          menu will appear letting you pick what type of block to add next.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="mb-4 text-2xl font-semibold">Managing chatbots</h2>
        <p className="mb-4">
          From the Chatbots page, you can:
        </p>
        <ul className="mb-4 list-disc pl-6 space-y-2">
          <li><strong>Activate or pause</strong> a chatbot to control when it runs.</li>
          <li><strong>Duplicate</strong> a chatbot to create a copy you can modify.</li>
          <li><strong>Search and filter</strong> to find specific chatbots quickly.</li>
          <li><strong>Delete</strong> chatbots you no longer need.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="mb-4 text-2xl font-semibold">Example use cases</h2>
        <ul className="mb-4 list-disc pl-6 space-y-2">
          <li><strong>Welcome flow</strong> — Greet new customers and ask how you can help.</li>
          <li><strong>Lead qualification</strong> — Ask a series of questions to qualify a lead before handing off to sales.</li>
          <li><strong>FAQ menu</strong> — Offer a button menu of common topics and send relevant information based on their selection.</li>
          <li><strong>Appointment booking</strong> — Collect customer details, preferred date and time, and confirm the booking.</li>
        </ul>
      </section>

      <div className="rounded-lg bg-blue-50 p-4">
        <p className="text-sm text-blue-800">
          <strong>Tip:</strong> Start simple. Create a basic welcome flow first, test it, then add
          more steps as you learn what your customers ask about most.
        </p>
      </div>
    </main>
  )
}
