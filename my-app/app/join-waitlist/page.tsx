"use client";
import Waitlist from "@/components/component/waitlist";
import { Navbar } from "@/components/navbar";
import React from "react";
import WhatsAppSignup from "@/components/component/whatsappSignup";

export default function JoinWaitlist() {
  return (
    <div className="relative">
      <Navbar />
      <main className="pt-16">
        <section className="container mx-auto mt-8 px-4 lg:2/4 xl:w-2/3 ml-22.5 sm:w-3/4">
          <h1 className="text-5xl font-bold text-center text-left text-blue-600 mb-10">
          Join Our Waitlist & Become An Early-adopter
          </h1>
          
          <Waitlist />
        </section>

      </main>
    </div>
  );
}