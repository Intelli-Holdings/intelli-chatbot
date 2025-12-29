// utils/tourSteps.ts

import type { Tours } from '@/types/tour';

export const steps: Tours = [
  {
    tour: "mainTour",
    steps: [
      {
        icon: "👋",
        title: "Welcome to Intelli",
        content: "Start here to get a quick snapshot of your workspace and access the tour anytime.",
        selector: "#onborda-step1",
        side: "left",
        showControls: true,
        showSkip: true
      },
      {
        icon: "📈",
        title: "Live Insights",
        content: "Monitor key KPIs and performance trends compared to last month.",
        selector: "#onborda-step2",
        side: "right",
        showControls: true,
        showSkip: true
      },
      {
        icon: "👥",
        title: "Contact Management",
        content: "Track total contacts, follow-ups, conversions, and inbound leads at a glance.",
        selector: "#onborda-step3",
        side: "left",
        showControls: true,
        showSkip: true
      },
      {
        icon: "⚠️",
        title: "Priority Issues",
        content: "Stay on top of time-sensitive requests and high priority conversations.",
        selector: "#onborda-step4",
        side: "right",
        showControls: true,
        showSkip: true
      },
      {
        icon: "⚙️",
        title: "Token Usage",
        content: "Keep an eye on AI usage and costs so you can plan ahead.",
        selector: "#onborda-step5",
        side: "top",
        showControls: true,
        showSkip: true
      },
      {
        icon: "💬",
        title: "Conversations",
        content: "Review total and active conversations, response times, and satisfaction.",
        selector: "#onborda-step6",
        side: "left",
        showControls: true,
        showSkip: true
      },
      {
        icon: "🚀",
        title: "Launch Channels",
        content: "Create assistants and deploy them across your customer channels.",
        selector: "#onborda-step7",
        side: "right",
        showControls: true,
        showSkip: true
      }
    ]
  }
];
