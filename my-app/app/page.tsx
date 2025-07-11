"use client";
import React from "react";
import { useState } from "react";
import { Home } from "@/components/component/home"
import Head from "next/head";
import { ChatWidget } from "@/components/ChatWidget";

export default function Homepage() {
  return (
    <>
      <main className="min-h-screen p-2 bg-white">
      <Home />
      <ChatWidget />
    </main>
    </>
    
  );
}
