"use client"

import * as React from "react"
import { CheckIcon, ClipboardIcon, ChevronDown, ExternalLink, Sparkles } from "lucide-react"
import { trackEvent } from "@/lib/events"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

/**
 * Converts the main content area of a docs page into clean Markdown.
 * Walks the DOM tree and produces readable markdown output.
 */
function htmlToMarkdown(element: Element): string {
  let result = ""

  function processNode(node: Node): string {
    if (node.nodeType === Node.TEXT_NODE) {
      return node.textContent || ""
    }

    if (node.nodeType !== Node.ELEMENT_NODE) return ""

    const el = node as HTMLElement
    const tag = el.tagName.toLowerCase()

    // Skip interactive/non-content elements
    if (["script", "style", "button", "nav", "svg"].includes(tag)) return ""

    const childContent = Array.from(el.childNodes).map(processNode).join("")

    switch (tag) {
      case "h1":
        return `# ${childContent.trim()}\n\n`
      case "h2":
        return `## ${childContent.trim()}\n\n`
      case "h3":
        return `### ${childContent.trim()}\n\n`
      case "h4":
        return `#### ${childContent.trim()}\n\n`
      case "h5":
        return `##### ${childContent.trim()}\n\n`
      case "h6":
        return `###### ${childContent.trim()}\n\n`
      case "p":
        return `${childContent.trim()}\n\n`
      case "br":
        return "\n"
      case "strong":
      case "b":
        return `**${childContent.trim()}**`
      case "em":
      case "i":
        return `*${childContent.trim()}*`
      case "code":
        // Inline code (not inside a pre block)
        if (el.parentElement?.tagName.toLowerCase() !== "pre") {
          return `\`${childContent.trim()}\``
        }
        return childContent
      case "pre": {
        const codeEl = el.querySelector("code")
        const lang = codeEl?.className?.match(/language-(\w+)/)?.[1] || ""
        const codeText = codeEl?.textContent || el.textContent || ""
        return `\`\`\`${lang}\n${codeText.trim()}\n\`\`\`\n\n`
      }
      case "a": {
        const href = el.getAttribute("href") || ""
        return `[${childContent.trim()}](${href})`
      }
      case "img": {
        const src = el.getAttribute("src") || ""
        const alt = el.getAttribute("alt") || ""
        return `![${alt}](${src})\n\n`
      }
      case "ul":
        return `${childContent}\n`
      case "ol":
        return `${childContent}\n`
      case "li": {
        const parent = el.parentElement?.tagName.toLowerCase()
        if (parent === "ol") {
          const index = Array.from(el.parentElement!.children).indexOf(el) + 1
          return `${index}. ${childContent.trim()}\n`
        }
        return `- ${childContent.trim()}\n`
      }
      case "blockquote":
        return childContent
          .trim()
          .split("\n")
          .map((line) => `> ${line}`)
          .join("\n") + "\n\n"
      case "hr":
        return "---\n\n"
      case "table": {
        return processTable(el) + "\n\n"
      }
      case "thead":
      case "tbody":
      case "tr":
      case "th":
      case "td":
        // Handled by processTable
        return childContent
      case "div":
      case "section":
      case "article":
      case "main":
      case "span":
      case "figure":
      case "figcaption":
        return childContent
      default:
        return childContent
    }
  }

  function processTable(tableEl: HTMLElement): string {
    const rows = tableEl.querySelectorAll("tr")
    if (rows.length === 0) return ""

    const tableData: string[][] = []
    rows.forEach((row) => {
      const cells = row.querySelectorAll("th, td")
      const rowData: string[] = []
      cells.forEach((cell) => {
        rowData.push(cell.textContent?.trim() || "")
      })
      tableData.push(rowData)
    })

    if (tableData.length === 0) return ""

    const colCount = Math.max(...tableData.map((r) => r.length))
    const colWidths = Array(colCount).fill(3)
    tableData.forEach((row) => {
      row.forEach((cell, i) => {
        colWidths[i] = Math.max(colWidths[i], cell.length)
      })
    })

    let md = ""
    // Header row
    const header = tableData[0]
    md += "| " + header.map((cell, i) => cell.padEnd(colWidths[i])).join(" | ") + " |\n"
    md += "| " + colWidths.map((w) => "-".repeat(w)).join(" | ") + " |\n"
    // Data rows
    for (let i = 1; i < tableData.length; i++) {
      const row = tableData[i]
      md += "| " + row.map((cell, j) => cell.padEnd(colWidths[j] || 3)).join(" | ") + " |\n"
    }

    return md
  }

  result = processNode(element)

  // Clean up excessive newlines
  return result.replace(/\n{3,}/g, "\n\n").trim()
}

function getPageTitle(): string {
  const h1 = document.querySelector("main h1")
  return h1?.textContent?.trim() || document.title || "Page"
}

function getPageMarkdown(): string {
  const main = document.querySelector("main")
  if (!main) return document.body.innerText

  const pageUrl = window.location.href
  const title = getPageTitle()
  const markdown = htmlToMarkdown(main)

  return `# ${title}\n\nSource: ${pageUrl}\n\n${markdown}`
}

export function CopyPageButton() {
  const [hasCopied, setHasCopied] = React.useState(false)
  const [isOpen, setIsOpen] = React.useState(false)

  React.useEffect(() => {
    if (hasCopied) {
      const timer = setTimeout(() => setHasCopied(false), 2000)
      return () => clearTimeout(timer)
    }
  }, [hasCopied])

  const handleCopyPage = React.useCallback(() => {
    const markdown = getPageMarkdown()
    navigator.clipboard.writeText(markdown)
    trackEvent({
      name: "copy_page_markdown",
      properties: {
        page: window.location.pathname,
      },
    })
    setHasCopied(true)
    setIsOpen(false)
  }, [])

  const handleViewAsMarkdown = React.useCallback(() => {
    const markdown = getPageMarkdown()
    const blob = new Blob([markdown], { type: "text/plain;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    window.open(url, "_blank")
    // Clean up blob URL after a short delay
    setTimeout(() => URL.revokeObjectURL(url), 5000)
    setIsOpen(false)
  }, [])

  const handleOpenInClaude = React.useCallback(() => {
    const markdown = getPageMarkdown()
    const title = getPageTitle()
    const prompt = `Here is the documentation page "${title}" from Intelli:\n\n${markdown}\n\nBased on this documentation, how can I help you?`
    const encoded = encodeURIComponent(prompt)
    window.open(`https://claude.ai/new?q=${encoded}`, "_blank")
    setIsOpen(false)
  }, [])

  return (
    <div className="flex items-center">
      <Button
        variant="outline"
        size="sm"
        className="gap-1.5 rounded-r-none border-r-0 text-sm font-medium"
        onClick={handleCopyPage}
      >
        {hasCopied ? (
          <CheckIcon className="size-4 text-green-600" />
        ) : (
          <ClipboardIcon className="size-4" />
        )}
        {hasCopied ? "Copied!" : "Copy page"}
      </Button>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="rounded-l-none px-1.5"
          >
            <ChevronDown className="size-3.5 opacity-60" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleCopyPage} className="cursor-pointer gap-2.5">
            <ClipboardIcon className="size-4 shrink-0 opacity-70" />
            <span>Copy page as Markdown</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleViewAsMarkdown} className="cursor-pointer gap-2.5">
            <ExternalLink className="size-4 shrink-0 opacity-70" />
            <span>Open Markdown</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleOpenInClaude} className="cursor-pointer gap-2.5">
            <Sparkles className="size-4 shrink-0 text-orange-500" />
            <span>Chat in Claude.ai</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
