// app/components/MessageInput.tsx
import { CornerDownLeft, Mic, Paperclip } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Input } from "@/components/ui/input"

const MessageInput = () => {
  return (
    <form
      className="relative overflow-hidden rounded-lg border bg-background focus-within:ring-1 focus-within:ring-ring"
    >
      <Label htmlFor="message" className="sr-only">
        Message
      </Label>
      <Input
      id="message"
      placeholder="Reply to the messages here..."
      className="border-0 p-3 shadow-xs focus-visible:ring-0" 
      >
      </Input>
      
      <div className="flex items-center p-2 pt-0">
      <Button type="submit" size="sm" className="ml-auto gap-1.5">
          Send Message
          <CornerDownLeft className="size-3.5" />
        </Button>

      </div>
    </form>
  );
}

export default MessageInput;
