"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Star,
  Play,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Folder,
  FolderOpen,
  ChevronDown,
  FileText,
} from "lucide-react"
import { useState } from "react"
import Image from "next/image"

const testimonials = [
  {
    name: "Emily Fiagbedzi",
    role: "AI Startup Program Director",
    company: "Mest Africa",
    industry: "Education",
    logo: "/mestafrica_logo.jpeg",
    content:
      "Intelli transformed our customer service. We now handle 3x more inquiries with the same team size, and our response time dropped from hours to seconds.",
    impact: "300% increase in inquiry handling capacity",
    rating: 5,
    avatar: "/professional-woman-ceo.png",
    hasVideo: true,
    caseStudyUrl: "/case-studies/mest-africa",
  },
  {
    name: "Michael Nartey",
    role: "Operations Director",
    company: "ALX Ghana",
    industry: "Education",
    logo: "/alx.jpeg",
    content:
      "Parents and students get instant answers about enrollment, schedules, and programs. Our administrative workload decreased by 70%.",
    impact: "70% reduction in administrative workload",
    rating: 5,
    avatar: "/professional-man-director.jpg",
    hasVideo: true,
    caseStudyUrl: "/case-studies/edufuture-school",
  },
  {
    name: "Lucy Wamugunda",
    role: "Program Manager",
    company: "Rift Valley Institute of Business Studies (RViBS)",
    industry: "Education",
    logo: "/RVIBS.jpeg",
    content:
      "We can now efficiently manage thousands of scholarship and grant inquiries. Intelli helps us focus on what matters most - helping people.",
    impact: "5000+ inquiries managed efficiently",
    rating: 5,
    avatar: "/professional-woman-doctor.png",
    hasVideo: false,
    caseStudyUrl: "/case-studies/hope-foundation",
  },
  {
    name: "James Rodriguez",
    role: "Customer Service Manager",
    company: "GovServe Portal",
    industry: "Government",
    logo: "/generic-government-logo.png",
    content:
      "Citizens now get instant responses to permit applications and tax inquiries. We've improved public satisfaction by 85% while reducing wait times.",
    impact: "85% improvement in citizen satisfaction",
    rating: 5,
    avatar: "/professional-man-manager.jpg",
    hasVideo: true,
    caseStudyUrl: "/case-studies/govserve-portal",
  },
  {
    name: "Lisa Park",
    role: "Head of Operations",
    company: "TechCorp Solutions",
    industry: "Technology",
    logo: "/abstract-tech-logo.png",
    content:
      "Our technical support team can now focus on complex issues while Intelli handles routine inquiries. Customer satisfaction scores increased by 40%.",
    impact: "40% increase in customer satisfaction",
    rating: 5,
    avatar: "/professional-woman-head-operations.jpg",
    hasVideo: true,
    caseStudyUrl: "/case-studies/techcorp-solutions",
  },
  {
    name: "Ahmed Hassan",
    role: "Customer Experience Lead",
    company: "HealthCare Plus",
    industry: "Healthcare",
    logo: "/healthcare-company-logo.png",
    content:
      "Patients get immediate answers about appointments, insurance, and services. We've reduced phone wait times by 90% and improved patient experience significantly.",
    impact: "90% reduction in phone wait times",
    rating: 5,
    avatar: "/professional-man-healthcare.jpg",
    hasVideo: false,
    caseStudyUrl: "/case-studies/healthcare-plus",
  },
]

