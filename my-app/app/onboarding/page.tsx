"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import OnboardingChecklist from "./onboarding-checklist"
import ConfettiEffect from "./confetti-effect"
import { useOnboarding } from "@/context/onboarding-context"
import OnboardingFlow from "./onboarding-flow"
import CircuitBackground from "@/components/ui/circuit-background"
import { 
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Link from "next/link";

interface OnboardingData {
  source: string
  goals: string[]
  businessType: string
  platforms: string[]
  employees: string
}

const steps = ["welcome", "questions", "checklist"]

export default function OnboardingPage() {
  const [showConfetti, setShowConfetti] = useState(false)
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    source: "",
    goals: [],
    businessType: "",
    platforms: [],
    employees: "",
  })

  const { completedTasks, setIsOnboardingComplete } = useOnboarding()

  const updateOnboardingData = (data: Partial<typeof onboardingData>) => {
    setOnboardingData({ ...onboardingData, ...data })
  }

  const handleOnboardingComplete = () => {
    setShowConfetti(true)
    setIsOnboardingComplete(true)
  }

  useEffect(() => {
    if (completedTasks.length === 9) {
      setIsOnboardingComplete(true)
    }
  }, [completedTasks, setIsOnboardingComplete])

  return (
    <div className="mx-auto py-10 min-h-screen relative">
      <CircuitBackground />
      <div className="container relative z-10">
      <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink>
              <Link href="/pre-onboarding">Pre-onboarding</Link>              
           </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink>
              <Link href="/onboarding">Onboarding</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <h2 className="text-2xl font-bold text-center mb-8 text-slate-800">Welcome to Intelli, complete these steps to get onboarded</h2>
        <OnboardingFlow onboardingData={onboardingData} updateOnboardingData={updateOnboardingData}  onComplete={handleOnboardingComplete}  />
        {showConfetti && <ConfettiEffect />}
      </div>
    </div>
  )
}

