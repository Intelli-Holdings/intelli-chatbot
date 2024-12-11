// app/lib/mint-config.ts

export const mintConfig = {
    name: 'Intelli Docs',
    logo: {
      dark: '/Intelli.svg',
      light: '/Intelli.svg',
    },
    favicon: '/favicon.svg',
    colors: {
      primary: "#0070f3",
      light: "#ffffff",
      dark: "#000000",
      anchors: {
        from: "#ff7e5f",
        to: "#feb47b",
      },
    },
    topbarLinks: [
      {
        name: 'Support',
        url: 'mailto:support@intelliconcierge.com',
      },
    ],
    topbarCtaButton: {
      name: 'Dashboard',
      url: 'https://intelliconcierge.com/dashboard',
    },
    secondaryMenu: [
      { name: "About Us", url: "/about" },
      { name: "Contact", url: "/contact" },
      // Add more secondary menu links as needed
    ],
    footerSocials: {
      x: 'https://x.com/intelliconcierge',
      github: 'https://github.com/Sqweya-AI',
      linkedin: 'https://www.linkedin.com/company/intelliconcierge',
    },
    navigation: [
      {
        group: "Documentation",
        pages: [
          { name: "Getting Started", url: "/docs/getting-started" },
          { name: "API Reference", url: "/docs/api" },
          { name: "Tutorials", url: "/docs/tutorials" },
        ],
      },
      {
        group: "Resources",
        pages: [
          { name: "Blog", url: "/blog" },
          { name: "Support", url: "/support" },
          { name: "Privacy Policy", url: "/privacy" },
        ],
      },
    ],
  };