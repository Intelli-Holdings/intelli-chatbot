"use client";

import { useRef, useState } from "react";
// import { useNavigation } from "next-navigation"; // Correct import statement

export default function ChatWidget() {
  //const navigation = useNavigation(); // Correct usage of useNavigation
  const scrollTargetRef = useRef<HTMLDivElement>(null);
  const initialMessages = [
    {
      role: "user",
      content: "Hi, what is websitebot?",
    },
    {
      role: "bot",
      content:
        "WebsiteBot is a software application designed to perform automated tasks on websites.",
    },
  ];
  const [messages, setMessages] = useState(initialMessages);

  const handleSubmitMessage = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const message = e.currentTarget.message.value;
    if (!message) {
      return;
    }

    setMessages([...messages, { role: "user", content: message }]);
    e.currentTarget.message.value = "";
    setTimeout(() => {
      if (scrollTargetRef.current)
        scrollTargetRef.current.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">      
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
             
        <div className="fixed bottom-0 left-0 flex h-48 w-full items-end justify-center bg-gradient-to-t from-white via-white dark:from-black dark:via-black lg:static lg:h-auto lg:w-auto lg:bg-none">
        <div className="relative bg-white max-w-[400px]">
      <p className="p-4 font-medium">Chat with me!</p>
      <div className="divide-y divide-gray-300/50 border-t border-gray-300/50">
        <div className="space-y-6 py-8 text-base leading-7 text-gray-600 h-[400px] overflow-y-auto">
          <ul className="space-y-4 px-4">
            {messages.map((item, idx) => (
              <li
                key={idx}
                className={`flex items-center ${
                  item.role === "user" ? "ml-10 justify-end" : "mr-10"
                }`}
              >
                <p className="bg-gray-100 p-4 rounded-md">{item.content}</p>
              </li>
            ))}
          </ul>
          <div ref={scrollTargetRef}></div>
        </div>
        <form
          onSubmit={handleSubmitMessage}
          className="p-4 flex gap-2 text-base font-semibold leading-7"
        >
          <input
            name="message"
            placeholder="Ask any question"
            className="px-2 py-1.5 border rounded-md flex-1 font-normal focus:outline-none focus:border-gray-400"
          />
          <button type="submit" className="bg-gray-600 px-2.5 rounded-md text-white">
            {/* prettier-ignore */}
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" x2="11" y1="2" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </form>
      </div>
    </div>
          
        </div>
      </div>     
    </main>
    
  );
}
