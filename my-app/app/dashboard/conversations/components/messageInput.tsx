"use client"

import type React from "react"
import { useState, useRef, type ChangeEvent, type KeyboardEvent, useEffect } from "react"
import { ArrowUp, Paperclip, X, FileIcon, Loader2, Mic, Trash2, Smile } from "lucide-react"
import { Button } from "@/components/ui/button"
import { sendMessage } from "@/app/actions"
import { useUser } from "@clerk/nextjs"
import { toast } from "sonner"
import EmojiPicker from "emoji-picker-react"
import { Input } from "@/components/ui/input"

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
    // Clean up audio URL when component unmounts
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl)
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [audioUrl])

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

      // Add audio file if exists
      if (audioBlob) {
        const audioFile = new File([audioBlob], "voice-message.webm", { type: "audio/webm" })
        formData.append("file", audioFile)
        formData.append("type", "audio")
      }

      const response = await sendMessage(formData)
      console.log("Message sent successfully:", response)
      toast.success("Message sent successfully")
      setAnswer("")
      setFiles([])
      setAudioBlob(null)
      setAudioWaveform([])
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl)
        setAudioUrl(null)
      }
      if (onMessageSent) onMessageSent()
    } catch (e) {
      setError((e as Error).message)
      toast.error("Failed to send message")
      console.error("Error sending message:", e)
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
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

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setAnswer(e.target.value)
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

    // Reduce the number of data points for a smoother waveform
    const downSampledData = []
    const sampleSize = Math.floor(bufferLength / 50) // Reduce to 50 points
    for (let i = 0; i < 50; i++) {
      const start = i * sampleSize
      const slice = dataArray.slice(start, start + sampleSize)
      const averageAmplitude = slice.reduce((sum, val) => sum + Math.abs(val - 128), 0) / slice.length
      downSampledData.push(averageAmplitude / 128) // Normalize to 0-1 range
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

      // Setup audio context for visualization
      const audioContext = new AudioContext()
      const analyser = audioContext.createAnalyser()
      const source = audioContext.createMediaStreamSource(stream)
      source.connect(analyser)
      analyser.fftSize = 2048

      audioContextRef.current = audioContext
      analyserRef.current = analyser

      // Start audio visualization
      animationFrameRef.current = requestAnimationFrame(visualizeAudio)

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        // Stop visualization
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current)
        }

        // Clean up audio context
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

        // Stop all tracks from the stream
        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorderRef.current = mediaRecorder
      mediaRecorder.start()
      setIsRecording(true)
    } catch (error) {
      console.error("Error accessing microphone:", error)
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

  const renderAudioWaveform = () => {
    if (!isRecording || audioWaveform.length === 0) return null

    return (
      <div className="flex items-center gap-2 p-2 border-b bg-white">
        <div className="flex-grow flex items-center">
          <div className="w-full h-8 flex items-center">
            {audioWaveform.map((amplitude, index) => (
              <div
                key={index}
                className="h-full flex-grow mx-0.5 bg-blue-500"
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

  return (
    <div>
      <form onSubmit={handleSubmit} className="rounded-xl">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          multiple
          accept="image/*,video/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          className="hidden"
        />
        {isRecording && renderAudioWaveform()}

        {files.length > 0 && (
          <div className="flex flex-wrap gap-2 p-2 border-b">
            {files.map((file, index) => renderFilePreview(file, index))}
          </div>
        )}

        {audioUrl && (
          <div className="flex items-center gap-2 p-2 border-b">
            <audio src={audioUrl} controls className="h-8 flex-grow" />
            <Button type="button" variant="ghost" size="icon" onClick={deleteRecording} className="h-8 w-8">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}

        <div className="p-2 bg-white flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="rounded-full"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            disabled={isLoading || isRecording}
          >
            <Smile className="h-5 w-5 text-[#54656f]" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="rounded-full"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading || isRecording}
          >
            <Paperclip className="h-5 w-5 text-[#54656f]" />
          </Button>
          <Input
            placeholder="Respond to customer..."
            className="bg-white border border-gray-100 flex-grow"
            value={answer}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            disabled={isLoading || isRecording}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="rounded-full"
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isLoading}
          >
            <Mic className="h-5 w-5 text-[#54656f]" />
          </Button>
          <Button className="rounded-full" type="submit" size="icon" variant="ghost" disabled={isSubmitDisabled}>
            {isLoading ? (
              <Loader2 className="h-5 w-5 text-[#54656f] animate-spin" />
            ) : (
              <ArrowUp className="h-5 w-5 text-[#54656f]" />
            )}
          </Button>
        </div>

        {showEmojiPicker && (
          <div className="absolute bottom-16 left-0 z-10">
            <EmojiPicker onEmojiClick={handleEmojiClick} />
          </div>
        )}
      </form>
      {error && <p className="text-red-500 mt-2 text-sm">{error}</p>}
    </div>
  )
}

export default MessageInput