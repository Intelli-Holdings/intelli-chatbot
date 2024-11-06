"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="flex h-screen flex-col items-center justify-center bg-gradient-to-br from-white-900 via-white-800 to-white-700 p-6 text-center text-white space-y-8">
      {/* 404 Text */}
      <span className="bg-gradient-to-b from-teal-500 to-[#007fff]-500 bg-clip-text text-[8rem] font-extrabold leading-none text-transparent">
        404
      </span>
      
      {/* Heading */}
      <h2 className="font-heading text-4xl font-bold text-gray-900">
        Oops! That page is missing
      </h2>
      
      {/* Description */}
      <p className="max-w-md text-lg text-gray-500">
        Sorry, the page you are looking for doesn&apos;t exist or has been moved.
      </p>
      
      {/* CTA Buttons */}
      <div className="mt-8 flex gap-4">
        <Button 
          onClick={() => router.back()} 
          variant="default" 
          size="lg"
          className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-lg shadow-lg"
        >
          Go Back
        </Button>
        <Button 
          onClick={() => router.push("/dashboard")} 
          variant="ghost" 
          size="lg"
          className="border border-teal-500 text-teal-500 hover:bg-teal-500 hover:text-white px-8 py-3 rounded-lg shadow-lg"
        >
          Back to Home
        </Button>
      </div>
    </div>
  );
}
