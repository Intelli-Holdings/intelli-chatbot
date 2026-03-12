import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Copy, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { logger } from "@/lib/logger";
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
  const [reactFramework, setReactFramework] = useState<string>("nextjs-app");

  useEffect(() => {
    const fetchEmbeddingCode = async () => {
      try {
        const response = await fetch(`/api/widgets/embedding/${widgetKey}`, {
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache",
          },
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || "Failed to fetch embedding code");
        }

        const data = await response.json();
        logger.info("[DeploymentDialog] Successfully fetched embedding code");
        setEmbeddingCode(data.embedding_code);
      } catch (error) {
        logger.error("[DeploymentDialog] Error fetching embedding code:", {
          error: error instanceof Error ? error.message : String(error),
        });
        toast.error(
          `Failed to fetch embedding code: ${error instanceof Error ? error.message : "Unknown error"}`
        );
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

  const reactSnippets: Record<
    string,
    { code: string; envHint: string; envFile: string; description: string }
  > = {
    "nextjs-app": {
      description:
        "Add the widget to your root layout so it appears on every page. The component includes 'use client' so it works in Server Component trees.",
      code: `// app/layout.tsx
import { IntelliWidget } from '@intelli-inc/chat-widget'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <IntelliWidget assistantId="${widgetKey}" />
      </body>
    </html>
  )
}`,
      envHint:
        "Tip: Store your assistant ID in an environment variable for flexibility.",
      envFile: `# .env.local
NEXT_PUBLIC_ASSISTANT_ID=${widgetKey}`,
    },
    "nextjs-pages": {
      description:
        "Add the widget to _app.tsx so it appears on every page, or import it into a specific page component.",
      code: `// pages/_app.tsx
import type { AppProps } from 'next/app'
import { IntelliWidget } from '@intelli-inc/chat-widget'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Component {...pageProps} />
      <IntelliWidget assistantId="${widgetKey}" />
    </>
  )
}`,
      envHint:
        "Tip: Store your assistant ID in an environment variable for flexibility.",
      envFile: `# .env.local
NEXT_PUBLIC_ASSISTANT_ID=${widgetKey}`,
    },
    vite: {
      description:
        "Import the widget in your root App component. Vite requires the VITE_ prefix to expose env vars to client code.",
      code: `// src/App.tsx
import { IntelliWidget } from '@intelli-inc/chat-widget'

function App() {
  return (
    <>
      {/* Your app content */}
      <IntelliWidget assistantId="${widgetKey}" />
    </>
  )
}

export default App`,
      envHint:
        "Vite requires the VITE_ prefix for environment variables to be exposed to client code.",
      envFile: `# .env
VITE_ASSISTANT_ID=${widgetKey}`,
    },
    cra: {
      description:
        "Import the widget in your root App component. Create React App requires the REACT_APP_ prefix for environment variables.",
      code: `// src/App.tsx
import { IntelliWidget } from '@intelli-inc/chat-widget'

function App() {
  return (
    <>
      {/* Your app content */}
      <IntelliWidget assistantId="${widgetKey}" />
    </>
  )
}

export default App`,
      envHint:
        "Create React App requires the REACT_APP_ prefix for environment variables.",
      envFile: `# .env
REACT_APP_ASSISTANT_ID=${widgetKey}`,
    },
  };

  const currentSnippet = reactSnippets[reactFramework];

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
      <DialogContent className="max-w-[95vw] sm:max-w-2xl mx-4 sm:mx-auto max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Deploy Website Widget</DialogTitle>
        </DialogHeader>
        <p className="text-muted-foreground px-1">
          Add the Intelli chat widget to your website to receive and respond to
          messages from visitors.
        </p>

        <Tabs defaultValue="html" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="html">HTML</TabsTrigger>
            <TabsTrigger value="wordpress">WordPress</TabsTrigger>
            <TabsTrigger value="react">React</TabsTrigger>
          </TabsList>

          {/* ── HTML Tab ─────────────────────────────────── */}
          <TabsContent value="html" className="space-y-4">
            <p className="text-sm px-1">
              Paste this snippet in the{" "}
              <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">
                {"<head>"}
              </code>{" "}
              of your HTML file:
            </p>
            <CodeBlock
              code={embeddingCode || "No embedding code available"}
              copyKey="html"
              copied={copied}
              onCopy={handleCopy}
              disabled={!embeddingCode}
            />
            <p className="text-xs text-muted-foreground px-1">
              The script loads asynchronously and won&apos;t affect your
              page&apos;s load performance.
            </p>
          </TabsContent>

          {/* ── WordPress Tab ────────────────────────────── */}
          <TabsContent value="wordpress" className="space-y-4">
            <p className="text-sm px-1">
              Use your Widget Key to configure the Intelli WordPress plugin:
            </p>
            <CodeBlock
              code={widgetKey}
              copyKey="wordpress"
              copied={copied}
              onCopy={handleCopy}
              disabled={!widgetKey}
            />
            <div className="bg-muted/50 border rounded-lg p-3 text-sm text-muted-foreground space-y-2">
              <p className="font-medium text-foreground">Setup steps:</p>
              <ol className="list-decimal list-inside space-y-1 text-xs">
                <li>
                  In your WordPress admin, go to{" "}
                  <strong>Plugins &rarr; Add New</strong>
                </li>
                <li>
                  Search for <strong>&ldquo;Intelli&rdquo;</strong> and install
                  the plugin
                </li>
                <li>Activate the plugin and open its settings page</li>
                <li>Paste the Widget Key above and save</li>
              </ol>
            </div>
          </TabsContent>

          {/* ── React Tab ────────────────────────────────── */}
          <TabsContent value="react" className="space-y-5">
            {/* Framework selector */}
            <div className="flex items-center gap-3 px-1">
              <label className="text-sm font-medium whitespace-nowrap">
                Framework:
              </label>
              <Select
                value={reactFramework}
                onValueChange={setReactFramework}
              >
                <SelectTrigger className="w-full max-w-[220px] h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nextjs-app">
                    Next.js (App Router)
                  </SelectItem>
                  <SelectItem value="nextjs-pages">
                    Next.js (Pages Router)
                  </SelectItem>
                  <SelectItem value="vite">Vite + React</SelectItem>
                  <SelectItem value="cra">Create React App</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <p className="text-sm text-muted-foreground px-1">
              {currentSnippet.description}
            </p>

            {/* Step 1: Install */}
            <div className="space-y-2">
              <StepHeader step={1} title="Install the package" />
              <div className="flex gap-2">
                <CodeBlock
                  code="npm install @intelli-inc/chat-widget"
                  copyKey="react-install"
                  copied={copied}
                  onCopy={handleCopy}
                  className="flex-1"
                  compact
                />
              </div>
              <p className="text-xs text-muted-foreground px-1">
                Also available via{" "}
                <code className="bg-muted px-1 py-0.5 rounded font-mono">
                  yarn add
                </code>{" "}
                or{" "}
                <code className="bg-muted px-1 py-0.5 rounded font-mono">
                  pnpm add
                </code>
              </p>
            </div>

            {/* Step 2: Add widget */}
            <div className="space-y-2">
              <StepHeader step={2} title="Add the widget to your app" />
              <CodeBlock
                code={currentSnippet.code}
                copyKey="react-code"
                copied={copied}
                onCopy={handleCopy}
              />
            </div>

            {/* Step 3: Environment variable */}
            <div className="space-y-2">
              <StepHeader step={3} title="Set up environment variable" optional />
              <CodeBlock
                code={currentSnippet.envFile}
                copyKey="react-env"
                copied={copied}
                onCopy={handleCopy}
                compact
              />
              <p className="text-xs text-muted-foreground px-1">
                {currentSnippet.envHint}
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

/* ── Helper Components ──────────────────────────────────────────── */

function StepHeader({
  step,
  title,
  optional,
}: {
  step: number;
  title: string;
  optional?: boolean;
}) {
  return (
    <div className="flex items-center gap-2 px-1">
      <span className="flex items-center justify-center size-5 rounded-full bg-primary text-primary-foreground text-xs font-semibold">
        {step}
      </span>
      <h3 className="text-sm font-medium">{title}</h3>
      {optional && (
        <span className="text-xs text-muted-foreground">(optional)</span>
      )}
    </div>
  );
}

function CodeBlock({
  code,
  copyKey,
  copied,
  onCopy,
  disabled,
  className,
  compact,
}: {
  code: string;
  copyKey: string;
  copied: string;
  onCopy: (text: string, key: string) => void;
  disabled?: boolean;
  className?: string;
  compact?: boolean;
}) {
  return (
    <div className={`relative group ${className ?? ""}`}>
      <pre
        className={`bg-muted ${compact ? "p-2.5" : "p-3 sm:p-4"} rounded-lg overflow-x-auto text-xs font-mono whitespace-pre-wrap break-words`}
      >
        {code}
      </pre>
      <Button
        size="icon"
        variant="ghost"
        className="absolute top-1.5 right-1.5 size-7 opacity-0 group-hover:opacity-100 transition-opacity bg-muted-foreground/10 hover:bg-muted-foreground/20"
        onClick={() => onCopy(code, copyKey)}
        disabled={disabled}
      >
        {copied === copyKey ? (
          <Check className="size-3.5 text-green-500" />
        ) : (
          <Copy className="size-3.5" />
        )}
      </Button>
    </div>
  );
}
