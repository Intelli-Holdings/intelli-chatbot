"use client"

import { useState, useEffect, type FormEvent } from "react"
import { Button } from "@/components/ui/button"
import { PlusCircle, Loader2, Phone, Edit2 } from "lucide-react"
import { toast } from "sonner"
import { useOrganization, useUser } from "@clerk/nextjs"
import useActiveOrganizationId from "@/hooks/use-organization-id"
import type React from "react"
import PhoneInput from "react-phone-number-input"
import "react-phone-number-input/style.css"

interface PhoneNumber {
  id: string
  phoneNumber: string
  type: 'business' | 'user'
  email?: string
}

// Define the API response structure
interface PhoneNumberApiResponse {
  main_business_phone_number?: string;
  others: any[];
}

export const PhoneNumberForm: React.FC = () => {
  const [phoneNumber, setPhoneNumber] = useState<string>("")
  const [isBusinessNumber, setIsBusinessNumber] = useState<boolean>(false)
  const [existingNumbers, setExistingNumbers] = useState<PhoneNumber[]>([])
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const { organization, isLoaded } = useOrganization()
  const { user } = useUser()
  const organizationId = useActiveOrganizationId()

  // Function to transform API response to our internal format
  const transformApiResponse = (data: PhoneNumberApiResponse): PhoneNumber[] => {
    const numbers: PhoneNumber[] = [];
    
    // Add main business number if present
    if (data.main_business_phone_number) {
      numbers.push({
        id: 'main-business',
        phoneNumber: data.main_business_phone_number,
        type: 'business'
      });
    }
    
    // Add other numbers if present and are in expected format
    if (Array.isArray(data.others)) {
      data.others.forEach((item, index) => {
        if (item && typeof item === 'object') {
          numbers.push({
            id: item.id || `other-${index}`,
            phoneNumber: item.phoneNumber || item.phone_number || '',
            type: item.type || 'user',
            email: item.email
          });
        }
      });
    }
    
    return numbers;
  }

  useEffect(() => {
    const fetchPhoneNumbers = async () => {
      if (organizationId) {
        try {
          setIsLoading(true);
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_DEV_API_BASE_URL}/auth/get/org/${organizationId}/phone-numbers/`
          )
          if (response.ok) {
            const data = await response.json();
            
            // Handle the specific API format
            if (data && typeof data === 'object') {
              // Check if the response matches our expected format
              if ('main_business_phone_number' in data && 'others' in data) {
                const transformedData = transformApiResponse(data);
                setExistingNumbers(transformedData);
              } else {
                console.warn('API returned unexpected format:', data);
                setExistingNumbers([]);
              }
            } else {
              console.error('API returned invalid data format:', data);
              setExistingNumbers([]);
            }
          }
        } catch (error) {
          console.error("Failed to fetch phone numbers:", error)
          toast.error("Failed to load existing phone numbers")
          setExistingNumbers([])
        } finally {
          setIsLoading(false)
        }
      }
    }

    fetchPhoneNumbers()
  }, [organizationId])

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (!organizationId || !phoneNumber) {
      toast.error("Missing required information")
      return
    }
    
    setIsSubmitting(true)

    const payload: any = {
      organization_id: organizationId,
    }

    // Build payload based on the type of update
    if (isBusinessNumber) {
      payload.phone_number = phoneNumber.replace(/\s/g, "").replace('+', '')
    } else {
      payload.user_phone = phoneNumber.replace(/\s/g, "").replace('+', '')
      payload.user_email = user?.emailAddresses[0].emailAddress
    }

    console.log('Submitting payload:', payload)

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_DEV_API_BASE_URL}/auth/update/organization/phone-number/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          body: JSON.stringify(payload)
        }
      )

      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        throw new Error(errorData?.message || "Failed to update phone number")
      }

      toast.success(`${isBusinessNumber ? 'Business' : 'User'} phone number added successfully`)
      setPhoneNumber("")
      
      // Refresh the phone numbers list
      try {
        const updatedResponse = await fetch(
          `${process.env.NEXT_PUBLIC_DEV_API_BASE_URL}/auth/get/org/${organizationId}/phone-numbers/`
        )
        if (updatedResponse.ok) {
          const data = await updatedResponse.json()
          
          // Use the same transformation function for consistency
          if (data && typeof data === 'object' && 'main_business_phone_number' in data && 'others' in data) {
            const transformedData = transformApiResponse(data);
            setExistingNumbers(transformedData);
          } else {
            console.warn('Refresh API returned unexpected format:', data);
            // Don't reset existing numbers if the refresh fails but we had data before
          }
        }
      } catch (refreshError) {
        console.error("Failed to refresh phone numbers:", refreshError)
      }
    } catch (error) {
      toast.error("Failed to add phone number", {
        description: error instanceof Error ? error.message : "An unexpected error occurred"
      })
      console.error("Phone number update error:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isLoaded || isLoading) {
    return <div className="flex justify-center"><Loader2 className="h-6 w-6 animate-spin" /></div>
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border p-4">
        <h3 className="text-lg font-medium mb-4">Existing Phone Numbers</h3>
        {existingNumbers.length === 0 ? (
          <p className="text-muted-foreground">No phone numbers added yet.</p>
        ) : (
          <div className="space-y-3">
            {existingNumbers.map((number) => (
              <div key={number.id} className="flex items-center justify-between p-2 bg-secondary rounded">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <span>{number.phoneNumber}</span>
                  {number.email && (
                    <span className="text-sm text-muted-foreground">({number.email})</span>
                  )}
                  <span className="text-xs bg-primary/10 px-2 py-1 rounded">
                    {number.type}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setPhoneNumber(number.phoneNumber)
                    setIsBusinessNumber(number.type === 'business')
                  }}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Number Type
              <select
                className="mt-1 block w-full rounded-md border py-2 px-3"
                value={isBusinessNumber ? "business" : "user"}
                onChange={(e) => setIsBusinessNumber(e.target.value === "business")}
              >
                <option value="business">Business Number</option>
                <option value="user">User Number (whatsapp)</option>
              </select>
            </label>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              Phone Number
              <PhoneInput
                international
                countryCallingCodeEditable={false}
                defaultCountry="GH"
                value={phoneNumber}
                onChange={(value) => setPhoneNumber(value || "")}
                disabled={isSubmitting}
                className="flex h-10 w-full rounded-md border px-3 py-4 text-sm"
              />
            </label>
          </div>
        </div>

        <Button
          type="submit"
          className="bg-[#007fff] text-white hover:bg-[#007fff]/100 hover:text-white w-full"
          disabled={isSubmitting || !phoneNumber || !organizationId}
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              <span>Saving...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <span>Save Number</span>
              <PlusCircle className="ml-2 h-4 w-4" />
            </div>
          )}
        </Button>
      </form>
    </div>
  )
}