"use client";

import React from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  Globe,
  Bot,
  BarChart2,
  ShieldAlert,
  Bell,
} from "lucide-react";

interface FeedbackFeature {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  image: string;
  content: {
    title: string;
    description: string;
    features: string[];
  };
}

const feedbackFeatures: FeedbackFeature[] = [
  {
    id: "conversations-whatsapp",
    title: "WhatsApp inbox",
    description:
      "Manage all WhatsApp conversations from a unified team inbox",
    icon: <MessageSquare className="w-5 h-5" />,
    image: "/ConversationsWhatsapp.png",
    content: {
      title: "Unified WhatsApp conversations",
      description:
        "See every WhatsApp message in one place. Your team can collaborate, assign chats, and respond faster without switching between devices.",
      features: [
        "Centralize all WhatsApp threads in a shared inbox",
        "Assign conversations to specific team members",
        "View AI-suggested replies alongside customer messages",
      ],
    },
  },
  {
    id: "conversations-website",
    title: "Website chat",
    description:
      "Engage website visitors with real-time live chat and AI responses",
    icon: <Globe className="w-5 h-5" />,
    image: "/ConversationsWebsite.png",
    content: {
      title: "Live website conversations",
      description:
        "Capture every visitor interaction on your website. Convert browsing sessions into meaningful conversations and qualified leads.",
      features: [
        "Embed a chat widget on any page in minutes",
        "Automatically greet visitors and qualify inquiries",
        "Seamlessly hand off from AI to a human agent",
      ],
    },
  },
  {
    id: "chatbot-flows",
    title: "AI chatbots",
    description:
      "Build intelligent chatbot flows with a visual drag-and-drop editor",
    icon: <Bot className="w-5 h-5" />,
    image: "/ChatbotsInterface.png",
    content: {
      title: "Visual chatbot flow builder",
      description:
        "Design conversational experiences without writing code. Drag, drop, and connect nodes to automate customer journeys end-to-end.",
      features: [
        "Create multi-step flows with conditional branching",
        "Collect user inputs and save to custom fields",
        "Deploy across WhatsApp and website channels instantly",
      ],
    },
  },
  {
    id: "analytics",
    title: "Analytics",
    description:
      "Track performance metrics and uncover actionable insights",
    icon: <BarChart2 className="w-5 h-5" />,
    image: "/Analytics.png",
    content: {
      title: "Real-time analytics dashboard",
      description:
        "Understand what's working and where to improve. Monitor conversation volume, response times, and channel performance at a glance.",
      features: [
        "Track message volume and conversation trends over time",
        "Compare performance across WhatsApp, web, and more",
        "Identify peak hours to optimize team scheduling",
      ],
    },
  },
  {
    id: "escalations",
    title: "Escalations",
    description:
      "Set up smart triggers to surface urgent customer requests",
    icon: <ShieldAlert className="w-5 h-5" />,
    image: "/EscalationEvents.png",
    content: {
      title: "Smart escalation management",
      description:
        "Never miss a high-priority request. Define custom escalation events so the right issues reach the right people immediately.",
      features: [
        "Create keyword and intent-based escalation triggers",
        "Route escalated chats to senior agents automatically",
        "Track resolution times and escalation patterns",
      ],
    },
  },
  {
    id: "notifications",
    title: "Notifications",
    description:
      "Stay informed with instant alerts for escalations and events",
    icon: <Bell className="w-5 h-5" />,
    image: "/Notifications.png",
    content: {
      title: "Instant notification alerts",
      description:
        "Get notified the moment something needs your attention. Real-time alerts keep your team responsive and customers happy.",
      features: [
        "Receive alerts for new escalations and pending issues",
        "View notification history with resolved and open statuses",
        "Customize which events trigger notifications",
      ],
    },
  },
];

const ValueProposition = () => {
  const [selectedFeature, setSelectedFeature] = React.useState<string>(
    feedbackFeatures[0].id
  );

  const selectedContent = feedbackFeatures.find(
    (feature) => feature.id === selectedFeature
  );

  if (!selectedContent) {
    return null;
  }

  return (
    <section className="py-20">
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-2 mb-10">
          <span className="w-2 h-2 rounded-full bg-blue-500" />
          <span className="text-xs font-semibold tracking-[0.08em] uppercase text-[#1a1a1a]">
            Value proposition
          </span>
        </div>
        <h2 className="text-[clamp(32px,4.5vw,56px)] font-bold text-[#1a1a1a] leading-[1.1] mb-10">
          Effortless customer support
        </h2>
        <p className="text-[15px] text-[#1a1a1a]/70 leading-[1.7] max-w-2xl mx-auto">
          Everything you need to manage conversations, automate responses, and
          keep every customer satisfied — all from one platform.
        </p>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-8">
        {feedbackFeatures.map((feature) => {
          const isActive = selectedFeature === feature.id;
          return (
            <button
              key={feature.id}
              onClick={() => setSelectedFeature(feature.id)}
              className={`p-4 sm:p-5 rounded-xl text-left transition-all duration-200 flex flex-col items-center border ${
                isActive
                  ? "bg-[#007fff] text-white border-[#007fff] shadow-lg"
                  : "bg-white border-[#1a1a1a]/[0.06] hover:border-[#1a1a1a]/[0.12] hover:shadow-sm"
              }`}
            >
              <div
                className={`mb-3 flex items-center justify-center ${
                  isActive ? "text-white" : "text-[#007fff]"
                }`}
              >
                {feature.icon}
              </div>
              <h3 className="font-semibold text-sm mb-1.5 hidden sm:block text-center">
                {feature.title}
              </h3>
              <p
                className={`text-[13px] leading-relaxed hidden lg:block text-center ${
                  isActive ? "text-white/70" : "text-[#1a1a1a]/55"
                }`}
              >
                {feature.description}
              </p>
            </button>
          );
        })}
      </div>

      <div className="rounded-xl overflow-hidden border border-[#1a1a1a]/[0.06] bg-white shadow-[0_8px_40px_rgba(0,0,0,0.06)]">
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedFeature}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="p-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-5">
                <h3 className="text-2xl font-bold text-[#1a1a1a]">
                  {selectedContent.content.title}
                </h3>
                <p className="text-[15px] text-[#1a1a1a]/55 leading-[1.7]">
                  {selectedContent.content.description}
                </p>
                <ul className="space-y-3">
                  {selectedContent.content.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <div className="flex-shrink-0 w-5 h-5 rounded-full bg-[#007fff]/10 text-[#007fff] flex items-center justify-center">
                        <svg
                          className="w-3 h-3"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                      <span className="text-[14px] text-[#1a1a1a]/70">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="relative">
                <Image
                  src={selectedContent.image}
                  alt={selectedContent.title}
                  width={600}
                  height={400}
                  className="rounded-lg w-full border border-[#1a1a1a]/[0.06]"
                />
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
};

export default ValueProposition;
