import { useState } from 'react';
import { Card, CardContent, CardHeader, CardDescription, CardTitle } from '@/components/ui/card';
import {Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import EmbeddedSignup from './EmbeddedSignup';

const WhatsappAssistant = () => {
  const [formData, setFormData] = useState({
    phoneNumber: '',
    accessToken: '',
    phoneNumberId: '',
    businessAccountId: '',
    appVersion: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement the API call to update the cloud API with formData
    console.log('Form data submitted:', formData);
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 p-6">
      {/* Left Column: Form */}
      <Card className='md:w-1/2 bg-white shadow-md p-6 rounded-lg'>
      <CardHeader>
        <CardTitle>Whatsapp Manual Onboarding</CardTitle>
      </CardHeader>
      <form onSubmit={handleFormSubmit} className="space-y-4">
          <div>
            <label htmlFor="phoneNumber" className="block text-sm font-medium">Phone Number</label>
            <input
              type="text"
              id="phoneNumber"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border rounded-lg shadow-sm"
              placeholder="WhatsApp phone number without leading (+)"
              aria-label="WhatsApp phone number without leading plus"
            />
          </div>
          <div>
            <label htmlFor="accessToken" className="block text-sm font-medium">Permanent Access Token</label>
            <input
              type="text"
              id="accessToken"
              name="accessToken"
              value={formData.accessToken}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border rounded-lg shadow-sm"
              placeholder="Access token from your Meta App..."
              aria-label="WhatsApp Cloud API permanent access token"
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
              placeholder="WhatsApp Cloud Phone number ID"
              aria-label="WhatsApp Cloud Phone number ID"
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
              placeholder="WhatsApp cloud business ID"
              aria-label="WhatsApp cloud business ID"
            />
          </div>
          <div>
            <label htmlFor="appVersion" className="block text-sm font-medium">Application Version</label>
            <input
              type="text"
              id="appVersion"
              name="appVersion"
              value={formData.appVersion}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border rounded-lg shadow-sm"
              placeholder="WhatsApp cloud Application version"
              aria-label="WhatsApp cloud Application version"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 bg-gray-600 text-white font-medium rounded-xl shadow-md mt-4  hover:bg-blue-700"
            aria-label="Update Cloud API"
          >
            Create Assistant
          </button>
        </form>

      </Card>

      {/* Right Column: WhatsApp Signup Embed */}
      <div className="md:w-1/2 flex items-center justify-center">
        <div className="bg-gradient-to-r from-teal-100 to-blue-100 p-4 rounded-lg shadow-sm w-full h-full flex items-center justify-center">
          <EmbeddedSignup />
        </div>
      </div>
    </div>
  );
};

export default WhatsappAssistant;
