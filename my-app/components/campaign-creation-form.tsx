"use client";

import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Users, FileText, Zap, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { useWhatsAppTemplates } from '@/hooks/use-whatsapp-templates';
import { CampaignService, type CreateCampaignData } from '@/services/campaign';

interface ContactList {
  id: string;
  name: string;
  contactCount: number;
  description?: string;
  tags: string[];
}

interface CampaignCreationFormProps {
  appService: any;
  onSuccess: () => void;
}

export default function CampaignCreationForm({ appService, onSuccess }: CampaignCreationFormProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    templateId: '',
    audienceListIds: [] as string[],
    scheduleImmediate: true,
    scheduleDate: '',
    scheduleTime: '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  });
  const [contactLists, setContactLists] = useState<ContactList[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingLists, setLoadingLists] = useState(false);

  const { templates, loading: templatesLoading } = useWhatsAppTemplates(appService);
  const approvedTemplates = templates.filter(t => t.status === 'APPROVED');

  // Fetch contact lists
  useEffect(() => {
    const fetchContactLists = async () => {
      if (!appService) return;

      setLoadingLists(true);
      try {
        const response = await fetch(`/api/contacts/lists?appServiceId=${appService.id}`);
        if (response.ok) {
          const lists = await response.json();
          setContactLists(lists);
        }
      } catch (error) {
        toast.error('Failed to load contact lists');
      } finally {
        setLoadingLists(false);
      }
    };

    fetchContactLists();
  }, [appService]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAudienceToggle = (listId: string) => {
    setFormData(prev => ({
      ...prev,
      audienceListIds: prev.audienceListIds.includes(listId)
        ? prev.audienceListIds.filter(id => id !== listId)
        : [...prev.audienceListIds, listId]
    }));
  };

  const validateStep = (stepNumber: number): boolean => {
    switch (stepNumber) {
      case 1:
        return formData.name.trim() !== '' && formData.description.trim() !== '';
      case 2:
        return formData.templateId !== '';
      case 3:
        return formData.audienceListIds.length > 0;
      case 4:
        if (formData.scheduleImmediate) return true;
        return formData.scheduleDate !== '' && formData.scheduleTime !== '';
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep(prev => Math.min(prev + 1, 5));
    } else {
      toast.error('Please complete all required fields');
    }
  };

  const prevStep = () => {
    setStep(prev => Math.max(prev - 1, 1));
  };

  const getTotalAudienceSize = () => {
    return contactLists
      .filter(list => formData.audienceListIds.includes(list.id))
      .reduce((total, list) => total + list.contactCount, 0);
  };

  const getSelectedTemplate = () => {
    return approvedTemplates.find(t => t.id === formData.templateId);
  };

  const handleSubmit = async () => {
    if (!appService) {
      toast.error('App service not configured');
      return;
    }

    setLoading(true);
    try {
      // TODO: This old form needs to be updated to match new API structure
      // Use CampaignCreationFormV2 instead
      const campaignData: any = {
        name: formData.name,
        description: formData.description,
        channel: 'whatsapp',
        organization: '',
        payload: {},
      };

      await CampaignService.createCampaign(campaignData);
      toast.success('Campaign created successfully!');
      onSuccess();
    } catch (error) {
      toast.error('Failed to create campaign');
    } finally {
      setLoading(false);
    }
  };

  const stepTitles = [
    'Campaign Details',
    'Select Template',
    'Choose Audience',
    'Schedule Campaign',
    'Review & Launch'
  ];

  return (
    <div className="space-y-6">
      {/* Progress Indicator */}
      <div className="flex items-center justify-between mb-8">
        {stepTitles.map((title, index) => (
          <div key={index} className="flex items-center">
            <div
              className={`
                w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                ${step > index + 1
                  ? 'bg-green-600 text-white'
                  : step === index + 1
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-600'
                }
              `}
            >
              {step > index + 1 ? '✓' : index + 1}
            </div>
            <div className="ml-2 hidden sm:block">
              <div className={`text-sm font-medium ${step === index + 1 ? 'text-blue-600' : 'text-gray-500'}`}>
                {title}
              </div>
            </div>
            {index < stepTitles.length - 1 && (
              <div className={`w-12 h-0.5 mx-4 ${step > index + 1 ? 'bg-green-600' : 'bg-gray-200'}`} />
            )}
          </div>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {step === 1 && <FileText className="h-5 w-5" />}
            {step === 2 && <Send className="h-5 w-5" />}
            {step === 3 && <Users className="h-5 w-5" />}
            {step === 4 && <Clock className="h-5 w-5" />}
            {step === 5 && <Zap className="h-5 w-5" />}
            {stepTitles[step - 1]}
          </CardTitle>
          <CardDescription>
            {step === 1 && 'Enter the basic information for your broadcast campaign'}
            {step === 2 && 'Choose an approved WhatsApp template for your message'}
            {step === 3 && 'Select the contact lists you want to target'}
            {step === 4 && 'Choose when to send your campaign'}
            {step === 5 && 'Review your campaign settings before launching'}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Step 1: Campaign Details */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="campaignName">Campaign Name *</Label>
                <Input
                  id="campaignName"
                  placeholder="e.g., Summer Sale Promotion"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="campaignDescription">Campaign Description *</Label>
                <Textarea
                  id="campaignDescription"
                  placeholder="Describe the purpose and goals of this campaign"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          )}

          {/* Step 2: Template Selection */}
          {step === 2 && (
            <div className="space-y-4">
              {templatesLoading ? (
                <div className="text-center py-8">Loading templates...</div>
              ) : approvedTemplates.length === 0 ? (
                <Alert>
                  <AlertDescription>
                    No approved templates available. Please create and get approval for templates first.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {approvedTemplates.map((template) => (
                    <Card
                      key={template.id}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        formData.templateId === template.id
                          ? 'ring-2 ring-blue-500 bg-blue-50'
                          : 'hover:border-gray-400'
                      }`}
                      onClick={() => handleInputChange('templateId', template.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium">{template.name}</h4>
                          <Badge variant="outline">{template.category}</Badge>
                        </div>
                        <div className="text-sm text-muted-foreground space-y-1">
                          {template.components?.map((component, index) => (
                            <div key={index}>
                              {component.type === 'BODY' && (
                                <p className="line-clamp-2">{component.text}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 3: Audience Selection */}
          {step === 3 && (
            <div className="space-y-4">
              {loadingLists ? (
                <div className="text-center py-8">Loading contact lists...</div>
              ) : contactLists.length === 0 ? (
                <Alert>
                  <AlertDescription>
                    No contact lists available. Please upload contacts first.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-3">
                  {contactLists.map((list) => (
                    <Card
                      key={list.id}
                      className={`transition-all ${
                        formData.audienceListIds.includes(list.id)
                          ? 'ring-2 ring-blue-500 bg-blue-50'
                          : 'hover:border-gray-400'
                      }`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-3">
                          <Checkbox
                            checked={formData.audienceListIds.includes(list.id)}
                            onCheckedChange={() => handleAudienceToggle(list.id)}
                          />
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium">{list.name}</h4>
                              <Badge variant="outline">{list.contactCount} contacts</Badge>
                            </div>
                            {list.description && (
                              <p className="text-sm text-muted-foreground mt-1">{list.description}</p>
                            )}
                            {list.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {list.tags.map((tag) => (
                                  <Badge key={tag} variant="secondary" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  
                  {formData.audienceListIds.length > 0 && (
                    <div className="mt-4 p-4 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-green-600" />
                        <span className="font-medium text-green-800">
                          Total Audience: {getTotalAudienceSize().toLocaleString()} contacts
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Step 4: Schedule */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={formData.scheduleImmediate}
                    onCheckedChange={(checked) => handleInputChange('scheduleImmediate', checked)}
                  />
                  <Label>Send immediately</Label>
                </div>

                {!formData.scheduleImmediate && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg">
                    <div className="space-y-2">
                      <Label htmlFor="scheduleDate">Date</Label>
                      <Input
                        id="scheduleDate"
                        type="date"
                        value={formData.scheduleDate}
                        onChange={(e) => handleInputChange('scheduleDate', e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="scheduleTime">Time</Label>
                      <Input
                        id="scheduleTime"
                        type="time"
                        value={formData.scheduleTime}
                        onChange={(e) => handleInputChange('scheduleTime', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="timezone">Timezone</Label>
                      <Select
                        value={formData.timezone}
                        onValueChange={(value) => handleInputChange('timezone', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="America/New_York">Eastern Time (EST/EDT)</SelectItem>
                          <SelectItem value="America/Chicago">Central Time (CST/CDT)</SelectItem>
                          <SelectItem value="America/Denver">Mountain Time (MST/MDT)</SelectItem>
                          <SelectItem value="America/Los_Angeles">Pacific Time (PST/PDT)</SelectItem>
                          <SelectItem value="UTC">UTC</SelectItem>
                          <SelectItem value="Europe/London">London (GMT/BST)</SelectItem>
                          <SelectItem value="Europe/Paris">Paris (CET/CEST)</SelectItem>
                          <SelectItem value="Asia/Tokyo">Tokyo (JST)</SelectItem>
                          <SelectItem value="Asia/Shanghai">Shanghai (CST)</SelectItem>
                          <SelectItem value="Asia/Kolkata">India (IST)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 5: Review */}
          {step === 5 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Campaign Details</h3>
                  <div className="space-y-2">
                    <div>
                      <span className="font-medium">Name:</span> {formData.name}
                    </div>
                    <div>
                      <span className="font-medium">Description:</span> {formData.description}
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold">Template</h3>
                  <div>
                    {getSelectedTemplate() && (
                      <div className="p-3 border rounded-lg">
                        <div className="font-medium">{getSelectedTemplate()?.name}</div>
                        <Badge variant="outline" className="mt-1">
                          {getSelectedTemplate()?.category}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Audience</h3>
                  <div className="space-y-2">
                    {contactLists
                      .filter(list => formData.audienceListIds.includes(list.id))
                      .map(list => (
                        <div key={list.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                          <span>{list.name}</span>
                          <Badge variant="outline">{list.contactCount}</Badge>
                        </div>
                      ))}
                    <div className="font-medium text-green-600">
                      Total: {getTotalAudienceSize().toLocaleString()} contacts
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold">Schedule</h3>
                  <div>
                    {formData.scheduleImmediate ? (
                      <span className="text-green-600 font-medium">Send immediately</span>
                    ) : (
                      <div>
                        <div>Date: {new Date(`${formData.scheduleDate}T${formData.scheduleTime}`).toLocaleDateString()}</div>
                        <div>Time: {new Date(`${formData.scheduleDate}T${formData.scheduleTime}`).toLocaleTimeString()}</div>
                        <div>Timezone: {formData.timezone}</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <Alert>
                <AlertDescription>
                  Once launched, this campaign will send messages to {getTotalAudienceSize().toLocaleString()} contacts.
                  Please review all details carefully before proceeding.
                </AlertDescription>
              </Alert>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6 border-t">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={step === 1}
            >
              Previous
            </Button>

            {step < 5 ? (
              <Button
                onClick={nextStep}
                disabled={!validateStep(step)}
              >
                Next
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="bg-green-600 hover:bg-green-700"
              >
                {loading ? 'Creating...' : 'Launch Campaign'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
