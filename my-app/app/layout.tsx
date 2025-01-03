import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import "@/app/globals.css";
import { Toaster } from 'sonner';
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/next"


// Onborda
import { Onborda, OnbordaProvider } from "onborda";
import { steps } from "@/lib/steps";

// Custom Card
import CustomCard from "@/components/CustomCard";

//Next Step Js
import { NextStepProvider, NextStep } from 'nextstepjs';

import Script from "next/script";

// Website widget 
// import { ChatPreview } from "@/components/chat-preview";

import { PHProvider } from './providers'
import dynamic from 'next/dynamic'
import {
  ClerkProvider,
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs';

const PostHogPageView = dynamic(() => import('./PostHogPageView'), {
  ssr: false,
})

const inter = Inter ({ subsets: ["latin"] });
const manrope = Manrope ({ subsets: ["latin"] });
<link
  rel="icon"
  href="/icon.ico"
  type="image/ico"
  sizes="16x16"
/>
export const metadata: Metadata = {
  title: "Intelli - Effortless Customer Support ",
  description: "Intelli is a Customer Support Platform that streamlines conversations and interactions between businesses and their customers across multiple channels using AI. Our AI SDK can be integrated into your website, whatsapp, Instagram and other social media platforms to handle inquiries and help your business to never miss a customer message.",
  
  icons: {
    icon: '/icon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png'
  },
  openGraph: {
    title: 'Intelli',
    description: 'Effortless intelligent customer support for your business.',
    images: '/Intelli.svg', 
  },
  keywords: ["Increase Lead Conversions", "Intelligent Chatbot", "Global Leader", "Omichannel ", "Automate your sales and customer support", "Put Customer Inquiries on Autopilot", "RPA", "Automation", "Customer Support", "Customer Service", "Customer Experience", "CX", "Customer Success", "Customer Satisfaction", "Customer Feedback", "Customer Journey", "Customer Relationship", "Customer Loyalty", "Customer Retention", "Customer Acquisition", "Customer Engagement", "Customer Advocacy", "Customer Lifetime Value", "Customer Churn", "Customer Segmentation", "Customer Persona", "Customer Data", "Customer Analytics", "Customer Insights", "Customer Intelligence", "Customer Feedback", "Customer Survey", "Customer Review", "Customer Testimonial", "Customer Complaint", "Customer Query", "Customer Request", "Customer Ticket", "Customer Case", "Customer Issue", "Customer Problem", "Customer Solution", "Customer Satisfaction Score", "Customer Effort Score", "Net Promoter Score", "Customer Journey Map", "Customer Persona", "Customer Data Platform", "Customer Relationship Management", "Customer Experience Management", "Customer Success Management", "Customer Support Management", "Customer Service Management", "Customer Feedback Management", "Customer Survey Management", "Customer Review Management", "Customer Testimonial Management", "Customer Complaint Management", "Customer Query Management", "Customer Request Management", "Customer Ticket Management", "Customer Case Management"]

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
    <PHProvider>
      <Analytics />      
      <SpeedInsights />
      <SignedOut>   
      </SignedOut>        
      <SignedIn>            
      </SignedIn> 
     
      <body className={inter.className}>
      <PostHogPageView /> 
      <NextStepProvider>
            <NextStep
            steps={steps}
            >
        {children}
        </NextStep>   
      </NextStepProvider>
       
      <Toaster
      toastOptions={{
        classNames: {
          error: 'bg-red-400',
          success: 'text-green-400',
          warning: 'text-yellow-400',
          info: 'bg-blue-400',
        },
      }}

      richColors
    />
  
    
  
      </body>
       </PHProvider>
       <Script src="https://cdn.jsdelivr.net/npm/prismjs@1/components/prism-core.min.js" />
       <Script src="https://cdn.jsdelivr.net/npm/prismjs@1/plugins/autoloader/prism-autoloader.min.js" />
    </html>
    </ClerkProvider>
  );
}