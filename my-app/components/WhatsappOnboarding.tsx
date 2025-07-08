import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardDescription, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader, Check, Info } from 'lucide-react';
import { toast } from "sonner";
import EmbeddedSignup from './EmbeddedSignup';
import useActiveOrganizationId from '@/hooks/use-organization-id';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';

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
      console.error('Error:', error);
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
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <span className="text-green-600 font-bold">✅</span>
              <p className="text-sm text-gray-700">
                <strong>Active Facebook Business Page</strong> - Your business must have an active Facebook page
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-green-600 font-bold">✅</span>
              <p className="text-sm text-gray-700">
                <strong>Full Administrative Access</strong> - Must have full admin access to Facebook Business Page and business.facebook.com Business Portfolio/Business Manager
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-green-600 font-bold">✅</span>
              <p className="text-sm text-gray-700">
                <strong>Dedicated Phone Number</strong> - Must NOT be currently used on WhatsApp (ready to receive OTP via SMS or Call)
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-green-600 font-bold">✅</span>
              <p className="text-sm text-gray-700">
                <strong>Business Website</strong> with functional contact information
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-green-600 font-bold">✅</span>
              <p className="text-sm text-gray-700">
                <strong>Privacy Policy and Terms of Service</strong> published on your website
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-green-600 font-bold">✅</span>
              <p className="text-sm text-gray-700">
                <strong>Business Knowledge Base</strong> (FAQs, documentation) for customer support
              </p>
            </div>
          </CardContent>
        </Card>     
      </div>
    </div>
  );
};

export default WhatsappAssistant;