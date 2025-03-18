"use client"

import Image from "next/image"
import React, { useState } from "react"

interface MessageContentProps {
  text: string | null
  isExpanded?: boolean
  onToggle?: () => void
}

interface ImagePreviewProps {
  src: string
}

const ImagePreview: React.FC<ImagePreviewProps> = ({ src }) => {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)

  return (
    <div className="relative rounded-md overflow-hidden my-2">
      {isLoading && <div className="w-full h-40 bg-gray-200 animate-pulse rounded-md"></div>}

      {error ? (
        <div className="bg-gray-100 p-3 text-sm text-gray-500 rounded border border-gray-200">Unable to load image</div>
      ) : (
        <div className={`${isLoading ? "invisible" : "visible"}`}>
          <Image
            src={src || "/placeholder.svg"}
            alt="Shared image"
            width={300}
            height={200}
            className="rounded-md object-cover"
            onLoad={() => setIsLoading(false)}
            onError={() => {
              setIsLoading(false)
              setError(true)
            }}
          />
        </div>
      )}
    </div>
  )
}

const processTextWithLinks = (text: string): (string | JSX.Element)[] => {
  // Image URL regex pattern - detects common image extensions
  const imageUrlRegex = /(https?:\/\/[^\s]+\.(jpg|jpeg|png|gif|webp)(\?[^\s]*)?)/gi

  // Regular URL regex
  const urlRegex = /(https?:\/\/[^\s\]]+|\[([^\]]+)\]$$([^\s$$]+)\))/g

  // First check for image URLs and replace them with ImagePreview components
  const imageMatches = text.match(imageUrlRegex)
  if (imageMatches) {
    // Create a version of the text where image URLs are replaced with placeholders
    let processedText = text
    const imagePreviews: JSX.Element[] = []

    imageMatches.forEach((imageUrl, index) => {
      // Replace the image URL with a unique placeholder
      const placeholder = `__IMAGE_PLACEHOLDER_${index}__`
      processedText = processedText.replace(imageUrl, placeholder)

      // Create an image preview component
      imagePreviews.push(<ImagePreview key={`img-${index}`} src={imageUrl || "/placeholder.svg"} />)
    })

    // Split by the placeholders
    const parts = processedText.split(/(__IMAGE_PLACEHOLDER_\d+__)/)
    const result: (string | JSX.Element)[] = []

    parts.forEach((part) => {
      // Check if this part is a placeholder
      const placeholderMatch = part.match(/__IMAGE_PLACEHOLDER_(\d+)__/)
      if (placeholderMatch) {
        const imageIndex = Number.parseInt(placeholderMatch[1], 10)
        // Replace placeholder with image component
        result.push(imagePreviews[imageIndex])
      } else if (part) {
        // Process regular text
        result.push(part)
      }
    })

    // Process remaining text parts for regular links
    return result.flatMap((item) => {
      if (typeof item === "string") {
        // Process regular links in text parts
        const linkParts = item.split(urlRegex)
        return linkParts.map((part, idx) => {
          if (urlRegex.test(part) && !imageUrlRegex.test(part)) {
            const match = part.match(/\[([^\]]+)\]$$([^\s$$]+)\)/)
            if (match) {
              const [, linkText, url] = match
              return (
                <a
                  key={idx}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                  title={url}
                >
                  {linkText}
                </a>
              )
            } else {
              return (
                <a
                  key={idx}
                  href={part}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                  title={part}
                >
                  {part}
                </a>
              )
            }
          }
          return part
        })
      }
      return item
    })
  }

  // If no image URLs, process as before
  const parts = text.split(urlRegex)

  return parts.map((part, index) => {
    if (urlRegex.test(part)) {
      const match = part.match(/\[([^\]]+)\]$$([^\s$$]+)\)/)
      if (match) {
        const [, linkText, url] = match
        return (
          <a
            key={index}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
            title={url}
          >
            {linkText}
          </a>
        )
      } else {
        return (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
            title={part}
          >
            {part}
          </a>
        )
      }
    }
    return part
  })
}

