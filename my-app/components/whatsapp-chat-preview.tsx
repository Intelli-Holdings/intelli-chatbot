import { DefaultTemplate } from "@/data/default-templates"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { X, Phone, Video, MoreVertical } from "lucide-react"

interface WhatsAppChatPreviewProps {
  template: DefaultTemplate
  onClose: () => void
}

export function WhatsAppChatPreview({ template, onClose }: WhatsAppChatPreviewProps) {
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="bg-green-600 text-white p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src="/placeholder-avatar.png" />
              <AvatarFallback className="bg-green-700 text-white text-xs">
                YB
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-sm font-medium">Your Business</CardTitle>
              <div className="text-xs text-green-100">Online</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="ghost" className="text-white hover:bg-green-700 p-1">
              <Video className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="ghost" className="text-white hover:bg-green-700 p-1">
              <Phone className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="ghost" className="text-white hover:bg-green-700 p-1">
              <MoreVertical className="h-4 w-4" />
            </Button>
            <Button 
              size="sm" 
              variant="ghost" 
              className="text-white hover:bg-green-700 p-1"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        {/* Chat Background */}
        <div 
          className="min-h-[400px] p-4 bg-cover bg-center"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='a' patternUnits='userSpaceOnUse' width='20' height='20'%3E%3Cpath d='M0 0h20v20H0z' fill='%23f0f2f5'/%3E%3Cpath d='M10 0v20M0 10h20' stroke='%23e4e6ea' stroke-width='0.5'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23a)'/%3E%3C/svg%3E")`
          }}
        >
          {/* Template Message */}
          <div className="flex justify-end mb-4">
            <div className="max-w-[80%] bg-green-500 text-white rounded-lg p-3 shadow-sm">
              {template.preview.headerText && (
                <div className="font-semibold text-sm mb-2 border-b border-green-400 pb-2">
                  {template.preview.headerText}
                </div>
              )}
              
              <div className="text-sm whitespace-pre-wrap mb-2">
                {template.preview.bodyText}
              </div>
              
              {template.preview.footerText && (
                <div className="text-xs text-green-100 border-t border-green-400 pt-2 mt-2">
                  {template.preview.footerText}
                </div>
              )}
              
              {template.preview.buttons && template.preview.buttons.length > 0 && (
                <div className="mt-3 space-y-1">
                  {template.preview.buttons.map((button, index) => (
                    <div 
                      key={index}
                      className="w-full p-2 bg-green-400 hover:bg-green-300 rounded border text-center text-sm font-medium cursor-pointer transition-colors"
                    >
                      {button}
                    </div>
                  ))}
                </div>
              )}
              
              <div className="text-xs text-green-100 mt-2 text-right">
                12:34 PM ✓✓
              </div>
            </div>
          </div>
          
          {/* Customer Response */}
          <div className="flex justify-start">
            <div className="max-w-[80%] bg-white rounded-lg p-3 shadow-sm">
              <div className="text-sm text-gray-800">
                Thanks for the information! 👍
              </div>
              <div className="text-xs text-gray-500 mt-1">
                12:35 PM
              </div>
            </div>
          </div>
        </div>
        
        {/* Template Info */}
        <div className="border-t p-3 bg-muted/30">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-sm">{template.name}</div>
              <div className="text-xs text-muted-foreground">
                Category: {template.category}
              </div>
            </div>
            <Badge variant="outline" className="text-xs">
              Preview
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
