// app/lib/mint-config.ts
import { MintConfig } from '@/types/mintConfig';

export const mintConfig: MintConfig = {
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
          { name: "API Documentation", url: "/docs/api" },
          { name: "Tutorials", url: "/docs/tutorials" },
        ],
      },
      
    ],
  };