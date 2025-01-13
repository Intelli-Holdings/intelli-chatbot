import { useState } from 'react';
import { useOrganizationList } from '@clerk/nextjs';
import { Card, CardContent, CardHeader, CardDescription, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from "sonner";
import EmbeddedSignup from './EmbeddedSignup';

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

  const [selectedOrganizationId, setSelectedOrganizationId] = useState('');
  const { userMemberships, isLoaded } = useOrganizationList({
    userMemberships: { infinite: true },
  });

  const selectedOrg = userMemberships?.data?.find(
    membership => membership.organization.id === selectedOrganizationId
  );

  const handleOrganizationChange = (value: string) => {
    setSelectedOrganizationId(value);
    toast.info(`Selected organization: ${userMemberships?.data?.find(m => m.organization.id === value)?.organization.name}`);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedOrganizationId) {
      toast.error("Please select an organization");
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
      organization_id: selectedOrganizationId
    };

    try {
      setLoading(true);
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
          // Specific error for duplicate phone number
          toast.info(responseData.phone_number[0], {
            description: "Please use a different phone number",
            duration: 5000
          });
        } else if (typeof responseData === 'object') {
          // Handle other field-specific errors
          Object.entries(responseData).forEach(([field, errors]) => {
            const errorMessage = Array.isArray(errors) ? errors[0] : errors;
            toast.error(`${field.replace(/_/g, ' ').toUpperCase()}: ${errorMessage}`, {
              duration: 5000
            });
          });
        } else {
          // Generic error message
          toast.info("Failed to create WhatsApp integration", {
            description: "Please check your input and try again",
            duration: 5000
          });
        }
        throw new Error(JSON.stringify(responseData));
      }

      // Success case
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
      
      setSelectedOrganizationId('');

      // const data = await response.json();
      toast.success("WhatsApp integration created successfully!");
     // console.log('Success:', data);
    } catch (error) {
      console.error('Error:', error);
      // General error handling is done above in the response.ok check
    } finally {
      setLoading(false);
    }
};

  if (!isLoaded) {
    return <div className="p-6">Loading organizations...</div>;
  }

  return (
    <div className="flex flex-col md:flex-row gap-6 p-6">
      <Card className="md:w-1/2 bg-white shadow-md p-6 rounded-lg">
        <CardHeader>
          <CardTitle>WhatsApp Manual Onboarding</CardTitle>
          <CardDescription>Configure your WhatsApp Business account integration</CardDescription>
        </CardHeader>
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Organization
            </label>
            <Select value={selectedOrganizationId} onValueChange={handleOrganizationChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select an organization" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {userMemberships?.data?.map((membership) => (
                    <SelectItem
                      key={membership.organization.id}
                      value={membership.organization.id}
                    >
                      {membership.organization.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
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
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <div className="flex items-center justify-center space-x-2">
                <Loader className="animate-spin h-5 w-5" />
                <span>Creating WhatsApp Package...</span>
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