"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type { Email } from "@/lib/types"
import { X, Paperclip, Sparkles, Mic, MicOff } from "lucide-react"
import { useMediaQuery } from "@/hooks/use-media-query"
import { Drawer, DrawerContent, DrawerFooter, DrawerHeader, DrawerTitle } from "@/components/ui/drawer"

interface ComposeEmailProps {
  replyTo?: Email | null
  onClose: () => void
  onSend: (email: Email) => void
}

export function ComposeEmail({ replyTo, onClose, onSend }: ComposeEmailProps) {
  const [to, setTo] = useState(replyTo ? replyTo.from.email : "")
  const [cc, setCc] = useState("")
  const [bcc, setBcc] = useState("")
  const [subject, setSubject] = useState(replyTo ? `Re: ${replyTo.subject}` : "")
  const [body, setBody] = useState(
    replyTo
      ? `\n\n-------- Original Message --------\nFrom: ${replyTo.from.name}\nDate: ${replyTo.date.toLocaleString()}\nSubject: ${replyTo.subject}\n\n${replyTo.body}`
      : "",
  )
  const [isRecording, setIsRecording] = useState(false)
  const [open, setOpen] = useState(true)
  const isMobile = useMediaQuery("(max-width: 640px)")
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus()
      if (replyTo) {
        textareaRef.current.setSelectionRange(0, 0)
      }
    }
  }, [replyTo])

  const handleSend = () => {
    if (!to || !subject) return

    onSend({
      id: `draft-${Date.now()}`,
      from: {
        name: "Me",
        email: "me@example.com",
        avatar: "/placeholder.svg?height=40&width=40",
      },
      to: to.split(",").map((email) => email.trim()),
      cc: cc ? cc.split(",").map((email) => email.trim()) : [],
      bcc: bcc ? bcc.split(",").map((email) => email.trim()) : [],
      subject,
      body,
      date: new Date(),
      read: true,
      folder: "sent",
    })
  }

  const handleClose = () => {
    setOpen(false)
    onClose()
  }

  const generateAIResponse = () => {
    // In a real app, this would call an AI service
    const aiResponses = [
      "Thank you for your email. I've reviewed the information and will get back to with a more detailed response soon.",
      "I appreciate you reaching out. I'm available for the meeting suggested and look forward to discussing this further.",
      "Thanks for sharing this update. I'll review the attached documents and provide my feedback by end of week.",
    ]

    const randomResponse = aiResponses[Math.floor(Math.random() * aiResponses.length)]
    setBody(randomResponse + (replyTo ? body : ""))
  }

  const toggleRecording = () => {
    setIsRecording(!isRecording)

    if (!isRecording) {
      // In a real app, this would start speech recognition
      // For demo purposes, we'll simulate it with a timeout
      setTimeout(() => {
        setBody(
          (prev) =>
            prev +
            (prev ? "\n\n" : "") +
            "This is a transcribed message from voice input. In real application, this would use the Web Speech API to convert your speech text in real-time.",
        )
        setIsRecording(false)
      }, 3000)
    }
  }

  const content = (
    <>
      <div className="grid gap-4 py-4">
        <div>
          <Input placeholder="To" value={to} onChange={(e) => setTo(e.target.value)} />
        </div>
        <div>
          <Input placeholder="Cc" value={cc} onChange={(e) => setCc(e.target.value)} />
        </div>
        <div>
          <Input placeholder="Bcc" value={bcc} onChange={(e) => setBcc(e.target.value)} />
        </div>
        <div>
          <Input placeholder="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} />
        </div>
        <div className="relative">
          <Textarea
            ref={textareaRef}
            placeholder="Write your message here..."
            className="min-h-[200px]"
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
          {isRecording && (
            <div className="absolute bottom-3 right-3 animate-pulse">
              <span className="flex h-3 w-3 items-center justify-center">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500"></span>
              </span>
            </div>
          )}
        </div>
      </div>
      <div className="flex justify-between">
        <div className="flex gap-2">
          <Button variant="outline" size="icon" title="Attach file">
            <Paperclip className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" className="gap-1" onClick={generateAIResponse}>
            <Sparkles className="h-4 w-4" />
            AI Suggest
          </Button>
          <Button
            variant={isRecording ? "destructive" : "outline"}
            size="sm"
            className="gap-1"
            onClick={toggleRecording}
          >
            {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            {isRecording ? "Stop" : "Dictate"}
          </Button>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={handleClose}>
            Discard
          </Button>
          <Button onClick={handleSend}>Send</Button>
        </div>
      </div>
    </>
  )

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={setOpen} onClose={handleClose}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Compose Email</DrawerTitle>
            <Button variant="ghost" size="icon" className="absolute right-4 top-4" onClick={handleClose}>
              <X className="h-4 w-4" />
            </Button>
          </DrawerHeader>
          <div className="px-4">{content}</div>
          <DrawerFooter className="pt-2">
            <Button onClick={handleSend}>Send</Button>
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Compose Email</DialogTitle>
          <Button variant="ghost" size="icon" className="absolute right-4 top-4" onClick={handleClose}>
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>
        {content}
        <DialogFooter className="sm:justify-end">
          <Button onClick={handleSend}>Send</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

