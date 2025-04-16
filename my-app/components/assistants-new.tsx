"use client"

import { useEffect, useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

import { CreateAssistantDialog } from "@/components/create-assistant-dialog"
import { EditAssistantDialog } from "@/components/edit-assistant-dialog"
import { Bot, CircleDot, BadgeCheck, Info, MoreVertical, Pencil, Trash } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { DeleteAssistantDialog } from "@/components/delete-dialog-assistant"
import useActiveOrganizationId from "@/hooks/use-organization-id"

interface Assistant {
  id: number
  name: string
  prompt: string
  assistant_id: string
  organization: string
  organization_id: string
}

export default function Assistants() {
  const organizationId = useActiveOrganizationId()
  const [assistants, setAssistants] = useState<Assistant[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedAssistant, setSelectedAssistant] = useState<Assistant | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; assistant: Assistant | null }>({
    isOpen: false,
    assistant: null,
  })

  const fetchAssistants = async () => {
    if (!organizationId) return

    setIsLoading(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/get/assistants/${organizationId}/`)
      if (!response.ok) {
        toast.info("No assistants found. Create one to get started.")
        return
      }

      const data: Assistant[] = await response.json()
      setAssistants(data)

      if (data.length === 0) {
        toast.info("No assistants found. Create one to get started.")
      }
    } catch (error) {
      console.error("Error fetching assistants:", error)

      toast.error("Failed to fetch assistants. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteAssistant = async (assistant: Assistant) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/assistants/${assistant.id}/`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete assistant")

      setAssistants(assistants.filter((a) => a.id !== assistant.id))
      setDeleteDialog({ isOpen: false, assistant: null })
      toast.success("Assistant deleted successfully!")

      // Full page reload after successful deletion
      window.location.reload()
    } catch (error) {
      console.error("Error deleting assistant:", error)
      toast.error("Failed to delete assistant. Please try again.")
    }
  }

  useEffect(() => {
    if (organizationId) {
      fetchAssistants()
    }
  }, [organizationId])

  return (
    <div className="space-y-4">
      {!organizationId ? (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>No Organization </AlertTitle>
          <AlertDescription>Please create or join an organization to manage assistants.</AlertDescription>
        </Alert>
      ) : isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="h-[240px] animate-pulse bg-muted" />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">My Assistants</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <CreateAssistantDialog
              onAssistantCreated={() => {
                fetchAssistants()
                // Full page reload after creating an assistant
                window.location.reload()
              }}
            />

            {assistants.length > 0 &&
              assistants.map((assistant) => (
                <Card key={assistant.id} className="h-[240px] flex flex-col">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          <Bot className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{assistant.name}</CardTitle>
                          <div className="flex items-center space-x-2">
                            <BadgeCheck className="h-4 w-4 text-blue-500" />
                            <span className="text-sm text-muted-foreground">
                              ID: {assistant.assistant_id.slice(0, 12)}...
                            </span>
                          </div>
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
                            onClick={() => {
                              setSelectedAssistant(assistant)
                              setIsEditDialogOpen(true)
                            }}
                            className="cursor-pointer"
                          >
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              setDeleteDialog({
                                isOpen: true,
                                assistant: assistant,
                              })
                            }
                            className="cursor-pointer text-red-500"
                          >
                            <Trash className="mr-2 h-4 w-4" />
                            Delete
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
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{assistant.prompt}</p>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      )}

      {/* Edit Assistant Dialog */}
      <EditAssistantDialog
        isOpen={isEditDialogOpen}
        onClose={() => {
          setIsEditDialogOpen(false)
          setSelectedAssistant(null)
          // Full page reload after closing edit dialog
          window.location.reload()
        }}
        assistant={selectedAssistant}
        onAssistantUpdated={(updatedAssistants) => {
          setAssistants(updatedAssistants)
          // Full page reload after updating assistants
          window.location.reload()
        }}
        assistants={assistants}
      />

      {/* Delete Assistant Dialog */}
      <DeleteAssistantDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => {
          setDeleteDialog({ isOpen: false, assistant: null })
          // Full page reload after closing delete dialog
          window.location.reload()
        }}
        onConfirm={() => {
          if (deleteDialog.assistant) {
            handleDeleteAssistant(deleteDialog.assistant)
            // window.location.reload() is already called in handleDeleteAssistant after successful deletion
          }
        }}
        assistantName={deleteDialog.assistant?.name || ""}
      />
    </div>
  )
}
