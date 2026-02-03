"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Email } from "@/lib/types"
import {
  ArrowLeft,
  Archive,
  Trash2,
  Reply,
  ReplyAll,
  Forward,
  Star,
  MoreHorizontal,
  Sparkles,
  Mic,
  MicOff,
} from "lucide-react"
import { formatDate } from "@/lib/utils"
import { EmailSummary } from "@/components/email-summary"
import { useMediaQuery } from "@/hooks/use-media-query"

interface EmailDetailProps {
  email: Email
  onBack: () => void
  onReply: () => void
}

export function EmailDetail({ email, onBack, onReply }: EmailDetailProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [activeTab, setActiveTab] = useState<"original" | "summary">("original")
  const isDesktop = useMediaQuery("(min-width: 1024px)")

  const toggleRecording = () => {
    setIsRecording(!isRecording)
    // In a real app, this would start/stop speech recognition
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b p-2">
        {!isDesktop && (
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
        )}
        <div className="flex flex-1 items-center gap-2">
          <Button variant="ghost" size="icon" title="Archive">
            <Archive className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" title="Delete">
            <Trash2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" title="Star">
            <Star className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" title="More options">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="flex-1 overflow-auto p-4">
        <h1 className="text-xl font-bold">{email.subject}</h1>
        <div className="mt-4 flex items-start gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={email.from.avatar} alt={email.from.name} />
            <AvatarFallback>
              {email.from.name
                .split("")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <div>
                <span className="font-semibold">{email.from.name}</span>
                <span className="text-sm text-gray-500 dark:text-gray-400"> &lt;{email.from.email}&gt;</span>
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400">{formatDate(email.date)}</span>
            </div>
            <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              To: <span className="text-gray-950 dark:text-gray-50">{email.to.join(",")}</span>
            </div>
            {email.labels && email.labels.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {email.labels.map((label) => (
                  <Badge key={label} variant="outline">
                    {label}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "original" | "summary")} className="mt-6">
          <TabsList>
            <TabsTrigger value="original">Original</TabsTrigger>
            <TabsTrigger value="summary" className="flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5" />
              AI Summary
            </TabsTrigger>
          </TabsList>
          <TabsContent value="original" className="mt-4">
            <div className="prose prose-sm max-w-none">
              {email.body.split("\n\n").map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="summary" className="mt-4">
            <EmailSummary email={email} />
          </TabsContent>
        </Tabs>

        {email.attachments && email.attachments.length > 0 && (
          <>
            <Separator className="my-6" />
            <div>
              <h3 className="mb-2 font-semibold">Attachments ({email.attachments.length})</h3>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                {email.attachments.map((attachment) => (
                  <div key={attachment.name} className="flex flex-col items-center rounded-lg border border-gray-200 p-2 text-center dark:border-gray-800">
                    <div className="h-16 w-16 bg-gray-100/50 flex items-center justify-center rounded dark:bg-gray-800/50">
                      <span className="text-xs">{attachment.type}</span>
                    </div>
                    <p className="mt-1 truncate text-xs font-medium">{attachment.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{attachment.size}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
      <div className="border-t p-3">
        <div className="flex flex-wrap gap-2">
          <Button onClick={onReply} className="gap-1">
            <Reply className="h-4 w-4" />
            Reply
          </Button>
          <Button variant="outline" className="gap-1">
            <ReplyAll className="h-4 w-4" />
            Reply All
          </Button>
          <Button variant="outline" className="gap-1">
            <Forward className="h-4 w-4" />
            Forward
          </Button>
          <Button variant={isRecording ? "destructive" : "outline"} className="gap-1 ml-auto" onClick={toggleRecording}>
            {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            {isRecording ? "Stop" : "Dictate"}
          </Button>
        </div>
      </div>
    </div>
  )
}

