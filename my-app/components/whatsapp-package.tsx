"use client"

import { useEffect, useState } from "react"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { toast } from "sonner"
import { Bot, CircleDot, BadgeCheck, Info, MoreVertical, Pencil, Trash, Plus, Phone, Check, AlertTriangle } from "lucide-react"
import useActiveOrganizationId from "@/hooks/use-organization-id"

// Types
interface WhatsAppPackage {
  id: number
  whatsapp_business_account_id: string
  phone_number: string
  phone_number_id: string
  access_token: string
  organization_id: string
}

interface Assistant {
  id: number
  name: string
  prompt: string
  assistant_id: string
  organization: string
  organization_id: string
}

interface AppService {
  id: number
  assistant_id: number
  whatsapp_package_id: number
  channel: string
  status: string
}

// Form schemas
const whatsAppPackageSchema = z.object({
  whatsapp_business_account_id: z.string().min(1, "Business Account ID is required"),
  phone_number: z.string().min(1, "Phone number is required"),
  phone_number_id: z.string().min(1, "Phone number ID is required"),
  access_token: z.string().min(1, "Access token is required"),
})

const appServiceSchema = z.object({
  assistant_id: z.string().min(1, "Assistant is required"),
  whatsapp_package_id: z.string().min(1, "WhatsApp package is required"),
  channel: z.string().min(1, "Channel is required"),
})

export default function WhatsAppPackage() {
  const organizationId = useActiveOrganizationId()
  const [whatsAppPackages, setWhatsAppPackages] = useState<WhatsAppPackage[]>([])
  const [assistants, setAssistants] = useState<Assistant[]>([])
  const [appServices, setAppServices] = useState<AppService[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editPackage, setEditPackage] = useState<WhatsAppPackage | null>(null)
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; packageId: number | null }>({
    isOpen: false,
    packageId: null,
  })
  
  // Stepper state
  const [currentStep, setCurrentStep] = useState(0)
  const [isStepperOpen, setIsStepperOpen] = useState(false)
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null)
  const [selectedAssistantId, setSelectedAssistantId] = useState<string | null>(null)
  
  // Forms
  const whatsAppForm = useForm<z.infer<typeof whatsAppPackageSchema>>({
    resolver: zodResolver(whatsAppPackageSchema),
    defaultValues: {
      whatsapp_business_account_id: "",
      phone_number: "",
      phone_number_id: "",
      access_token: "",
    },
  })

  const appServiceForm = useForm<z.infer<typeof appServiceSchema>>({
    resolver: zodResolver(appServiceSchema),
    defaultValues: {
      assistant_id: "",
      whatsapp_package_id: "",
      channel: "whatsapp",
    },
  })

  // Fetch WhatsApp packages
  const fetchWhatsAppPackages = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/channels/whatsapp/org/${organizationId}`)
      if (!response.ok) {
        toast.info("No WhatsApp packages found. Create one to get started.")
        setWhatsAppPackages([])
        return
      }

      const data = await response.json()
      setWhatsAppPackages(data)

      if (data.length === 0) {
        toast.info("No WhatsApp packages found. Create one to get started.")
      }
    } catch (error) {
      console.error("Error fetching WhatsApp packages:", error)
      toast.error("Failed to fetch WhatsApp packages. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch Assistants
  const fetchAssistants = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/get/assistants/${organizationId}/`)
      if (!response.ok) {
        return
      }

      const data: Assistant[] = await response.json()
      setAssistants(data)
    } catch (error) {
      console.error("Error fetching assistants:", error)
    }
  }

