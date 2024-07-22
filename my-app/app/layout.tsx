import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "@/app/globals.css";
import { Toaster } from 'sonner';
import { Analytics } from "@vercel/analytics/react"
import Script from "next/script";

import { PHProvider } from './providers'
import dynamic from 'next/dynamic'
import {
  ClerkProvider,
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton
} from '@clerk/nextjs';

const PostHogPageView = dynamic(() => import('./PostHogPageView'), {
  ssr: false,
})

const inter = Manrope({ subsets: ["latin"] });
<link
  rel="icon"
  href="/icon.ico"
  type="image/ico"
  sizes="16x16"
/>
export const metadata: Metadata = {
  title: "Intelli Concierge",
  description: "Your Intelligent Assistant",
  
  icons: {
    icon: '/icon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png'
  },
  keywords: ["Increase Lead Conversions", "Increase Hotel Bookings", "Increase Revenue for your Hotel", "Intelligent Chatbot", "Global Leader", "Omichannel ", "Automate your sales and customer support", "Put Customer Inquiries on Autopilot", "RPA", "Automation", "Customer Support", "Customer Service", "Customer Experience", "CX", "Customer Success", "Customer Satisfaction", "Customer Feedback", "Customer Journey", "Customer Relationship", "Customer Loyalty", "Customer Retention", "Customer Acquisition", "Customer Engagement", "Customer Advocacy", "Customer Lifetime Value", "Customer Churn", "Customer Segmentation", "Customer Persona", "Customer Data", "Customer Analytics", "Customer Insights", "Customer Intelligence", "Customer Feedback", "Customer Survey", "Customer Review", "Customer Testimonial", "Customer Complaint", "Customer Query", "Customer Request", "Customer Ticket", "Customer Case", "Customer Issue", "Customer Problem", "Customer Solution", "Customer Satisfaction Score", "Customer Effort Score", "Net Promoter Score", "Customer Journey Map", "Customer Persona", "Customer Data Platform", "Customer Relationship Management", "Customer Experience Management", "Customer Success Management", "Customer Support Management", "Customer Service Management", "Customer Feedback Management", "Customer Survey Management", "Customer Review Management", "Customer Testimonial Management", "Customer Complaint Management", "Customer Query Management", "Customer Request Management", "Customer Ticket Management", "Customer Case Management", "Customer Issue Management", "Customer Problem Management", "Customer Solution Management", "Customer Satisfaction Score Management", "Customer Effort Score Management", "Net Promoter Score Management", "Customer Journey Map Management", "Customer Persona Management", "Customer Data Platform Management", "Customer Relationship Management", "Customer Experience Management", "Customer Success Management", "Customer Support Management", "Customer Service Management", "Customer Feedback Management", "Customer Survey Management", "Customer Review Management", "Customer Testimonial Management", "Customer Complaint Management", "Customer Query Management", "Customer Request Management", "Customer Ticket Management", "Customer Case Management", "Customer Issue Management", "Customer Problem Management", "Customer Solution Management", "Customer Satisfaction Score Management", "Customer Effort Score Management", "Net Promoter Score Management", "Customer Journey Map Management", "Customer Persona Management", "Customer Data Platform Management", "Customer Relationship Management", "Customer Experience Management", "Customer Success Management", "Customer Support Management", "Customer Service Management", "Customer Feedback Management", "Customer Survey Management", "Customer Review Management", "Customer Testimonial Management", "Customer Complaint Management", "Customer Query Management", "Customer Request Management", "Customer Ticket Management", "Customer Case Management"]

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
      
      <SignedOut>          <SignInButton />        </SignedOut>        <SignedIn>          <UserButton />        </SignedIn>
      <body className={inter.className}>
      <PostHogPageView /> 
        {children}
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
