"use client";

import Image from "next/image";

const whatsappNumber = "254769758405";
const whatsappUrl = `https://wa.me/${whatsappNumber}`;
const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(whatsappUrl)}&size=300x300`;

export default function WhatsAppDemo() {
  return (
    <div className="flex flex-col items-center">
      <div className="bg-white border border-[#1a1a1a]/[0.08] p-8 rounded-md w-full max-w-sm text-center">
        <p className="text-sm font-semibold text-[#1a1a1a] mb-1">Try It Live</p>
        <p className="text-[13px] text-[#1a1a1a]/55 mb-5">
          Scan the QR code or tap the button to chat with our AI assistant on WhatsApp.
        </p>

        <Image
          src={qrCodeUrl}
          alt="Scan this QR code to start a conversation with Intelli's AI WhatsApp Assistant"
          className="mx-auto mb-4"
          width={150}
          height={150}
        />

        <div className="flex items-center justify-center my-4">
          <hr className="w-full border-[#1a1a1a]/[0.08]" />
          <span className="px-3 text-xs text-[#1a1a1a]/30 font-medium">OR</span>
          <hr className="w-full border-[#1a1a1a]/[0.08]" />
        </div>

        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block px-6 py-3 text-sm font-semibold text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors"
        >
          Chat on WhatsApp
        </a>
      </div>
    </div>
  );
}
