"use client"

import { useState, useEffect } from "react"
import { useOnboarding } from "@/context/onboarding-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { ChevronUp, ChevronDown } from "lucide-react"

export default function OnboardingReminder() {
  const { completedTasks, isOnboardingComplete } = useOnboarding()
  const [isExpanded, setIsExpanded] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const totalTasks = 9 // Total number of tasks in the checklist
    const completedTasksCount = completedTasks.length
    const newProgress = (completedTasksCount / totalTasks) * 100
    setProgress(newProgress)
  }, [completedTasks])

  if (isOnboardingComplete) {
    return null
  }

  return (
    <Card className="fixed bottom-4 right-4 w-80 shadow-lg transition-all duration-300 ease-in-out">
      <CardHeader className="cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <CardTitle className="flex items-center justify-between">
          <span>Onboarding Progress</span>
          {isExpanded ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
        </CardTitle>
        <Progress value={progress} className="w-full" />
      </CardHeader>
      {isExpanded && (
        <CardContent>
          <p className="mb-4">You&apos;ve completed {completedTasks.length} out of 9 tasks.</p>
          <Button asChild>
            <a href="/onboarding">Continue Onboarding</a>
          </Button>
        </CardContent>
      )}
    </Card>
  )
}