// Create WhatsApp package
const handleCreatePackage = async (values: z.infer<typeof whatsAppPackageSchema>) => {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/channels/create/`, {
            method: "POST", 
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                choice: "whatsapp",
                data: {
                    whatsapp_business_account_id: values.whatsapp_business_account_id,
                    phone_number: values.phone_number,
                    phone_number_id: values.phone_number_id,
                    access_token: values.access_token
                },
                organization_id: organizationId
            }),
        })

        if (!response.ok) throw new Error("Failed to create WhatsApp package")

        toast.success("WhatsApp package created successfully!")
        setIsDialogOpen(false)
        whatsAppForm.reset()
        fetchWhatsAppPackages()
    } catch (error) {
        console.error("Error creating WhatsApp package:", error)
        toast.error("Failed to create WhatsApp package. Please try again.")
    }
}

  // Update WhatsApp package
  const handleUpdatePackage = async (values: z.infer<typeof whatsAppPackageSchema>) => {
    if (!editPackage) return

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/channels/whatsapp/${editPackage.id}/update/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...values,
          organization_id: organizationId,
        }),
      })

      if (!response.ok) throw new Error("Failed to update WhatsApp package")

      toast.success("WhatsApp package updated successfully!")
      setIsDialogOpen(false)
      setEditPackage(null)
      whatsAppForm.reset()
      fetchWhatsAppPackages()
    } catch (error) {
      console.error("Error updating WhatsApp package:", error)
      toast.error("Failed to update WhatsApp package. Please try again.")
    }
  }

  // Delete WhatsApp package
  const handleDeletePackage = async (packageId: number) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/channels/whatsapp/${packageId}/delete/`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete WhatsApp package")

      toast.success("WhatsApp package deleted successfully!")
      setDeleteDialog({ isOpen: false, packageId: null })
      fetchWhatsAppPackages()
    } catch (error) {
      console.error("Error deleting WhatsApp package:", error)
      toast.error("Failed to delete WhatsApp package. Please try again.")
    }
  }

  // Create App Service
  const handleCreateAppService = async (values: z.infer<typeof appServiceSchema>) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/app-services/create/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...values,
          organization_id: organizationId,
        }),
      })

      if (!response.ok) throw new Error("Failed to create App Service")

      toast.success("WhatsApp App Service created successfully!")
      setIsStepperOpen(false)
      setCurrentStep(0)
      appServiceForm.reset()
    } catch (error) {
      console.error("Error creating App Service:", error)
      toast.error("Failed to create App Service. Please try again.")
    }
  }

  useEffect(() => {
    if (organizationId) {
      fetchWhatsAppPackages()
      fetchAssistants()
    }
  }, [organizationId])

  useEffect(() => {
    if (editPackage) {
      whatsAppForm.reset({
        whatsapp_business_account_id: editPackage.whatsapp_business_account_id,
        phone_number: editPackage.phone_number,
        phone_number_id: editPackage.phone_number_id,
        access_token: editPackage.access_token,
      })
    }
  }, [editPackage])

  return (
    <div className="space-y-4">
      {!organizationId ? (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>No Organization</AlertTitle>
          <AlertDescription>Please create or join an organization to manage WhatsApp packages.</AlertDescription>
        </Alert>
      ) : isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="h-[240px] animate-pulse bg-muted" />
          ))}
        </div>
      ) : (
        <div className="space-y-4">          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Create WhatsApp Package Card */}
            <Card className="h-[240px] flex flex-col items-center justify-center cursor-pointer hover:bg-secondary/10 transition-colors"
                onClick={() => {
                  whatsAppForm.reset()
                  setEditPackage(null)
                  setIsDialogOpen(true)
                }}>
              <CardContent className="pt-6 flex flex-col items-center">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Plus className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-lg mb-2">Create WhatsApp Package</CardTitle>
                <CardDescription className="text-center">
                  Connect your WhatsApp Business account to start using it with your assistants.
                </CardDescription>
              </CardContent>
            </Card>

            {/* WhatsApp Packages List */}
            {whatsAppPackages.map((pkg) => (
              <Card key={pkg.id} className="h-[240px] flex flex-col">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-500/10 rounded-full flex items-center justify-center">
                        <Phone className="h-4 w-4 text-green-500" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">WhatsApp Account</CardTitle>
                        <div className="flex items-center space-x-2">
                          <BadgeCheck className="h-4 w-4 text-blue-500" />
                          <span className="text-sm text-muted-foreground">ID: {pkg.whatsapp_business_account_id.slice(0, 8)}...</span>
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
                            setEditPackage(pkg)
                            setIsDialogOpen(true)
                          }}
                          className="cursor-pointer"
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setDeleteDialog({ isOpen: true, packageId: pkg.id })}
                          className="cursor-pointer text-red-500"
                        >
                          <Trash className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedPackageId(pkg.id.toString())
                            appServiceForm.setValue("whatsapp_package_id", pkg.id.toString())
                            setIsStepperOpen(true)
                          }}
                          className="cursor-pointer"
                        >
                          <Bot className="mr-2 h-4 w-4" />
                          Connect to Assistant
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
                  <div className="text-sm text-muted-foreground mt-2 space-y-1">
                    <p><span className="font-medium text-foreground">Phone:</span> {pkg.phone_number}</p>
                    <p><span className="font-medium text-foreground">Number ID:</span> {pkg.phone_number_id.slice(0, 8)}...</p>
                    <p><span className="font-medium text-foreground">Token:</span> {pkg.access_token.slice(0, 12)}...</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* WhatsApp Package Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editPackage ? "Edit WhatsApp Package" : "Create WhatsApp Package"}</DialogTitle>
            <DialogDescription>
              {editPackage
                ? "Update your WhatsApp Business Account details."
                : "Connect your WhatsApp Business API to create a new package."}
            </DialogDescription>
          </DialogHeader>
          <Form {...whatsAppForm}>
            <form onSubmit={whatsAppForm.handleSubmit(editPackage ? handleUpdatePackage : handleCreatePackage)} className="space-y-4">
              <FormField
                control={whatsAppForm.control}
                name="whatsapp_business_account_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Business Account ID</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter WhatsApp Business Account ID" {...field} />
                    </FormControl>
                    <FormDescription>
                      Your WhatsApp Business Account ID from Meta Business Suite
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={whatsAppForm.control}
                name="phone_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. +1234567890" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={whatsAppForm.control}
                name="phone_number_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number ID</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter phone number ID" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={whatsAppForm.control}
                name="access_token"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Access Token</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter access token" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit">
                  {editPackage ? "Update Package" : "Create Package"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog.isOpen} onOpenChange={(open) => !open && setDeleteDialog({ isOpen: false, packageId: null })}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete WhatsApp Package</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this WhatsApp package? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setDeleteDialog({ isOpen: false, packageId: null })}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteDialog.packageId && handleDeletePackage(deleteDialog.packageId)}
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* App Service Stepper Dialog */}
      <Dialog open={isStepperOpen} onOpenChange={setIsStepperOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create WhatsApp App Service</DialogTitle>
            <DialogDescription>
              Connect your WhatsApp package to an assistant to create a new app service.
            </DialogDescription>
          </DialogHeader>
          
          
          <Form {...appServiceForm}>
            <form onSubmit={appServiceForm.handleSubmit(handleCreateAppService)} className="space-y-4">
              {currentStep === 0 && (
                <FormField
                  control={appServiceForm.control}
                  name="assistant_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Select Assistant</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value)
                          setSelectedAssistantId(value)
                        }}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select an assistant" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {assistants.map((assistant) => (
                            <SelectItem key={assistant.id} value={assistant.id.toString()}>
                              {assistant.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        The assistant that will respond to WhatsApp messages
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              
              {currentStep === 1 && (
                <FormField
                  control={appServiceForm.control}
                  name="whatsapp_package_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Select WhatsApp Package</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a WhatsApp package" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {whatsAppPackages.map((pkg) => (
                            <SelectItem key={pkg.id} value={pkg.id.toString()}>
                              {pkg.phone_number} ({pkg.whatsapp_business_account_id.slice(0, 8)}...)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        The WhatsApp Business Account to connect to
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              
              {currentStep === 2 && (
                <>
                  <FormField
                    control={appServiceForm.control}
                    name="channel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Channel</FormLabel>
                        <FormControl>
                          <Input readOnly {...field} />
                        </FormControl>
                        <FormDescription>
                          The messaging channel for this integration
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle>Ready to Connect</AlertTitle>
                    <AlertDescription>
                      You&apos;re about to connect your assistant to the WhatsApp channel. Click submit to create the connection.
                    </AlertDescription>
                  </Alert>
                </>
              )}
              
              <div className="flex justify-between">
                {currentStep > 0 ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCurrentStep((step) => step - 1)}
                  >
                    Previous
                  </Button>
                ) : (
                  <div></div>
                )}
                
                {currentStep < 2 ? (
                  <Button
                    type="button"
                    onClick={() => {
                      if (currentStep === 0 && !appServiceForm.getValues("assistant_id")) {
                        appServiceForm.setError("assistant_id", { message: "Please select an assistant" })
                        return
                      }
                      if (currentStep === 1 && !appServiceForm.getValues("whatsapp_package_id")) {
                        appServiceForm.setError("whatsapp_package_id", { message: "Please select a WhatsApp package" })
                        return
                      }
                      setCurrentStep((step) => step + 1)
                    }}
                  >
                    Next
                  </Button>
                ) : (
                  <Button type="submit">Create App Service</Button>
                )}
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Connection Status Cards */}
      {whatsAppPackages.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-medium mb-4">WhatsApp Connection Status</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {whatsAppPackages.map((pkg) => (
              <Card key={pkg.id}>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <CircleDot className="w-4 h-4 fill-green-500 text-green-500 mr-2" />
                    Connected
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium">Number:</span>
                      <span>{pkg.phone_number}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Number ID:</span>
                      <span>{pkg.phone_number_id.slice(0, 8)}...</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Business Account:</span>
                      <span>{pkg.whatsapp_business_account_id.slice(0, 8)}...</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
