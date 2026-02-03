"use client"

import { useEffect, useState } from "react"
import Confetti from "canvas-confetti"

export default function ConfettiEffect() {
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 })

  useEffect(() => {
    const updateWindowSize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight })
    }

    updateWindowSize()
    window.addEventListener("resize", updateWindowSize)

    return () => window.removeEventListener("resize", updateWindowSize)
  }, [])

  useEffect(() => {
    if (windowSize.width && windowSize.height) {
      Confetti({
        particleCount: 200,
        // additional options can be added here
      });
    }
  }, [windowSize]);

  return null;
}

