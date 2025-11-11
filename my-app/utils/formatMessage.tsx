"use client"

import Image from "next/image"
import React, { useState, useRef, useEffect } from "react"
import data from "@emoji-mart/data"
import Picker from "@emoji-mart/react"

interface MessageContentProps {
  text: string | null
  isExpanded?: boolean
  onToggle?: () => void
  replyTo?: {
    sender: string
    content: string
  }
  reactions?: Record<string, number>
  onAddReaction?: (emoji: string) => void
}

interface ImagePreviewProps {
  src: string
}

const ImagePreview: React.FC<ImagePreviewProps> = ({ src }) => {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)
  const [useImgTag, setUseImgTag] = useState(false)

  const handleImageError = () => {
    setIsLoading(false)
    setError(true)
    // Fallback to native img tag if Next/Image fails
    setUseImgTag(true)
  }

  return (
    <div className="relative rounded-md overflow-hidden my-2 max-w-xs">
      {isLoading && <div className="w-full h-40 bg-gray-200 animate-pulse rounded-md"></div>}

      {error && !useImgTag ? (
        <div className="bg-gray-100 p-3 text-sm text-gray-500 rounded border border-gray-200">Unable to load image</div>
      ) : useImgTag ? (
        // Fallback to native img tag for Azure Blob Storage
        <img
          src={src || "/placeholder.svg"}
          alt="Shared image"
          className={`rounded-md object-cover max-w-xs h-auto ${isLoading ? "invisible" : "visible"}`}
          onLoad={() => setIsLoading(false)}
          onError={handleImageError}
          crossOrigin="anonymous"
        />
      ) : (
        // Try Next/Image first
        <div className={`${isLoading ? "invisible" : "visible"}`}>
          <Image
            src={src || "/placeholder.svg"}
            alt="Shared image"
            width={300}
            height={200}
            className="rounded-md object-cover max-w-xs h-auto"
            onLoad={() => setIsLoading(false)}
            onError={handleImageError}
            unoptimized
          />
        </div>
      )}
    </div>
  )
}

