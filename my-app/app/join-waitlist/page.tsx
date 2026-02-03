"use client"
import Waitlist from "@/components/component/waitlist"
import { Navbar } from "@/components/navbar"

export default function JoinWaitlist() {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar />

      <main className="container mx-auto px-4 pt-20 pb-16 flex justify-center items-center min-h-[calc(100vh-80px)]">
        <div className="w-full max-w-md">
          <Waitlist />
        </div>
      </main>

      {/* Background decoration - optional */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-1/4 left-1/4 w-1/2 h-1/2 bg-[#007fff]/5 rounded-full blur-3xl"></div>
      </div>
    </div>
  )
}

