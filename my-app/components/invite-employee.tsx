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
import { sendInvites } from "@/lib/dashboard/employeeService"

export function InviteEmployee() {
  const [keywords, setKeywords] = useState<string[]>([])

  const handleKeywordsChange = (newKeywords: string[]) => {
    setKeywords(newKeywords)
  }

  const handleSendInvites = () => {
    sendInvites(keywords)
  }

  return (
    <Card>
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
        </div> */}
        
        <Separator className="my-4" />
        <div className="space-y-4">
          <h4 className="text-medium font-medium">
            Invite employees via email
          </h4>
          <div className="grid gap-6">
            <KeywordsInput onKeywordsChange={handleKeywordsChange} />
            <Button onClick={handleSendInvites}>Send Invite</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}