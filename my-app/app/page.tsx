"use client";
import React from "react";
import { useState } from "react";
import { Home } from "@/components/component/home";
import TwoColumnFooter from "@/components/sections/footer";

export default function Homepage() {
  const [showPrivacy, setShowPrivacy] = useState(false);

  return (
    <main className="min-h-screen p-4 bg-white">
      <Home />
      <TwoColumnFooter />
    </main>
  );
}
