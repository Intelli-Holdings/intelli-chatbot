"use client";
import React from "react";
import { useState } from "react";
import { Home } from "@/components/component/home";
import Privacy from "@/components/privacy";

export default function Homepage() {
  const [showPrivacy, setShowPrivacy] = useState(false);

  return (
    <main className="min-h-screen p-4 bg-white">
      <Home />
      <footer className="w-full bg-white-500">
        <div className="container-fluid ">
          <p className="text-sm text-center text-gray-900">
            Need help? Get in touch with us.
          </p>
          <p className="mt-2 text-xs text-center text-gray-900">
            <a href="/terms">Terms of Use</a> |
            <a href="/privacy" >
              Privacy Policy
            </a>{"/privacy"}
            | Data Protection Policy | Socials | © IntelliConcierge 2024
          </p>
        </div>
      </footer>
      {showPrivacy && <Privacy />}
    </main>
  );
}
