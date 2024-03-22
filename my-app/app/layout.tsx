import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import { Toaster } from 'sonner';
import { Analytics } from "@vercel/analytics/react"

const inter = Manrope({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Intelli Concierge",
  description: "Your Intelligent Assistant",
  keywords: ["Increase Lead Conversions", "Increase Hotel Bookings", "Increase Revenue for your Hotel", "Intelligent Chatbot", "Global Leader", "Omichannel ", "Automate your sales and customer support", "Put Customer Inquiries on Autopilot", "RPA", "Automation", "Customer Support", "Customer Service", "Customer Experience", "CX", "Customer Success", "Customer Satisfaction", "Customer Feedback", "Customer Journey", "Customer Relationship", "Customer Loyalty", "Customer Retention", "Customer Acquisition", "Customer Engagement", "Customer Advocacy", "Customer Lifetime Value", "Customer Churn", "Customer Segmentation", "Customer Persona", "Customer Data", "Customer Analytics", "Customer Insights", "Customer Intelligence", "Customer Feedback", "Customer Survey", "Customer Review", "Customer Testimonial", "Customer Complaint", "Customer Query", "Customer Request", "Customer Ticket", "Customer Case", "Customer Issue", "Customer Problem", "Customer Solution", "Customer Satisfaction Score", "Customer Effort Score", "Net Promoter Score", "Customer Journey Map", "Customer Persona", "Customer Data Platform", "Customer Relationship Management", "Customer Experience Management", "Customer Success Management", "Customer Support Management", "Customer Service Management", "Customer Feedback Management", "Customer Survey Management", "Customer Review Management", "Customer Testimonial Management", "Customer Complaint Management", "Customer Query Management", "Customer Request Management", "Customer Ticket Management", "Customer Case Management", "Customer Issue Management", "Customer Problem Management", "Customer Solution Management", "Customer Satisfaction Score Management", "Customer Effort Score Management", "Net Promoter Score Management", "Customer Journey Map Management", "Customer Persona Management", "Customer Data Platform Management", "Customer Relationship Management", "Customer Experience Management", "Customer Success Management", "Customer Support Management", "Customer Service Management", "Customer Feedback Management", "Customer Survey Management", "Customer Review Management", "Customer Testimonial Management", "Customer Complaint Management", "Customer Query Management", "Customer Request Management", "Customer Ticket Management", "Customer Case Management", "Customer Issue Management", "Customer Problem Management", "Customer Solution Management", "Customer Satisfaction Score Management", "Customer Effort Score Management", "Net Promoter Score Management", "Customer Journey Map Management", "Customer Persona Management", "Customer Data Platform Management", "Customer Relationship Management", "Customer Experience Management", "Customer Success Management", "Customer Support Management", "Customer Service Management", "Customer Feedback Management", "Customer Survey Management", "Customer Review Management", "Customer Testimonial Management", "Customer Complaint Management", "Customer Query Management", "Customer Request Management", "Customer Ticket Management", "Customer Case Management"]

};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <Analytics />
      <body className={inter.className}>{children}

      <Toaster
      toastOptions={{
        unstyled: true,
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
    </html>
  );
}
