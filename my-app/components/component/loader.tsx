import { useState, useEffect } from "react";
import { Progress } from "@/components/ui/progress";
import Image from "next/image"
import BounceLoader from "@/components/bounce-loader";
import PulsatingLoader from "@/components/pulsating-loader";
import ClassicLoader from "@/components/classic-loader";

export function Loader() {

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-white">
        <>
          <div className="mb-4">
            <Image
              alt="Intelli logo"
              className="h-24 w-24"
              height="100"
              src="/Logo.svg"
              style={{
                aspectRatio: "100/100",
                objectFit: "cover",
              }}
              width="100"
            />
            <PulsatingLoader />
          </div>
        </>

    </div>
  );
}