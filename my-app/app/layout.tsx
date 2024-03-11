import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Intelli Concierge",
  description: "Your intelligent Assistant",
  keywords: ["Intelli Concierge", "Concierge", "Assistant", "Chatbot", "Voicebot", "AI", "ML", "NLP", "RPA", "Automation", "Customer Support", "Customer Service", "Customer Experience", "CX", "Customer Success", "Customer Satisfaction", "Customer Feedback", "Customer Journey", "Customer Relationship", "Customer Loyalty", "Customer Retention", "Customer Acquisition", "Customer Engagement", "Customer Advocacy", "Customer Lifetime Value", "Customer Churn", "Customer Segmentation", "Customer Persona", "Customer Data", "Customer Analytics", "Customer Insights", "Customer Intelligence", "Customer Feedback", "Customer Survey", "Customer Review", "Customer Testimonial", "Customer Complaint", "Customer Query", "Customer Request", "Customer Ticket", "Customer Case", "Customer Issue", "Customer Problem", "Customer Solution", "Customer Satisfaction Score", "Customer Effort Score", "Net Promoter Score", "Customer Journey Map", "Customer Persona", "Customer Data Platform", "Customer Relationship Management", "Customer Experience Management", "Customer Success Management", "Customer Support Management", "Customer Service Management", "Customer Feedback Management", "Customer Survey Management", "Customer Review Management", "Customer Testimonial Management", "Customer Complaint Management", "Customer Query Management", "Customer Request Management", "Customer Ticket Management", "Customer Case Management", "Customer Issue Management", "Customer Problem Management", "Customer Solution Management", "Customer Satisfaction Score Management", "Customer Effort Score Management", "Net Promoter Score Management", "Customer Journey Map Management", "Customer Persona Management", "Customer Data Platform Management", "Customer Relationship Management", "Customer Experience Management", "Customer Success Management", "Customer Support Management", "Customer Service Management", "Customer Feedback Management", "Customer Survey Management", "Customer Review Management", "Customer Testimonial Management", "Customer Complaint Management", "Customer Query Management", "Customer Request Management", "Customer Ticket Management", "Customer Case Management", "Customer Issue Management", "Customer Problem Management", "Customer Solution Management", "Customer Satisfaction Score Management", "Customer Effort Score Management", "Net Promoter Score Management", "Customer Journey Map Management", "Customer Persona Management", "Customer Data Platform Management", "Customer Relationship Management", "Customer Experience Management", "Customer Success Management", "Customer Support Management", "Customer Service Management", "Customer Feedback Management", "Customer Survey Management", "Customer Review Management", "Customer Testimonial Management", "Customer Complaint Management", "Customer Query Management", "Customer Request Management", "Customer Ticket Management", "Customer Case Management"]

};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
