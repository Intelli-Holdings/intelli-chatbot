import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import "@/app/globals.css";
import { Toaster } from 'sonner';
import { SpeedInsights } from "@vercel/speed-insights/next"
import Script from "next/script";


// Onborda
import { Onborda, OnbordaProvider } from "onborda";
import { steps } from "@/lib/steps";

// Custom Card
import CustomCard from "@/components/CustomCard";

//Next Step Js
import { NextStepProvider, NextStep } from 'nextstepjs';

// Aptabase Analytics 
import { AptabaseProvider } from '@aptabase/react';

import { PHProvider } from './providers'
import dynamic from 'next/dynamic'
import {
  ClerkProvider,
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs';

// Toast notifications
import ToastProvider from "@/components/ToastProvider";

const PostHogPageView = dynamic(() => import('./PostHogPageView'), {
  ssr: false,
})

const inter = Inter ({ subsets: ["latin"] });
const manrope = Manrope ({ subsets: ["latin"] });
<><link
  rel="icon"
  href="/icon.ico"
  type="image/ico"
  sizes="16x16, 32x32, 64x64, 128x128, 256x256, 512x512, 1024x1024" /><link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" /><link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" /><link rel="icon" type="image/svg+xml" href="/icon.svg" /></>

export const metadata = {
  title: 'Intelli - Effortless Customer Support',
  description: 'Intelli is a Customer Support Platform that streamlines conversations and interactions between businesses and their customers across multiple channels using AI.',
  openGraph: {
    title: 'Intelli',
    description: 'Effortless intelligent customer support for your business.',
    images: [
      {
        url: 'https://www.intelliconcierge.com/api/og', // URL to your dynamically generated OG image
        width: 1200,    // Specify the width of your image
        height: 630,    // Specify the height of your image
        alt: 'An alternative text for the image',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Intelli',
    description: 'Effortless intelligent customer support for your business.',
    images: [
      {
        url: 'https://www.intelliconcierge.com/api/og', // URL to your dynamically generated OG image
        width: 1200,
        height: 630,
        alt: 'An alternative text for the image',
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
          <SignedOut></SignedOut>
          <SignedIn></SignedIn>
          <body className={inter.className}>
            <PostHogPageView />
            <AptabaseProvider appKey="A-US-3705920924">
            <NextStepProvider>
              <NextStep steps={steps}>{children}</NextStep>
            </NextStepProvider>
            </AptabaseProvider>
            <ToastProvider />
          </body>
          <Script src="https://cdn.jsdelivr.net/npm/prismjs@1/components/prism-core.min.js" />
          <Script src="https://cdn.jsdelivr.net/npm/prismjs@1/plugins/autoloader/prism-autoloader.min.js" />
        </PHProvider>
      </html>
    </ClerkProvider>
  );
}