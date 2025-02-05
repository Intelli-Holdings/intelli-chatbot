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
    <Head>
        <title>Intelli</title>
        <meta name="description" content="Effortless intelligent customer support for your business." />
        <meta property="og:url" content="https://intelliconcierge.com" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Intelli" />
        <meta property="og:description" content="Effortless intelligent customer support for your business." />
        <meta property="og:image" content="https://opengraph.b-cdn.net/production/images/2977506a-36c6-48fc-ba42-cecaae987eb6.png?token=yhX75NIxl7JNr-KYOF9OzCI8xIEvLMHhc6wi33o10dw&height=630&width=1200&expires=33274744940" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta property="twitter:domain" content="intelliconcierge.com" />
        <meta property="twitter:url" content="https://intelliconcierge.com" />
        <meta name="twitter:title" content="Intelli" />
        <meta name="twitter:description" content="Effortless intelligent customer support for your business." />
        <meta name="twitter:image" content="https://opengraph.b-cdn.net/production/images/2977506a-36c6-48fc-ba42-cecaae987eb6.png?token=yhX75NIxl7JNr-KYOF9OzCI8xIEvLMHhc6wi33o10dw&height=630&width=1200&expires=33274744940" />
      </Head>

      <main className="min-h-screen p-2 bg-white">
      <Home />
      <PopupModal />
    </main>
    </>
    
  );
}
