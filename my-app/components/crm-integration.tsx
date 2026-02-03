'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Image from 'next/image'
import { Label } from "@/components/ui/label"
import { CRMProvider } from "@/types/contact"
import { connectToCRM } from "@/app/actions"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from 'sonner'

// Define authentication fields for each CRM
const crmAuthFields = {
  salesforce: [
    { name: 'clientId', label: 'Client ID', type: 'text' },
    { name: 'clientSecret', label: 'Client Secret', type: 'password' },
    { name: 'username', label: 'Username', type: 'email' },
    { name: 'password', label: 'Password', type: 'password' },
    { name: 'securityToken', label: 'Security Token', type: 'text' },
  ],
  zoho: [
    { name: 'apiKey', label: 'API Key', type: 'password' },
    { name: 'organization', label: 'Organization ID', type: 'text' },
  ],
  airtable: [
    { name: 'apiKey', label: 'API Key', type: 'password' },
    { name: 'baseId', label: 'Base ID', type: 'text' },
    { name: 'tableName', label: 'Table Name', type: 'text' },
  ],
}

const crmProviders: CRMProvider[] = [
  {
    id: 'salesforce',
    name: 'Salesforce',
    icon: '/Salesforce.png',
    isConnected: false,
  },
  {
    id: 'zoho',
    name: 'Zoho CRM',
    icon: '/zoho-crm.png',
    isConnected: false,
  },
  {
    id: 'airtable',
    name: 'Airtable',
    icon: '/Airtable_Logo.png',
    isConnected: false,
  },
]

export function CRMIntegration() {
  const [providers, setProviders] = useState(crmProviders)
  const [selectedProvider, setSelectedProvider] = useState<CRMProvider | null>(null)
  const [authData, setAuthData] = useState<Record<string, string>>({})
  const [isConnecting, setIsConnecting] = useState(false)

  const handleAuthInputChange = (field: string, value: string) => {
    setAuthData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleConnect = async (provider: CRMProvider) => {
    if (provider.isConnected) {
      // Handle disconnection
      try {
        const result = await connectToCRM(provider.id, null) // Pass null for credentials when disconnecting
        if (result.success) {
          setProviders(prev => 
            prev.map(p => 
              p.id === provider.id ? { ...p, isConnected: false } : p
            )
          )
          toast.success(`Disconnected from ${provider.name}`)
        }
      } catch (error) {
        toast.error(`Failed to disconnect from ${provider.name}`)
        console.error(`Disconnect error:`, error)
      }
    } else {
      // Open auth dialog for connection
      setSelectedProvider(provider)
      setAuthData({})
    }
  }

  const handleSubmitAuth = async () => {
    if (!selectedProvider) return

    setIsConnecting(true)
    try {
      const result = await connectToCRM(selectedProvider.id, authData)
      
      if (result.success) {
        setProviders(prev => 
          prev.map(p => 
            p.id === selectedProvider.id ? { ...p, isConnected: true } : p
          )
        )
        setSelectedProvider(null)
        toast.success(`Connected to ${selectedProvider.name}`)
      } else {
        throw new Error(result.message)
      }
    } catch (error) {
      toast.error(`Failed to connect to ${selectedProvider.name}`)
      console.error(`Connection error:`, error)
    } finally {
      setIsConnecting(false)
    }
  }

  return (
    <>
      <div className="grid gap-4 py-4">
        {providers.map((provider) => (
          <div
            key={provider.id}
            className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Image
                width={85}
                height={85}
                src={provider.icon || "/placeholder.svg"}
                alt={provider.name}
                
              />
              <div>
                <h3 className="font-medium">{provider.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {provider.isConnected ? 'Connected' : 'Not connected'}
                </p>
              </div>
            </div>
            <Button
              variant={provider.isConnected ? "outline" : "default"}
              onClick={() => handleConnect(provider)}
            >
              {provider.isConnected ? 'Disconnect' : 'Connect'}
            </Button>
          </div>
        ))}
      </div>

      <Dialog open={!!selectedProvider} onOpenChange={() => setSelectedProvider(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Connect to {selectedProvider?.name}</DialogTitle>
            <DialogDescription>
              Enter your credentials to connect to {selectedProvider?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {selectedProvider && crmAuthFields[selectedProvider.id as keyof typeof crmAuthFields].map((field) => (
              <div key={field.name} className="grid gap-2">
                <Label htmlFor={field.name}>{field.label}</Label>
                <Input
                  id={field.name}
                  type={field.type}
                  value={authData[field.name] || ''}
                  onChange={(e) => handleAuthInputChange(field.name, e.target.value)}
                />
              </div>
            ))}
            <Button 
              onClick={handleSubmitAuth} 
              disabled={isConnecting}
              className="w-full"
            >
              {isConnecting ? 'Connecting...' : 'Connect'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}