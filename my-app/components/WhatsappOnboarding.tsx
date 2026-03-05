import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardDescription, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader, Check, Info } from 'lucide-react';
import { toast } from "sonner";
import EmbeddedSignup from './EmbeddedSignup';
import useActiveOrganizationId from '@/hooks/use-organization-id';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';

import { logger } from "@/lib/logger";
const WhatsappAssistant = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phoneNumber: '',
    accessToken: '',
    phoneNumberId: '',
    businessAccountId: '',
    appSecret: '',
  });
  const [currentStep, setCurrentStep] = useState(1);

  // Get active organization ID automatically
  const activeOrganizationId = useActiveOrganizationId();
  
  // When organization ID is loaded, show a notification
  useEffect(() => {
    if (activeOrganizationId) {
      toast.info("Organization automatically selected");
      setCurrentStep(2);
    }
  }, [activeOrganizationId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
    
    // Update current step based on form completion
    const formFields = Object.values(formData);
    const filledFields = formFields.filter(field => field !== '').length;
    
    if (filledFields >= 1 && currentStep < 3) setCurrentStep(3);
    if (Object.values(formData).every(val => val !== '') && currentStep < 4) setCurrentStep(4);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!activeOrganizationId) {
      toast.error("Organization not yet loaded. Please wait a moment.");
      return;
    }
    
    const payload = {
      choice: "whatsapp",
      data: {
        whatsapp_business_account_id: formData.businessAccountId,
        name: formData.name,
        phone_number: formData.phoneNumber,
        phone_number_id: formData.phoneNumberId,
        app_secret: formData.appSecret,
        access_token: formData.accessToken
      },
      organization_id: activeOrganizationId
    };

    try {
      setLoading(true);
      setCurrentStep(5);
      toast.info("Creating WhatsApp integration...");
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/channels/create/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      const responseData = await response.json();

      if (!response.ok) {
        // Handle different types of errors
        if (responseData.phone_number) {
          toast.info(responseData.phone_number[0], {
            description: "Please use a different phone number",
            duration: 5000
          });
        } else if (typeof responseData === 'object') {
          Object.entries(responseData).forEach(([field, errors]) => {
            const errorMessage = Array.isArray(errors) ? errors[0] : errors;
            toast.error(`${field.replace(/_/g, ' ').toUpperCase()}: ${errorMessage}`, {
              duration: 5000
            });
          });
        } else {
          toast.info("Failed to create WhatsApp integration", {
            description: "Please check your input and try again",
            duration: 5000
          });
        }
        setCurrentStep(4); // Back to form completion step
        throw new Error(JSON.stringify(responseData));
      }

      // Success case
      setCurrentStep(6);
      toast.success("WhatsApp integration created successfully!", {
        description: `Created package for ${formData.name}`,
        duration: 5000
      });
      
      // Clear form after success
      setFormData({
        name: '',
        phoneNumber: '',
        accessToken: '',
        phoneNumberId: '',
        businessAccountId: '',
        appSecret: '',
      });

    } catch (error) {
      logger.error('Error:', { error: error instanceof Error ? error.message : String(error) });
    } finally {
      setLoading(false);
    }
  };
  
  // Timeline steps
  const steps = [
    { id: 1, title: "Starting", description: "Initializing WhatsApp configuration" },
    { id: 2, title: "Organization Selected", description: "Your organization has been automatically identified" },
    { id: 3, title: "Form Input", description: "Enter your WhatsApp business details" },
    { id: 4, title: "Ready to Submit", description: "All information has been provided" },
    { id: 5, title: "Processing", description: "Creating your WhatsApp integration" },
    { id: 6, title: "Complete", description: "WhatsApp business account successfully connected" }
  ];

  return (
    <div className="flex flex-col md:flex-row gap-6 p-6">
    
      <Card className="md:w-1/2 shadow-md p-6 rounded-lg">
        <EmbeddedSignup />
      </Card>

      <div className="md:w-1/2 flex flex-col gap-4">
        {/* Prerequisites Card */}
        <Card className="bg-white shadow-md p-6 rounded-lg">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-800">Onboarding Requirements</CardTitle>
            <CardDescription className="text-gray-600">
              Essential prerequisites before connecting WhatsApp Business API
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Required for both flows</p>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Check size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-gray-700">
                  <strong>Active Facebook Business Page</strong> - Your business must have an active Facebook page
                </p>
              </div>
              <div className="flex items-start gap-3">
                <Check size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-gray-700">
                  <strong>Full Administrative Access</strong> - Admin access to Facebook Business Page and Business Manager
                </p>
              </div>
              <div className="flex items-start gap-3">
                <Check size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-gray-700">
                  <strong>Business Website</strong> with functional contact information
                </p>
              </div>
              <div className="flex items-start gap-3">
                <Check size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-gray-700">
                  <strong>Privacy Policy and Terms of Service</strong> published on your website
                </p>
              </div>
            </div>

            <div className="border-t pt-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 border rounded-lg bg-gray-50">
                  <p className="text-xs font-semibold text-gray-800 mb-2 uppercase tracking-wide">New Number</p>
                  <div className="flex items-start gap-2">
                    <Check size={14} className="text-green-600 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-gray-600">
                      <strong>Dedicated phone number</strong> not currently registered on WhatsApp, ready to receive OTP via SMS or call
                    </p>
                  </div>
                </div>
                <div className="p-3 border rounded-lg bg-blue-50">
                  <p className="text-xs font-semibold text-blue-800 mb-2 uppercase tracking-wide">Coexistence</p>
                  <div className="flex items-start gap-2">
                    <Check size={14} className="text-blue-600 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-gray-600">
                      <strong>Existing WhatsApp Business App</strong> number -- your WA Business app keeps working alongside our platform
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>     
      </div>
    </div>
  );
};

export default WhatsappAssistant;