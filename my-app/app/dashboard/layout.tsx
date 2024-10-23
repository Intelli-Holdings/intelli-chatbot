import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import type { Metadata } from "next";
import { Toaster } from "sonner";

// Onborda
import { Onborda, OnbordaProvider } from "onborda";
import { steps } from "@/lib/steps";


// Custom Card
import CustomCard from "@/components/CustomCard";


export const metadata: Metadata = {
  title: "Intelli Dashboard",
  description: "The Dashboard for Businesses that care about their customers.",
};

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div suppressHydrationWarning>     
     <Toaster position="top-right" />
      <Header />
      <div className="flex h-screen">
        <Sidebar />
        <main className="w-full pt-16">        
          {children}       
          </main>
      </div>
      
    </div>
  );
}
