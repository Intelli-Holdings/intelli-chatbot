"use client"

import React from "react"
import { ExternalLink, FileText, ImageIcon, Video, File } from "lucide-react"
import type { ParsedInteractiveMessage, ParsedCtaMessage } from "./parse-interactive-message"
import { formatMessage } from "@/utils/formatMessage"

interface TemplateHeader {
  format: string
  text?: string
}

interface InteractiveFlowMessageProps {
  parsed: ParsedInteractiveMessage
  timestamp: string
  header?: TemplateHeader
}

interface CtaMessageProps {
  parsed: ParsedCtaMessage
  timestamp: string
  header?: TemplateHeader
}

interface TemplateMessageProps {
  templateName: string
  body?: string
  timestamp: string
  header?: TemplateHeader
}

function MediaHeaderPreview({ header }: { header: TemplateHeader }) {
  const format = header.format.toUpperCase()

  if (format === 'TEXT' && header.text) {
    return (
      <div className="px-3 pt-2 pb-1 font-semibold text-sm text-[#111b21]">
        {header.text}
      </div>
    )
  }

  const iconMap: Record<string, { icon: React.ReactNode; label: string }> = {
    IMAGE: { icon: <ImageIcon className="h-5 w-5" />, label: "Image" },
    VIDEO: { icon: <Video className="h-5 w-5" />, label: "Video" },
    DOCUMENT: { icon: <File className="h-5 w-5" />, label: "Document" },
  }

  const info = iconMap[format]
  if (!info) return null

  return (
    <div className="bg-[#c6ecc0]/60 flex flex-col items-center justify-center py-6 gap-1.5">
      <span className="text-[#667781]">{info.icon}</span>
      <span className="text-[11px] font-medium text-[#667781] uppercase">{info.label} header</span>
    </div>
  )
}

export function InteractiveFlowMessage({ parsed, timestamp, header }: InteractiveFlowMessageProps) {
  return (
    <div className="flex flex-col items-end max-w-[65%] self-end">
      <div className="w-full rounded-lg overflow-hidden shadow-[0_1px_0.5px_rgba(11,20,26,.13)]">
        {/* Media header */}
        {header && <MediaHeaderPreview header={header} />}
        {/* Body section */}
        <div className="bg-[#d9fdd3] px-3 pt-2 pb-1.5">
          <div className="text-sm text-[#111b21]">{formatMessage(parsed.body)}</div>
          <div className="flex items-center justify-end gap-1 mt-1">
            <span className="text-[11px] text-[#667781]">
              {new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>
        </div>
        {/* Buttons section — seamless inside the same card */}
        {parsed.options.map((option, index) => (
          <div
            key={index}
            className="border-t border-[#c6ecc0] bg-[#d9fdd3] px-3 py-2.5 text-center text-sm text-[#027eb5] font-medium"
          >
            {option}
          </div>
        ))}
      </div>
    </div>
  )
}

export function CtaFlowMessage({ parsed, timestamp, header }: CtaMessageProps) {
  return (
    <div className="flex flex-col items-end max-w-[65%] self-end">
      <div className="w-full rounded-lg overflow-hidden shadow-[0_1px_0.5px_rgba(11,20,26,.13)]">
        {/* Media header */}
        {header && <MediaHeaderPreview header={header} />}
        {/* Body section */}
        <div className="bg-[#d9fdd3] px-3 pt-2 pb-1.5">
          <div className="text-sm text-[#111b21]">{formatMessage(parsed.body)}</div>
          <div className="flex items-center justify-end gap-1 mt-1">
            <span className="text-[11px] text-[#667781]">
              {new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>
        </div>
        {/* CTA Buttons — clickable links */}
        {parsed.buttons.map((button, index) => (
          <a
            key={index}
            href={button.url}
            target="_blank"
            rel="noopener noreferrer"
            className="border-t border-[#c6ecc0] bg-[#d9fdd3] px-3 py-2.5 flex items-center justify-center gap-1.5 text-sm text-[#027eb5] font-medium hover:bg-[#cdf5c6] transition-colors"
          >
            <ExternalLink className="h-3.5 w-3.5 shrink-0" />
            {button.label}
          </a>
        ))}
      </div>
    </div>
  )
}

export function TemplateMessage({ templateName, body, timestamp, header }: TemplateMessageProps) {
  return (
    <div className="flex flex-col items-end max-w-[65%] self-end">
      <div className="w-full rounded-lg overflow-hidden shadow-[0_1px_0.5px_rgba(11,20,26,.13)] bg-[#d9fdd3]">
        {/* Media header */}
        {header && <MediaHeaderPreview header={header} />}
        <div className="px-3 pt-2 pb-1.5">
          <div className="flex items-center gap-1.5 mb-1">
            <FileText className="h-3 w-3 text-[#667781] shrink-0" />
            <span className="text-[10px] font-medium text-[#667781]">{templateName}</span>
          </div>
          {body ? (
            <div className="text-sm text-[#111b21]">{formatMessage(body)}</div>
          ) : (
            <div className="text-xs italic text-[#667781]">Template content unavailable</div>
          )}
          <div className="flex items-center justify-end gap-1 mt-1">
            <span className="text-[11px] text-[#667781]">
              {new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
