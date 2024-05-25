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
              height={40}    
              width={40}         
              src="/Intelli.svg"             
            />
            
          </div>
          <PulsatingLoader />
        </>

    </div>
  );
}