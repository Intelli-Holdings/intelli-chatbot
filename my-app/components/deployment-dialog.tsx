import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface DeploymentDialogProps {
  onClose: () => void;
  widgetKey: string;
  websiteUrl: string;
}

export function DeploymentDialog({
  onClose,
  widgetKey,
  websiteUrl,
}: DeploymentDialogProps) {
  const [copied, setCopied] = useState<string>("");
  const [embeddingCode, setEmbeddingCode] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEmbeddingCode = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/widgets/${widgetKey}/embedding-code/`
        );
        if (!response.ok) throw new Error("Failed to fetch embedding code");
        const data = await response.json();
        setEmbeddingCode(data.embedding_code);
      } catch (error) {
        console.error("Error fetching embedding code:", error);
        toast.error("Failed to fetch embedding code");
      } finally {
        setIsLoading(false);
      }
    };

    fetchEmbeddingCode();
  }, [widgetKey]);

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(""), 2000);
    toast.success("Copied to clipboard");
  };

  if (isLoading) {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl mx-4 sm:mx-auto">
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-2xl mx-4 sm:mx-auto h-[90vh] sm:h-auto overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">
            Website Chat Widget
          </DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground mb-4 px-1">
          This will allow you to receive and respond to messages via your
          website widget.
        </p>
        <Tabs defaultValue="html" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="html" className="text-xs sm:text-sm">
              HTML
            </TabsTrigger>
            <TabsTrigger value="wordpress" className="text-xs sm:text-sm">
              WordPress
            </TabsTrigger>
            <TabsTrigger value="nextjs" className="text-xs sm:text-sm">
              React
            </TabsTrigger>
          </TabsList>

          <TabsContent value="html">
            <div className="space-y-4">
              <p className="text-sm px-1">
                Copy and paste the code below in the header section of your
                website:
              </p>
              <div className="relative">
                <pre className="bg-muted p-3 sm:p-4 rounded-lg overflow-x-auto text-xs sm:text-sm font-mono whitespace-pre-wrap break-all">
                  {embeddingCode || "No embedding code available"}
                </pre>
                <Button
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => handleCopy(embeddingCode, "html")}
                  disabled={!embeddingCode}
                >
                  {copied === "html" ? "Copied!" : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2 px-1">
                This code will initialize the chat widget on your website with
                your specific configuration.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="wordpress">
            <div className="space-y-4">
              <p className="text-sm px-1">
                Copy the AI Assistant ID to Install On a WordPress Website using
                the Intelli WordPress plugin.
              </p>
              <div className="relative">
                <pre className="bg-muted p-3 sm:p-4 rounded-lg overflow-x-auto text-xs sm:text-sm font-mono">
                  {widgetKey}
                </pre>
                <Button
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => handleCopy(widgetKey, "wordpress")}
                  disabled={!widgetKey}
                >
                  {copied === "wordpress" ? (
                    "Copied!"
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2 italic px-1">
                How to Get the Intelli WordPress Plugin? Search &ldquo;Intelli
                &ldquo; under wordpress plugins in your wordpress site.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="nextjs">
            <div className="space-y-6">
              <h3 className="text-sm font-medium mb-2">
                1. Install the package
              </h3>
              <pre className="bg-muted p-3 rounded-lg overflow-x-auto text-xs sm:text-sm font-mono">
                npm install @intelli-inc/chat-widget
              </pre>
              <p className="text-xs text-muted-foreground mt-2">
                Or using yarn:
              </p>
              <pre className="bg-muted p-3 rounded-lg overflow-x-auto text-xs sm:text-sm font-mono">
                yarn add @intelli-inc/chat-widget
              </pre>
              <h3 className="text-sm font-medium mb-2">
                2. Add the widget to your app
              </h3>

              <div className="relative">
                <pre className="bg-muted p-3 sm:p-4 rounded-lg overflow-x-auto text-xs sm:text-sm font-mono whitespace-pre-wrap">
                  {`import { IntelliWidget } from '@intelli-inc/chat-widget'

// Add this to your layout or page component
export default function App() {
  return (
    <>
      <main>
        {/* Your app content */}
      </main>
      <IntelliWidget 
        assistantId="${widgetKey}"
    </>
  )
}`}
                </pre>
                <Button
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() =>
                    handleCopy(
                      `import { IntelliWidget } from '@intelli-inc/chat-widget'

// Add this to your layout or page component
export default function App() {
  return (
    <>
      <main>
        {/* Your app content */}
      </main>
      <IntelliWidget 
        assistantId="${widgetKey}"
    </>
  )
}`,
                      "nextjs"
                    )
                  }
                  disabled={!widgetKey}
                >
                  {copied === "nextjs" ? (
                    "Copied!"
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
