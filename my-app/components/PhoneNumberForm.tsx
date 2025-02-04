"use client"

import { useState, type FormEvent } from "react"
import { Button } from "@/components/ui/button"
import { PlusCircle, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { useOrganization } from "@clerk/nextjs"
import type React from "react"
import PhoneInput from "react-phone-number-input"
import "react-phone-number-input/style.css"

export const PhoneNumberForm: React.FC = () => {
  const [phoneNumber, setPhoneNumber] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const { organization, isLoaded } = useOrganization()

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (!organization?.id || !phoneNumber) {
      toast.error("Missing required information")
      return
    }
    
    setIsSubmitting(true)

    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/update/organization/phone-number/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          body: JSON.stringify({
            organization_id: organization.id,
            phone_number: phoneNumber.replace(/\s/g, "")
          })
        })

      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        throw new Error(errorData?.message || "Failed to update phone number")
      }

      toast.success("Phone number added successfully")
      setPhoneNumber("")
    } catch (error) {
      toast.error("Failed to add phone number", {
        description: error instanceof Error ? error.message : "An unexpected error occurred"
      })
      console.error("Phone number update error:", error)
      toast.error("Failed to add phone number")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isLoaded) {
    return null
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 flex items-center gap-2">
      <div className="flex-1">
        <PhoneInput
          international
          countryCallingCodeEditable={false}
          defaultCountry="GH"
          value={phoneNumber}
          onChange={(value) => setPhoneNumber(value || "")}
          disabled={isSubmitting}
          className="flex h-10 w-full rounded-md border px-3 py-4 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>
      <Button
        type="submit"
        className="bg-[#007fff] text-white hover:bg-[#007fff]/100 hover:text-white"
        size={"default"}
        variant="outline"
        disabled={isSubmitting || !phoneNumber || !organization?.id}
      >
        {isSubmitting ? (
          <div className="flex items-center">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            <span>Adding...</span>
          </div>
        ) : (
          <div className="flex items-center">
            <span>Add</span>
            <PlusCircle className="ml-2 h-4 w-4" />
          </div>
        )}
      </Button>
    </form>
  )
}