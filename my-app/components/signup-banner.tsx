"use client"

import type React from "react"
import { useEffect, useRef } from "react"
import { Award, Coffee, Star, Sparkles } from "lucide-react"
import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"

const Banner: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Animated background particles effect
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    const particles: {
      x: number
      y: number
      size: number
      speedX: number
      speedY: number
      color: string
    }[] = []

    // Create particles
    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 3 + 1,
        speedX: Math.random() * 0.5 - 0.25,
        speedY: Math.random() * 0.5 - 0.25,
        color: `rgba(255, 255, 255, ${Math.random() * 0.2 + 0.1})`,
      })
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      particles.forEach((particle) => {
        ctx.fillStyle = particle.color
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        ctx.fill()

        particle.x += particle.speedX
        particle.y += particle.speedY

        if (particle.x < 0 || particle.x > canvas.width) {
          particle.speedX = -particle.speedX
        }

        if (particle.y < 0 || particle.y > canvas.height) {
          particle.speedY = -particle.speedY
        }
      })

      requestAnimationFrame(animate)
    }

    animate()

    return () => {
      // Cleanup
    }
  }, [])

  return (
    <div className="relative bg-gradient-to-r from-[#007fff] via-[#3395ff] to-[#66b2ff] rounded-3xl p-10 flex items-center justify-between overflow-hidden shadow-xl">
      {/* Animated background canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* Glassmorphism overlay */}
      <div className="absolute inset-0 bg-white/10 backdrop-blur-sm" />

      {/* Left Section: Text, Badges, and Buttons */}
      <div className="flex flex-col space-y-8 z-10 max-w-xl">


        {/* Main Text */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <h1 className="text-5xl font-bold text-white leading-tight tracking-tight drop-shadow-md">
            Ready to elevate your <br />
            <span className="bg-gradient-to-r from-white to-[#e6f3ff] text-transparent bg-clip-text">
              customer experience?
            </span>
          </h1>

          <p className="mt-4 text-blue-50 text-lg max-w-md">
            Join great businesses that have transformed their customer support with our platform.
          </p>
        </motion.div>

        {/* Buttons */}
        <motion.div
          className="flex flex-wrap gap-4"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <Link href="/auth/sign-up">
            <button className="group relative bg-white text-[#007fff] font-semibold py-3 px-8 rounded-3xl hover:bg-blue-50 transition-all duration-300 shadow-lg">
              <span className="flex items-center gap-2">
                Get started for free
                <Sparkles className="h-4 w-4 transition-transform group-hover:rotate-12" />
              </span>
              <span className="absolute inset-0 rounded-full bg-white/40 blur-md -z-10 opacity-0 group-hover:opacity-100 transition-opacity"></span>
            </button>
          </Link>

          <a href="https://cal.com/intelli/book-a-demo" target="_blank" rel="noopener noreferrer">
            <button className="relative overflow-hidden bg-transparent border-2 border-white text-white font-semibold py-3 px-8 rounded-3xl group transition-all duration-300">
              <span className="relative z-10 flex items-center gap-2 group-hover:text-[#007fff]">Book a demo</span>
              <span className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-300"></span>
              <span className="absolute inset-0 opacity-0 group-hover:opacity-100 text-[#007fff] flex items-center justify-center transition-opacity duration-300 font-semibold">
                Book a demo
              </span>
            </button>
          </a>
        </motion.div>
      </div>

      {/* Right Section: Illustration */}
      <motion.div
        className="relative z-10 hidden md:block"
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.4 }}
      >
        <div className="relative">
          {/* Main circle */}
          <div className="h-80 w-80 rounded-full bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-md flex items-center justify-center shadow-xl border border-white/20">
            {/* Inner elements */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-64 w-64 rounded-full bg-gradient-to-tr from-[#007fff]/30 to-[#66b2ff]/30 backdrop-blur-sm animate-pulse"></div>
            </div>

            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-48 w-48 rounded-full bg-gradient-to-bl from-[#66b2ff]/20 to-[#007fff]/20 backdrop-blur-sm"></div>
            </div>
            
            {/* Intelli Logo */}
            <motion.div 
              className="absolute z-10 flex items-center justify-center"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ 
                duration: 1.2, 
                delay: 1,
                type: "spring",
                stiffness: 100
              }}
            >
              <div className="relative w-32 h-32">
                <Image 
                  src="/Intelli.svg" 
                  alt="Intelli Logo"
                  fill
                  className="drop-shadow-lg"
                  priority
                />
              </div>
            </motion.div>
            
          </div>
        </div>
      </motion.div>

      {/* Bottom decorative elements */}
      <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-[#007fff]/20 to-transparent pointer-events-none"></div>

    </div>
  )
}

export default Banner

