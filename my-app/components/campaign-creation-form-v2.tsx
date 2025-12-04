"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Users, FileText, Zap, MessageSquare, Calendar, Send, Search, CheckCircle2, Download, Upload, File, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { useWhatsAppTemplates } from '@/hooks/use-whatsapp-templates';
import { CampaignService, type CreateCampaignData } from '@/services/campaign';
import useActiveOrganizationId from '@/hooks/use-organization-id';
import { useCampaignTimezone } from '@/hooks/use-campaign-timezone';
import { convertUTCToLocalDateTimeString } from '@/lib/timezone-utils';
import { TemplateSelectionPanel } from '@/components/template-selection-panel';

interface Contact {
  id: string;
  fullname: string;
  phone_number: string;
  tags: Array<{ id: string; name: string; slug: string }>;
}

interface Tag {
  id: string;
  name: string;
  slug: string;
}

interface CampaignCreationFormProps {
  appService: any;
  onSuccess: () => void;
}

export default function CampaignCreationFormV2({ appService, onSuccess }: CampaignCreationFormProps) {
  const organizationId = useActiveOrganizationId();
  const [step, setStep] = useState(1);
  const [campaignType, setCampaignType] = useState<'template' | 'simple'>('template');

  const {
    scheduledAtUTC,
    scheduleNow,
    setScheduleNow,
    handleScheduleChange,
    getScheduleForAPI,
    getDisplaySchedule,
  } = useCampaignTimezone();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    channel: 'whatsapp' as 'whatsapp' | 'sms' | 'email',

    // Template-based fields
    templateName: '',
    templateLanguage: '',
    bodyParameters: [] as Array<{ type: string; text: string; parameter_name?: string }>,
    headerParameters: [] as Array<{ type: string; text: string }>,
    buttonParameters: [] as Array<{ type: string; text: string; sub_type?: string }>,

    // Simple text fields
    messageContent: '',

    // Recipient selection
    selectedContacts: [] as string[],
    selectedTags: [] as string[],
  });

  const [uploadedCSV, setUploadedCSV] = useState<File | null>(null);
  const [csvUploading, setCSVUploading] = useState(false);
  const [createdCampaignId, setCreatedCampaignId] = useState<string | null>(null);
  const [createdWhatsAppCampaignId, setCreatedWhatsAppCampaignId] = useState<string | null>(null);
  const [creatingCampaign, setCreatingCampaign] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [templateSearchTerm, setTemplateSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingContacts, setLoadingContacts] = useState(false);

  const { templates, loading: templatesLoading } = useWhatsAppTemplates(appService);
  const approvedTemplates = templates.filter(t => t.status === 'APPROVED');

  // Fetch contacts and tags
  useEffect(() => {
    const fetchData = async () => {
      if (!organizationId) return;

      setLoadingContacts(true);
      try {
        // Fetch contacts
        const contactsResponse = await fetch(
          `/api/contacts/contacts?organization=${organizationId}&page_size=1000`
        );
        if (contactsResponse.ok) {
          const contactsData = await contactsResponse.json();
          setContacts(contactsData.results || contactsData || []);
        }

        // Fetch tags
        const tagsResponse = await fetch(`/api/contacts/tags?organization=${organizationId}`);
        if (tagsResponse.ok) {
          const tagsData = await tagsResponse.json();
          setTags(tagsData.results || tagsData || []);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load contacts and tags');
      } finally {
        setLoadingContacts(false);
      }
    };

    fetchData();
  }, [organizationId]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleContactToggle = (contactId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedContacts: prev.selectedContacts.includes(contactId)
        ? prev.selectedContacts.filter(id => id !== contactId)
        : [...prev.selectedContacts, contactId]
    }));
  };

  const handleTagToggle = (tagSlug: string) => {
    setFormData(prev => ({
      ...prev,
      selectedTags: prev.selectedTags.includes(tagSlug)
        ? prev.selectedTags.filter(slug => slug !== tagSlug)
        : [...prev.selectedTags, tagSlug]
    }));
  };

  const getSelectedTemplate = () => {
    return approvedTemplates.find(t => t.name === formData.templateName);
  };

  // Extract variables from template
  const extractTemplateVariables = (template: any) => {
    const bodyVariables: Array<{ type: string; text: string; parameter_name?: string }> = [];
    const headerVariables: Array<{ type: string; text: string }> = [];
    const buttonVariables: Array<{ type: string; text: string; sub_type?: string }> = [];

    // Extract body variables
    const bodyComponent = template.components?.find((c: any) => c.type === 'BODY');
    if (bodyComponent?.text) {
      const bodyText = bodyComponent.text;
      const paramMatches = bodyText.match(/\{\{(\w+|\d+)\}\}/g) || [];

      // Check if template uses named parameters (marketing templates)
      const isNamedParameters = paramMatches.some((m: string) => !/^\{\{\d+\}\}$/.test(m));

      paramMatches.forEach((match: string, index: number) => {
        const paramName = match.replace(/\{\{|\}\}/g, '');
        const param: { type: string; text: string; parameter_name?: string } = {
          type: 'text',
          text: '', // User will fill this
        };

        // If template uses named parameters, include parameter_name
        if (isNamedParameters && !/^\d+$/.test(paramName)) {
          param.parameter_name = paramName;
        }

        bodyVariables.push(param);
      });
    }

    // Extract header variables (if TEXT header with variable)
    const headerComponent = template.components?.find((c: any) => c.type === 'HEADER');
    if (headerComponent?.format === 'TEXT' && headerComponent?.text) {
      const headerText = headerComponent.text;
      const headerMatches = headerText.match(/\{\{(\w+|\d+)\}\}/g) || [];

      headerMatches.forEach(() => {
        headerVariables.push({
          type: 'text',
          text: '', // User will fill this
        });
      });
    }

    // Extract button variables (URL buttons with parameters and COPY_CODE buttons)
    const buttonsComponent = template.components?.find((c: any) => c.type === 'BUTTONS');
    console.log('Looking for BUTTONS component in template:', template.name);
    console.log('All components:', template.components?.map((c: any) => c.type));

    if (buttonsComponent) {
      console.log('Button component found:', JSON.stringify(buttonsComponent, null, 2));

      if (buttonsComponent.buttons) {
        buttonsComponent.buttons.forEach((button: any, index: number) => {
          console.log(`Processing button ${index}:`, JSON.stringify(button, null, 2));

          // URL buttons with variables in the URL
          if (button.type === 'URL' && button.url) {
            const urlMatches = button.url.match(/\{\{(\w+|\d+)\}\}/g) || [];
            console.log(`Button ${index} URL matches:`, urlMatches);
            urlMatches.forEach(() => {
              buttonVariables.push({
                type: 'text',
                text: '', // User will fill this
                sub_type: 'url',
              });
            });
          }

          // COPY_CODE buttons always require a parameter (the code to copy)
          if (button.type === 'COPY_CODE') {
            console.log(`Button ${index} is COPY_CODE, adding parameter`);
            buttonVariables.push({
              type: 'text',
              text: '', // User will fill this
              sub_type: 'copy_code',
            });
          }
        });
      } else {
        console.log('Buttons component found but no buttons array');
      }
    } else {
      console.log('No BUTTONS component found in template');
    }

    return { bodyVariables, headerVariables, buttonVariables };
  };

  // Handle template selection
  const handleTemplateSelect = async (templateName: string) => {
    const template = approvedTemplates.find(t => t.name === templateName);
    if (template) {
      console.log('Selected template:', template);
      const { bodyVariables, headerVariables, buttonVariables } = extractTemplateVariables(template);
      console.log('Extracted variables - Body:', bodyVariables.length, 'Header:', headerVariables.length, 'Button:', buttonVariables.length);
      setFormData(prev => ({
        ...prev,
        templateName,
        templateLanguage: template.language,
        bodyParameters: bodyVariables,
        headerParameters: headerVariables,
        buttonParameters: buttonVariables,
      }));

      // Reset CSV upload when template changes
      setUploadedCSV(null);
    }
  };

  // Create campaign with current form data
  const createCampaign = async () => {
    if (!appService || !organizationId) {
      toast.error('App service or organization not configured');
      return false;
    }

    setCreatingCampaign(true);
    try {
      // Build the campaign data according to backend expectations
      const campaignData: any = {
        name: formData.name,
        description: formData.description,
        channel: formData.channel,
        organization: organizationId,
      };

      // Only add scheduled_at if it has a value
      const scheduleValue = getScheduleForAPI();
      if (scheduleValue) {
        campaignData.scheduled_at = scheduleValue;
      }

      // Add phone_number for WhatsApp campaigns
      if (formData.channel === 'whatsapp' && appService.phone_number) {
        campaignData.phone_number = appService.phone_number;
      }

      // Add template data for template-based campaigns
      if (campaignType === 'template') {
        const selectedTemplate = approvedTemplates.find(t => t.name === formData.templateName);
        if (selectedTemplate) {
          console.log('=== CAMPAIGN CREATION DEBUG ===');
          console.log('Selected template for campaign:', JSON.stringify(selectedTemplate, null, 2));
          console.log('Form data button parameters:', formData.buttonParameters);
          campaignData.template_id = selectedTemplate.id;

          // Build the template object with all required metadata
          // Use the Meta API format with components as an array
          const templatePayload: any = {
            template: {
              meta_template_id: selectedTemplate.id,
              name: selectedTemplate.name,
              language: selectedTemplate.language,
              category: selectedTemplate.category,
              components: selectedTemplate.components.map((component: any) => {
                // Return component in Meta API format
                const comp: any = {
                  type: component.type
                };

                // Add component-specific fields
                if (component.type === 'HEADER') {
                  comp.format = component.format;
                  if (component.text) comp.text = component.text;
                } else if (component.type === 'BODY') {
                  comp.text = component.text;
                } else if (component.type === 'FOOTER') {
                  comp.text = component.text;
                } else if (component.type === 'BUTTONS') {
                  comp.buttons = component.buttons?.map((btn: any) => ({
                    type: btn.type,
                    text: btn.text,
                    url: btn.url,
                    phone_number: btn.phone_number
                  }));
                }

                return comp;
              })
            }
          };

          // Extract body params as variable placeholders (e.g., {{1}}, {{2}})
          // These will be dynamically replaced when CSV is imported with actual values
          const bodyComponent = selectedTemplate.components.find((c: any) => c.type === 'BODY');
          if (bodyComponent?.text) {
            const bodyText = bodyComponent.text;
            const paramMatches = bodyText.match(/\{\{(\w+|\d+)\}\}/g) || [];
            templatePayload.body_params = paramMatches;
          } else {
            templatePayload.body_params = [];
          }

          // Extract header params as variable placeholders
          const headerComponent = selectedTemplate.components.find((c: any) => c.type === 'HEADER');
          if (headerComponent?.format === 'TEXT' && headerComponent?.text) {
            const headerText = headerComponent.text;
            const headerMatches = headerText.match(/\{\{(\w+|\d+)\}\}/g) || [];
            templatePayload.header_params = headerMatches;
          }

          // Extract button params from URL buttons and COPY_CODE buttons
          const buttonsComponent = selectedTemplate.components.find((c: any) => c.type === 'BUTTONS');
          const buttonParams: string[] = [];

          if (buttonsComponent?.buttons) {
            buttonsComponent.buttons.forEach((button: any) => {
              // URL buttons with variables in the URL
              if (button.type === 'URL' && button.url) {
                const urlMatches = button.url.match(/\{\{(\w+|\d+)\}\}/g) || [];
                buttonParams.push(...urlMatches);
              }
              // COPY_CODE buttons - the example value is the placeholder
              if (button.type === 'COPY_CODE' && button.example) {
                buttonParams.push('{{copy_code}}'); // Placeholder for copy code
              }
            });
          }

          templatePayload.button_params = buttonParams;
          console.log('Extracted params - Body:', templatePayload.body_params, 'Header:', templatePayload.header_params, 'Button:', templatePayload.button_params);

          campaignData.payload = templatePayload;
        }
      } else {
        // For simple text campaigns
        campaignData.payload = {
          message_content: formData.messageContent,
        };
      }

      console.log('Creating campaign with data:', campaignData);
      const campaign = await CampaignService.createCampaign(campaignData);
      console.log('Campaign created:', campaign);

      setCreatedCampaignId(campaign.id);
      if (campaign.whatsapp_campaign_id) {
        setCreatedWhatsAppCampaignId(campaign.whatsapp_campaign_id);
      }
      toast.success('Campaign created successfully!');
      return true;
    } catch (error) {
      console.error('Error creating campaign:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create campaign');
      return false;
    } finally {
      setCreatingCampaign(false);
    }
  };

  // Download CSV template
  const handleDownloadTemplate = async () => {
    if (!createdWhatsAppCampaignId || !organizationId) {
      toast.error('Campaign not created yet');
      return;
    }

    try {
      // Prepare recipients data
      const tagIds = formData.selectedTags.length > 0
        ? formData.selectedTags.map(slug => {
            const tag = tags.find(t => t.slug === slug);
            return tag ? parseInt(tag.id) : null;
          }).filter((id): id is number => id !== null)
        : [];

      const contactIds = formData.selectedContacts.length > 0
        ? formData.selectedContacts.map(id => parseInt(id))
        : [];

      // Build recipients object only if there are recipients
      const recipients = (tagIds.length > 0 || contactIds.length > 0) ? {
        tag_ids: tagIds.length > 0 ? tagIds : undefined,
        contact_ids: contactIds.length > 0 ? contactIds : undefined,
      } : undefined;

      const blob = await CampaignService.exportParamsTemplate(
        createdWhatsAppCampaignId,
        organizationId,
        recipients
      );
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `campaign-${createdWhatsAppCampaignId}-params-template.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('CSV template downloaded successfully');
    } catch (error) {
      console.error('Error downloading template:', error);
      toast.error('Failed to download CSV template');
    }
  };

  // Handle CSV file selection
  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.endsWith('.csv')) {
        toast.error('Please upload a CSV file');
        return;
      }
      setUploadedCSV(file);
      toast.success('CSV file selected successfully');
    }
  };

  // Upload and process CSV
  const handleImportCSV = async () => {
    if (!uploadedCSV || !createdWhatsAppCampaignId || !organizationId) {
      toast.error('Please select a CSV file first');
      return;
    }

    setCSVUploading(true);
    try {
      await CampaignService.importParamsTemplate(createdWhatsAppCampaignId, organizationId, uploadedCSV);
      toast.success('CSV imported successfully! Your template parameters are ready.');
    } catch (error) {
      console.error('Error importing CSV:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to import CSV');
    } finally {
      setCSVUploading(false);
    }
  };

  // Remove uploaded CSV
  const handleRemoveCSV = () => {
    setUploadedCSV(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const validateStep = (stepNumber: number): boolean => {
    switch (stepNumber) {
      case 1:
        return formData.name.trim() !== '' && formData.description.trim() !== '';
      case 2:
        if (campaignType === 'template') {
          if (!formData.templateName) {
            toast.error('Please select a template');
            return false;
          }
          return true;
        }
        return formData.messageContent.trim() !== '';
      case 3:
        return formData.selectedContacts.length > 0 || formData.selectedTags.length > 0;
      case 4:
        // For templates with variables, require CSV upload
        if (campaignType === 'template') {
          const hasVariables = formData.bodyParameters.length > 0 || formData.headerParameters.length > 0;
          if (hasVariables && !uploadedCSV) {
            toast.error('Please upload the CSV file with parameter values');
            return false;
          }
        }
        return true;
      case 5:
        return true; // Review step, always valid
      default:
        return true;
    }
  };

  const nextStep = async () => {
    if (!validateStep(step)) {
      toast.error('Please complete all required fields');
      return;
    }

    // Create campaign after step 2 (message content)
    if (step === 2 && !createdCampaignId) {
      const success = await createCampaign();
      if (!success) return;
    }

    // Move to next step, respecting the max step count
    const maxStep = stepTitles.length;
    setStep(prev => Math.min(prev + 1, maxStep));
  };

  const prevStep = () => {
    setStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!createdWhatsAppCampaignId || !organizationId) {
      toast.error('Campaign not created');
      return;
    }

    setLoading(true);
    try {
      // Add recipients if campaign is WhatsApp
      if (formData.channel === 'whatsapp') {
        // Get tag IDs from tag slugs
        const tagIds = formData.selectedTags.length > 0
          ? formData.selectedTags.map(slug => {
              const tag = tags.find(t => t.slug === slug);
              return tag ? parseInt(tag.id) : null;
            }).filter((id): id is number => id !== null)
          : [];

        // Get contact IDs
        const contactIds = formData.selectedContacts.length > 0
          ? formData.selectedContacts.map(id => parseInt(id))
          : [];

        // Only add recipients if at least one type is selected
        if (tagIds.length > 0 || contactIds.length > 0) {
          const recipientData: { tag_ids?: number[]; contact_ids?: number[] } = {};

          if (tagIds.length > 0) {
            recipientData.tag_ids = tagIds;
          }

          if (contactIds.length > 0) {
            recipientData.contact_ids = contactIds;
          }

          await CampaignService.addWhatsAppCampaignRecipients(
            createdWhatsAppCampaignId,
            organizationId,
            recipientData
          );
        }

        // Execute the campaign
        await CampaignService.executeWhatsAppCampaign(
          createdWhatsAppCampaignId,
          organizationId,
          scheduleNow
        );
      }

      toast.success('Campaign launched successfully!');
      onSuccess();
    } catch (error) {
      console.error('Error launching campaign:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to launch campaign');
    } finally {
      setLoading(false);
    }
  };

  const hasTemplateVariables = campaignType === 'template' &&
    (formData.bodyParameters.length > 0 || formData.headerParameters.length > 0 || formData.buttonParameters.length > 0);

  const stepTitles = hasTemplateVariables
    ? [
        'Campaign Details',
        'Message Content',
        'Select Recipients',
        'Upload Parameters',
        'Review & Launch'
      ]
    : [
        'Campaign Details',
        'Message Content',
        'Select Recipients',
        'Review & Launch'
      ];

  const filteredContacts = contacts.filter(contact =>
    contact.fullname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.phone_number?.includes(searchTerm)
  );

  const filteredTemplates = approvedTemplates.filter(template =>
    template.name.toLowerCase().includes(templateSearchTerm.toLowerCase()) ||
    template.category?.toLowerCase().includes(templateSearchTerm.toLowerCase())
  );

  const getRecipientCount = () => {
    let count = formData.selectedContacts.length;

    // Add contacts from selected tags (rough estimate)
    formData.selectedTags.forEach(tagSlug => {
      const contactsWithTag = contacts.filter(c =>
        c.tags.some(t => t.slug === tagSlug) &&
        !formData.selectedContacts.includes(c.id)
      );
      count += contactsWithTag.length;
    });

    return count;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header Section */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-foreground mb-2">Create Campaign</h1>
          <p className="text-muted-foreground">Launch targeted campaigns across multiple channels</p>
        </div>

        <div className="mb-12">
          <div className="flex items-center justify-between">
            {stepTitles.map((title, index) => (
              <div key={index} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-shrink-0">
                  <div
                    className={`
                      w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold
                      transition-all duration-300 ease-out
                      ${step > index + 1
                        ? 'bg-green-500 text-white shadow-md'
                        : step === index + 1
                        ? 'bg-primary text-primary-foreground shadow-lg ring-4 ring-primary/20'
                        : 'bg-muted text-muted-foreground'
                      }
                    `}
                  >
                    {step > index + 1 ? <CheckCircle2 className="h-5 w-5" /> : index + 1}
                  </div>
                  <span className="text-xs font-medium text-foreground mt-2 text-center whitespace-nowrap px-1">
                    {title}
                  </span>
                </div>

                {index < stepTitles.length - 1 && (
                  <div className={`flex-1 h-1 mx-3 rounded-full transition-all duration-300 ${
                    step > index + 1 ? 'bg-green-500' : 'bg-muted'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Main Form Card */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-6 border-b border-border/40 bg-gradient-to-r from-muted/30 via-muted/10 to-transparent rounded-t-lg">
            <div className="flex items-center gap-3">
              {step === 1 && <FileText className="h-6 w-6 text-primary" />}
              {step === 2 && <MessageSquare className="h-6 w-6 text-primary" />}
              {step === 3 && <Users className="h-6 w-6 text-primary" />}
              {step === 4 && <Upload className="h-6 w-6 text-primary" />}
              {step === 5 && <Zap className="h-6 w-6 text-primary" />}
              <div>
                <CardTitle className="text-2xl">{stepTitles[step - 1]}</CardTitle>
                <CardDescription className="mt-1">
                  {step === 1 && 'Enter the basic information for your campaign'}
                  {step === 2 && 'Choose your message type and content'}
                  {step === 3 && 'Select contacts or tags to target'}
                  {step === 4 && hasTemplateVariables && 'Upload CSV with template parameter values'}
                  {((step === 4 && !hasTemplateVariables) || step === 5) && 'Review your campaign settings before launching'}
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-8 pb-8">
            {/* Step 1: Campaign Details */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="campaignName" className="text-base font-semibold">Campaign Name <span className="text-red-500">*</span></Label>
                  <Input
                    id="campaignName"
                    placeholder="e.g., Summer Sale Promotion"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="h-11 text-base"
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="campaignDescription" className="text-base font-semibold">Campaign Description <span className="text-red-500">*</span></Label>
                  <Textarea
                    id="campaignDescription"
                    placeholder="Describe the purpose and goals of this campaign"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={4}
                    className="text-base resize-none"
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="channel" className="text-base font-semibold">Communication Channel <span className="text-red-500">*</span></Label>
                  <Select value={formData.channel} onValueChange={(value: any) => handleInputChange('channel', value)}>
                    <SelectTrigger className="h-11 text-base">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="whatsapp">WhatsApp</SelectItem>
                      <SelectItem value="sms">SMS</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4 pt-2">
                  <Label className="text-base font-semibold">Schedule</Label>
                  <div className="flex items-center space-x-3 p-4 bg-muted/40 rounded-lg border border-border/50">
                    <Checkbox
                      id="scheduleNow"
                      checked={scheduleNow}
                      onCheckedChange={(checked) => setScheduleNow(!!checked)}
                    />
                    <Label htmlFor="scheduleNow" className="font-medium cursor-pointer">Send immediately</Label>
                  </div>

                  {!scheduleNow && (
                    <div className="space-y-3 mt-4">
                      <Label htmlFor="scheduledAt" className="text-sm font-semibold">Scheduled Date & Time</Label>
                      <Input
                        id="scheduledAt"
                        type="datetime-local"
                        value={scheduledAtUTC ? convertUTCToLocalDateTimeString(scheduledAtUTC) : ''}
                        onChange={(e) => handleScheduleChange(e.target.value)}
                        min={new Date().toISOString().slice(0, 16)}
                        className="h-11"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 2: Message Content */}
            {step === 2 && (
              <div className="space-y-6">
                <Tabs value={campaignType} onValueChange={(value: any) => setCampaignType(value)} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 p-1 bg-muted/50 rounded-lg">
                    <TabsTrigger value="template" className="rounded-md">Use Template</TabsTrigger>
                    <TabsTrigger value="simple" className="rounded-md">Simple Text</TabsTrigger>
                  </TabsList>

                  <TabsContent value="template" className="space-y-6 mt-6">
                    {templatesLoading ? (
                      <div className="text-center py-12">
                        <div className="inline-flex items-center gap-2 text-muted-foreground">
                          <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
                          Loading templates...
                        </div>
                      </div>
                    ) : approvedTemplates.length === 0 ? (
                      <Alert className="bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-900">
                        <AlertDescription className="text-amber-800 dark:text-amber-200">
                          No approved templates available. Please create and get approval for templates in Meta Business Manager.
                        </AlertDescription>
                      </Alert>
                    ) : (
                      <div className="space-y-4">
                        <TemplateSelectionPanel
                          templates={approvedTemplates}
                          selectedTemplate={formData.templateName}
                          onSelectTemplate={handleTemplateSelect}
                          loading={false}
                          maxHeight="max-h-80"
                        />

                        {getSelectedTemplate() && (formData.bodyParameters.length > 0 || formData.headerParameters.length > 0 || formData.buttonParameters.length > 0) && (
                          <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-900">
                            <AlertDescription className="text-blue-800 dark:text-blue-200">
                              This template requires {formData.bodyParameters.length + formData.headerParameters.length + formData.buttonParameters.length} parameter(s).
                              You&apos;ll be able to upload parameter values after selecting recipients.
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="simple" className="space-y-6 mt-6">
                    <div className="space-y-3">
                      <Label htmlFor="messageContent" className="text-base font-semibold">Message Content <span className="text-red-500">*</span></Label>
                      <Textarea
                        id="messageContent"
                        placeholder="Enter your message here. You can use {{fullname}} as a placeholder for the recipient's name."
                        value={formData.messageContent}
                        onChange={(e) => handleInputChange('messageContent', e.target.value)}
                        rows={8}
                        className="text-base resize-none"
                      />
                      <p className="text-xs text-muted-foreground font-medium">
                        Available variables: <code className="bg-muted px-2 py-1 rounded">{'{'}{'{'} fullname {'}'}{'}'}​</code>
                      </p>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            )}

            {/* Step 3: Select Recipients */}
            {step === 3 && (
              <div className="space-y-6">
                <Tabs defaultValue="contacts" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 p-1 bg-muted/50 rounded-lg">
                    <TabsTrigger value="contacts" className="rounded-md">By Contacts</TabsTrigger>
                    <TabsTrigger value="tags" className="rounded-md">By Tags</TabsTrigger>
                  </TabsList>

                  <TabsContent value="contacts" className="space-y-6 mt-6">
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold text-muted-foreground">Search Contacts</Label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <Input
                          placeholder="Search by name or phone number..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 h-11"
                        />
                      </div>
                    </div>

                    {loadingContacts ? (
                      <div className="text-center py-12 p-10">
                        <div className="inline-flex items-center gap-2 text-muted-foreground">
                          <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
                          Loading contacts...
                        </div>
                      </div>
                    ) : filteredContacts.length === 0 ? (
                      <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-900">
                        <AlertDescription className="text-blue-800 dark:text-blue-200">
                          No contacts found. Please add contacts first.
                        </AlertDescription>
                      </Alert>
                    ) : (
                      <div className="space-y-3 max-h-[600px] overflow-y-auto pt-2 pl-2 pr-2">
                        {filteredContacts.map((contact) => (
                          <Card
                            key={contact.id}
                            className={`cursor-pointer transition-all duration-200 border-border/50 ${
                              formData.selectedContacts.includes(contact.id)
                                ? 'ring-2 ring-primary bg-primary/5 border-primary/30'
                                : 'hover:border-border hover:shadow-sm'
                            }`}
                            onClick={() => handleContactToggle(contact.id)}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-start space-x-3">
                                <Checkbox
                                  checked={formData.selectedContacts.includes(contact.id)}
                                  onCheckedChange={() => handleContactToggle(contact.id)}
                                  className="mt-1"
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="font-semibold text-foreground truncate">{contact.fullname}</div>
                                  <div className="text-sm text-muted-foreground">{contact.phone_number}</div>
                                  {contact.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-2">
                                      {contact.tags.map((tag) => (
                                        <Badge key={tag.id} variant="secondary" className="text-xs">
                                          {tag.name}
                                        </Badge>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="tags" className="space-y-6 mt-6">
                    {tags.length === 0 ? (
                      <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-900">
                        <AlertDescription className="text-blue-800 dark:text-blue-200">
                          No tags available. Create tags to organize your contacts.
                        </AlertDescription>
                      </Alert>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {tags.map((tag) => {
                          const contactCount = contacts.filter(c => c.tags.some(t => t.slug === tag.slug)).length;
                          return (
                            <Card
                              key={tag.id}
                              className={`cursor-pointer transition-all duration-200 border-border/50 ${
                                formData.selectedTags.includes(tag.slug)
                                  ? 'ring-2 ring-primary bg-primary/5 border-primary/30'
                                  : 'hover:border-border hover:shadow-sm'
                              }`}
                              onClick={() => handleTagToggle(tag.slug)}
                            >
                              <CardContent className="p-4">
                                <div className="flex items-center space-x-3">
                                  <Checkbox
                                    checked={formData.selectedTags.includes(tag.slug)}
                                    onCheckedChange={() => handleTagToggle(tag.slug)}
                                  />
                                  <div className="flex-1">
                                    <div className="font-semibold text-foreground">{tag.name}</div>
                                    <div className="text-sm text-muted-foreground">
                                      {contactCount} {contactCount === 1 ? 'contact' : 'contacts'}
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    )}
                  </TabsContent>
                </Tabs>

                {(formData.selectedContacts.length > 0 || formData.selectedTags.length > 0) && (
                  <Card className="bg-gradient-to-r from-green-50 to-green-50/50 border-green-200 dark:from-green-950/30 dark:to-green-950/20 dark:border-green-900">
                    <CardContent className="p-4 flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center flex-shrink-0">
                        <Users className="h-5 w-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <div className="font-semibold text-green-900 dark:text-green-200">
                          Estimated Recipients: {getRecipientCount()} contacts
                        </div>
                        <p className="text-sm text-green-800/70 dark:text-green-300/70">Will receive this campaign</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* Step 4: Upload Parameters (only for templates with variables) */}
            {step === 4 && hasTemplateVariables && (
              <div className="space-y-6">
                <Card className="bg-gradient-to-br from-blue-50 to-indigo-50/50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-900">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-base flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Template Parameters
                    </CardTitle>
                    <CardDescription>
                      This template requires {formData.bodyParameters.length + formData.headerParameters.length + formData.buttonParameters.length} parameter(s).
                      Download the CSV template, fill it with values for each recipient, then upload it back.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Step 1: Download CSV Template */}
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">Step 1: Download CSV Template</Label>
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full h-11"
                        onClick={handleDownloadTemplate}
                        disabled={!createdWhatsAppCampaignId}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download CSV Template
                      </Button>
                      <p className="text-xs text-muted-foreground">
                        The CSV will include columns for all template parameters
                      </p>
                    </div>

                    {/* Step 2: Upload Filled CSV */}
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">Step 2: Upload Filled CSV</Label>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".csv"
                        onChange={handleCSVUpload}
                        className="hidden"
                        id="csv-upload"
                      />

                      {!uploadedCSV ? (
                        <label htmlFor="csv-upload">
                          <div className="w-full h-32 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors">
                            <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                            <p className="text-sm font-medium text-foreground">Click to upload CSV</p>
                            <p className="text-xs text-muted-foreground mt-1">or drag and drop</p>
                          </div>
                        </label>
                      ) : (
                        <div className="w-full p-4 border border-border rounded-lg bg-muted/30">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center">
                                <File className="h-5 w-5 text-green-600 dark:text-green-400" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-foreground">{uploadedCSV.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {(uploadedCSV.size / 1024).toFixed(2)} KB
                                </p>
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={handleRemoveCSV}
                              className="h-8 w-8 p-0"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>

                          <Button
                            type="button"
                            className="w-full mt-3"
                            onClick={handleImportCSV}
                            disabled={csvUploading}
                          >
                            {csvUploading ? (
                              <>
                                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                                Importing...
                              </>
                            ) : (
                              <>
                                <Upload className="h-4 w-4 mr-2" />
                                Import CSV Data
                              </>
                            )}
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Info Alert */}
                    <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-900">
                      <AlertDescription className="text-blue-800 dark:text-blue-200 text-xs">
                        <strong>Note:</strong> Each row in the CSV represents one recipient. The template parameters will be personalized for each contact.
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Step 5 (or 4 for simple): Review */}
            {((hasTemplateVariables && step === 5) || (!hasTemplateVariables && step === 4)) && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Campaign Details Column */}
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-4">Campaign Details</h3>
                      <Card className="bg-muted/30 border-border/50">
                        <CardContent className="p-4 space-y-4">
                          <div className="flex justify-between items-start">
                            <span className="font-medium text-muted-foreground">Name:</span>
                            <span className="font-semibold text-foreground text-right max-w-xs">{formData.name}</span>
                          </div>
                          <div className="border-t border-border/30"></div>
                          <div className="flex justify-between items-start">
                            <span className="font-medium text-muted-foreground">Description:</span>
                            <span className="text-sm text-foreground text-right max-w-xs">{formData.description}</span>
                          </div>
                          <div className="border-t border-border/30"></div>
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-muted-foreground">Channel:</span>
                            <Badge className="text-xs">{formData.channel.toUpperCase()}</Badge>
                          </div>
                          <div className="border-t border-border/30"></div>
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-muted-foreground">Schedule:</span>
                            <span className={`text-sm font-semibold ${scheduleNow ? 'text-green-600' : 'text-foreground'}`}>
                              {getDisplaySchedule()}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-4">Message</h3>
                      <Card className="bg-muted/30 border-border/50">
                        <CardContent className="p-4">
                          {campaignType === 'template' ? (
                            <div className="space-y-3">
                              <div className="space-y-2">
                                <div className="text-sm font-medium text-muted-foreground">Template:</div>
                                <div className="font-semibold text-foreground">{formData.templateName}</div>
                                <Badge variant="outline" className="text-xs mt-2">
                                  {formData.templateLanguage}
                                </Badge>
                              </div>

                              {uploadedCSV && (
                                <>
                                  <div className="border-t border-border/30"></div>
                                  <div className="space-y-2">
                                    <div className="text-sm font-medium text-muted-foreground">Parameters:</div>
                                    <div className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-950/30 rounded border border-green-200 dark:border-green-900">
                                      <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                                      <span className="text-sm text-green-800 dark:text-green-200">
                                        CSV uploaded: {uploadedCSV.name}
                                      </span>
                                    </div>
                                  </div>
                                </>
                              )}
                            </div>
                          ) : (
                            <div className="text-sm whitespace-pre-wrap text-foreground leading-relaxed">
                              {formData.messageContent}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  </div>

                  {/* Recipients Column */}
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-4">Recipients</h3>
                      <Card className="bg-muted/30 border-border/50">
                        <CardContent className="p-4 space-y-4">
                          {formData.selectedContacts.length > 0 && (
                            <div>
                              <div className="text-sm font-semibold text-muted-foreground mb-3">Selected Contacts:</div>
                              <div className="max-h-40 overflow-y-auto space-y-2">
                                {formData.selectedContacts.slice(0, 5).map(contactId => {
                                  const contact = contacts.find(c => c.id === contactId);
                                  return contact ? (
                                    <div key={contactId} className="text-sm p-2 bg-background rounded border border-border/50">
                                      <div className="font-medium text-foreground">{contact.fullname}</div>
                                      <div className="text-muted-foreground text-xs">{contact.phone_number}</div>
                                    </div>
                                  ) : null;
                                })}
                                {formData.selectedContacts.length > 5 && (
                                  <div className="text-sm text-muted-foreground font-medium">
                                    +{formData.selectedContacts.length - 5} more contacts
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {formData.selectedContacts.length > 0 && formData.selectedTags.length > 0 && (
                            <div className="border-t border-border/30"></div>
                          )}

                          {formData.selectedTags.length > 0 && (
                            <div>
                              <div className="text-sm font-semibold text-muted-foreground mb-3">Selected Tags:</div>
                              <div className="flex flex-wrap gap-2">
                                {formData.selectedTags.map(tagSlug => {
                                  const tag = tags.find(t => t.slug === tagSlug);
                                  return tag ? (
                                    <Badge key={tagSlug} variant="secondary" className="text-xs">
                                      {tag.name}
                                    </Badge>
                                  ) : null;
                                })}
                              </div>
                            </div>
                          )}

                          <div className="border-t border-border/30 pt-4">
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-foreground">Total Recipients:</span>
                              <span className="text-lg font-bold text-green-600">{getRecipientCount()}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </div>

                <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-900">
                  <AlertDescription className="text-blue-800 dark:text-blue-200">
                    Once launched, this campaign will send messages to approximately <strong>{getRecipientCount()}</strong> contacts. Please review all details carefully before proceeding.
                  </AlertDescription>
                </Alert>
              </div>
            )}
          </CardContent>

          <div className="px-8 py-6 border-t border-border/30 bg-muted/10 rounded-b-lg flex justify-between gap-4">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={step === 1 || creatingCampaign}
              className="h-11 px-6 font-medium"
            >
              Previous
            </Button>

            {step < stepTitles.length ? (
              <Button
                onClick={nextStep}
                disabled={!validateStep(step) || creatingCampaign}
                className="h-11 px-8 font-medium"
              >
                {creatingCampaign ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
                    Creating Campaign...
                  </div>
                ) : (
                  'Next Step'
                )}
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={loading || !validateStep(step)}
                className="h-11 px-8 font-medium bg-green-600 hover:bg-green-700 text-white shadow-lg"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                    Launching...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Send className="h-4 w-4" />
                    Launch Campaign
                  </div>
                )}
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
