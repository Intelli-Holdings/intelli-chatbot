"use client";
import { useState } from "react";
import Image from "next/image";

const WhatsAppDemo = () => {
  const [showQrCode, setShowQrCode] = useState(true);

  const whatsappNumber = "254769758405";
  const whatsappUrl = `https://wa.me/${whatsappNumber}`; // WhatsApp chat URL
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(whatsappUrl)}&size=300x300`; // Use URL encoding for the QR code API

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-96 text-center">
        <h1 className="text-2xl font-bold text-green-600 mb-4">AI WhatsApp Assistant</h1>
        <p className="mb-6">
          Scan the QR code to chat with our AI assistant on WhatsApp.
        </p>
        {showQrCode && (
          <div>
            <Image
              src={qrCodeUrl}
              alt="WhatsApp QR Code"
              className="mx-auto mb-4"
              width={150}
              height={150}
            />

            {/* Separator with "OR" */}
            <div className="flex items-center justify-center my-4">
              <hr className="w-full border-gray-300" />
              <span className="px-2 text-gray-500">OR</span>
              <hr className="w-full border-gray-300" />
            </div>
            <p className="mb-6">
              Click the button below to chat on WhatsApp.     
            </p>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition duration-200"
            >
              Continue with WhatsApp
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default WhatsAppDemo;