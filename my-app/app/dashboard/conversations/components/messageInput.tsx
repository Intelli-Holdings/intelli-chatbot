"use client"

import type React from "react"
import { useState, useRef, type ChangeEvent, type KeyboardEvent } from "react"
import { ArrowUp, Paperclip, X, FileIcon, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { sendMessage } from "@/app/actions"
import { useUser } from "@clerk/nextjs"
import { Card } from "@/components/ui/card"
import { toast } from "sonner"
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

interface MessageInputProps {
  customerNumber: string
  phoneNumber: string
  onMessageSent?: () => void
}

const MessageInput: React.FC<MessageInputProps> = ({ customerNumber, phoneNumber, onMessageSent }) => {
  const [answer, setAnswer] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [files, setFiles] = useState<File[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { user } = useUser()

  const getMediaType = (file: File): string => {
    if (file.type.startsWith("image/")) return "image"
    if (file.type.startsWith("video/")) return "video"
    return "document"
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (isSubmitDisabled) return
    setError(null)
    setIsLoading(true)

    try {
      const formData = new FormData()
      formData.append("customer_number", customerNumber)
      formData.append("phone_number", phoneNumber || "")

      if (answer.trim()) {
        formData.append("answer", answer)
      }

      files.forEach((file) => {
        formData.append("file", file)
        formData.append("type", getMediaType(file))
      })

      const response = await sendMessage(formData)
      console.log("Message sent successfully:", response)
      toast.success("Message sent successfully")
      setAnswer("")
      setFiles([])
      if (onMessageSent) onMessageSent()
    } catch (e) {
      setError((e as Error).message)
      toast.error("Failed to send message")
      console.error("Error sending message:", e)
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles((prevFiles) => [...prevFiles, ...Array.from(e.target.files || [])])
    }
  }

  const removeFile = (index: number) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index))
  }

  const handleTextareaChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setAnswer(e.target.value)
    adjustTextareaHeight()
  }

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }

  const isSubmitDisabled = isLoading || (answer.trim() === "" && files.length === 0)

  const renderFilePreview = (file: File, index: number) => {
    if (file.type.startsWith("image/")) {
      return (
        <div key={index} className="relative">
          <img
            src={URL.createObjectURL(file) || "/placeholder.svg"}
            alt={file.name}
            className="w-20 h-20 object-cover rounded"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute top-0 right-0 h-5 w-5 bg-white rounded-full"
            onClick={() => removeFile(index)}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      )
    } else {
      return (
        <div key={index} className="flex items-center bg-gray-100 rounded p-1 pr-2">
          <FileIcon className="h-5 w-5 mr-2" />
          <span className="text-xs text-gray-700 max-w-[150px] truncate">{file.name}</span>
          <Button type="button" variant="ghost" size="icon" className="h-5 w-5 ml-1" onClick={() => removeFile(index)}>
            <X className="h-3 w-3" />
          </Button>
        </div>
      )
    }
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="rounded-lg">
        <Card className="mx-2 border shadow-sm">
          <div className="flex flex-col p-2">
            {files.length > 0 && (
              <div className="flex flex-wrap gap-2 p-2 border-b">
                {files.map((file, index) => renderFilePreview(file, index))}
              </div>
            )}
            <Textarea
              ref={textareaRef}
              placeholder="Reply to customer..."
              id="answer"
              className="border-0 p-3 m-1 shadow-xs focus-visible:ring-0 min-h-[40px] max-h-[200px] overflow-y-auto resize-none"
              value={answer}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              name="answer"
              disabled={isLoading}
            />
            <div className="flex items-center justify-between p-2">
              <div className="flex items-center">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  multiple
                  accept="image/*,video/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                  className="hidden"
                />
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isLoading}
                    >
                      <Paperclip className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    You can Attach images, pdfs and docs
                  </TooltipContent>
                </Tooltip>
              </div>
              <Button
                className={`${isSubmitDisabled ? "bg-gray-100" : "bg-blue-100"} border`}
                type="submit"
                size="icon"
                variant="ghost"
                disabled={isSubmitDisabled}
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <ArrowUp className="h-4 w-4 mr-1" />}
              </Button>
            </div>
          </div>
        </Card>
      </form>
      {error && <p className="text-red-500 mt-2 text-sm">{error}</p>}
    </div>
  )
}

export default MessageInput

