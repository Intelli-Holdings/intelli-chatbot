"use client";
import WhatsAppSignup from "@/components/component/whatsappSignup";
import WhatsappOnboarding from "@/components/WhatsappOnboarding";
import React, { useEffect, useState } from "react";

export default function WhatsappPage() {

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6">Get Started With Whatsapp</h2>
      <div className="space-y-4">
       <WhatsappOnboarding />    
      </div>
    </div>
  );
}