const processInlineStyles = (content: string | (string | JSX.Element)[]): (string | JSX.Element)[] => {
  if (Array.isArray(content)) {
    return content.flatMap((item, index) => {
      if (typeof item === "string") {
        const parts = item.split(/(\*\*.*?\*\*|\*.*?\*)/g)
        return parts.map((part, subIndex) => {
          if (part.startsWith("**") && part.endsWith("**")) {
            return <strong key={`${index}-${subIndex}`}>{part.slice(2, -2)}</strong>
          } else if (part.startsWith("*") && part.endsWith("*")) {
            return <em key={`${index}-${subIndex}`}>{part.slice(1, -1)}</em>
          }
          return part
        })
      }
      return item
    })
  }

  const parts = content.split(/(\*\*.*?\*\*|\*.*?\*)/g)
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={index}>{part.slice(2, -2)}</strong>
    } else if (part.startsWith("*") && part.endsWith("*")) {
      return <em key={index}>{part.slice(1, -1)}</em>
    }
    return part
  })
}

const formatTable = (tableContent: string): JSX.Element => {
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
          {headers.map((header, index) => (
            <th key={index} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {processInlineStyles(header)}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {bodyRows.map((row, rowIndex) => (
          <tr key={rowIndex}>
            {row.split("|").map((cell, cellIndex) => (
              <td key={cellIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {processInlineStyles(cell.trim())}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

const formatContent = (text: string): JSX.Element => {
  const lines = text.split("\n")
  const formattedLines: JSX.Element[] = []

  let currentList: JSX.Element[] = []
  let isProcessingList = false
  let isProcessingTable = false
  let tableContent = ""

  lines.forEach((line, index) => {
    const trimmedLine = line.trim()

    // Table handling
    if (trimmedLine.startsWith("|") && trimmedLine.endsWith("|")) {
      if (!isProcessingTable) {
        isProcessingTable = true
        tableContent = trimmedLine + "\n"
      } else {
        tableContent += trimmedLine + "\n"
      }
      return
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
        <li key={index} className="py-1 flex items-start">
          <span className="mr-2 mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-current opacity-60" />
          <span>{processInlineStyles(processTextWithLinks(itemText))}</span>
        </li>,
      )
    } else {
      if (isProcessingList && currentList.length > 0) {
        formattedLines.push(
          <ul key={`list-${index}`} className="space-y-1 pl-4 list-none">
            {currentList}
          </ul>,
        )
        currentList = []
        isProcessingList = false
      }

      if (trimmedLine) {
        const headingMatch = trimmedLine.match(/^(#{1,6})\s(.+)$/)
        if (headingMatch) {
          const [, hashes, content] = headingMatch
          const HeadingTag = `h${hashes.length}` as keyof JSX.IntrinsicElements
          formattedLines.push(
            <HeadingTag key={`heading-${index}`} className={`text-${7 - hashes.length}xl font-bold mb-2`}>
              {processInlineStyles(processTextWithLinks(content))}
            </HeadingTag>,
          )
        } else {
          formattedLines.push(<p key={index}>{processInlineStyles(processTextWithLinks(trimmedLine))}</p>)
        }
      }
    }
  })

  if (currentList.length > 0) {
    formattedLines.push(
      <ul key="final-list" className="space-y-1 pl-4 list-none">
        {currentList}
      </ul>,
    )
  }

  if (isProcessingTable) {
    formattedLines.push(formatTable(tableContent))
  }

  return <div className="space-y-2">{formattedLines}</div>
}

export const MessageContent: React.FC<MessageContentProps> = ({ text, isExpanded = false, onToggle }) => {
  if (!text) return null

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const formattedContent = React.useMemo(() => {
    return formatContent(text)
  }, [text])

  return (
    <div className={`message-content ${!isExpanded ? "collapsed" : ""}`}>
      <div className="prose prose-sm">{formattedContent}</div>
      {text.split("\n").length > 4 && (
        <button onClick={onToggle} className="read-more hover:opacity-80">
          {isExpanded ? "Read less" : "Read more"}
        </button>
      )}
    </div>
  )
}

export const FormattedMessage: React.FC<{ text: string | null }> = ({ text }) => {
  const [isExpanded, setIsExpanded] = useState(false)

  return <MessageContent text={text} isExpanded={isExpanded} onToggle={() => setIsExpanded(!isExpanded)} />
}

export const formatMessage = (text: string): JSX.Element => {
  return <FormattedMessage text={text} />
}

