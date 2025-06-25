"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { X, ChevronRight, ChevronLeft, Minimize2, Maximize2, Sparkles, Globe, Package } from "lucide-react"
import Link from "next/link"

interface OnboardingStepperProps {
  onComplete: () => void
  onWhatsAppCreate: () => void
  onWebsiteCreate: () => void
}

interface Step {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  action: "link" | "dialog" | "external"
  href?: string
  completed: boolean
}

const OnboardingStepper: React.FC<OnboardingStepperProps> = ({ onComplete, onWhatsAppCreate, onWebsiteCreate }) => {
  const [currentStep, setCurrentStep] = useState(0)
  const [isMinimized, setIsMinimized] = useState(false)
  const [steps, setSteps] = useState<Step[]>([
    {
      id: "assistant",
      title: "Create an Assistant",
      description: "Your assistant works on any channel",
      icon: <Sparkles className="w-5 h-5" />,
      action: "link",
      href: "/dashboard/assistants",
      completed: false,
    },
    {
      id: "website",
      title: "Create a Website Widget",
      description: "Use your assistant to create a widget",
      icon: <Globe className="w-5 h-5" />,
      action: "dialog",
      completed: false,
    },
    {
      id: "whatsapp",
      title: "Create a WhatsApp Package",
      description: "Connect your assistant to WhatsApp",
      icon: <Package className="w-5 h-5" />,
      action: "dialog",
      completed: false,
    },
  ])

  const completedSteps = steps.filter((step) => step.completed).length
  const progress = (completedSteps / steps.length) * 100

  const handleStepComplete = (stepId: string) => {
    setSteps((prev) => prev.map((step) => (step.id === stepId ? { ...step, completed: true } : step)))

    // Move to next step if not the last one
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }

    // Check if all steps are completed
    const updatedSteps = steps.map((step) => (step.id === stepId ? { ...step, completed: true } : step))
    if (updatedSteps.every((step) => step.completed)) {
      setTimeout(() => onComplete(), 1000)
    }
  }

  const handleStepAction = (step: Step) => {
    switch (step.action) {
      case "link":
        // Mark as completed when clicked (you might want to track this differently)
        handleStepComplete(step.id)
        break
      case "dialog":
        if (step.id === "website") {
          onWebsiteCreate()
        } else if (step.id === "whatsapp") {
          onWhatsAppCreate()
        }
        handleStepComplete(step.id)
        break
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleSkipAll = () => {
    onComplete()
  }

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 left-4 z-50">
        <Button
          onClick={() => setIsMinimized(false)}
          className="rounded-full w-12 h-12 bg-[#007fff] hover:bg-[#0066cc] shadow-lg"
        >
          <Maximize2 className="w-5 h-5" />
        </Button>
      </div>
    )
  }

  return (
    <div className="fixed bottom-4 left-4 z-50 w-80">
      <Card className="shadow-xl border-2 border-[#007fff]/20 bg-white">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              🚀 Get Started
              <Badge variant="secondary" className="text-xs">
                {completedSteps}/{steps.length}
              </Badge>
            </CardTitle>
            <div className="flex gap-1">
              <Button variant="ghost" size="sm" onClick={() => setIsMinimized(true)} className="h-8 w-8 p-0">
                <Minimize2 className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={handleSkipAll} className="h-8 w-8 p-0">
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <Progress value={progress} className="h-2" />
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Current Step */}
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-[#007fff]/5 rounded-lg border border-[#007fff]/20">
              <div className="flex-shrink-0 w-8 h-8 bg-[#007fff] rounded-full flex items-center justify-center text-white">
                {steps[currentStep]?.completed ? "✓" : currentStep + 1}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm">{steps[currentStep]?.title}</h3>
                <p className="text-xs text-gray-600 mt-1">{steps[currentStep]?.description}</p>

                {steps[currentStep]?.action === "link" ? (
                  <Link href={steps[currentStep].href || "#"}>
                    <Button
                      size="sm"
                      className="mt-2 bg-[#007fff] hover:bg-[#0066cc]"
                      onClick={() => handleStepComplete(steps[currentStep].id)}
                    >
                      {steps[currentStep]?.icon}
                      <span className="ml-2">Start</span>
                    </Button>
                  </Link>
                ) : (
                  <Button
                    size="sm"
                    className="mt-2 bg-[#007fff] hover:bg-[#0066cc]"
                    onClick={() => handleStepAction(steps[currentStep])}
                  >
                    {steps[currentStep]?.icon}
                    <span className="ml-2">Create</span>
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Step Navigation */}
          <div className="flex justify-between items-center pt-2 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>

            <div className="flex gap-1">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    index === currentStep ? "bg-[#007fff]" : steps[index]?.completed ? "bg-green-500" : "bg-gray-300"
                  }`}
                />
              ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleNext}
              disabled={currentStep === steps.length - 1}
              className="flex items-center gap-1"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Skip Option */}
          <div className="text-center pt-2 border-t">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSkipAll}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              Skip onboarding
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default OnboardingStepper
