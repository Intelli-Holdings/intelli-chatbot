// utils/tourSteps.ts

import type { Tours } from '@/types/tour';

export const steps: Tours = [
  {
    tour: "mainTour",
    steps: [
      {
        icon: "👋",
        title: "Welcome to Intelli",
        content: "This is your Command Center.",
        selector: "#onborda-step1",
        side: "left",
        showControls: true,
        showSkip: true
      },
      {
        icon: "🪄",
        title: "Create an Assistant",
        content: "An assistant works in the background for your business.",
        selector: "#onborda-step2",
        side: "right",
        showControls: true,
        showSkip: true
      },
      {
        icon: "🌐",
        title: "Create a Website Widget",
        content: "The website widget is powered by your assistant. Create, customize widget color, name and custome greeting here.",
        selector: "#onborda-step3",
        side: "right",
        showControls: true,
        showSkip: true
      },
      {
        icon: "📦",
        title: "Create a Whatsapp Package",
        content: "This package connects your assistant to your Whatsapp account and does some magic behind the scenes.",
        selector: "#onborda-step4",
        side: "right",
        showControls: true,
        showSkip: true
      },
      {
        icon: "🔔",
        title: "View Notifications",
        content: "When customers send time sensitive messages; you get them instantly and resolve their concerns.",
        selector: "#onborda-step5",
        side: "top",
        showControls: true,
        showSkip: true
      },
      {
        icon: "💬",
        title: "View Conversations",
        content: "This is your inbox; you can view and respond to messages from your customers here when you takeover the AI.",
        selector: "#onborda-step6",
        side: "top",
        showControls: true,
        showSkip: true
      },
      {
        icon: "📊",
        title: "View Your Analytics",
        content: "Monitor messages, resolution times, engagement rates and any other usage metric we measure about your business.",
        selector: "#onborda-step7",
        side: "top",
        showControls: true,
        showSkip: true
      }
    ]
  }
];