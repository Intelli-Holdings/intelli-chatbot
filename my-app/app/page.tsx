import React from "react";
import { Home } from "@/components/component/home";

export default function Homepage() {
  return (
    <main className="min-h-screen p-4 bg-white">     
          <Home/>
          <footer className="w-full bg-white-500">
        <div className="container-fluid ">
          <p className="text-sm text-center text-gray-900">
            Need help? Get in touch with us.
          </p>
          <p className="mt-2 text-xs text-center text-gray-900">
            Terms of Use | Privacy Notice | Data Policy | Socials | ©
            IntelliConcierge 2024
          </p>
        </div>
      </footer>
    </main>
  );
}
