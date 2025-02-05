"use client";
import React from "react";
import { useState } from "react";
import { Home } from "@/components/component/home";
import TwoColumnFooter from "@/components/sections/footer";
import PopupModal from "@/components/component/popupModal";
import Head from "next/head";

export default function Homepage() {
  return (
    <>
      <main className="min-h-screen p-2 bg-white">
      <Home />
      <PopupModal />
    </main>
    </>
    
  );
}
