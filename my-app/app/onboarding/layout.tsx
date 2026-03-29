"use client"

import { OnboardingProvider } from "@/context/onboarding-context"

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <OnboardingProvider>{children}</OnboardingProvider>
}
