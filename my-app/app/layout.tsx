import type { Metadata } from "next";
import { Inter, DM_Sans } from "next/font/google";
import "@/app/globals.css";
import { SpeedInsights } from "@vercel/speed-insights/next"
import Script from "next/script";

import { PHProvider } from './providers'
import dynamic from 'next/dynamic'
import { ClerkProvider } from '@clerk/nextjs';

// AEO: Organization + WebSite JSON-LD structured data (injected globally)
import { OrganizationJsonLd, WebSiteJsonLd } from "@/components/seo/JsonLd";

// Dynamically loaded non-critical components (reduces initial JS bundle)
const PostHogPageView = dynamic(() => import('./PostHogPageView'), { ssr: false })
const ConsentGate = dynamic(() => import('@/components/consent-gate'), { ssr: false })
const AttentionBadge = dynamic(() => import('@/components/AttentionBadge'), { ssr: false })
const PointerEventsFix = dynamic(() => import('@/components/pointer-events-fix'), { ssr: false })
const ToastProvider = dynamic(() => import('@/components/ToastProvider'), { ssr: false })
const TourProviderWrapper = dynamic(() => import('@/components/tour-provider-wrapper'), { ssr: false })

const inter = Inter({ subsets: ["latin"] });
const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  weight: ['400', '500', '600', '700'],
});
<><link
  rel="icon"
  href="/Intelli.svg"
  type="image/svg"
  sizes="16x16, 32x32, 64x64, 128x128, 256x256, 512x512, 1024x1024" /><link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" /><link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" /><link rel="icon" type="image/svg+xml" href="/icon.svg" /></>

export const metadata: Metadata = {
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
            <ConsentGate /> {/* renders MetaPixel only after consent */}
            <AttentionBadge />
            <PostHogPageView />
            <PointerEventsFix />
            <TourProviderWrapper>
              {children}
            </TourProviderWrapper>
            <ToastProvider />
          </body>
          <Script src="https://cdn.jsdelivr.net/npm/prismjs@1/components/prism-core.min.js" />
          <Script src="https://cdn.jsdelivr.net/npm/prismjs@1/plugins/autoloader/prism-autoloader.min.js" />
        </PHProvider>
      </html>
    </ClerkProvider>
  );
}