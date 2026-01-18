"use client"

import { useState, useEffect, useCallback, type FormEvent } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { PlusCircle, Loader2, Phone, Edit2, Trash2, RefreshCcw } from "lucide-react"
import { toast } from "sonner"
import { useOrganization, useUser, useAuth } from "@clerk/nextjs"
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

const transformApiResponse = (data: PhoneNumberApiResponse): PhoneNumber[] => {
  const numbers: PhoneNumber[] = []

  // Add main business number if present
  if (data.main_business_phone_number) {
    numbers.push({
      id: "main-business",
      phoneNumber: data.main_business_phone_number,
      type: "business"
    })
  }

  // Add other numbers if present and are in expected format
  if (Array.isArray(data.others)) {
    data.others.forEach((item, index) => {
      if (item && typeof item === "object") {
        numbers.push({
          id: String(item.id ?? `other-${index}`),
          // Backend returns 'user_phone' field
          phoneNumber: item.user_phone || item.phoneNumber || item.phone_number || "",
          type: item.type === "business" ? "business" : "user",
          // Backend returns 'user_email' field
          email: item.user_email || item.email
        })
      }
    })
  }

  return numbers
}

export const PhoneNumberForm: React.FC = () => {
  const [phoneNumber, setPhoneNumber] = useState<string>("")
  const [isBusinessNumber, setIsBusinessNumber] = useState<boolean>(false)
  const [existingNumbers, setExistingNumbers] = useState<PhoneNumber[]>([])
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false)
  const [lastSyncedAt, setLastSyncedAt] = useState<number | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const { isLoaded } = useOrganization()
  const { user } = useUser()
  const { getToken } = useAuth()
  const organizationId = useActiveOrganizationId()
  const cacheTtlMs = 1000 * 60 * 5
  const cacheKey = organizationId ? `org-phone-numbers:${organizationId}` : null

  const formatSyncTime = (timestamp: number) =>
    new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })

  const readCache = useCallback(() => {
    if (!cacheKey || typeof window === "undefined") {
      return null
    }
    try {
      const raw = localStorage.getItem(cacheKey)
      if (!raw) {
        return null
      }
      const parsed = JSON.parse(raw)
      if (!parsed || !Array.isArray(parsed.data) || !parsed.timestamp) {
        return null
      }
      if (Date.now() - parsed.timestamp > cacheTtlMs) {
        return null
      }
      return parsed as { data: PhoneNumber[]; timestamp: number }
    } catch {
      return null
    }
  }, [cacheKey, cacheTtlMs])

  const writeCache = useCallback(
    (numbers: PhoneNumber[], timestamp = Date.now()) => {
      if (!cacheKey || typeof window === "undefined") {
        return
      }
      try {
        localStorage.setItem(
          cacheKey,
          JSON.stringify({
            data: numbers,
            timestamp
          })
        )
      } catch {
        // Ignore cache write errors
      }
    },
    [cacheKey]
  )

  const applyNumbers = useCallback(
    (numbers: PhoneNumber[], timestamp = Date.now()) => {
      setExistingNumbers(numbers)
      setLastSyncedAt(timestamp)
      writeCache(numbers, timestamp)
    },
    [writeCache]
  )

  const fetchPhoneNumbers = useCallback(
    async (options: { background?: boolean } = {}) => {
      if (!organizationId) {
        return
      }
      const isBackground = options.background ?? false
      if (isBackground) {
        setIsRefreshing(true)
      } else {
        setIsLoading(true)
      }
      try {
        const token = await getToken({ organizationId: organizationId ?? undefined })
        if (!token) {
          throw new Error("Missing authentication token")
        }
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/get/org/${organizationId}/phone-numbers/`,
          {
            headers: {
              "Authorization": `Bearer ${token}`,
              "Accept": "application/json"
            }
          }
        )
        if (!response.ok) {
          const errorData = await response.json().catch(() => null)
          throw new Error(errorData?.message || "Failed to load phone numbers")
        }
        const data = await response.json()

        if (data && typeof data === "object" && "main_business_phone_number" in data && "others" in data) {
          applyNumbers(transformApiResponse(data))
        } else {
          console.warn("API returned unexpected format:", data)
          if (!isBackground) {
            setExistingNumbers([])
          }
        }
      } catch (error) {
        console.error("Failed to fetch phone numbers:", error)
        if (!isBackground) {
          toast.error("Failed to load existing phone numbers")
          setExistingNumbers([])
        }
      } finally {
        setIsLoading(false)
        setIsRefreshing(false)
      }
    },
    [applyNumbers, getToken, organizationId, transformApiResponse]
  )

  useEffect(() => {
    if (!organizationId) {
      return
    }
    const cached = readCache()
    if (cached) {
      setExistingNumbers(cached.data)
      setLastSyncedAt(cached.timestamp)
      setIsLoading(false)
      fetchPhoneNumbers({ background: true })
      return
    }
    setExistingNumbers([])
    setLastSyncedAt(null)
    fetchPhoneNumbers()
  }, [fetchPhoneNumbers, organizationId, readCache])

  const canDeleteNumber = (number: PhoneNumber) =>
    number.type === "user" && /^\d+$/.test(number.id)

  const handleDelete = async (number: PhoneNumber) => {
    if (!organizationId || !canDeleteNumber(number)) {
      return
    }
    setDeletingId(number.id)
    try {
      const token = await getToken({ organizationId: organizationId ?? undefined })
      if (!token) {
        throw new Error("Missing authentication token")
      }
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/org/${organizationId}/phone-numbers/${number.id}/`,
        {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Accept": "application/json"
          }
        }
      )
      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        throw new Error(errorData?.message || "Failed to delete phone number")
      }
      const updatedNumbers = existingNumbers.filter((item) => item.id !== number.id)
      applyNumbers(updatedNumbers)
      toast.success("Phone number removed")
    } catch (error) {
      toast.error("Failed to delete phone number", {
        description: error instanceof Error ? error.message : "An unexpected error occurred"
      })
      console.error("Phone number delete error:", error)
    } finally {
      setDeletingId(null)
    }
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (!organizationId || !phoneNumber) {
      toast.error("Missing required information")
      return
    }
    
    setIsSubmitting(true)

    const sanitizedNumber = phoneNumber.replace(/\s/g, "").replace("+", "")
    const payload: any = {
      organization_id: organizationId,
    }

    // Build payload based on the type of update
    if (isBusinessNumber) {
      payload.phone_number = sanitizedNumber
    } else {
      payload.user_phone = sanitizedNumber
      payload.user_email = user?.emailAddresses[0].emailAddress
    }

    console.log('Submitting payload:', payload)

    try {
      const token = await getToken({ organizationId: organizationId ?? undefined })
      if (!token) {
        throw new Error("Missing authentication token")
      }
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/update/organization/phone-number/`,
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
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

      toast.success(`${isBusinessNumber ? "Main" : "Secondary"} number saved successfully`)
      setPhoneNumber("")
      fetchPhoneNumbers({ background: true })
    } catch (error) {
      toast.error("Failed to add phone number", {
        description: error instanceof Error ? error.message : "An unexpected error occurred"
      })
      console.error("Phone number update error:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const orderedNumbers = [...existingNumbers].sort((a, b) => {
    if (a.type === b.type) {
      return 0
    }
    return a.type === "business" ? -1 : 1
  })

  const typeNote = isBusinessNumber
    ? "Main numbers replace the current main number for the organization."
    : "Secondary numbers are additive. You can add multiple numbers to receive notifications."

  if (!isLoaded || isLoading) {
    return (
      <div className="flex min-h-[160px] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border bg-background p-4 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold">Existing Phone Numbers</h3>
            <p className="text-sm text-muted-foreground">
              The main number is primary. Secondary numbers receive notification alerts.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              {lastSyncedAt ? `Last synced ${formatSyncTime(lastSyncedAt)}` : "Not synced yet"}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => fetchPhoneNumbers({ background: true })}
              disabled={isRefreshing}
              aria-label="Refresh phone numbers"
            >
              {isRefreshing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCcw className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {isRefreshing && (
          <p className="mt-2 text-xs text-muted-foreground">Refreshing cached data.</p>
        )}

        <div className="mt-4 space-y-3">
          {orderedNumbers.length === 0 ? (
            <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
              No phone numbers added yet.
            </div>
          ) : (
            orderedNumbers.map((number, index) => (
              <div
                key={number.id}
                className="group flex items-center justify-between rounded-lg border bg-white p-3 shadow-sm transition hover:shadow-md animate-in fade-in-0 slide-in-from-bottom-2"
                style={{ animationDelay: `${index * 40}ms` }}
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-700">
                    <Phone className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium">{number.phoneNumber}</span>
                      <Badge
                        variant={number.type === "business" ? "info" : "secondary"}
                        className="capitalize"
                      >
                        {number.type === "business" ? "main" : "secondary"}
                      </Badge>
                    </div>
                    {number.email && (
                      <div className="text-xs text-muted-foreground">{number.email}</div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setPhoneNumber(number.phoneNumber)
                      setIsBusinessNumber(number.type === "business")
                    }}
                    disabled={isSubmitting}
                    aria-label="Edit phone number"
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  {canDeleteNumber(number) && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          disabled={deletingId === number.id}
                          aria-label="Delete phone number"
                        >
                          {deletingId === number.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Remove this phone number?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This removes the secondary notification number {number.phoneNumber}. You can add it again later.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-red-600 text-white hover:bg-red-700"
                            onClick={() => handleDelete(number)}
                            disabled={deletingId === number.id}
                          >
                            {deletingId === number.id ? "Removing..." : "Remove"}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="rounded-xl border bg-background p-4 shadow-sm">
        <div className="space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold">Add a phone number</h3>
              <p className="text-sm text-muted-foreground">
                Choose a number type and save it for notifications.
              </p>
            </div>
            <Badge variant={isBusinessNumber ? "info" : "secondary"} className="capitalize">
              {isBusinessNumber ? "main update" : "secondary number"}
            </Badge>
          </div>

          <div className="rounded-lg border bg-muted/30 p-3">
            <div className="text-sm font-medium">Number Type</div>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <button
                type="button"
                className={`rounded-lg border px-3 py-2 text-left text-sm transition ${
                  isBusinessNumber
                    ? "border-blue-200 bg-blue-50 text-blue-700 shadow-sm"
                    : "border-muted bg-white text-muted-foreground hover:bg-muted/40"
                }`}
                onClick={() => setIsBusinessNumber(true)}
              >
                <div className="font-medium text-foreground">Main Number</div>
                <div className="text-xs text-muted-foreground">Replaces the current main number</div>
              </button>
              <button
                type="button"
                className={`rounded-lg border px-3 py-2 text-left text-sm transition ${
                  !isBusinessNumber
                    ? "border-blue-200 bg-blue-50 text-blue-700 shadow-sm"
                    : "border-muted bg-white text-muted-foreground hover:bg-muted/40"
                }`}
                onClick={() => setIsBusinessNumber(false)}
              >
                <div className="font-medium text-foreground">Secondary Number (WhatsApp)</div>
                <div className="text-xs text-muted-foreground">Adds another notification recipient</div>
              </button>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">{typeNote}</p>
          </div>

          <div>
            <label className="block text-sm font-medium">Phone Number</label>
            <div className="mt-2 rounded-md border bg-white px-3 py-2 shadow-sm transition focus-within:ring-2 focus-within:ring-blue-500">
              <PhoneInput
                international
                countryCallingCodeEditable={false}
                defaultCountry="GH"
                value={phoneNumber}
                onChange={(value) => setPhoneNumber(value || "")}
                disabled={isSubmitting}
                className="flex w-full items-center gap-2"
                numberInputProps={{
                  className: "w-full bg-transparent text-sm outline-none"
                }}
              />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Use international format with country code (for example, +233...).
            </p>
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
        </div>
      </form>
    </div>
  )
}