export default function TestimonialsSection() {
  const [playingVideo, setPlayingVideo] = useState<number | null>(null)
  const [currentMobileIndex, setCurrentMobileIndex] = useState(0)
  const [currentDesktopIndex, setCurrentDesktopIndex] = useState(0)
  const [selectedIndustry, setSelectedIndustry] = useState<string | null>(null)
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())
  const [selectedTestimonial, setSelectedTestimonial] = useState<any>(null)

  const handleCaseStudyClick = (url: string) => {
    window.location.href = url
  }

  const nextMobileTestimonial = () => {
    setCurrentMobileIndex((prev) => (prev + 1) % testimonials.length)
  }

  const prevMobileTestimonial = () => {
    setCurrentMobileIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

  const nextDesktopTestimonial = () => {
    setCurrentDesktopIndex((prev) => (prev + 1) % testimonials.length)
  }

  const prevDesktopTestimonial = () => {
    setCurrentDesktopIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

  const filteredTestimonials = selectedIndustry
    ? testimonials.filter((t) => t.industry === selectedIndustry)
    : testimonials

  const industries = Array.from(new Set(testimonials.map((t) => t.industry)))

  const toggleFolder = (industry: string) => {
    const newExpanded = new Set(expandedFolders)
    if (newExpanded.has(industry)) {
      newExpanded.delete(industry)
    } else {
      newExpanded.add(industry)
    }
    setExpandedFolders(newExpanded)
  }

  const selectTestimonial = (testimonial: any) => {
    setSelectedTestimonial(testimonial)
  }

  return (
    <section className="w-full rounded-2xl py-20 bg-gradient-to-b from-muted/30 to-background">
      <div className="w-full px-4">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl lg:text-5xl font-bold text-balance">Real Impact, Real Results</h2>
          <p className="text-xl text-muted-foreground text-pretty max-w-2xl mx-auto">
            Read how our customers transformed their customer experience with measurable business impact
          </p>
        </div>

        {/* Mobile: Single card carousel */}
        <div className="md:hidden">
          <div className="relative">
            <div className="overflow-hidden">
              <div
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${currentMobileIndex * 100}%)` }}
              >
                {testimonials.map((testimonial, index) => (
                  <div key={index} className="w-full flex-shrink-0 px-4">
                    <TestimonialCard
                      testimonial={testimonial}
                      index={index}
                      playingVideo={playingVideo}
                      setPlayingVideo={setPlayingVideo}
                      onCaseStudyClick={handleCaseStudyClick}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Mobile navigation */}
            <div className="flex justify-center items-center gap-4 mt-6">
              <button
                onClick={prevMobileTestimonial}
                className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors"
              >
                ←
              </button>
              <div className="flex gap-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentMobileIndex(index)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentMobileIndex ? "bg-primary" : "bg-muted-foreground/30"
                    }`}
                  />
                ))}
              </div>
              <button
                onClick={nextMobileTestimonial}
                className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors"
              >
                →
              </button>
            </div>
          </div>
        </div>

        <div className="hidden md:block">
          <div className="max-w-7xl mx-auto bg-white rounded-lg border border-slate-300 shadow-xl overflow-hidden">
            {/* File Explorer Header */}
            <div className="bg-slate-50 border-b border-slate-200 px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <button className="w-8 h-8 rounded hover:bg-slate-200 flex items-center justify-center">
                      <ChevronLeft className="w-4 h-4 text-slate-600" />
                    </button>
                    <button className="w-8 h-8 rounded hover:bg-slate-200 flex items-center justify-center">
                      <ChevronRight className="w-4 h-4 text-slate-600" />
                    </button>
                  </div>
                  <div className="text-sm text-slate-600">
                    {selectedTestimonial ? `${selectedTestimonial.company} - Case Study` : "Customer Success Stories"}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-xs text-slate-500">
                    {selectedTestimonial ? "1 document" : `${testimonials.length} testimonials`}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex h-[700px]">
              {/* Left Sidebar - Expandable Folder Navigation */}
              <div className="w-80 bg-slate-50 border-r border-slate-200 flex flex-col">
                <div className="p-4 border-b border-slate-200">
                  <h3 className="text-sm font-semibold text-slate-700 mb-3">Customer Stories</h3>
                  <div className="space-y-1">
                    <button
                      onClick={() => {
                        setSelectedTestimonial(null)
                        setSelectedIndustry(null)
                      }}
                      className={`w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded transition-colors ${
                        !selectedTestimonial && selectedIndustry === null
                          ? "text-slate-600 bg-cyan-50 border border-cyan-200"
                          : "text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      <Folder className="w-4 h-4 text-cyan-600" />
                      <span>All Industries</span>
                    </button>
                  </div>
                </div>

                <div className="flex-1 p-4 overflow-y-auto">
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
                    Industry Folders
                  </h4>
                  <div className="space-y-1">
                    {industries.map((industry, idx) => {
                      const isExpanded = expandedFolders.has(industry)
                      const industryTestimonials = testimonials.filter((t) => t.industry === industry)

                      return (
                        <div key={idx}>
                          <button
                            onClick={() => toggleFolder(industry)}
                            className="w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded transition-colors text-slate-600 hover:bg-slate-100"
                          >
                            {isExpanded ? (
                              <ChevronDown className="w-3 h-3 text-slate-500" />
                            ) : (
                              <ChevronRight className="w-3 h-3 text-slate-500" />
                            )}
                            {isExpanded ? (
                              <FolderOpen className="w-4 h-4 text-amber-500" />
                            ) : (
                              <Folder className="w-4 h-4 text-amber-500" />
                            )}
                            <span>{industry}</span>
                            <span className="ml-auto text-xs text-slate-400">{industryTestimonials.length}</span>
                          </button>

                          {isExpanded && (
                            <div className="ml-6 mt-1 space-y-1">
                              {industryTestimonials.map((testimonial, testIdx) => (
                                <button
                                  key={testIdx}
                                  onClick={() => selectTestimonial(testimonial)}
                                  className={`w-full flex items-center gap-2 px-2 py-1.5 text-xs rounded transition-colors ${
                                    selectedTestimonial?.company === testimonial.company
                                      ? "text-slate-700 bg-blue-50 border border-blue-200"
                                      : "text-slate-600 hover:bg-slate-100"
                                  }`}
                                >
                                  <FileText className="w-3 h-3 text-blue-500" />
                                  <span className="truncate">{testimonial.company}</span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div className="p-4 border-t border-slate-200">
                  <div className="text-xs text-slate-500">
                    <div className="flex justify-between mb-1">
                      <span>Storage</span>
                      <span>Intelli Cloud</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Documents</span>
                      <span>{testimonials.length}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Content Area - Document View */}
              <div className="flex-1 flex flex-col bg-gray-50">
                {selectedTestimonial ? (
                  <div className="flex-1 overflow-y-auto p-8">
                    <div className="max-w-4xl mx-auto">
                      {/* Clean Document Paper - matching uploaded image style */}
                      <div className="bg-white shadow-sm border border-gray-200 min-h-[600px] p-12">
                        {/* Header instruction */}
                        <div className="text-sm text-gray-500 mb-8 border-b border-gray-100 pb-4">
                          Use Company logo/persona image
                        </div>

                        {/* Person Profile Section */}
                        <div className="mb-12">
                          <h2 className="text-2xl font-normal text-black mb-2">{selectedTestimonial.name}</h2>
                          <p className="text-gray-600 mb-6">
                            {selectedTestimonial.role}, {selectedTestimonial.company}
                          </p>

                          {/* Professional Photo */}
                          <div className="mb-8">
                            <Image
                              src={selectedTestimonial.avatar || "/placeholder.svg"}
                              alt={selectedTestimonial.name}
                              width={192}
                              height={256}
                              className="w-48 h-64 object-cover rounded-lg shadow-sm"
                            />
                          </div>
                        </div>

                        {/* RAW Section */}
                        <div className="mb-8">
                          <h3 className="text-lg font-normal text-black mb-4">RAW</h3>
                          <div className="pl-8">
                            <p className="text-gray-800 leading-relaxed">
                              Intelli has been helpful it&apos;s especially with answering FAQs from clients and reducing the
                              response rates
                            </p>
                          </div>
                        </div>

                        {/* Or separator */}
                        <div className="mb-8">
                          <div className="pl-8">
                            <p className="text-gray-800">Or</p>
                          </div>
                        </div>

                        {/* EDITED Section */}
                        <div className="mb-12">
                          <h3 className="text-lg font-normal text-black mb-4">EDITED</h3>
                          <div className="pl-8">
                            <p className="text-gray-800 leading-relaxed">
                              Intelli has improved how we{" "}
                              <span className="text-blue-500 font-medium">respond to FAQs</span> from our Clients. Since
                              implementing it, we&apos;ve seen a <span className="text-blue-500 font-medium">reduction</span>{" "}
                              in <span className="text-blue-500 font-medium">response rates</span> allowing our{" "}
                              <span className="text-blue-500 font-medium">
                                team to operate 24/7 and save 40 hours per week
                              </span>
                              .
                            </p>
                          </div>
                        </div>

                        {/* Additional person name at bottom */}
                        <div className="border-t border-gray-100 pt-8">
                          <h3 className="text-lg font-normal text-black">Emily Fiagbedzi</h3>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Default view when no testimonial is selected */
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center text-slate-500 max-w-md">
                      <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <h3 className="text-xl font-medium mb-2">Select a Customer Story</h3>
                      <p className="text-sm leading-relaxed">
                        Choose an industry folder from the sidebar and select a company to view their detailed success
                        story and business impact.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function TestimonialCard({
  testimonial,
  index,
  playingVideo,
  setPlayingVideo,
  onCaseStudyClick,
}: {
  testimonial: any
  index: number
  playingVideo: number | null
  setPlayingVideo: (index: number | null) => void
  onCaseStudyClick: (url: string) => void
}) {
  return (
    <div className="relative group">
      <div className="absolute -top-4 left-8 z-10">
        <div className="relative">
          {/* Folder tab background */}
          <div className="w-20 h-8 bg-gradient-to-b from-slate-200 via-slate-100 to-slate-200 rounded-t-xl border-l-2 border-r-2 border-t-2 border-slate-300/60 shadow-sm">
            {/* Tab highlight */}
            <div className="absolute top-1 left-1 right-1 h-1 bg-gradient-to-r from-white/60 to-transparent rounded-t-lg"></div>
            {/* Tab label area */}
            <div className="flex items-center justify-center h-full">
              <div className="w-3 h-1 bg-slate-400/40 rounded-full"></div>
            </div>
          </div>
          {/* Tab shadow */}
          <div className="absolute -bottom-1 left-1 right-1 h-2 bg-slate-300/20 blur-sm rounded-b-lg"></div>
        </div>
      </div>

      <Card className="group hover:shadow-2xl transition-all duration-700 cursor-pointer transform hover:-translate-y-3 hover:rotate-1 relative overflow-hidden">
        {/* Folder background with realistic gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-100 via-slate-50 to-slate-100 opacity-95"></div>

        {/* Folder edge highlight */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-white/80 via-white/60 to-white/80"></div>
        <div className="absolute top-0 bottom-0 left-0 w-1 bg-gradient-to-b from-white/80 via-white/60 to-white/80"></div>

        {/* Folder corner fold effect */}
        <div className="absolute top-0 right-0 w-8 h-8 bg-gradient-to-bl from-slate-200 to-transparent opacity-60"></div>

        {/* Inner folder content area */}
        <div className="absolute inset-4 bg-white/90 rounded-lg shadow-inner border border-slate-200/50"></div>

        <CardContent className="relative z-10 p-8 h-full flex flex-col">
          <div className="space-y-6 flex-1">
            <div className="flex items-center justify-between bg-white/60 rounded-lg p-3 backdrop-blur-sm border border-slate-200/30">
              <Image
                src={testimonial.logo || "/placeholder.svg"}
                alt={`${testimonial.company} logo`}
                width={100}
                height={32}
                className="h-8 object-contain drop-shadow-sm"
              />
              <div className="flex items-center gap-1">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-500 drop-shadow-sm" />
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="bg-gradient-to-r from-cyan-50 to-amber-50 rounded-xl p-4 border-2 border-gradient-to-r from-cyan-200 to-amber-200 shadow-lg">
                {/* Label tape effect */}
                <div className="absolute -top-2 left-4 bg-amber-200 px-3 py-1 rounded-full text-xs font-medium text-amber-800 shadow-sm border border-amber-300">
                  Impact
                </div>
                <p className="text-sm font-bold text-slate-800 text-center mt-2">{testimonial.impact}</p>
              </div>
            </div>

            <div className="bg-white/80 rounded-lg p-4 border-l-4 border-cyan-400 shadow-sm backdrop-blur-sm">
              <blockquote className="text-base leading-relaxed flex-1 italic text-slate-700">
                &quot;{testimonial.content}&quot;
              </blockquote>
            </div>

            <div className="bg-gradient-to-r from-white/90 to-slate-50/90 rounded-lg p-4 border border-slate-200/50 shadow-sm backdrop-blur-sm">
              <div className="flex items-center gap-4">
                <Avatar className="w-12 h-12 border-2 border-white shadow-md">
                  <AvatarImage src={testimonial.avatar || "/placeholder.svg"} alt={testimonial.name} />
                  <AvatarFallback className="bg-gradient-to-br from-cyan-100 to-amber-100 text-slate-700 font-semibold">
                    {testimonial.name
                      .split(" ")
                      .map((n:any) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-semibold text-sm text-slate-800">{testimonial.name}</p>
                  <p className="text-xs text-slate-600">{testimonial.role}</p>
                  <p className="text-xs font-medium text-cyan-600">{testimonial.company}</p>
                </div>
                <div className="flex flex-col gap-2">
                  <Badge variant="outline" className="text-xs bg-white/60 border-slate-300">
                    {testimonial.industry}
                  </Badge>
                  {testimonial.hasVideo && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setPlayingVideo(playingVideo === index ? null : index)
                      }}
                      className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-cyan-600 text-white rounded-full flex items-center justify-center hover:from-cyan-600 hover:to-cyan-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105"
                    >
                      <Play className="w-3 h-3 ml-0.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Video placeholder */}
            {testimonial.hasVideo && playingVideo === index && (
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg aspect-video flex items-center justify-center shadow-inner border border-slate-700">
                <div className="text-white text-center">
                  <Play className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-xs opacity-75">Video testimonial placeholder</p>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-slate-200/50 bg-white/40 rounded-lg px-3 py-2 backdrop-blur-sm">
              <span className="text-xs text-slate-600 font-medium">Click to view case study</span>
              <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-cyan-600 transition-colors duration-300" />
            </div>
          </div>
        </CardContent>

        <div className="absolute bottom-2 right-2 w-6 h-6 bg-slate-300/40 rounded-full flex items-center justify-center opacity-60 group-hover:opacity-80 transition-opacity">
          <div className="w-2 h-2 bg-slate-500/60 rounded-full"></div>
        </div>
      </Card>
    </div>
  )
}
