// utils/tourSteps.ts

import type { Tours } from '@/types/tour';

export const steps: Tours = [
  {
    tour: "mainTour",
    steps: [
      {
        icon: "👋",
        title: "Welcome to Your Dashboard",
        content: "Get a quick view of what matters most today.",
        selector: "#onborda-step1",
        side: "bottom",
        showControls: true,
        showSkip: true
      },
      {
        icon: "🧭",
        title: "Navigation Menu",
        content: "Open the sidebar to reach assistants, channels, and analytics.",
        selector: "#tour-step-sidebar-toggle",
        side: "bottom",
        showControls: true,
        showSkip: true
      },
      {
        icon: "🔔",
        title: "Notifications",
        content: "Keep track of important alerts and updates here.",
        selector: "#tour-step-notifications",
        side: "left",
        showControls: true,
        showSkip: true
      },
      {
        icon: "📈",
        title: "Live Insights",
        content: "Monitor conversations, messages, and AI usage at a glance.",
        selector: "#tour-step-live-insights",
        side: "top",
        showControls: true,
        showSkip: true
      }
    ]
  },
  {
    tour: "gettingStartedTour",
    steps: [
      {
        icon: "👋",
        title: "Welcome to Intelli",
        content: "This is your command center for customer engagement.",
        selector: "#onborda-step1",
        side: "bottom",
        showControls: true,
        showSkip: true
      },
      {
        icon: "🧭",
        title: "Navigation Menu",
        content: "Use the sidebar to move between key areas quickly.",
        selector: "#tour-step-sidebar-toggle",
        side: "bottom",
        showControls: true,
        showSkip: true
      },
      {
        icon: "🔔",
        title: "Notifications",
        content: "Stay on top of alerts and new activity.",
        selector: "#tour-step-notifications",
        side: "left",
        showControls: true,
        showSkip: true
      },
      {
        icon: "💬",
        title: "Connect a Channel",
        content: "Start by connecting WhatsApp or your website widget.",
        selector: "#tour-step-connect-channel",
        side: "bottom",
        showControls: true,
        showSkip: true
      },
      {
        icon: "✨",
        title: "Create Your Assistant",
        content: "Train an AI assistant to respond with your business knowledge.",
        selector: "#tour-step-create-assistant",
        side: "bottom",
        showControls: true,
        showSkip: true
      },
      {
        icon: "🚀",
        title: "Engage Customers",
        content: "Launch conversations and start tracking growth.",
        selector: "#tour-step-engage-customers",
        side: "top",
        showControls: true,
        showSkip: true
      }
    ]
  }
];
