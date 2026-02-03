import { Phone } from "lucide-react"

interface TemplatePreviewProps {
  template: any
  variables: string[]
}

export default function TemplatePreview({ template, variables }: TemplatePreviewProps) {
  // Replace variables in text with their values
  const replaceVariables = (text: string) => {
    if (!text) return ""

    let result = text
    variables.forEach((value, index) => {
      const placeholder = `{{${index + 1}}}`
      result = result.replace(placeholder, value || placeholder)
    })

    return result
  }

  return (
    <div className="border rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-900">
      <div className="bg-green-600 text-white p-3 flex items-center justify-between">
        <div className="flex items-center">
          <Phone className="h-4 w-4 mr-2" />
          <span className="text-sm font-medium">WhatsApp</span>
        </div>
        <div className="text-xs">12:34 PM</div>
      </div>

      <div className="p-4 space-y-3">
        <div className="flex justify-start">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-3 max-w-[80%] shadow-sm">
            <div className="text-xs text-gray-500 mb-1">Business Name</div>

            {template.components.header.text && (
              <div className="font-medium mb-2">{replaceVariables(template.components.header.text)}</div>
            )}

            <div className="text-sm mb-2 whitespace-pre-wrap">
              {replaceVariables(template.components.body.text) || "Your message will appear here"}
            </div>

            {template.components.footer.text && (
              <div className="text-xs text-gray-500 mt-2">{template.components.footer.text}</div>
            )}

            {template.components.buttons.length > 0 && (
              <div className="mt-3 pt-2 border-t space-y-2">
                {/* Button rendering would go here */}
                <div className="text-sm text-center text-blue-600">Button placeholder</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
