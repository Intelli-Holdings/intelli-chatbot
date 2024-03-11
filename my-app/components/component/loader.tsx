import { useState, useEffect } from "react";
import { Progress } from "@/components/ui/progress";
import Image from "next/image"

export function Loader() {
  const [progress, setProgress] = useState(0);
  const loadingTime = 3000; // Replace 3000 with the actual loading time

  useEffect(() => {
    const timer = setTimeout(() => setProgress(66), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-white">
      {progress < 100 ? (
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
          </div>
          <div className="text-xl font-semibold">Intelli</div>
         
          <Progress className="mt-4 w-64" value={progress} />
        </>
      ) : (
        <div>Authentication completed.</div>
      )}
    </div>
  );
}