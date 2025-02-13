import { ReleaseNote } from '@/types/release-notes';

export const releaseNotes: Record<string, ReleaseNote> = {
  "1.00": {
    version: "1.00",
    date: "February 11, 2025",
    sections: {
      whatsNew: {
        overview: "This update introduces major enhancements to Intelli's AI-driven platform...",
        features: [
          {
            title: "Live Chat for Website Widgets",
            description: "Businesses can now embed AI-powered live chat directly on their websites.",
            details: [
              "Real-time visitor engagement",
              "AI & human agent takeover",
              "Seamless dashboard monitoring"
            ]
          },
          // Add more features...
        ]
      },
      improvements: [
        {
          title: "Faster Data Fetching",
          description: "Organization-based queries improve API response times."
        },
        // Add more improvements...
      ],
      technicalDetails: [
        "Updated dependencies and refactored hooks for improved notification handling.",
        "Implemented logic to fetch app services by organization using new API endpoints.",
        // Add more technical details...
      ]
    }
  },
  "1.01": {
    version: "1.01",
    date: "March 1, 2025",
    sections: {
      whatsNew: {
        overview: "",
        features: []
      },
      improvements: [],
      technicalDetails: []
    }
  }
};