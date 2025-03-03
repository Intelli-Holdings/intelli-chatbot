"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import OnboardingChecklist from "./onboarding-checklist"
import ConfettiEffect from "./confetti-effect"
import { useOnboarding } from "@/context/onboarding-context"
import OnboardingFlow from "./onboarding-flow"
import CircuitBackground from "@/components/ui/circuit-background"

interface OnboardingData {
  source: string
  goals: string[]
  businessType: string
  platforms: string[]
  employees: string
}

const steps = ["welcome", "questions", "checklist"]

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0)
  const [showConfetti, setShowConfetti] = useState(false)
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    source: "",
    goals: [],
    businessType: "",
    platforms: [],
    employees: "",
  })

  const { completedTasks, setIsOnboardingComplete } = useOnboarding()

  const progress = ((currentStep + 1) / steps.length) * 100

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      setShowConfetti(true)
      setIsOnboardingComplete(true)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const updateOnboardingData = (data: Partial<typeof onboardingData>) => {
    setOnboardingData({ ...onboardingData, ...data })
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
        <h2 className="text-2xl font-bold text-center mb-8 text-slate-800">Welcome to Intelli, complete these steps to get onboarded</h2>
        <OnboardingFlow onboardingData={onboardingData} updateOnboardingData={updateOnboardingData} />
      </div>
    </div>
  )
}

