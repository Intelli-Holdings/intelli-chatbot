"use client"
import type React from "react"
import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { joinWaitlist } from "@/lib/waitlist"
import { ArrowRight, ArrowLeft, Check } from "lucide-react"

const Waitlist: React.FC = () => {
  const [email, setEmail] = useState("")
  const [companyName, setCompanyName] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [fullName, setFullName] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  const steps = [
    {
      field: "email",
      value: email,
      setter: setEmail,
      label: "Email",
      placeholder: "Your email address",
      type: "email",
    },
    {
      field: "companyName",
      value: companyName,
      setter: setCompanyName,
      label: "Company Name",
      placeholder: "Your company name",
      type: "text",
    },
    {
      field: "phoneNumber",
      value: phoneNumber,
      setter: setPhoneNumber,
      label: "Phone Number",
      placeholder: "Start with country code e.g +1",
      type: "tel",
    },
    {
      field: "fullName",
      value: fullName,
      setter: setFullName,
      label: "Full Name",
      placeholder: "Your full name",
      type: "text",
    },
  ]

  const isCurrentStepValid = steps[currentStep]?.value.trim() !== ""
  const isFormValid = email && companyName && phoneNumber && fullName
  const isLastStep = currentStep === steps.length - 1

  useEffect(() => {
    const savedForm = localStorage.getItem("waitlistForm")
    if (savedForm) {
      const { email, companyName, phoneNumber, fullName } = JSON.parse(savedForm)
      setEmail(email || "")
      setCompanyName(companyName || "")
      setPhoneNumber(phoneNumber || "")
      setFullName(fullName || "")
    }
  }, [])

  const nextStep = () => {
    if (currentStep < steps.length - 1 && isCurrentStepValid) {
      setIsAnimating(true)
      setTimeout(() => {
        setCurrentStep(currentStep + 1)
        setIsAnimating(false)
      }, 300)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setIsAnimating(true)
      setTimeout(() => {
        setCurrentStep(currentStep - 1)
        setIsAnimating(false)
      }, 300)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (isFormValid) {
      const formData = new FormData()
      formData.append("email", email)
      formData.append("companyName", companyName)
      formData.append("phoneNumber", phoneNumber)
      formData.append("fullName", fullName)

      try {
        setIsLoading(true)
        const { success } = await joinWaitlist(formData)

        if (success) {
          setIsSubmitted(true)
          localStorage.setItem("waitlistForm", JSON.stringify({ email, companyName, phoneNumber, fullName }))
          toast.success("Success! You have joined the waitlist and received a 20% discount!")
        } else {
          toast.error("Failed to join waitlist")
        }
      } catch (error) {
        console.error("Error joining waitlist:", error)
        toast.error("Something went wrong, please try submitting again.")
      } finally {
        setIsLoading(false)
      }
    } else {
      toast.error("Please fill in all fields")
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      if (isLastStep) {
        if (isFormValid) {
          handleSubmit(e as unknown as React.FormEvent)
        }
      } else if (isCurrentStepValid) {
        nextStep()
      }
    }
  }

  const currentField = steps[currentStep]

  return (
    <div className="relative w-full max-w-md">
      {/* Dynamic gradient blobs */}
      <div className="absolute -top-20 -left-20 w-64 h-64 bg-[#007fff]/30 rounded-full blur-3xl animate-blob"></div>
      <div className="absolute top-40 -right-20 w-72 h-72 bg-[#007fff]/20 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-20 left-20 w-56 h-56 bg-[#007fff]/25 rounded-full blur-3xl animate-blob animation-delay-4000"></div>

      <Card className="relative bg-white/80 backdrop-blur-lg rounded-xl p-6 border border-white/20 shadow-xl overflow-hidden z-10">
        <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-transparent via-[#007fff] to-transparent opacity-70"></div>

        <CardHeader className="pb-2">
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-[#007fff] to-blue-600 bg-clip-text text-transparent">
            Early Access Form
          </CardTitle>
          <CardDescription className="text-lg font-medium text-gray-600">
            Sign up to get early access by joining the waitlist.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative overflow-hidden" style={{ minHeight: "100px" }}>
              <div
                className={`p-1 transition-all duration-300 ease-in-out ${isAnimating ? "opacity-0 transform translate-x-full" : "opacity-100 transform translate-x-0"}`}
              >
                <Label className="block text-gray-700 font-medium mb-2">{currentField.label}:</Label>
                <Input
                  placeholder={currentField.placeholder}
                  type={currentField.type}
                  value={currentField.value}
                  onChange={(e) => currentField.setter(e.target.value)}
                  onKeyDown={handleKeyDown}
                  required
                  autoFocus
                  className="border- bg-white/90 shadow-lg rounded-lg px-4 py-3 w-full focus:outline-none focus:ring-2 focus:ring-[#007fff] transition-all duration-200"
                />
              </div>
            </div>

            <div className="flex justify-between items-center mt-8">
              {currentStep > 0 ? (
                <Button
                  type="button"
                  onClick={prevStep}
                  variant="outline"
                  className="flex items-center gap-2 border-[#007fff]/30 text-[#007fff] hover:bg-[#007fff]/10 transition-all duration-200"
                >
                  <ArrowLeft className="h-4 w-4" /> Back
                </Button>
              ) : (
                <div></div> // Empty div to maintain layout
              )}

              <div className="flex-1 flex justify-center">
                <div className="flex gap-2">
                  {steps.map((_, index) => (
                    <div
                      key={index}
                      className={`h-2 w-2 rounded-full transition-all duration-300 ${
                        index === currentStep
                          ? "bg-[#007fff] scale-125"
                          : index < currentStep
                            ? "bg-[#007fff]/60"
                            : "bg-gray-300"
                      }`}
                    />
                  ))}
                </div>
              </div>

              {isLastStep ? (
                <Button
                  className="bg-gradient-to-r from-[#007fff] to-blue-600 hover:opacity-90 text-white font-bold py-2 px-6 rounded-lg shadow-lg shadow-[#007fff]/20 flex items-center gap-2 transition-all duration-200"
                  type="submit"
                  disabled={!isFormValid || isLoading || isSubmitted}
                >
                  {isSubmitted ? (
                    <>
                      Joined <Check className="h-4 w-4" />
                    </>
                  ) : isLoading ? (
                    <div className="flex items-center gap-2">
                      <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                      Joining...
                    </div>
                  ) : (
                    "Submit"
                  )}
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={nextStep}
                  disabled={!isCurrentStepValid}
                  className="bg-gradient-to-r from-[#007fff] to-blue-600 hover:opacity-90 text-white font-bold py-2 px-6 rounded-lg shadow-lg shadow-[#007fff]/20 flex items-center gap-2 transition-all duration-200"
                >
                  Next <ArrowRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default Waitlist

