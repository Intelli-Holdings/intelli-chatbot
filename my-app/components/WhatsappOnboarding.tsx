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
      <Card className="md:w-1/2 bg-white shadow-md p-6 rounded-lg">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>WhatsApp Manual Onboarding</CardTitle>
              <CardDescription>Configure your WhatsApp Business account integration</CardDescription>
            </div>
            <HoverCard>
              <HoverCardTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Info className="h-5 w-5" />
                </Button>
              </HoverCardTrigger>
              <HoverCardContent className="w-80">
                <div className="space-y-4">
                  <h3 className="font-medium">Setup Progress</h3>
                  <div className="space-y-2">
                    {steps.map((step) => (
                      <div key={step.id} className="flex items-start gap-2">
                        <div className={`mt-0.5 h-5 w-5 rounded-full flex items-center justify-center
                          ${currentStep >= step.id ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                          {currentStep >= step.id ? (
                            <Check className="h-3 w-3" />
                          ) : (
                            <span className="text-xs">{step.id}</span>
                          )}
                        </div>
                        <div>
                          <p className={`text-sm font-medium ${currentStep >= step.id ? 'text-gray-900' : 'text-gray-500'}`}>
                            {step.title}
                          </p>
                          <p className="text-xs text-gray-500">{step.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </HoverCardContent>
            </HoverCard>
          </div>
        </CardHeader>
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium">Account Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border rounded-lg shadow-sm"
              placeholder="My WhatsApp Business Account"
              required
            />
          </div>
          <div>
            <label htmlFor="phoneNumber" className="block text-sm font-medium">Phone Number</label>
            <input
              type="text"
              id="phoneNumber"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border rounded-lg shadow-sm"
              placeholder="+1234567890"
              required
            />
          </div>
          <div>
            <label htmlFor="accessToken" className="block text-sm font-medium">Access Token</label>
            <input
              type="password"
              id="accessToken"
              name="accessToken"
              value={formData.accessToken}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border rounded-lg shadow-sm"
              placeholder="WhatsApp Cloud API access token"
              required
            />
          </div>
          <div>
            <label htmlFor="phoneNumberId" className="block text-sm font-medium">Phone Number ID</label>
            <input
              type="text"
              id="phoneNumberId"
              name="phoneNumberId"
              value={formData.phoneNumberId}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border rounded-lg shadow-sm"
              placeholder="WhatsApp Cloud Phone Number ID"
              required
            />
          </div>
          <div>
            <label htmlFor="businessAccountId" className="block text-sm font-medium">Business Account ID</label>
            <input
              type="text"
              id="businessAccountId"
              name="businessAccountId"
              value={formData.businessAccountId}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border rounded-lg shadow-sm"
              placeholder="WhatsApp Business Account ID"
              required
            />
          </div>
          <div>
            <label htmlFor="appSecret" className="block text-sm font-medium">App Secret</label>
            <input
              type="password"
              id="appSecret"
              name="appSecret"
              value={formData.appSecret}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border rounded-lg shadow-sm"
              placeholder="WhatsApp App Secret"
              required
            />
          </div>
          <Button 
            type="submit" 
            className="w-full" 
            disabled={loading || !activeOrganizationId}
          >
            {loading ? (
              <div className="flex items-center justify-center space-x-2">
                <Loader className="animate-spin h-5 w-5" />
                <span>Creating WhatsApp Package...</span>
              </div>
            ) : !activeOrganizationId ? (
              <div className="flex items-center justify-center space-x-2">
                <Loader className="animate-spin h-5 w-5" />
                <span>Waiting for organization data...</span>
              </div>
            ) : (
              "Create WhatsApp Package"
            )}
          </Button>
        </form>
      </Card>

      <div className="md:w-1/2 flex items-center justify-center">
        <div className="bg-gradient-to-r from-teal-100 to-blue-100 p-4 rounded-lg shadow-sm w-full h-full flex items-center justify-center">
        <EmbeddedSignup />
        </div>
      </div>
    </div>
  );
};

export default WhatsappAssistant;