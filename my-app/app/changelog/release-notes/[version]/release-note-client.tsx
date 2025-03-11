"use client"

import { Download, Share, Twitter, Linkedin, MoreHorizontal } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import TableOfContents from "./table-of-contents"
import { generatePDF } from "./generate-pdf"

export default function ReleaseNoteClient({ version }: { version: string }) {
  const currentUrl = typeof window !== "undefined" ? window.location.href : "";
  
  const downloadReleaseNotes = async () => {
    await generatePDF(version);
  };

  const shareContent = (platform: string) => {
    const customMessage = "Hey Intelli @Intelli just launched product release and it's awesomee.. go read it here ";
    switch (platform) {
      case "link":
        if (navigator.share) {
          navigator.share({
            title: `Release Notes ${version}`,
            text: customMessage,
            url: currentUrl,
          })
          .then(() => console.log("Shared successfully"))
          .catch(error => console.error("Error sharing", error));
        } else {
          navigator.clipboard.writeText(currentUrl);
          alert("URL copied to clipboard");
        }
        break;
      case "twitter":
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(customMessage + currentUrl)}`,
          "_blank"
        );
        break;
      case "linkedin":
        window.open(
          `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(currentUrl)}&title=${encodeURIComponent(customMessage)}&summary=${encodeURIComponent("Go read it here")}`,
          "_blank"
        );
        break;
      default:
        console.warn("Unsupported platform:", platform);
    }
  }

  const technicalDetails = [
    "Updated dependencies and refactored hooks for improved notification handling.",
    "Implemented logic to fetch app services by organization using new API endpoints.",
    "Integrated live chat feature for website widgets with real-time engagement.",
    "Added a demo video component with enhanced user interface and experience.",
    "Optimized statistics view on conversations page and refined data fetching logic.",
    "Resolved build issues by addressing dependency conflicts and code inconsistencies.",
    "Updated documentation to include OG image support and widget conversation endpoints.",
    "Improved widget display with adjustments in layout and responsive design.",
    "Fixed build configuration errors affecting production deployment.",
    "Enhanced notifications by integrating a new phone number form for user alerts.",
    "Refactored the widgets page and components to boost performance and usability.",
    "Introduced escalation events and updated pricing page with interactive elements.",
    "Enhanced organization management via improved invite member functionality.",
    "Implemented delete functionality for assistants to streamline management.",
    "Refined the pricing page with improved layouts and performance optimizations.",
    "Upgraded the command center UI/UX for a more intuitive interface.",
    "Streamlined product tour copy for better clarity and engagement.",
    "Resolved socket API build errors through backend communication refactoring.",
    "Enhanced WhatsApp Conversations page with export options and WebRTC integration.",
    "Improved security and accessibility with comprehensive component refactoring.",
    "Optimized create organization popups to support multiple instances.",
    "Integrated new office addresses feature to enhance website contact information.",
    "Added support for additional analytics providers by integrating more data sources.",
    "Refined WhatsApp onboarding process for a smoother user experience."
  ];

  return (
    <div className="min-h-screen bg-background w-full">
      {/* Hero Banner */}
      <div
        className="relative h-64 md:h-80 bg-gradient-to-r from-purple-600 to-blue-400 p-8"
        style={{
          backgroundImage: `/`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 " />
        <div className="relative z-10 h-full flex flex-col justify-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white">Release Notes</h1>
          <p className="mt-2 text-xl md:text-2xl text-white/90">Version {version}</p>
        </div>
      </div>

      <div className="w-full mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Content Area */}
          <div className="flex-1 max-w-full lg:max-w-[calc(100%-16rem)]">
            <div className="mb-8">
              <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h2 className="text-3xl font-bold">Release Notes {version}</h2>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={downloadReleaseNotes}>
                                      <Download className="mr-2 h-4 w-4" />
                                      Download PDF
                                    </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => shareContent("link")}>
                        <Share className="mr-2 h-4 w-4" />
                        Share Link
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => shareContent("twitter")}>
                        <Twitter className="mr-2 h-4 w-4" />
                        Share on Twitter
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => shareContent("linkedin")}>
                        <Linkedin className="mr-2 h-4 w-4" />
                        Share on LinkedIn
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">Last Updated: February 11, 2025</p>
            </div>

            <ScrollArea className="h-[calc(100vh-16rem)]">
              <div className="prose prose-slate dark:prose-invert max-w-none pr-2">
                {/* ...existing sections... */}
                <Separator className="my-8" />
                {/* Technical Details Section */}
                <section id="tech-details">
                  <h2 className="text-2xl font-bold mb-4">📝 Technical Details</h2>
                  <ul className="list-disc pl-5 space-y-2">
                    {technicalDetails.map((detail, index) => (
                      <li key={index} className="text-sm">{detail}</li>
                    ))}
                  </ul>
                </section>
              </div>
            </ScrollArea>
          </div>

          {/* Right Sidebar - Table of Contents */}
          <div className="w-full lg:w-56 lg:flex-shrink-0 lg:border-l lg:pl-4">
            <div className="sticky top-4">
              <TableOfContents />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-blue-200 py-8 px-4 text-center">
        <p className="text-lg font-semibold">
          ✨ Explore these updates now on your{" "}
          <Link href="https://intelliconcierge.com/dashboard" className="text-primary hover:underline">
            dashboard
          </Link>
          !
        </p>
      </div>
    </div>
  )
}
