"use client"

import Image from "next/image"
import { useState, useEffect } from "react"

const testimonials = [
  {
    quote:
      "The Intelli interface is solid; there is no difference in the user experience, so I can comfortably respond to our customers easily.",
    author: "Andrews Narteh",
    title: "Recruitment Analyst",
    company: "ALX Ghana ",
    avatar: "/professional-woman-ceo.png",
    logo: "/alx.jpeg",
    website: "https://www.alxafrica.com/ghana/",
  },
  
  {
    quote:
      "Intelli has improved how we respond to FAQs from our Clients. Since implementing it, we’ve seen a reduction in response rates allowing our team to operate 24/7 and save 40 hours per week.",
    author: "Lucy Wamugunda",
    title: "Digital Marketing Specialist",
    company: "Rift Valley Institute of Business Studies (RViBS)",
    avatar: "/professional-nonprofit-director.jpg",
    logo: "/RVIBS.jpeg",
    website: "https://rvibs.ac.ke/",
  },
  {
    quote:
      "Intelli is helping us manage inquiries in a big way. Since implementing it, we’ve seen a reduction in response rates allowing our team to operate 24/7 and provide more hands-on support to our Incoming AI entrepreneurs.",
    author: "Emily Fiagbedzi",
    title: "AI Startup Program Director",
    company: "Mest Africa",
    avatar: "/professional-government-official.jpg",
    logo: "/mestafrica_logo.jpeg",
    website: "https://meltwater.org/mest-ai-startup-program/",
  },
]

export function BrandCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [progress, setProgress] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    if (isPaused) return

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setCurrentIndex((current) => (current + 1) % testimonials.length)
          return 0
        }
        return prev + 100 / 80 // 8 seconds = 80 intervals of 100ms
      })
    }, 100)

    return () => clearInterval(interval)
  }, [isPaused])

  const handleBrandClick = (index: number) => {
    setCurrentIndex(index)
    setProgress(0)
    window.open(testimonials[index].website, "_blank", "noopener,noreferrer")
  }

  const currentTestimonial = testimonials[currentIndex]

  return (
    <section className="py-12 md:py-20 bg-slate-50 rounded-2xl">
      <div className="container mx-auto px-4 max-w-6xl  ">
        <div
          className="text-center mb-8 md:mb-12 px-4 rounded-2xl bg-gradient-to-r from-[#007fff]  to-[#68E4E6] bg-opacity-10 blur-xs py-10 md:py-16"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <blockquote className="text-lg md:text-2xl lg:text-3xl xl:text-4xl font-medium text-slate-900 leading-tight mb-6 md:mb-8 px-4 ">
            &quot;{currentTestimonial.quote}&quot;
          </blockquote>

          <div className="flex items-center justify-center gap-3 md:gap-4 mb-4 md:mb-6">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full overflow-hidden flex-shrink-0">
              <Image
                src={currentTestimonial.avatar || "/placeholder.svg"}
                alt={currentTestimonial.author}
                className="w-full h-full object-cover"
                width={120}
                height={80}
              />
            </div>
            <div className="text-left">
              <div className="font-semibold text-slate-900 text-sm md:text-base">{currentTestimonial.author}</div>
              <div className="text-slate-600 text-xs md:text-sm">
                {currentTestimonial.title} / {currentTestimonial.company}
              </div>
            </div>
          </div>

          <div className="w-24 md:w-32 h-1 bg-slate-200 rounded-full mx-auto overflow-hidden">
            <div
              className="h-full bg-cyan-500 rounded-full transition-all duration-100 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="border-t border-slate-200 pt-8 md:pt-12">
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4 md:gap-6 lg:gap-8 items-center justify-items-center">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className={`group cursor-pointer transition-all duration-300 hover:scale-105 ${
                  index === currentIndex ? "scale-105" : ""
                }`}
                onClick={() => handleBrandClick(index)}
              >
                <div className="w-16 h-12 md:w-20 md:h-14 lg:w-28 lg:h-16 flex items-center justify-center">
                  <Image
                    src={testimonial.logo || "/placeholder.svg"}
                    alt={`${testimonial.company} logo`}
                    width={120}
                    height={80}
                    className={`max-w-full max-h-full object-contain transition-all duration-300 ${
                      index === currentIndex
                        ? "opacity-100 filter-none"
                        : "opacity-60 group-hover:opacity-100 filter grayscale group-hover:grayscale-0"
                    }`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
