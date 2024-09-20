import React from "react";

const ChatbotExperience = () => {
  return (
    <section className="bg-black text-white py-16">
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center px-4 md:px-8">
        {/* Left Section: Text Block */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-sm">For customers</span>
          </div>
          <h2 className="text-4xl font-bold">Instant service, exceptional experiences</h2>
          <p className="text-gray-300">
            <strong>Fin AI Agent</strong>
            <br />
            Provide 24/7 support and resolve 50% of support volume instantly. It&apos;s so much more than an AI chatbot.
          </p>
          <p className="text-gray-300">
            <strong>Omnichannel</strong>
            <br />
            Deliver exceptional experiences wherever your customers are.
          </p>
          <p className="text-gray-300">
            <strong>Help Center</strong>
            <br />
            Help customers find accurate answers when and where they need them.
          </p>
          <button className="mt-4 bg-white text-black px-6 py-2 rounded-full shadow-lg hover:bg-gray-200">
            Learn more
          </button>
        </div>

        {/* Right Section: Chatbot UI */}
        <div className="bg-white rounded-lg shadow-lg p-6 relative">
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-2">
              <img
                src="/ai-agent-icon.png" // Replace with the correct icon
                alt="AI Agent"
                className="w-8 h-8"
              />
              <span className="text-gray-800 font-bold">Fin</span>
              <span className="text-gray-500">AI Agent</span>
            </div>
            <div className="flex space-x-2">
              <span className="text-gray-400">📚</span>
              <span className="text-gray-400">👤</span>
            </div>
          </div>
          {/* Chat content */}
          <div className="space-y-4">
            <div className="text-sm space-y-2">
              <p className="bg-gray-100 p-3 rounded-lg">
                Of course! We have 5 available in our London store. Would you like me to reserve one?
              </p>
              <p className="text-right text-orange-600 font-semibold">Yes</p>
            </div>
            <div className="text-sm space-y-2">
              <p className="bg-gray-100 p-3 rounded-lg">
                Great, that’s reserved. You’ll receive a confirmation email shortly.
              </p>
              <p className="text-right text-orange-600 font-semibold">Nope, all good!</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg flex items-center justify-between">
              <input
                type="text"
                className="w-full p-2 text-gray-800 bg-transparent outline-none"
                placeholder="Reply"
              />
              <div className="flex space-x-2 text-gray-500">
                <span>😊</span>
                <span>📎</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ChatbotExperience;
