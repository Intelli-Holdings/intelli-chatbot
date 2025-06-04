"use client"

import type React from "react"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup } from "@/components/ui/radio-group"

interface CreateTemplateFormProps {
  onClose: () => void
}

export default function CreateTemplateForm({ onClose }: CreateTemplateFormProps) {
  const [templateData, setTemplateData] = useState({
    name: "",
    locale: "en_US",
    category: "UTILITY",
    headerType: "NONE",
    body: "",
    footer: "",
    buttonType: "NONE",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Template data:", templateData)
    onClose()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="template-name" className="text-xs font-medium text-muted-foreground">
            TEMPLATE NAME *
          </Label>
          <Input
            id="template-name"
            placeholder="Use a name to track it later"
            value={templateData.name}
            onChange={(e) => setTemplateData({ ...templateData, name: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="locale" className="text-xs font-medium text-muted-foreground">
            LOCALE *
          </Label>
          <select
            id="locale"
            className="w-full rounded-md border border-input bg-background px-3 py-2"
            value={templateData.locale}
            onChange={(e) => setTemplateData({ ...templateData, locale: e.target.value })}
          >
            <option value="en_US">English (US)</option>
            <option value="es_ES">Spanish (Spain)</option>
            <option value="pt_BR">Portuguese (Brazil)</option>
            <option value="fr_FR">French (France)</option>
            <option value="de_DE">German</option>
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-xs font-medium text-muted-foreground">TEMPLATE CATEGORY *</Label>
        <div className="flex gap-2">
          <Button
            type="button"
            variant={templateData.category === "UTILITY" ? "default" : "outline"}
            className={templateData.category === "UTILITY" ? "bg-blue-600 hover:bg-blue-700" : ""}
            onClick={() => setTemplateData({ ...templateData, category: "UTILITY" })}
          >
            Utility
          </Button>
          <Button
            type="button"
            variant={templateData.category === "MARKETING" ? "default" : "outline"}
            className={templateData.category === "MARKETING" ? "bg-blue-600 hover:bg-blue-700" : ""}
            onClick={() => setTemplateData({ ...templateData, category: "MARKETING" })}
          >
            Marketing
          </Button>
          <Button
            type="button"
            variant={templateData.category === "AUTH/OTP" ? "default" : "outline"}
            className={templateData.category === "AUTH/OTP" ? "bg-blue-600 hover:bg-blue-700" : ""}
            onClick={() => setTemplateData({ ...templateData, category: "AUTH/OTP" })}
          >
            Auth/OTP
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-xs font-medium text-muted-foreground">HEADER TYPE *</Label>
        <div>
          <Button
            type="button"
            variant={templateData.headerType === "NONE" ? "default" : "outline"}
            className={templateData.headerType === "NONE" ? "bg-blue-600 hover:bg-blue-700" : ""}
            onClick={() => setTemplateData({ ...templateData, headerType: "NONE" })}
          >
            No Header
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="message-body" className="text-xs font-medium text-muted-foreground">
            MESSAGE BODY (1024)*
          </Label>
          <div className="flex gap-2">
            <Button type="button" variant="outline" size="sm" className="h-8 gap-1">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M12 6V12M12 12V18M12 12H18M12 12H6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Custom Fields
            </Button>
            <Button type="button" variant="outline" size="sm" className="h-8 gap-1">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M4 7V4H20V7M9 20H15M12 4V20"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Variables
            </Button>
            <Button type="button" variant="outline" size="sm" className="h-8 gap-1">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M12 14C8.13401 14 5 17.134 5 21H19C19 17.134 15.866 14 12 14Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Name
            </Button>
          </div>
        </div>
        <Textarea
          id="message-body"
          className="min-h-[200px]"
          placeholder="Type your message here..."
          value={templateData.body}
          onChange={(e) => setTemplateData({ ...templateData, body: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="footer-text" className="text-xs font-medium text-muted-foreground">
          FOOTER TEXT
        </Label>
        <Input
          id="footer-text"
          placeholder="Provide text for footer (60)"
          value={templateData.footer}
          onChange={(e) => setTemplateData({ ...templateData, footer: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label className="text-xs font-medium text-muted-foreground">BUTTON</Label>
        <RadioGroup
          value={templateData.buttonType}
          onValueChange={(value) => setTemplateData({ ...templateData, buttonType: value })}
          className="flex gap-2"
        >
          <div className="flex items-center space-x-2">
            <Button
              type="button"
              variant={templateData.buttonType === "NONE" ? "default" : "outline"}
              className={templateData.buttonType === "NONE" ? "bg-blue-600 hover:bg-blue-700" : ""}
              onClick={() => setTemplateData({ ...templateData, buttonType: "NONE" })}
            >
              <svg
                className="mr-2 h-4 w-4"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M18 6L6 18M6 6L18 18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              None
            </Button>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              type="button"
              variant={templateData.buttonType === "CALL_TO_ACTION" ? "default" : "outline"}
              className={templateData.buttonType === "CALL_TO_ACTION" ? "bg-blue-600 hover:bg-blue-700" : ""}
              onClick={() => setTemplateData({ ...templateData, buttonType: "CALL_TO_ACTION" })}
            >
              <svg
                className="mr-2 h-4 w-4"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M15 3H6C5.46957 3 4.96086 3.21071 4.58579 3.58579C4.21071 3.96086 4 4.46957 4 5V19C4 19.5304 4.21071 20.0391 4.58579 20.4142C4.96086 20.7893 5.46957 21 6 21H18C18.5304 21 19.0391 20.7893 19.4142 20.4142C19.7893 20.0391 20 19.5304 20 19V8M15 3L20 8M15 3V8H20"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Call To Action
            </Button>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              type="button"
              variant={templateData.buttonType === "QUICK_REPLY" ? "default" : "outline"}
              className={templateData.buttonType === "QUICK_REPLY" ? "bg-blue-600 hover:bg-blue-700" : ""}
              onClick={() => setTemplateData({ ...templateData, buttonType: "QUICK_REPLY" })}
            >
              <svg
                className="mr-2 h-4 w-4"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M8 12H8.01M12 12H12.01M16 12H16.01M21 12C21 16.418 16.97 20 12 20C10.5286 20 9.14629 19.6376 7.94358 19C7.60128 19 6.27147 19.7393 5.54922 20C4.82696 20.2607 4.82696 19.7393 4.82696 19.5C4.82696 19.2607 5.29218 18.2143 5.54922 18C3.97631 16.7357 3 14.4643 3 12C3 7.582 7.03 4 12 4C16.97 4 21 7.582 21 12Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Quick Reply
            </Button>
          </div>
        </RadioGroup>
      </div>

      <div className="flex justify-end">
        <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
          Save
        </Button>
      </div>
    </form>
  )
}
