"use client"

import { useState, useEffect } from "react"
import { useMediaQuery } from "@/hooks/use-media-query"
import { cn } from "@/lib/utils"
import { Sidebar } from "@/components/sidebar"
import { EmailList } from "@/components/email-list"
import { EmailDetail } from "@/components/email-detail"
import { ComposeEmail } from "@/components/compose-email"
import { MobileNav } from "@/components/mobile-nav"
import type { Email, Folder } from "@/lib/types"
import { generateEmails } from "@/lib/data"

export default function EmailClient() {
  const [emails, setEmails] = useState<Email[]>([])
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null)
  const [currentFolder, setCurrentFolder] = useState<Folder>("inbox")
  const [isComposing, setIsComposing] = useState(false)
  const [showEmailDetail, setShowEmailDetail] = useState(false)
  const isDesktop = useMediaQuery("(min-width: 1024px)")
  const isTablet = useMediaQuery("(min-width: 768px)")
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  useEffect(() => {
    // Generate mock emails
    setEmails(generateEmails(25))
  }, [])

  const filteredEmails = emails.filter((email) => email.folder === currentFolder)

  const handleSelectEmail = (email: Email) => {
    setSelectedEmail(email)
    if (!isDesktop) {
      setShowEmailDetail(true)
    }
  }

  const handleSendEmail = (email: Email) => {
    setEmails((prev) => [
      {
        ...email,
        id: `sent-${Date.now()}`,
        date: new Date(),
        folder: "sent",
      },
      ...prev,
    ])
    setIsComposing(false)
  }

  const handleBackToList = () => {
    setShowEmailDetail(false)
    setSelectedEmail(null)
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-white dark:bg-gray-950 border rounded-lg border-gray-200 dark:border-gray-800">
      {/* Mobile Navigation - Sheet is always rendered but only visible when triggered */}
      <MobileNav
        currentFolder={currentFolder}
        onFolderChange={setCurrentFolder}
        onCompose={() => setIsComposing(true)}
      />

      {/* Sidebar - visible on tablet and desktop */}
      {isTablet && (
        <Sidebar
          currentFolder={currentFolder}
          onFolderChange={setCurrentFolder}
          onCompose={() => setIsComposing(true)}
        />
      )}

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className={cn("flex flex-1 overflow-hidden", !isDesktop && showEmailDetail ? "hidden" : "flex")}>
          <EmailList
            emails={filteredEmails}
            selectedEmail={selectedEmail}
            onSelectEmail={handleSelectEmail}
            currentFolder={currentFolder}
            onFolderChange={setCurrentFolder}
            onCompose={() => setIsComposing(true)}
            mobileNavOpen={mobileNavOpen}
            setMobileNavOpen={setMobileNavOpen}
          />
        </div>

        {/* Email Detail - conditionally shown based on screen size and selection */}
        {(isDesktop || showEmailDetail) && selectedEmail && (
          <div className={cn("flex-1 overflow-auto", isDesktop ? "block" : "fixed inset-0 z-50 bg-white dark:bg-gray-950")}>
            <EmailDetail
              email={selectedEmail}
              onBack={handleBackToList}
              onReply={() => {
                setIsComposing(true)
              }}
            />
          </div>
        )}

        {/* Compose Email Modal */}
        {isComposing && (
          <ComposeEmail replyTo={selectedEmail} onClose={() => setIsComposing(false)} onSend={handleSendEmail} />
        )}
      </div>
    </div>
  )
}

