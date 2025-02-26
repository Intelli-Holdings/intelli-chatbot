"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

type OnboardingContextType = {
  completedTasks: string[]
  setCompletedTasks: React.Dispatch<React.SetStateAction<string[]>>
  isOnboardingComplete: boolean
  setIsOnboardingComplete: React.Dispatch<React.SetStateAction<boolean>>
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined)

export const useOnboarding = () => {
  const context = useContext(OnboardingContext)
  if (!context) {
    throw new Error("useOnboarding must be used within an OnboardingProvider")
  }
  return context
}

export const OnboardingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [completedTasks, setCompletedTasks] = useState<string[]>([])
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(false)

  useEffect(() => {
    const storedTasks = localStorage.getItem("onboardingTasks")
    if (storedTasks) {
      setCompletedTasks(JSON.parse(storedTasks))
    }

    const storedOnboardingComplete = localStorage.getItem("onboardingComplete")
    if (storedOnboardingComplete) {
      setIsOnboardingComplete(JSON.parse(storedOnboardingComplete))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("onboardingTasks", JSON.stringify(completedTasks))
  }, [completedTasks])

  useEffect(() => {
    localStorage.setItem("onboardingComplete", JSON.stringify(isOnboardingComplete))
  }, [isOnboardingComplete])

  return (
    <OnboardingContext.Provider
      value={{ completedTasks, setCompletedTasks, isOnboardingComplete, setIsOnboardingComplete }}
    >
      {children}
    </OnboardingContext.Provider>
  )
}

