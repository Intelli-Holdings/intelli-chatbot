'use client'

import { useEffect, useState } from 'react'
import { useOrganization } from "@clerk/nextjs"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { CreateAssistantDialog } from '@/components/create-assistant-dialog'
import { Assistant } from '@/types/assistant'
import { CircleDot } from 'lucide-react'

export default function Assistants() {
  const { organization, isLoaded } = useOrganization()
  const [assistants, setAssistants] = useState<Assistant[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchAssistants = async () => {
    if (!organization) return
    
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/get/assistants/${organization.id}/`
      )
      if (!response.ok) throw new Error('Failed to fetch assistants')
      const data = await response.json()
      setAssistants(data)
    } catch (error) {
      console.error('Error fetching assistants:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (isLoaded && organization) {
      fetchAssistants()
    }
  }, [isLoaded, organization])

  if (!isLoaded || isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="h-[240px] animate-pulse bg-muted" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <CreateAssistantDialog onAssistantCreated={fetchAssistants} />
        
        {assistants.map((assistant) => (
          <Card key={assistant.id} className="h-[240px]">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                  A
                </div>
                <span className="text-sm text-muted-foreground">
                  intelliconcierge.com
                </span>
              </div>
              <div className="space-y-1.5">
                <p className="text-sm text-muted-foreground">Free Plan</p>
                <CardTitle>{assistant.name}</CardTitle>
                <div className="flex items-center space-x-2">
                  <CircleDot className="w-3 h-3 fill-green-500 text-green-500" />
                  <span className="text-sm">Production</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Updated {new Date(assistant.updated_at || '').toLocaleDateString()}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

