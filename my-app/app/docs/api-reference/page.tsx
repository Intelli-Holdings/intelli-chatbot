import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "API Reference | Intelli Docs",
  description: "Detailed API reference for Intelli",
};

export default function ApiReference() {
  return (
    <main className="max-w-4xl mx-auto p-6">
      <h1 className="text-4xl font-bold mb-6">API Reference</h1>
      <p className="text-xl mb-4">
        This section provides an abridged reference for the APIs. You&apos;ll find information about
        available methods, their parameters, and return values.
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-4">Endpoints</h2>

      <div className="space-y-6">
        {apiEndpoints.map((endpoint) => (
          <div key={endpoint.name} className="p-4 bg-gray-800 rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold text-white mb-2">{endpoint.name}</h3>
            <pre className={`p-4 rounded-md text-white ${endpoint.methodColor}`}>
              <code>{endpoint.code}</code>
            </pre>
          </div>
        ))}
      </div>
    </main>
  );
}

const apiEndpoints = [
  { name: "Get all assistants", methodColor: "bg-green-600", code: `GET /api/assistants` },
  { name: "Get assistant by ID", methodColor: "bg-green-600", code: `GET /api/assistants/{id}` },
  { name: "Create assistant", methodColor: "bg-blue-600", code: `POST /api/assistants` },
  { name: "Update assistant", methodColor: "bg-yellow-600", code: `PUT /api/assistants/{id}` },
  { name: "Delete assistant", methodColor: "bg-red-600", code: `DELETE /api/assistants/{id}` },
  { name: "Update assistant with files", methodColor: "bg-blue-600", code: `POST /api/assistants/files` },
  { name: "Get assistants by organization", methodColor: "bg-green-600", code: `GET /api/assistants/organization` },
  { name: "Send Message", methodColor: "bg-blue-600", code: `POST /api/messages/send` },
  { name: "Send Document", methodColor: "bg-blue-600", code: `POST /api/messages/document` },
  { name: "Send Image", methodColor: "bg-blue-600", code: `POST /api/messages/image` },
  { name: "Takeover AI", methodColor: "bg-blue-600", code: `POST /api/takeover/ai` },
  { name: "Handover to AI", methodColor: "bg-blue-600", code: `POST /api/handover/ai` },
  { name: "Get business chat sessions", methodColor: "bg-green-600", code: `GET /api/chat-sessions` },
  { name: "Get app services by organization", methodColor: "bg-green-600", code: `GET /api/appservices/organization` },
  { name: "Get notifications assigned", methodColor: "bg-green-600", code: `GET /api/notifications/assigned` },
  { name: "Assign notification", methodColor: "bg-blue-600", code: `POST /api/notifications/assign` },
  { name: "Resolve notification", methodColor: "bg-blue-600", code: `POST /api/notifications/resolve` },
  { name: "Create escalation event", methodColor: "bg-blue-600", code: `POST /api/escalation-events/create` },
  { name: "Get escalation events", methodColor: "bg-green-600", code: `GET /api/escalation-events` },
  { name: "Delete escalation event", methodColor: "bg-red-600", code: `DELETE /api/escalation-events/{id}` },
  { name: "Update escalation event", methodColor: "bg-yellow-600", code: `PUT /api/escalation-events/{id}` },
  { name: "Create WhatsApp package", methodColor: "bg-blue-600", code: `POST /api/channel-package/whatsapp` },
  { name: "Get channel package", methodColor: "bg-green-600", code: `GET /api/channel-package` },
  { name: "Update channel package", methodColor: "bg-yellow-600", code: `PUT /api/channel-package/{id}` },
  { name: "Delete channel package", methodColor: "bg-red-600", code: `DELETE /api/channel-package/{id}` },
];