interface AudioPlayerProps {
  src: string
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ src }) => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [playbackRate, setPlaybackRate] = useState(1)
  const audioRef = useRef<HTMLAudioElement>(null)
  const [waveformBars, setWaveformBars] = useState<number[]>([])

  // Generate random waveform on mount
  useEffect(() => {
    // Generate 30 random bars for the waveform
    const bars = Array.from({ length: 30 }, () => Math.random() * 0.8 + 0.2)
    setWaveformBars(bars)
  }, [])

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime)
    }
  }

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration)
    }
  }

  const handleEnded = () => {
    setIsPlaying(false)
    setCurrentTime(0)
    if (audioRef.current) {
      audioRef.current.currentTime = 0
    }
  }

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (audioRef.current) {
      const progressBar = e.currentTarget
      const rect = progressBar.getBoundingClientRect()
      const clickPosition = (e.clientX - rect.left) / rect.width
      const newTime = clickPosition * duration
      audioRef.current.currentTime = newTime
      setCurrentTime(newTime)
    }
  }

  const togglePlaybackRate = () => {
    const rates = [1, 1.5, 2, 0.5]
    const currentIndex = rates.indexOf(playbackRate)
    const nextIndex = (currentIndex + 1) % rates.length
    setPlaybackRate(rates[nextIndex])

    if (audioRef.current) {
      audioRef.current.playbackRate = rates[nextIndex]
    }
  }

  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60)
    const seconds = Math.floor(timeInSeconds % 60)
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`
  }

  // Calculate progress percentage
  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0

  // Determine which bars should be highlighted based on progress
  const highlightedBarsCount = Math.floor((progressPercentage / 100) * waveformBars.length)

  return (
    <div className="bg-[#dcf8c6] rounded-lg p-3 my-2 w-full max-w-md flex items-center">
      {/* Avatar placeholder - can be replaced with actual user avatar */}
      <div className="w-10 h-10 bg-gray-300 rounded-full overflow-hidden mr-3 flex-shrink-0">
        <div className="w-full h-full bg-gradient-to-br from-purple-500 to-blue-500"></div>
      </div>

      {/* Play button */}
      <button
        onClick={togglePlayPause}
        className="w-8 h-8 flex items-center justify-center bg-transparent rounded-full hover:bg-black/10 transition-colors mr-3 flex-shrink-0"
      >
        {isPlaying ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="6" y="4" width="4" height="16"></rect>
            <rect x="14" y="4" width="4" height="16"></rect>
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polygon points="5 3 19 12 5 21 5 3"></polygon>
          </svg>
        )}
      </button>

      {/* Waveform visualization */}
      <div className="flex-1 cursor-pointer" onClick={handleProgressClick}>
        <div className="flex items-center h-8 gap-[2px]">
          {waveformBars.map((height, index) => (
            <div
              key={index}
              className={`w-1 rounded-full ${index < highlightedBarsCount ? "bg-blue-400" : "bg-gray-300"}`}
              style={{ height: `${height * 100}%` }}
            ></div>
          ))}
        </div>
      </div>

      {/* Time indicators */}
      <div className="flex flex-col items-end ml-3 text-xs text-gray-600 flex-shrink-0">
        <span>{formatTime(currentTime)}</span>
        <span>{new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}</span>
      </div>

      {/* Checkmark for delivered/read status */}
      <div className="ml-1 text-green-500 flex-shrink-0">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      </div>

      <audio
        ref={audioRef}
        src={src}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        preload="metadata"
      />
    </div>
  )
}

interface VideoPlayerProps {
  src: string
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ src }) => {
  return (
    <div className="my-2 max-w-md rounded-lg overflow-hidden shadow">
      <video src={src} controls className="w-full h-auto bg-black rounded-lg" controlsList="nodownload">
        Your browser does not support the video tag.
      </video>
    </div>
  )
}

interface MessageReactionsProps {
  reactions: Record<string, number>
  onAddReaction: (emoji: string) => void
}

const MessageReactions: React.FC<MessageReactionsProps> = ({ reactions, onAddReaction }) => {
  const [showPicker, setShowPicker] = useState(false)

  return (
    <div className="flex items-center mt-2 space-x-1">
      {Object.entries(reactions).map(([emoji, count]) => (
        <button
          key={emoji}
          className="px-2 py-1 text-xs bg-gray-100 rounded-full hover:bg-gray-200"
          onClick={() => onAddReaction(emoji)}
        >
          {emoji} {count}
        </button>
      ))}

      <button className="p-1 text-gray-500 hover:bg-gray-100 rounded-full" onClick={() => setShowPicker(!showPicker)}>
        <span>+</span>
      </button>

      {showPicker && (
        <div className="absolute z-10">
          <Picker
            data={data}
            onEmojiSelect={(emoji: any) => {
              onAddReaction(emoji.native)
              setShowPicker(false)
            }}
          />
        </div>
      )}
    </div>
  )
}

interface ReplyPreviewProps {
  replyTo: {
    sender: string
    content: string
  }
}

const ReplyPreview: React.FC<ReplyPreviewProps> = ({ replyTo }) => {
  if (!replyTo) return null

  return (
    <div className="pl-2 border-l-2 border-gray-300 mb-2 text-sm text-gray-500">
      <div className="font-medium">{replyTo.sender}</div>
      <div className="truncate">{replyTo.content.substring(0, 100)}</div>
    </div>
  )
}

interface TypingIndicatorProps {
  users?: string[]
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({ users = [] }) => {
  if (users.length === 0) return null

  return (
    <div className="flex items-center text-sm text-gray-500 p-2">
      <div className="flex space-x-1 mr-2">
        <span className="animate-bounce delay-0 h-2 w-2 bg-gray-400 rounded-full"></span>
        <span className="animate-bounce delay-150 h-2 w-2 bg-gray-400 rounded-full"></span>
        <span className="animate-bounce delay-300 h-2 w-2 bg-gray-400 rounded-full"></span>
      </div>
      <span>{users.length === 1 ? `${users[0]} is typing...` : `${users.length} people are typing...`}</span>
    </div>
  )
}

const emojiRegex = /(:[\w+-]+:)/g

const processEmojis = (text: string): string => {
  // Simple emoji mapping - in a real app, you'd use a complete emoji library
  const emojiMap: Record<string, string> = {
    ":smile:": "😊",
    ":laugh:": "😂",
    ":thumbsup:": "👍",
    ":heart:": "❤️",
    ":fire:": "🔥",
    ":tada:": "🎉",
    ":thinking:": "🤔",
    ":clap:": "👏",
  }

  return text.replace(emojiRegex, (match) => {
    return emojiMap[match] || match
  })
}

/**
 * Enhanced media type detection for Azure Blob Storage and standard URLs
 */
const createMediaUrlRegex = (): RegExp => {
  const azureBlobPattern =
    "https?:\\/\\/[a-zA-Z0-9]+\\.blob\\.core\\.windows\\.net\\/[^\\s]+\\.(jpg|jpeg|png|gif|webp|mp3|wav|ogg|m4a|aac|opus|webm|mp4|webm|avi|mov|mkv|flv|wmv|3gp)(\\?[^\\s]*)?"
  const standardMediaPattern =
    "https?:\\/\\/[^\\s]+\\.(jpg|jpeg|png|gif|webp|mp3|wav|ogg|m4a|aac|opus|webm|mp4|webm|avi|mov|mkv|flv|wmv|3gp)(\\?[^\\s]*)?"
  return new RegExp(`(${azureBlobPattern}|${standardMediaPattern})`, "gi")
}

/**
 * Detects if a URL is a media file (image, audio, or video)
 * Supports Azure Blob Storage URLs and standard image/audio/video URLs
 */
const getMediaType = (url: string): "image" | "audio" | "video" | null => {
  if (!url) return null

  const lowerUrl = url.toLowerCase()

  // Image extensions
  if (/\.(jpg|jpeg|png|gif|webp)(\?|$)/i.test(lowerUrl)) {
    return "image"
  }

  // Audio extensions
  if (/\.(mp3|wav|ogg|m4a|aac|opus|webm)(\?|$)/i.test(lowerUrl)) {
    return "audio"
  }

  // Video extensions
  if (/\.(mp4|webm|avi|mov|mkv|flv|wmv|3gp)(\?|$)/i.test(lowerUrl)) {
    return "video"
  }

  return null
}

const processTextWithLinks = (text: string): React.ReactNode[] => {
  text = processEmojis(text)
  text = text.replace(/\[MEDIA_PLACEHOLDER\]/gi, "").trim()

  // Matches: [AUDIO] Media - https://... OR [AUDIO] 123456 - https://...
  const audioRegex = /\[AUDIO\]\s+(?:Media|\d+)\s+-\s+(https?:\/\/[^\s]+)/gi

  // Matches: [IMAGE] 123456 - https://... (with or without URL)
  const imageUrlRegex =
    /\[IMAGE\]\s+\d+(?:\s+-\s+(https?:\/\/[^\s]+))?|(?:https?:\/\/[a-zA-Z0-9]+\.blob\.core\.windows\.net\/[^\s]+\.(jpg|jpeg|png|gif|webp)(?:\?[^\s]*)?)/gi

  // Matches: [VIDEO] 123456 - https://... OR direct video URLs
  const videoUrlRegex =
    /\[VIDEO\]\s+\d+(?:\s+-\s+(https?:\/\/[^\s]+))?|(https?:\/\/[^\s]+\.(mp4|avi|mov|mkv|flv|wmv|3gp)(?:\?[^\s]*)?|https?:\/\/[a-zA-Z0-9]+\.blob\.core\.windows\.net\/[^\s]+\.(mp4|avi|mov|mkv|flv|wmv|3gp)(?:\?[^\s]*)?)/gi

  const documentRegex =
    /\[DOCUMENT\]\s+(.*?)(?:\s+-\s+|\s+)(https?:\/\/[^\s]+\.(pdf|xls|xlsx|csv|doc|docx)(?:\?[^\s]*)?)/gi

  const urlRegex = /(https?:\/\/[^\s\]]+|\[([^\]]+)\]\s+([^\s\]]+))/g

  // Process audio matches first (highest priority for both Firebase and Azure)
  const audioMatches = text.match(audioRegex)
  if (audioMatches) {
    let processedText = text
    const audioPlayers = audioMatches
      .map((match, index) => {
        const urlMatch = match.match(/https?:\/\/[^\s]+/)
        const audioUrl = urlMatch ? urlMatch[0] : match

        const placeholder = `__AUDIO_PLACEHOLDER_${index}__`
        processedText = processedText.replace(match, placeholder)
        return React.createElement(AudioPlayer, { key: `audio-${index}`, src: audioUrl })
      })
      .filter(Boolean)

    const parts = processedText.split(/(__AUDIO_PLACEHOLDER_\d+__)/)
    const result: (string | React.ReactNode)[] = []

    parts.forEach((part) => {
      const placeholderMatch = part.match(/__AUDIO_PLACEHOLDER_(\d+)__/)
      if (placeholderMatch) {
        const audioIndex = Number.parseInt(placeholderMatch[1], 10)
        result.push(audioPlayers[audioIndex])
      } else if (part) {
        result.push(part)
      }
    })

    return result
  }

  // Process image matches second (after audio)
  const imageMatches = text.match(imageUrlRegex)
  if (imageMatches) {
    let processedText = text
    const imagePreviews: React.ReactNode[] = []

    imageMatches.forEach((match, index) => {
      let imgUrl = match
      if (match.includes("[IMAGE]")) {
        // Extract URL after the dash if it exists
        const urlMatch = match.match(/https?:\/\/[^\s]+/)
        if (urlMatch) {
          imgUrl = urlMatch[0]
          const placeholder = `__IMAGE_PLACEHOLDER_${index}__`
          processedText = processedText.replace(match, placeholder)
          imagePreviews.push(React.createElement(ImagePreview, { key: `img-${index}`, src: imgUrl }))
        } else {
          // [IMAGE] without URL - just remove it from display
          processedText = processedText.replace(match, "")
        }
      } else {
        // Azure or direct URL format
        imgUrl = match
        const placeholder = `__IMAGE_PLACEHOLDER_${index}__`
        processedText = processedText.replace(match, placeholder)
        imagePreviews.push(React.createElement(ImagePreview, { key: `img-${index}`, src: imgUrl }))
      }
    })

    const parts = processedText.split(/(__IMAGE_PLACEHOLDER_\d+__)/)
    const result: (string | React.ReactNode)[] = []

    parts.forEach((part) => {
      const placeholderMatch = part.match(/__IMAGE_PLACEHOLDER_(\d+)__/)
      if (placeholderMatch) {
        const imageIndex = Number.parseInt(placeholderMatch[1], 10)
        result.push(imagePreviews[imageIndex])
      } else if (part) {
        result.push(part)
      }
    })

    return result
  }

  const videoMatches = text.match(videoUrlRegex)
  if (videoMatches) {
    let processedText = text
    const videoPlayers = videoMatches
      .map((videoUrl, index) => {
        const placeholder = `__VIDEO_PLACEHOLDER_${index}__`
        processedText = processedText.replace(videoUrl, placeholder)
        return React.createElement(VideoPlayer, { key: `video-${index}`, src: videoUrl })
      })
      .filter(Boolean)

    const parts = processedText.split(/(__VIDEO_PLACEHOLDER_\d+__)/)
    const result: (string | React.ReactNode)[] = []

    parts.forEach((part) => {
      const placeholderMatch = part.match(/__VIDEO_PLACEHOLDER_(\d+)__/)
      if (placeholderMatch) {
        const videoIndex = Number.parseInt(placeholderMatch[1], 10)
        result.push(videoPlayers[videoIndex])
      } else if (part) {
        result.push(part)
      }
    })

    return result
  }

  const documentMatches = text.match(documentRegex)
  if (documentMatches) {
    let processedText = text
    const documentAttachments = documentMatches
      .map((docPattern, index) => {
        const match = docPattern.match(
          /\[DOCUMENT\]\s+(.*?)(?:\s+-\s+|\s+)(https?:\/\/[^\s]+\.(pdf|xls|xlsx|csv|doc|docx)(\?[^\s]*)?)/i,
        )
        if (match && match[1] && match[2]) {
          const filename = match[1].trim()
          const url = match[2]
          const fileExtension = url.split(".").pop()?.split("?")[0] || ""

          const placeholder = `__DOCUMENT_PLACEHOLDER_${index}__`
          processedText = processedText.replace(docPattern, placeholder)

          return React.createElement(DocumentAttachment, {
            key: `doc-${index}`,
            url: url,
            filename: filename,
            fileType: fileExtension,
          })
        }
        return null
      })
      .filter(Boolean)

    const parts = processedText.split(/(__DOCUMENT_PLACEHOLDER_\d+__)/)
    const result: (string | React.ReactNode)[] = []

    parts.forEach((part) => {
      const placeholderMatch = part.match(/__DOCUMENT_PLACEHOLDER_(\d+)__/)
      if (placeholderMatch) {
        const docIndex = Number.parseInt(placeholderMatch[1], 10)
        result.push(documentAttachments[docIndex])
      } else if (part) {
        const linkParts = part.split(urlRegex)
        result.push(
          ...linkParts.map((part, idx) => {
            if (urlRegex.test(part) && !imageUrlRegex.test(part)) {
              const match = part.match(/\[([^\]]+)\]\s+([^\s\]]+)/)
              if (match) {
                const [, linkText, url] = match
                return React.createElement(
                  "a",
                  {
                    key: idx,
                    href: url,
                    target: "_blank",
                    rel: "noopener noreferrer",
                    className: "text-blue-500 hover:underline",
                    title: url,
                  },
                  linkText,
                )
              } else {
                return React.createElement(
                  "a",
                  {
                    key: idx,
                    href: part,
                    target: "_blank",
                    rel: "noopener noreferrer",
                    className: "text-blue-500 hover:underline",
                    title: part,
                  },
                  part,
                )
              }
            }
            return part
          }),
        )
      }
    })

    return result
  }

  // If no media patterns, process as before
  const parts = text.split(urlRegex)

  return parts.map((part, index) => {
    if (urlRegex.test(part)) {
      const match = part.match(/\[([^\]]+)\]\s+([^\s\]]+)/)
      if (match) {
        const [, linkText, url] = match
        return React.createElement(
          "a",
          {
            key: index,
            href: url,
            target: "_blank",
            rel: "noopener noreferrer",
            className: "text-blue-500 hover:underline",
            title: url,
          },
          linkText,
        )
      } else {
        return React.createElement(
          "a",
          {
            key: index,
            href: part,
            target: "_blank",
            rel: "noopener noreferrer",
            className: "text-blue-500 hover:underline",
            title: part,
          },
          part,
        )
      }
    }
    return part
  })
}

// Document attachment interface
interface DocumentAttachmentProps {
  url: string
  filename: string
  fileType: string
}

// Document attachment component
const DocumentAttachment: React.FC<DocumentAttachmentProps> = ({ url, filename, fileType }) => {
  // Determine file icon based on extension
  const getFileIcon = () => {
    const extension = fileType.toLowerCase()

    if (extension === "pdf") {
      return (
        <div className="w-10 h-12 bg-red-500 rounded-md flex items-center justify-center text-black">
          <span className="text-xs font-bold">PDF</span>
        </div>
      )
    } else if (["xls", "xlsx", "csv"].includes(extension)) {
      return (
        <div className="w-10 h-12 bg-green-600 rounded-md flex items-center justify-center text-black">
          <span className="text-xs font-bold">XLS</span>
        </div>
      )
    } else if (["doc", "docx"].includes(extension)) {
      return (
        <div className="w-10 h-12 bg-blue-600 rounded-md flex items-center justify-center text-black">
          <span className="text-xs font-bold">DOC</span>
        </div>
      )
    } else {
      return (
        <div className="w-10 h-12 bg-gray-500 rounded-md flex items-center justify-center text-black">
          <span className="text-xs font-bold">FILE</span>
        </div>
      )
    }
  }

  // Extract file size from URL if available or use placeholder
  const getFileSize = () => {
    return "2 pages • " + fileType.toUpperCase() + " • 20 kB"
  }

  return (
    <div className="flex items-center p-3 bg-white rounded-md border border-gray-200 my-2 hover:bg-gray-50 transition-colors">
      {getFileIcon()}
      <div className="ml-3 flex-1">
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium text-gray-900 hover:underline"
        >
          {filename}
        </a>
        <p className="text-xs text-gray-500">{getFileSize()}</p>
      </div>
      <a href={url} download className="text-gray-400 hover:text-gray-600">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
          <polyline points="7 10 12 15 17 10"></polyline>
          <line x1="12" y1="15" x2="12" y2="3"></line>
        </svg>
      </a>
    </div>
  )
}

const processInlineStyles = (content: string | React.ReactNode[]): React.ReactNode[] => {
  if (Array.isArray(content)) {
    return content.flatMap((item, index) => {
      if (typeof item === "string") {
        const parts = item.split(/(\*\*.*?\*\*|\*.*?\*)/g)
        return parts.map((part, subIndex) => {
          if (part.startsWith("**") && part.endsWith("**")) {
            return React.createElement("strong", { key: `${index}-${subIndex}` }, part.slice(2, -2))
          } else if (part.startsWith("*") && part.endsWith("*")) {
            return React.createElement("em", { key: `${index}-${subIndex}` }, part.slice(1, -1))
          }
          return part
        })
      }
      return item
    })
  }

  // Ensure content is treated as a string if it's not an array
  const contentAsString = typeof content === "string" ? content : ""
  const parts = contentAsString.split(/(\*\*.*?\*\*|\*.*?\*)/g)

  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return React.createElement("strong", { key: index }, part.slice(2, -2))
    } else if (part.startsWith("*") && part.endsWith("*")) {
      return React.createElement("em", { key: index }, part.slice(1, -1))
    }
    return part
  })
}

const formatTable = (tableContent: string): React.ReactNode => {
  const rows = tableContent
    .split("\n")
    .map((row) => row.trim())
    .filter((row) => row.length > 0)
  const headers = rows[0]
    .split("|")
    .map((header) => header.trim())
    .filter((header) => header.length > 0)
  const bodyRows = rows.slice(2) // Skip the header and separator rows

  return (
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          {headers.map((header, index) =>
            React.createElement(
              "th",
              {
                key: index,
                className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider",
              },
              processInlineStyles(header),
            ),
          )}
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {bodyRows.map((row, rowIndex) =>
          React.createElement(
            "tr",
            { key: rowIndex },
            row
              .split("|")
              .map((cell, cellIndex) =>
                React.createElement(
                  "td",
                  { key: cellIndex, className: "px-6 py-4 whitespace-nowrap text-sm text-gray-500" },
                  processInlineStyles(cell.trim()),
                ),
              ),
          ),
        )}
      </tbody>
    </table>
  )
}

const formatContent = (text: string): React.ReactNode => {
  const lines = text.split("\n")
  const formattedLines: React.ReactNode[] = []

  let currentList: React.ReactNode[] = []
  let isProcessingList = false
  let isProcessingTable = false
  let tableContent = ""
  let i = 0

  while (i < lines.length) {
    const trimmedLine = lines[i].trim()

    // Code block detection - simplified without syntax highlighter
    if (trimmedLine.startsWith("```")) {
      const language = trimmedLine.slice(3).trim()
      const codeLines: string[] = []
      let j = i + 1

      while (j < lines.length && !lines[j].trim().startsWith("```")) {
        codeLines.push(lines[j])
        j++
      }

      formattedLines.push(
        React.createElement(
          "pre",
          { key: `code-${i}`, className: "bg-gray-900 text-gray-100 p-3 rounded-md overflow-x-auto text-sm my-2" },
          React.createElement("code", null, codeLines.join("\n")),
        ),
      )

      // Skip to after the closing backticks
      i = j + 1
      continue
    }

    // Table handling
    if (trimmedLine.startsWith("|") && trimmedLine.endsWith("|")) {
      if (!isProcessingTable) {
        isProcessingTable = true
        tableContent = trimmedLine + "\n"
      } else {
        tableContent += trimmedLine + "\n"
      }
      i++
      continue
    } else if (isProcessingTable) {
      formattedLines.push(formatTable(tableContent))
      isProcessingTable = false
      tableContent = ""
    }

    // List handling
    if (trimmedLine.startsWith("-") || trimmedLine.startsWith("•") || /^\d+\.*/.test(trimmedLine)) {
      isProcessingList = true
      const itemText = trimmedLine.replace(/^[-•\d+.]\s*/, "").trim()
      currentList.push(
        React.createElement(
          "li",
          { key: i, className: "py-1 flex items-start" },
          React.createElement("span", {
            className: "mr-2 mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-current opacity-60",
          }),
          React.createElement("span", null, processInlineStyles(processTextWithLinks(itemText))),
        ),
      )
    } else {
      if (isProcessingList && currentList.length > 0) {
        formattedLines.push(
          React.createElement("ul", { key: `list-${i}`, className: "space-y-1 pl-4 list-none" }, currentList),
        )
        currentList = []
        isProcessingList = false
      }

      if (trimmedLine) {
        const headingMatch = trimmedLine.match(/^(#{1,6})\s(.+)$/)
        if (headingMatch) {
          const [, hashes, content] = headingMatch
          const level = hashes.length
          const headingClass = ["text-2xl", "text-xl", "text-lg", "text-base", "text-sm", "text-xs"][level - 1]

          formattedLines.push(
            React.createElement(
              `h${level}` as any,
              { key: `heading-${i}`, className: `${headingClass} font-bold mb-2` },
              processInlineStyles(processTextWithLinks(content)),
            ),
          )
        } else {
          formattedLines.push(
            React.createElement("p", { key: i }, processInlineStyles(processTextWithLinks(trimmedLine))),
          )
        }
      }
    }

    i++
  }

  if (currentList.length > 0) {
    formattedLines.push(
      React.createElement("ul", { key: "final-list", className: "space-y-1 pl-4 list-none" }, currentList),
    )
  }

  if (isProcessingTable) {
    formattedLines.push(formatTable(tableContent))
  }

  return React.createElement("div", { className: "space-y-2" }, formattedLines)
}

