import { useEffect, useState } from "react";
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

interface Widget {
  id: number;
  widget_name: string;
  widget_key: string;
  created_at: string;
  updated_at: string;
}

interface DeploymentDialogProps {
  onClose: () => void;
}

export function DeploymentDialog({ onClose }: DeploymentDialogProps) {
  const [copied, setCopied] = useState<string>("");
  const [embeddingCode, setEmbeddingCode] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [widgetKey, setWidgetKey] = useState<string>("");

  useEffect(() => {
    const fetchLatestWidget = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/widgets/`
        );
        if (!response.ok) throw new Error("Failed to fetch widgets");
        const widgets: Widget[] = await response.json();

        // Sort widgets by created_at in descending order and get the latest one
        const sortedWidgets = widgets.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );

        if (sortedWidgets.length > 0) {
          const latestWidget = sortedWidgets[0];
          setWidgetKey(latestWidget.widget_key);
          fetchEmbeddingCode(latestWidget.widget_key);
        } else {
          throw new Error("No widgets found");
        }
      } catch (error) {
        console.error("Error fetching widgets:", error);
        toast.error("Failed to fetch widget information");
        setIsLoading(false);
      }
    };

    fetchLatestWidget();
  }, []);

  const fetchEmbeddingCode = async (key: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/widgets/${key}/embedding-code/`
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

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(""), 2000);
    toast.success("Copied to clipboard");
  };

  if (isLoading) {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Website Chat Widget</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground mb-4">
          This will allow you to receive and respond to messages via your
          website widget.
        </p>
        <Tabs defaultValue="html">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="html">HTML</TabsTrigger>
            <TabsTrigger value="wordpress">WordPress</TabsTrigger>
            <TabsTrigger value="nextjs">Next.js & React</TabsTrigger>
          </TabsList>

          <TabsContent value="html">
            <div className="space-y-4">
              <p className="text-sm">
                Copy and paste the code below in the header section of your
                website:
              </p>
              <div className="relative">
                <pre className="bg-muted p-4 rounded-lg overflow-x-auto font-mono text-sm whitespace-pre">
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
              <p className="text-xs text-muted-foreground mt-2">
                This code will initialize the chat widget on your website with
                your specific configuration.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="wordpress">
            <div className="space-y-4">
              <p className="text-sm">
                Copy the AI Assistant ID to Install On a WordPress Website using
                the Intelli WordPress plugin.
              </p>
              <div className="relative">
                <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
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
              <p className="text-sm text-muted-foreground italic">
                How to Get the Intelli WordPress Plugin? Search &ldquo;Intelli
                &ldquo; under wordpress plugins in your wordpress site.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="nextjs">
            <div className="space-y-4">
              <p className="text-sm">
                Install the package and add the widget to your Next.js or React
                app:
              </p>
              <div className="relative">
                <pre className="bg-muted p-4 rounded-lg overflow-x-auto whitespace-pre-wrap">{`npm install @intelli/chat-widget

// In your layout.tsx or page where you want the widget
import { IntelliWidget } from '@intelli/chat-widget'

export default function Layout({ children }) {
  return (
    <>
      {children}
      <IntelliWidget assistantId="${widgetKey}" />
    </>
  )
}`}</pre>
                <Button
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() =>
                    handleCopy(
                      `npm install @intelli/chat-widget

// In your layout.tsx or page where you want the widget
import { IntelliWidget } from '@intelli/chat-widget'

export default function Layout({ children }) {
  return (
    <>
      {children}
      <IntelliWidget assistantId="${widgetKey}" />
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
