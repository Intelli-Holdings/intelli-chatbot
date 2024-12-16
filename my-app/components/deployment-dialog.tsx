import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Copy } from 'lucide-react'
import { useState } from "react"

interface DeploymentDialogProps {
  assistantId: string;
}

export function DeploymentDialog({ assistantId }: DeploymentDialogProps) {
  const [copied, setCopied] = useState<string>("")

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
    setCopied(type)
    setTimeout(() => setCopied(""), 2000)
  }

  const htmlSnippet = `<script>var intelli_widget = "${assistantId}";</script>
<script src="https://chat-widget.intelliconcierge.com.ai/main.js?nonce=${Date.now()}"></script>`

  const nextjsSnippet = `npm install @intelli/chat-widget

// In your layout.tsx or page where you want the widget
import { IntelliWidget } from '@intelli/chat-widget'

export default function Layout({ children }) {
  return (
    <>
      {children}
      <IntelliWidget assistantId="${assistantId}" />
    </>
  )
}`

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="w-full mt-4">Create and Deploy Assistant</Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Website Chat Widget</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground mb-4">
          This will allow you and the AI Assistant to receive and respond to Messages via your website.
        </p>
        <Tabs defaultValue="wordpress">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="wordpress">WordPress</TabsTrigger>
            <TabsTrigger value="html">HTML</TabsTrigger>
            <TabsTrigger value="nextjs">Next.js</TabsTrigger>
          </TabsList>
          
          <TabsContent value="wordpress">
            <div className="space-y-4">
              <p className="text-sm">Copy the AI Assistant ID to Install On a WordPress Website using the Intelli WordPress plugin.</p>
              <div className="relative">
                <pre className="bg-muted p-4 rounded-lg overflow-x-auto">{assistantId}</pre>
                <Button 
                  size="sm" 
                  className="absolute top-2 right-2"
                  onClick={() => handleCopy(assistantId, "wordpress")}
                >
                  {copied === "wordpress" ? "Copied!" : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground italic">
                How to Get Intelli WordPress Plugin? Search &ldquo;Intelli &ldquo; under wordpress plugins in your wordpress site.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="html">
            <div className="space-y-4">
              <p className="text-sm">Copy and paste the code below to the header of the html page on which you want the widget to appear.</p>
              <div className="relative">
                <pre className="bg-muted p-4 rounded-lg overflow-x-auto whitespace-pre-wrap">{htmlSnippet}</pre>
                <Button 
                  size="sm" 
                  className="absolute top-2 right-2"
                  onClick={() => handleCopy(htmlSnippet, "html")}
                >
                  {copied === "html" ? "Copied!" : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="nextjs">
            <div className="space-y-4">
              <p className="text-sm">Install the package and add the widget to your Next.js application:</p>
              <div className="relative">
                <pre className="bg-muted p-4 rounded-lg overflow-x-auto whitespace-pre-wrap">{nextjsSnippet}</pre>
                <Button 
                  size="sm" 
                  className="absolute top-2 right-2"
                  onClick={() => handleCopy(nextjsSnippet, "nextjs")}
                >
                  {copied === "nextjs" ? "Copied!" : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
