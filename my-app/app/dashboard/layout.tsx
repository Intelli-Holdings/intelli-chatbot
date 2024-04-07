import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import type { Metadata } from "next";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Intelli Dashboard",
  description: "This is your home for intuitive customer support.",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Toaster position="top-right" />
      <Header />
      <div className="flex h-screen">
       <Sidebar />
        <main className="w-full pt-16">{children}</main>
      </div>
    </>
  );
}
