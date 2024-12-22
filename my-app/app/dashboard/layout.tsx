// app/layout.tsx or the corresponding layout file
import { Toaster } from "sonner";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import CreateOrganizationPopup from "@/components/CreateOrganizationPopup"; // Import the popup component

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div suppressHydrationWarning>
      <Toaster position="top-right" />
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="w-full ">
          <CreateOrganizationPopup /> {/* Show the popup if the user needs to create an organization */}
          {children}
        </main>
      </div>
    </div>
  );
}
