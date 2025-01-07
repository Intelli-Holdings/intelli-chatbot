'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { useOrganizationList } from "@clerk/nextjs"
import { CreateAssistantDialog } from '@/components/create-assistant-dialog'
import { Bot, CircleDot, Info, MoreVertical, Pencil } from 'lucide-react'
import {toast} from 'sonner'
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface Assistant {
  id: number
  name: string
  assistant_id: string
  organization: string
}

export default function Assistants() {
  const { userMemberships, isLoaded } = useOrganizationList({
    userMemberships: {
      infinite: true,
    },
  });

  const [assistants, setAssistants] = useState<Assistant[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isFirstLoad, setIsFirstLoad] = useState(true)
  const [selectedOrganizationId, setSelectedOrganizationId] = useState<string>('')

  const fetchAssistants = async () => {
    if (!selectedOrganizationId) return

    setIsLoading(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/get/assistants/${selectedOrganizationId}/`)
      if (!response.ok) {
        throw new Error('Failed to fetch assistants')
      }

      const data: Assistant[] = await response.json()
      setAssistants(data)
      
      if (!isFirstLoad && data.length === 0) {
        toast.error('No Assistants Found, create one to get started!')
      }
    } catch (error) {
      console.error('Error fetching assistants:', error)
      setAssistants([])
      toast.info('Failed to fetch assistants. This organization does not have assistants.')
    } finally {
      setIsLoading(false)
      setIsFirstLoad(false)
    }
  }

  const handleOrganizationChange = (orgId: string) => {
    setSelectedOrganizationId(orgId)
    setIsFirstLoad(true)
  }

  const handleEditAssistant = (assistant: Assistant) => {
    console.log('Edit assistant:', assistant)
   toast.info('Edit assistant feature coming soon!')
  }

  useEffect(() => {
    if (selectedOrganizationId) {
      fetchAssistants()
    }
  }, [selectedOrganizationId])

  if (!isLoaded) {
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

  const selectedOrg = userMemberships?.data?.find(
    membership => membership.organization.id === selectedOrganizationId
  )

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-foreground mb-1">Organization</label>
        <Select
          value={selectedOrganizationId}
          onValueChange={handleOrganizationChange}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select an organization" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {userMemberships?.data?.map((membership) => (
                <SelectItem 
                  key={membership.organization.id} 
                  value={membership.organization.id}
                >
                  {membership.organization.name}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      {selectedOrganizationId ? (
        isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="h-[240px] animate-pulse bg-muted" />
            ))}
          </div>
        ) : assistants.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <CreateAssistantDialog onAssistantCreated={fetchAssistants} />
            
            {assistants.map((assistant) => (
              <Card key={assistant.id} className="h-[240px] flex flex-col">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <Bot className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{assistant.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          ID: {assistant.assistant_id.slice(0, 12)}...
                        </p>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleEditAssistant(assistant)}
                          className="cursor-pointer"
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit Assistant
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="flex-grow">
                  <div className="flex items-center space-x-2">
                    <CircleDot className="w-3 h-3 fill-green-500 text-green-500" />
                    <span className="text-sm">Active</span>
                  </div>
                  {selectedOrg && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Organization: {selectedOrg.organization.name}
                    </p>
                  )}
                </CardContent>
                <CardFooter>
                  <Button variant="ghost" className="w-full">
                    View Assistant
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>No Assistants Found</AlertTitle>
              <AlertDescription>
                This organization doesn&apos;t have any assistants yet. Create your first assistant to get started!
              </AlertDescription>
            </Alert>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <CreateAssistantDialog onAssistantCreated={fetchAssistants} />
            </div>
          </div>
        )
      ) : (
        <Card className="text-center py-12">
          <CardContent>
            <CardTitle className="mt-2">Select an Organization</CardTitle>
            <CardDescription className="mt-1">
              Please select an organization to view its assistants.
            </CardDescription>
          </CardContent>
        </Card>
      )}
    </div>
  )
}