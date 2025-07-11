"use client"

import { useOnboarding } from "@/context/onboarding-context"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

const checklistItems = [
  {
    id: "create_assistant",
    title: "Create Your AI Assistant",
    tasks: ["Give it a name", "Upload your logo", "Set its personality", "Train it with FAQs"],
  },
  {
    id: "integrate_channels",
    title: "Integrate with Your Channels",
    tasks: [
      "Connect WhatsApp Business account",
      "Install Intelli widget on your site",
      "Forward emails to your Intelli assistant",
    ],
  },
  {
    id: "customize_widget",
    title: "Customize Your Widget",
    tasks: ["Choose colors to match your branding", "Set welcome messages", "Configure operating hours"],
  },
  {
    id: "test_assistant",
    title: "Test Your Assistant",
    tasks: ["Interact with it on each platform", "Refine its responses as needed"],
  },
]

export default function OnboardingChecklist() {
  const { completedTasks, setCompletedTasks } = useOnboarding()

  const handleTaskToggle = (taskId: string) => {
    setCompletedTasks((prev) => (prev.includes(taskId) ? prev.filter((id) => id !== taskId) : [...prev, taskId]))
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Onboarding Checklist</h2>
      {checklistItems.map((item) => (
        <div key={item.id} className="space-y-2">
          <h3 className="text-xl font-semibold">{item.title}</h3>
          <ul className="space-y-2">
            {item.tasks.map((task, index) => {
              const taskId = `${item.id}_${index}`
              return (
                <li key={taskId} className="flex items-center space-x-2">
                  <Checkbox
                    id={taskId}
                    checked={completedTasks.includes(taskId)}
                    onCheckedChange={() => handleTaskToggle(taskId)}
                  />
                  <Label htmlFor={taskId}>{task}</Label>
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </div>
  )
}

