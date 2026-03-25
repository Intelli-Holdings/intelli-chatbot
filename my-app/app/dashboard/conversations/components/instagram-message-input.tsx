"use client"

import type React from "react"
import Image from "next/image"
import { useState, useRef, type ChangeEvent, type KeyboardEvent, useEffect } from "react"
import { Paperclip, X, FileIcon, Loader2, Mic, Trash2, Smile, MessageSquareText, Heart, ImageIcon, Camera } from "lucide-react"
import { Button } from "@/components/ui/button"
import { sendInstagramMessage } from "@/app/actions"
import { useUser } from "@clerk/nextjs"
import { toast } from "sonner"
import { logger } from "@/lib/logger"
import EmojiPicker from "emoji-picker-react"
import { Textarea } from "@/components/ui/textarea"

interface InstagramMessageInputProps {
  customerNumber: string
  instagramBusinessAccountId: string
  organizationId?: string
  onMessageSent?: (newMessageContent: string, mediaUrl?: string, mediaType?: string) => number | void
  onMessageSendSuccess?: (tempId: number, realMessage: any) => void
  onMessageSendFailure?: (tempId: number) => void
  onOpenCannedResponses?: () => void
}

const INSTAGRAM_TEXT_LIMIT = 1000

const InstagramMessageInput: React.FC<InstagramMessageInputProps> = ({
  customerNumber,
  instagramBusinessAccountId,
  organizationId,
  onMessageSent,
  onMessageSendSuccess,
  onMessageSendFailure,
  onOpenCannedResponses,
}) => {
  const [answer, setAnswer] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [files, setFiles] = useState<File[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [audioWaveform, setAudioWaveform] = useState<number[]>([])

  const fileInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  const { user } = useUser()

  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl)
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [audioUrl])

  // Listen for retry events from failed messages
  useEffect(() => {
    const handleRetry = async (event: CustomEvent) => {
      const { content } = event.detail
      if (content) {
        setAnswer(content)
        setTimeout(() => {
          const form = document.querySelector('form') as HTMLFormElement
          if (form) {
            form.requestSubmit()
          }
        }, 100)
      }
    }

    window.addEventListener("retryMessage", handleRetry as unknown as EventListener)

    const handleCannedResponse = (event: CustomEvent) => {
      const { content } = event.detail
      if (content) {
        setAnswer(content)
        if (textareaRef.current) {
          textareaRef.current.focus()
        }
      }
    }

    window.addEventListener("setCannedResponse", handleCannedResponse as unknown as EventListener)

    return () => {
      window.removeEventListener("retryMessage", handleRetry as unknown as EventListener)
      window.removeEventListener("setCannedResponse", handleCannedResponse as unknown as EventListener)
    }
  }, [])

  const getMediaType = (file: File): string => {
    if (file.type.startsWith("image/")) return "image"
    if (file.type.startsWith("video/")) return "video"
    if (file.type.startsWith("audio/")) return "audio"
    return "document"
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (isSubmitDisabled) return
    setError(null)
    setIsLoading(true)

    // Capture current state before clearing
    const currentAnswer = answer
    const currentFiles = [...files]
    const currentAudioBlob = audioBlob
    const currentAudioUrl = audioUrl

    let mediaUrl: string | undefined
    let mediaType: string | undefined

    if (currentFiles.length > 0) {
      mediaUrl = URL.createObjectURL(currentFiles[0])
      mediaType = getMediaType(currentFiles[0])
    } else if (currentAudioBlob) {
      mediaUrl = currentAudioUrl || undefined
      mediaType = "audio"
    }

    const tempId = onMessageSent ? onMessageSent(currentAnswer || "Media", mediaUrl, mediaType) : undefined

    // Clear input immediately (Instagram-style optimistic UX)
    setAnswer("")
    setFiles([])
    setAudioBlob(null)
    setAudioWaveform([])
    if (currentAudioUrl) {
      URL.revokeObjectURL(currentAudioUrl)
      setAudioUrl(null)
    }
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
    }

    try {
      const formData = new FormData()
      formData.append("customer_id", customerNumber)
      formData.append("instagram_business_account_id", instagramBusinessAccountId || "")

      if (currentAnswer.trim()) {
        formData.append("answer", currentAnswer)
      }

      currentFiles.forEach((file) => {
        formData.append("file", file)
        formData.append("type", getMediaType(file))
      })

      if (currentAudioBlob) {
        const audioFile = new File([currentAudioBlob], "voice-message.webm", { type: "audio/webm" })
        formData.append("file", audioFile)
        formData.append("type", "audio")
      }

      const response = await sendInstagramMessage(formData)
      logger.info("Instagram message sent successfully", { data: response })
    } catch (e) {
      setError((e as Error).message)
      toast.error("Failed to send message")
      logger.error("Error sending Instagram message", { error: e instanceof Error ? e.message : String(e) })

      if (tempId && onMessageSendFailure) {
        onMessageSendFailure(tempId)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      if (!isSubmitDisabled) {
        handleSubmit(e as any)
      }
    }
  }

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      // Validate file sizes for Instagram
      for (const file of newFiles) {
        const isImage = file.type.startsWith("image/")
        const maxSize = isImage ? 8 * 1024 * 1024 : 25 * 1024 * 1024
        if (file.size > maxSize) {
          toast.error(`${file.name} exceeds ${isImage ? "8MB" : "25MB"} limit`)
          return
        }
      }
      setFiles((prevFiles) => [...prevFiles, ...newFiles])
    }
  }

  const removeFile = (index: number) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index))
  }

  const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    // Enforce Instagram 1000 character limit
    if (new TextEncoder().encode(value).length <= INSTAGRAM_TEXT_LIMIT) {
      setAnswer(value)
    }
    adjustTextareaHeight()
  }

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }

  const visualizeAudio = () => {
    if (!analyserRef.current) return

    const bufferLength = analyserRef.current.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)
    analyserRef.current.getByteTimeDomainData(dataArray)

    const downSampledData = []
    const sampleSize = Math.floor(bufferLength / 50)
    for (let i = 0; i < 50; i++) {
      const start = i * sampleSize
      const slice = dataArray.slice(start, start + sampleSize)
      const averageAmplitude = slice.reduce((sum, val) => sum + Math.abs(val - 128), 0) / slice.length
      downSampledData.push(averageAmplitude / 128)
    }

    setAudioWaveform(downSampledData)
    animationFrameRef.current = requestAnimationFrame(visualizeAudio)
  }

  const startRecording = async () => {
    audioChunksRef.current = []
    setAudioWaveform([])
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)

      const audioContext = new AudioContext()
      const analyser = audioContext.createAnalyser()
      const source = audioContext.createMediaStreamSource(stream)
      source.connect(analyser)
      analyser.fftSize = 2048

      audioContextRef.current = audioContext
      analyserRef.current = analyser

      animationFrameRef.current = requestAnimationFrame(visualizeAudio)

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current)
        }
        if (audioContextRef.current) {
          audioContextRef.current.close()
          audioContextRef.current = null
        }
        analyserRef.current = null

        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" })
        setAudioBlob(audioBlob)
        const url = URL.createObjectURL(audioBlob)
        setAudioUrl(url)
        setIsRecording(false)
        setAudioWaveform([])

        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorderRef.current = mediaRecorder
      mediaRecorder.start()
      setIsRecording(true)
    } catch (error) {
      logger.error("Error accessing microphone", { error: error instanceof Error ? error.message : String(error) })
      toast.error("Failed to access microphone")
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
    }
  }

  const deleteRecording = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl)
    }
    setAudioBlob(null)
    setAudioUrl(null)
    setAudioWaveform([])
  }

  const handleEmojiClick = (emojiData: { emoji: string }) => {
    setAnswer((prev) => prev + emojiData.emoji)
    setShowEmojiPicker(false)
    if (textareaRef.current) {
      textareaRef.current.focus()
    }
  }

  const isSubmitDisabled = isLoading || (answer.trim() === "" && files.length === 0 && !audioBlob)
  const textByteLength = new TextEncoder().encode(answer).length

  const renderFilePreview = (file: File, index: number) => {
    if (file.type.startsWith("image/")) {
      return (
        <div key={index} className="relative">
          <Image
            src={URL.createObjectURL(file) || "/placeholder.svg"}
            alt={file.name}
            width={80}
            height={80}
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

  const renderAudioWaveform = () => {
    if (!isRecording || audioWaveform.length === 0) return null

    return (
      <div className="flex items-center gap-2 p-2 border-b bg-white">
        <div className="flex-grow flex items-center">
          <div className="w-full h-8 flex items-center">
            {audioWaveform.map((amplitude, index) => (
              <div
                key={index}
                className="h-full flex-grow mx-0.5 bg-[#3797F0]"
                style={{
                  height: `${amplitude * 100}%`,
                  minWidth: "2px",
                  maxWidth: "4px",
                  opacity: 0.7,
                }}
              />
            ))}
          </div>
        </div>
        <Button type="button" variant="destructive" size="sm" onClick={stopRecording} className="ml-2">
          Stop Recording
        </Button>
      </div>
    )
  }

  const hasContent = answer.trim() !== "" || files.length > 0 || !!audioBlob

  return (
    <div>
      {error && <p className="text-red-500 px-3 py-1.5 text-xs">{error}</p>}

      {showEmojiPicker && (
        <div className="p-2 border-b border-[#DBDBDB]">
          <div className="relative">
            <EmojiPicker onEmojiClick={handleEmojiClick} />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 h-6 w-6 bg-white rounded-full"
              onClick={() => setShowEmojiPicker(false)}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      )}

      {isRecording && renderAudioWaveform()}

      {files.length > 0 && (
        <div className="flex flex-wrap gap-2 p-2 border-b border-[#DBDBDB]">
          {files.map((file, index) => renderFilePreview(file, index))}
        </div>
      )}

      {audioUrl && (
        <div className="flex items-center gap-2 p-2 border-b border-[#DBDBDB]">
          <audio src={audioUrl} controls className="h-8 flex-grow" />
          <Button type="button" variant="ghost" size="icon" onClick={deleteRecording} className="h-8 w-8">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex items-end gap-2 px-3 py-2">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          multiple
          accept="image/png,image/jpeg,image/gif,image/webp,video/mp4,video/quicktime,video/webm,audio/aac,audio/mp4,audio/wav,audio/x-m4a,application/pdf"
          className="hidden"
        />

        {/* Emoji / Sticker button */}
        <button
          type="button"
          className="shrink-0 p-1.5 rounded-full hover:bg-gray-100 transition-colors"
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          disabled={isLoading || isRecording}
        >
          <Smile className="h-6 w-6 text-[#262626]" />
        </button>

        {/* Input field - Instagram pill style */}
        <div className="flex-1 flex items-end border border-[#DBDBDB] rounded-[22px] px-3 py-1.5 min-h-[44px]">
          <Textarea
            placeholder="Message..."
            className="flex-1 min-h-[24px] max-h-[120px] resize-none border-0 p-0 text-[14px] leading-[20px] placeholder:text-[#8E8E8E] focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent"
            value={answer}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            disabled={isLoading || isRecording}
            ref={textareaRef}
            rows={1}
          />

          {/* Right side icons inside the pill */}
          {!hasContent && (
            <div className="flex items-center gap-1 ml-2 shrink-0">
              <button
                type="button"
                className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isLoading}
              >
                <Mic className={`h-5 w-5 ${isRecording ? "text-red-500 animate-pulse" : "text-[#262626]"}`} />
              </button>
              <button
                type="button"
                className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading || isRecording}
              >
                <ImageIcon className="h-5 w-5 text-[#262626]" />
              </button>
              {onOpenCannedResponses && (
                <button
                  type="button"
                  className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                  onClick={onOpenCannedResponses}
                  disabled={isLoading || isRecording}
                  title="Canned responses"
                >
                  <MessageSquareText className="h-5 w-5 text-[#262626]" />
                </button>
              )}
            </div>
          )}

          {/* Send button when there is content */}
          {hasContent && (
            <button
              type="submit"
              className="ml-2 shrink-0 text-[14px] font-semibold text-[#0095F6] hover:text-[#00376B] transition-colors disabled:opacity-40"
              disabled={isSubmitDisabled}
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                "Send"
              )}
            </button>
          )}
        </div>

        {/* Heart quick-send when empty */}
        {!hasContent && (
          <button
            type="button"
            className="shrink-0 p-1.5 rounded-full hover:bg-gray-100 transition-colors"
            disabled={isLoading || isRecording}
            title="Send heart"
          >
            <Heart className="h-6 w-6 text-[#262626]" />
          </button>
        )}
      </form>

      {/* Character counter - subtle, only when typing */}
      {textByteLength > 0 && (
        <div className="px-4 pb-1">
          <span className={`text-[10px] ${textByteLength > 900 ? "text-red-500" : "text-[#8E8E8E]"}`}>
            {textByteLength}/{INSTAGRAM_TEXT_LIMIT}
          </span>
        </div>
      )}
    </div>
  )
}

export default InstagramMessageInput
