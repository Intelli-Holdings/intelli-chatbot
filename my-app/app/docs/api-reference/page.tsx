import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "API Reference | Intelli Documentation",
  description: "API reference for integrating with Intelli's backend services.",
};

export default function ApiReference() {
  return (
    <main className="mx-auto max-w-4xl">
      <h1 className="mb-6 text-4xl font-bold text-[#007fff]">API Reference</h1>
      <p className="mb-6 text-lg">
        Use the Intelli API to integrate your systems with Intelli programmatically. Below is
        an overview of the available endpoints grouped by feature area.
      </p>

      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-semibold">Assistants</h2>
        <p className="mb-4">Create and manage your AI assistants.</p>
        <div className="space-y-3">
          {endpoints.assistants.map((ep) => (
            <EndpointCard key={`${ep.method} ${ep.code}`} {...ep} />
          ))}
        </div>
      </section>

      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-semibold">Messages</h2>
        <p className="mb-4">Send messages, images, and documents to customers.</p>
        <div className="space-y-3">
          {endpoints.messages.map((ep) => (
            <EndpointCard key={`${ep.method} ${ep.code}`} {...ep} />
          ))}
        </div>
      </section>

      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-semibold">Conversations</h2>
        <p className="mb-4">Manage conversation sessions and AI/human handovers.</p>
        <div className="space-y-3">
          {endpoints.conversations.map((ep) => (
            <EndpointCard key={`${ep.method} ${ep.code}`} {...ep} />
          ))}
        </div>
      </section>

      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-semibold">Notifications & Escalations</h2>
        <p className="mb-4">Manage notifications and escalation events.</p>
        <div className="space-y-3">
          {endpoints.notifications.map((ep) => (
            <EndpointCard key={`${ep.method} ${ep.code}`} {...ep} />
          ))}
        </div>
      </section>

      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-semibold">Channels</h2>
        <p className="mb-4">Manage WhatsApp and other channel connections.</p>
        <div className="space-y-3">
          {endpoints.channels.map((ep) => (
            <EndpointCard key={`${ep.method} ${ep.code}`} {...ep} />
          ))}
        </div>
      </section>

      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-semibold">App Services</h2>
        <p className="mb-4">Retrieve connected app services for an organization.</p>
        <div className="space-y-3">
          {endpoints.appServices.map((ep) => (
            <EndpointCard key={`${ep.method} ${ep.code}`} {...ep} />
          ))}
        </div>
      </section>
    </main>
  );
}

function EndpointCard({ name, method, code }: { name: string; method: string; code: string }) {
  const colors: Record<string, string> = {
    GET: "bg-green-600",
    POST: "bg-blue-600",
    PUT: "bg-yellow-600",
    DELETE: "bg-red-600",
  };

  return (
    <div className="flex items-center gap-3 rounded-lg bg-gray-800 p-3">
      <span className={`rounded px-2 py-1 text-xs font-bold text-white ${colors[method] || "bg-gray-600"}`}>
        {method}
      </span>
      <code className="text-sm text-gray-200">{code}</code>
      <span className="ml-auto text-sm text-gray-400">{name}</span>
    </div>
  );
}

const endpoints = {
  assistants: [
    { name: "List all assistants", method: "GET", code: "/api/assistants" },
    { name: "Get assistant by ID", method: "GET", code: "/api/assistants/{id}" },
    { name: "List by organization", method: "GET", code: "/api/assistants/organization" },
    { name: "Create assistant", method: "POST", code: "/api/assistants" },
    { name: "Update assistant", method: "PUT", code: "/api/assistants/{id}" },
    { name: "Upload files to assistant", method: "POST", code: "/api/assistants/files" },
    { name: "Delete assistant", method: "DELETE", code: "/api/assistants/{id}" },
  ],
  messages: [
    { name: "Send text message", method: "POST", code: "/api/messages/send" },
    { name: "Send document", method: "POST", code: "/api/messages/document" },
    { name: "Send image", method: "POST", code: "/api/messages/image" },
  ],
  conversations: [
    { name: "List chat sessions", method: "GET", code: "/api/chat-sessions" },
    { name: "Take over from AI", method: "POST", code: "/api/takeover/ai" },
    { name: "Hand back to AI", method: "POST", code: "/api/handover/ai" },
  ],
  notifications: [
    { name: "List assigned notifications", method: "GET", code: "/api/notifications/assigned" },
    { name: "Assign notification", method: "POST", code: "/api/notifications/assign" },
    { name: "Resolve notification", method: "POST", code: "/api/notifications/resolve" },
    { name: "Create escalation rule", method: "POST", code: "/api/escalation-events/create" },
    { name: "List escalation rules", method: "GET", code: "/api/escalation-events" },
    { name: "Update escalation rule", method: "PUT", code: "/api/escalation-events/{id}" },
    { name: "Delete escalation rule", method: "DELETE", code: "/api/escalation-events/{id}" },
  ],
  channels: [
    { name: "Create WhatsApp package", method: "POST", code: "/api/channel-package/whatsapp" },
    { name: "Get channel package", method: "GET", code: "/api/channel-package" },
    { name: "Update channel package", method: "PUT", code: "/api/channel-package/{id}" },
    { name: "Delete channel package", method: "DELETE", code: "/api/channel-package/{id}" },
  ],
  appServices: [
    { name: "List by organization", method: "GET", code: "/api/appservices/organization" },
  ],
};
