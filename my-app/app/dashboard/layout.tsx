import Header from "@/components/layout/header";
import type { Metadata } from "next";
import { Toaster } from "sonner";
import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

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
      <SidebarProvider
        style={
          {
            "--sidebar-width": "17rem",
          } as React.CSSProperties
        }
      >
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />          
          </header>
          <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <Toaster position="top-right" />
            <main className="">{children}</main>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
