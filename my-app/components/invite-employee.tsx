"use client"
import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import BlockCopyButton from "@/components/copy-button"
import { TooltipProvider } from "@/components/ui/tooltip"
import KeywordsInput from "@/components/blocks/tag-input"

export function InviteEmployee() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value)
  }

  const handleSendInvite = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(
        "https://intelli-python-backend.onrender.com/dashboard/employees/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      )

      if (response.ok) {
        console.log("Invite sent successfully")
      } else {
        console.error("Failed to send invite")
      }
    } catch (error) {
      console.error("Error sending invite:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <CardHeader>
        <CardTitle>Invite Employee</CardTitle>
        <CardDescription>
          Copy and share this link with them so they can access your dashboard.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* <div className="flex space-x-2">
          <Input value="http://example.com/link/to/document" readOnly />
          <TooltipProvider>
            <BlockCopyButton
              event="copy_block_code"
              name="Invite Link"
              code="http://example.com/link/to/document"
            />
          </TooltipProvider>
        </div>
        
          <KeywordsInput onKeywordsChange={handleKeywordsChange} />
        */}
        <Separator className="my-4" />
        <div className="flex flex-col space-y-4">
          <Input
            id="email"
            placeholder="Enter employee email"
            value={email}
            onChange={handleEmailChange}
          />
          <Button onClick={handleSendInvite} disabled={isLoading}>
            {isLoading ? "Sending Invite..." : "Send Invite"}
          </Button>
        </div>
      </CardContent>
    </>
  )
}