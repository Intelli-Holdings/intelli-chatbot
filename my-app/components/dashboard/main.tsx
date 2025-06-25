"use client"

import React, { useState } from "react"
import { Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { useNextStep } from "nextstepjs"
import { useUser } from "@clerk/nextjs"
import Link from "next/link"
import { useOnborda } from "onborda"
import Channels from "./channels"
import WhatsappOnboarding from "@/components/WhatsappOnboarding"
import Workground from "@/components/Workground"
import OnboardingStepper from "./OnboardingStepper"
import InsightsDashboard from "./InsightsDashboard"

const Dashboard: React.FC = () => {
  const { startOnborda } = useOnborda()
  const handleStartOnborda = () => {
    startOnborda("mainTour")
  }
  const { startNextStep } = useNextStep()
  const [isBannerVisible, setIsBannerVisible] = useState(true)
  const { isLoaded, isSignedIn, user } = useUser()
  const [mounted, setMounted] = useState(false)
  const [whatsappDialogOpen, setWhatsappDialogOpen] = useState(false)
  const [websiteDialogOpen, setWebsiteDialogOpen] = useState(false)

  // Onboarding state
  const [onboardingComplete, setOnboardingComplete] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)

  React.useEffect(() => {
    setMounted(true)
    // Check if user has completed onboarding (you can store this in localStorage or user preferences)
    const hasCompletedOnboarding = localStorage.getItem("onboarding-complete")
    setOnboardingComplete(!!hasCompletedOnboarding)
  }, [])

  const onClickHandler = (tourName: string) => {
    setIsBannerVisible(false)
    startNextStep(tourName)
  }

  const handleOnboardingComplete = () => {
    setOnboardingComplete(true)
    localStorage.setItem("onboarding-complete", "true")
  }

  if (!isLoaded || !isSignedIn) {
    return null
  }

  // Regular dashboard cards (non-onboarding)
  const dashboardCards = [
    {
      id: "onborda-step5",
      emoji: "🔔",
      title: "View Notifications",
      description: "Receive time-sensitive messages",
      href: "/dashboard/notifications",
    },
    {
      id: "onborda-step6",
      emoji: "💬",
      title: "View Conversations",
      description: "Your inbox for customer messages",
      href: "/dashboard/conversations",
    },
    {
      id: "onborda-step7",
      emoji: "📊",
      title: "View Your Analytics",
      description: "Monitor your business metrics",
      href: "/dashboard/analytics",
    },
  ]

  if (!mounted) {
    return null
  }

  return (
    <div className="space-y-8 relative">
      {/* Tour Button */}
      <div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="default" className="mr-2 bg-[#007fff] rounded-xl pt-2" onClick={handleStartOnborda}>
                <Sparkles size={16} className="mr-2" /> Click to Start Tour
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>This gives you a product tour of Intelli</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <div className="min-h-200 rounded-t-lg rounded-b-2xl ">
        {/* Top banner */}
        <div className="w-full" id="onborda-step1">
          <div className="bg p-2 shadow-sm border rounded-t-xl rounded-b-sm border-indigo-200 bg-[#007fff]/10 py-12 px-10 pt-6 sm:pt-12 sm:bg-blue sm:rounded-t-lg shadow-sm">
            <h1 className="text-3xl font-bold">
              Welcome, <span style={{ color: "#007fff" }}>{user.firstName}</span>
            </h1>
            <p className="text-lg">Your Business Command Center</p>
          </div>
        </div>

        {/* Tabs for Overview and Channels */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="live-insights">Live Insights</TabsTrigger>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="channels">Channels</TabsTrigger>
          </TabsList>
          <TabsContent value="live-insights">
            {/* Insights Dashboard */}
            <div className="p-4">
              <InsightsDashboard />
            </div>
          </TabsContent>
          <TabsContent value="overview">
            {/* Dashboard grid */}
            <div className="mx-auto px-2 py-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Render regular dashboard cards */}
                {dashboardCards.map((card) => (
                  <Link href={card.href} key={card.id}>
                    <div
                      id={card.id}
                      className="bg-white border border-gray-200 shadow-sm p-6 rounded-lg flex flex-col justify-between hover:shadow-lg transition-shadow cursor-pointer"
                    >
                      <div>
                        <div className="mb-4">
                          <div className="w-12 h-12 bg-blue-500 text-white rounded-lg flex items-center justify-center text-2xl">
                            {card.emoji}
                          </div>
                        </div>
                        <h3 className="text-lg font-semibold mb-2">{card.title}</h3>
                        <p className="text-gray-600 text-sm mb-6">{card.description}</p>
                      </div>
                      <div className="mt-auto flex items-center gap-2">
                        <Button variant="default" className="w-full">
                          View
                        </Button>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </TabsContent>
          <TabsContent value="channels">
            <Channels
              onWhatsAppCreate={() => setWhatsappDialogOpen(true)}
              onWebsiteCreate={() => setWebsiteDialogOpen(true)}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Onboarding Stepper - Bottom Left */}
      {!onboardingComplete && (
        <OnboardingStepper
          onComplete={handleOnboardingComplete}
          onWhatsAppCreate={() => setWhatsappDialogOpen(true)}
          onWebsiteCreate={() => setWebsiteDialogOpen(true)}
        />
      )}

      {/* WhatsApp Dialog */}
      <Dialog open={whatsappDialogOpen} onOpenChange={setWhatsappDialogOpen}>
        <DialogContent className="max-w-4xl">
          <WhatsappOnboarding />
        </DialogContent>
      </Dialog>

      {/* Website Widget Dialog */}
      <Dialog open={websiteDialogOpen} onOpenChange={setWebsiteDialogOpen}>
        <DialogContent className="max-w-4xl">
          <Workground />
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default Dashboard
