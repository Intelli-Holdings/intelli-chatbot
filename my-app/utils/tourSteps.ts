// utils/tourSteps.ts

import type { Tours } from '@/types/tour';

export const steps: Tours = [
  {
    tour: "mainTour",
    steps: [
      {
        icon: "👋",
        title: "Welcome to Intelli",
        content: "This is your Command Center. You can get started with Intelli from here; Let's explore the main features.",
        selector: "#step1",
        side: "left",
        showControls: true,
        showSkip: true
      },
      {
        icon: "🔧",
        title: "Create an Assistant",
        content: "Once you create an organization/team you can create assistants; Assistants belong to organizations; start building your first assistant by clicking the arrow on this card.",
        selector: "#step2",
        side: "right",
        showControls: true,
        showSkip: true
      },
      {
        icon: "🔔",
        title: "View Notifications",
        content: "When customers send time sensitive messages; we route them to you via our webhook so you get them instantly without delay.This is where you resolve escalations.",
        selector: "#step3",
        side: "top",
        showControls: true,
        showSkip: true
      },
      {
        icon: "💬",
        title: "View Conversations",
        content: "This is pretty much your inbox; you can view messages between your customers and the assistant here. And access our features like takeover.",
        selector: "#step4",
        side: "top",
        showControls: true,
        showSkip: true
      },
      {
        icon: "📊",
        title: "View Your Analytics",
        content: "Dive deep into how your organization uses Intelli with analytics; monitor messages, resolution times, engagement rates and sentiments.",
        selector: "#step5",
        side: "top",
        showControls: true,
        showSkip: true
      }
    ]
  }
];