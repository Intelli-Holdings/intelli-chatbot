"use client"

import { useState, useEffect, useRef, memo, useCallback } from "react"
import { motion, useInView } from "framer-motion"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { Navbar } from "@/components/navbar"
import FooterComponent from "@/components/home/Footer"
import testimonials, { type Testimonial } from "@/data/testimonials"

const TestimonialCard = memo(({ testimonial, index }: { testimonial: Testimonial; index: number }) => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  const sizeClasses = {
    small: "md:col-span-1 md:row-span-1",
    medium: "md:col-span-1 md:row-span-2",
    large: "md:col-span-2 md:row-span-2",
  } as const

  return (    <motion.div
      ref={ref}
      initial={{ filter: "blur(10px)", opacity: 0, y: 50 }}
      animate={isInView ? { filter: "blur(0px)", opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.05, ease: "easeOut" }}
      style={{ willChange: isInView ? 'auto' : 'opacity, transform, filter' }}
      className={`bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition-shadow duration-300 ${sizeClasses[testimonial.size as keyof typeof sizeClasses]}`}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className={`text-2xl font-bold ${testimonial.logoColor || "text-gray-800"}`}>{testimonial.logo}</div>
        <span className="font-semibold text-gray-800">{testimonial.company}</span>
      </div>      {testimonial.image && (
        <div className="mb-4 rounded-lg overflow-hidden">
          <Image
            src={testimonial.image}
            alt={`${testimonial.company} testimonial`}
            width={300}
            height={200}
            className="w-full h-32 object-cover"
            loading="lazy"
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
          />
        </div>
      )}

      <p className="text-gray-700 text-sm leading-relaxed mb-4">{testimonial.testimonial}</p>

      {testimonial.author && (
        <div className="flex items-center gap-3 mb-4">          <Image
            src={testimonial.author.avatar}
            alt={testimonial.author.name}
            width={40}
            height={40}
            className="rounded-full"
            loading="lazy"
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
          />
          <div>
            <div className="font-medium text-gray-900 text-sm">{testimonial.author.name}</div>
            <div className="text-gray-600 text-xs">{testimonial.author.title}</div>
          </div>
        </div>
      )}

      {testimonial.hasStory && (
        <button className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">
          Read the story <ArrowRight className="w-4 h-4" />
        </button>
      )}
    </motion.div>
  )
})

TestimonialCard.displayName = "TestimonialCard"

export default function CustomersPage() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = requestIdleCallback(() => setIsVisible(true))
    return () => cancelIdleCallback(timer)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Navbar />

      {/* Heading */}
      <div className="pt-32 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-6xl md:text-8xl font-bold leading-tight">
            {["What Our", "Customers", "Say"].map((text, i) => (
              <span
                key={i}
                className={`inline-block bg-clip-text text-transparent transition-all duration-700 ease-out delay-[${i * 300}ms] ${
                  isVisible
                    ? "opacity-100 translate-x-0 translate-y-0 blur-0"
                    : "opacity-0 -translate-x-10 -translate-y-5 blur"
                } ${
                  i % 2 === 1
                    ? "bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"
                    : "bg-gradient-to-r from-gray-900 via-blue-900 to-gray-900"
                }`}
              >
                {text} {" "}
              </span>
            ))}
          </h1>
        </div>
      </div>

      {/* Testimonials Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 pb-40">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-fr">          {testimonials.map((testimonial: Testimonial, index: number) => (
            <TestimonialCard key={testimonial.id} testimonial={testimonial} index={index} />
          ))}
        </div>

        {/* Sticky CTA */}
        <div className="fixed bottom-0 left-0 right-0 z-10">
          <div className="backdrop-blur-sm bg-white/20 border-t border-white/10 shadow-lg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 h-16 flex items-center justify-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1 }}
                className="flex items-center gap-4"
              >
                <span className="text-sm font-medium text-gray-900">Ready to get started?</span>
                <Button className="bg-black text-white hover:bg-gray-800 rounded-full px-4 py-2 text-sm">
                  Start free trial
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <div className="mt-20 px-4">
        <FooterComponent />
      </div>
    </div>
  )
}
