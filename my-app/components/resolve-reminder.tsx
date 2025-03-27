"use client"
import React from 'react';
import { AlertCircle, Clock } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface ResolveReminderProps {
  className?: string;
}

const ResolveReminder: React.FC<ResolveReminderProps> = ({ className }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <Collapsible 
      open={isOpen} 
      onOpenChange={setIsOpen}
      className={`w-full p-1 ${className}`}
    >
      <Alert variant="default" className="bg-amber-50 border-amber-200">
        <AlertCircle className="h-4 w-4 text-amber-600" />
        <div className="flex-1">
          <AlertTitle className="text-amber-800 flex items-center gap-2">
            <Clock className="h-4 w-4" /> 24-Hour Response Window
          </AlertTitle>
          <AlertDescription className="text-amber-700 text-sm">
            Resolve escalations within 24 hours to maintain messaging privileges.
          </AlertDescription>
        </div>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm" className="text-amber-700 hover:text-amber-900 hover:bg-amber-100">
            {isOpen ? 'Show Less' : 'Learn More'}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-1 px-4 py-3 text-sm border-0 text-red-600">
        <p className="mb-2">
          <strong>WhatsApp Policy:</strong> You may only reply to customer messages within 24 hours of their last message. 
          After this window closes, you&apos;ll need to restart the conversation which costs your business extra messaging credits.
        </p>
        <p className="mb-2">
          <strong>Why this matters:</strong> If you don&apos;t respond to escalations promptly, you may lose the ability to 
          message customers about their current issues without incurring extra/added costs.
        </p>
        <p>
          <strong>Best practice:</strong> Resolve all customer inquiries as quickly as possible to reduce expenses, maintain 
          continuous communication and provide better customer service.
        </p>
      </CollapsibleContent>
      </Alert>
      
      
    </Collapsible>
  );
};

export default ResolveReminder;