export const MessageContent: React.FC<MessageContentProps> = ({
  text,
  isExpanded = false,
  onToggle,
  replyTo,
  reactions = {},
  onAddReaction = () => {},
}) => {
  const [formattedContent, setFormattedContent] = useState<React.ReactNode | null>(null)

  useEffect(() => {
    if (text) {
      setFormattedContent(formatContent(text))
    } else {
      setFormattedContent(null)
    }
  }, [text])

  return (
    <div className={`message-content ${!isExpanded ? "collapsed" : ""}`}>
      {replyTo && <ReplyPreview replyTo={replyTo} />}
      <div className="prose prose-sm">{formattedContent}</div>
      {Object.keys(reactions).length > 0 && <MessageReactions reactions={reactions} onAddReaction={onAddReaction} />}
      {text && text.split("\n").length > 4 && (
        <button onClick={onToggle} className="read-more hover:opacity-80">
          {isExpanded ? "Read less" : "Read more"}
        </button>
      )}
    </div>
  )
}

export const FormattedMessage: React.FC<{
  text: string | null
  replyTo?: {
    sender: string
    content: string
  }
  reactions?: Record<string, number>
  onAddReaction?: (emoji: string) => void
}> = ({ text, replyTo, reactions = {}, onAddReaction = () => {} }) => {
  const [isExpanded, setIsExpanded] = useState(false)

  return React.createElement(MessageContent, {
    text: text,
    isExpanded: isExpanded,
    onToggle: () => setIsExpanded(!isExpanded),
    replyTo: replyTo,
    reactions: reactions,
    onAddReaction: onAddReaction,
  })
}

export const formatMessage = (
  text: string,
  options?: {
    replyTo?: {
      sender: string
      content: string
    }
    reactions?: Record<string, number>
    onAddReaction?: (emoji: string) => void
  },
): React.ReactElement => {
  return React.createElement(FormattedMessage, {
    text: text,
    replyTo: options?.replyTo,
    reactions: options?.reactions,
    onAddReaction: options?.onAddReaction,
  })
}

export { AudioPlayer, VideoPlayer, ImagePreview }
