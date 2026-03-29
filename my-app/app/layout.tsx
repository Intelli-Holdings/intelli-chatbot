import type { Metadata } from "next";
import { Inter, DM_Sans } from "next/font/google";
import "@/app/globals.css";
import { SpeedInsights } from "@vercel/speed-insights/next"
import Script from "next/script";

import { PHProvider } from './providers'
import { ClerkProvider } from '@clerk/nextjs';

// AEO: Organization + WebSite JSON-LD structured data (injected globally)
import { OrganizationJsonLd, WebSiteJsonLd } from "@/components/seo/JsonLd";

// Client-only dynamic components (ssr: false requires "use client")
import ClientLayoutComponents from './client-layout-components'

const inter = Inter({ subsets: ["latin"] });
const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  icons: {
    icon: [
      { url: '/Intelli.svg', type: 'image/svg+xml' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
  },
  title: 'Intelli — AI-Powered WhatsApp & Multi-Channel Customer Engagement Platform',
  description:
    'Intelli is an AI-powered platform that helps businesses manage customer conversations across WhatsApp, Instagram, Messenger, email, and web chat. Automate support, run campaigns, and engage customers at scale.',
  keywords: [
    'AI customer support',
    'WhatsApp Business API',
    'chatbot automation',
    'customer engagement platform',
    'AI helpdesk',
    'WhatsApp AI assistant',
    'multi-channel support',
    'Intelli',
    'Intelli Holdings Inc.',
    'WhatsApp Cloud API',
    'AI WhatsApp assistant',
  ],
  alternates: {
    canonical: 'https://www.intelliconcierge.com',
  },
  openGraph: {
    siteName: 'Intelli — AI Customer Engagement Platform',
    url: 'https://www.intelliconcierge.com',
    title: 'Intelli — AI-Powered WhatsApp & Multi-Channel Customer Engagement Platform',
    description:
      'Intelli is an AI-powered platform that helps businesses manage customer conversations across WhatsApp, Instagram, Messenger, email, and web chat. Automate support, run campaigns, and engage customers at scale.',
    type: 'website',
    images: [
      {
        url: 'https://www.intelliconcierge.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Intelli AI-Powered Customer Engagement Platform by Intelli Holdings Inc.',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Intelli — AI-Powered WhatsApp & Multi-Channel Customer Engagement Platform',
    description:
      'Intelli is an AI-powered platform that helps businesses manage customer conversations across WhatsApp, Instagram, Messenger, email, and web chat. Automate support, run campaigns, and engage customers at scale.',
    images: [
      {
        url: 'https://www.intelliconcierge.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Intelli AI-Powered Customer Engagement Platform by Intelli Holdings Inc.',
      },
    ],
  },
};



export const viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' }
  ]
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <head>
          {/* AEO: Global Organization + WebSite structured data for answer engine citation */}
          <OrganizationJsonLd />
          <WebSiteJsonLd />
          <Script async src="https://www.googletagmanager.com/gtag/js?id=G-2V9CBMTJHN"></Script>
          <Script id="google-analytics" strategy="lazyOnload">
            {
              `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-2V9CBMTJHN');
    `
            }
          </Script>
        </head>
        <PHProvider>
          <SpeedInsights />
          <body className={`${inter.className} ${dmSans.variable}`}>
            <ClientLayoutComponents />
            {children}
          </body>
          <Script src="https://cdn.jsdelivr.net/npm/prismjs@1/components/prism-core.min.js" />
          <Script src="https://cdn.jsdelivr.net/npm/prismjs@1/plugins/autoloader/prism-autoloader.min.js" />
        </PHProvider>
      </html>
    </ClerkProvider>
  );
}