// utils/tourSteps.ts

import type { Tours } from '@/types/tour';

export const steps: Tours = [
  {
    tour: "mainTour",
    steps: [
      {
        icon: "👋",
        title: "Welcome to Intelli",
        content: "Command center is the heart of all your business interactions. Let’s get started!",
        selector: "#onborda-step1",
        side: "left",
        showControls: true,
        showSkip: true
      },
      {
        icon: "🪄",
        title: "Set Up Your Assistant",
        content: "Upload information about your business, to enable the assistant to match your brand’s voice, and update details whenever you need.",
        selector: "#onborda-step2",
        side: "right",
        showControls: true,
        showSkip: true
      },
      {
        icon: "🌐",
        title: "Add a Website Widget",
        content: "Bring your assistant to life on your website! Customize its color, name, and greeting to reflect your brand and connect with your audience.",
        selector: "#onborda-step3",
        side: "right",
        showControls: true,
        showSkip: true
      },
      {
        icon: "📦",
        title: "Connect to Whatsapp",
        content: "Link your assistant to WhatsApp to handle inquiries. Watch as it manages conversations and simplifies communication behind the scenes.",
        selector: "#onborda-step4",
        side: "left",
        showControls: true,
        showSkip: true
      },
      {
        icon: "🔔",
        title: "Stay Notified",
        content: "Stay on top of time-sensitive messages with instant notifications. Resolve your customers’ concerns quickly and efficiently to keep them satisfied.",
        selector: "#onborda-step5",
        side: "top",
        showControls: true,
        showSkip: true
      },
      {
        icon: "💬",
        title: "Manage Conversations",
        content: "Take control whenever needed. Use your inbox to view and respond to customer messages in real time.",
        selector: "#onborda-step6",
        side: "left",
        showControls: true,
        showSkip: true
      },
      {
        icon: "📊",
        title: "Track Your Analytics",
        content: "Monitor essential metrics like response times, engagement rates, and customer satisfaction to improve your business performance.",
        selector: "#onborda-step7",
        side: "top",
        showControls: true,
        showSkip: true
      }
    ]
  }
];