"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Users, FileText, Zap, MessageSquare, Calendar, Send, Search, CheckCircle2, Download, Upload, X, AlertCircle } from 'lucide-react';
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
import { CampaignService, type Campaign, type CreateCampaignData } from '@/services/campaign';
import useActiveOrganizationId from '@/hooks/use-organization-id';
import { useCampaignTimezone } from '@/hooks/use-campaign-timezone';
import { convertUTCToLocalDateTimeString } from '@/lib/timezone-utils';
import { TemplateSelectionPanel } from '@/components/template-selection-panel';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useImportMappings } from '@/hooks/use-import-mappings';
import ImportMappingDialog from '@/components/import-mapping-dialog';
import Papa from 'papaparse';
import { autoMapCSVToFields, type AutoMappingResult, type FieldDefinition } from '@/lib/auto-mapping-engine';
import { transformCSVToRecipients, validateMappings, getRequiredFields } from '@/lib/csv-transform-utils';
import MappingPreviewPanel from '@/components/mapping-preview-panel';

interface Contact {
  id: string;
  fullname: string;
  phone: string; // Backend returns 'phone' not 'phone_number'
  email?: string;
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
  draftCampaign?: Campaign | null;
}

export default function CampaignCreationForm({ appService, onSuccess, draftCampaign = null }: CampaignCreationFormProps) {
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

  const [createdCampaignId, setCreatedCampaignId] = useState<string | null>(null);
  const [createdWhatsAppCampaignId, setCreatedWhatsAppCampaignId] = useState<string | null>(null);
  const [creatingCampaign, setCreatingCampaign] = useState(false);
  const [recipientParameters, setRecipientParameters] = useState<Record<string, Record<string, string>>>({});

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [customFields, setCustomFields] = useState<Array<{ id: string; name: string; key: string }>>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [templateSearchTerm, setTemplateSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingContacts, setLoadingContacts] = useState(false);

  // CSV Import state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [csvData, setCsvData] = useState<Array<Record<string, string>>>([]);
  const [selectedMappingId, setSelectedMappingId] = useState<string | null>(null);
  const [createIfNotExists, setCreateIfNotExists] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showMappingDialog, setShowMappingDialog] = useState(false);
  const [recipientSelectionMode, setRecipientSelectionMode] = useState<'manual' | 'csv'>('manual');
  const [csvImportStep, setCsvImportStep] = useState<'upload' | 'map' | 'verify'>('upload');
  const [columnMappings, setColumnMappings] = useState<Record<string, string>>({});
  const [autoMappingResults, setAutoMappingResults] = useState<AutoMappingResult | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [importedRecipientsCount, setImportedRecipientsCount] = useState(0);
  const hasInitializedDraft = useRef(false);
  const hasSyncedDraftTemplate = useRef(false);

  const { mappings, loading: mappingsLoading } = useImportMappings(organizationId || '', formData.channel);

  // New pagination / totals state used by contacts fetch logic
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);

  // Reduce page size to 100 to avoid gateway timeouts (was 1000)
  const pageSize = 100;

  const { templates, loading: templatesLoading } = useWhatsAppTemplates(appService);
  const approvedTemplates = templates.filter(t => t.status === 'APPROVED');

  useEffect(() => {
    hasInitializedDraft.current = false;
    hasSyncedDraftTemplate.current = false;
  }, [draftCampaign?.id]);

  // Fetch contacts using the same logic as /dashboard/contacts (paginated, smaller page size)
  // Returns true on success, false on failure.
  const fetchContacts = useCallback(async (orgId: string, page: number = 1) => {
    try {
      setLoadingContacts(true);
      const response = await fetch(`/api/contacts/contacts?organization=${orgId}&page=${page}&page_size=${pageSize}`);
      if (!response.ok) throw new Error("Failed to fetch contacts");
      const data = await response.json();

      // Handle paginated response
      if (data.results) {
        if (page === 1) {
          setContacts(data.results);
        } else {
          // Append new batch while keeping previous contacts
          setContacts(prev => {
            // Prevent duplicates by id (in case API returns overlapping results)
            const existingIds = new Set(prev.map(c => c.id));
            const newItems = data.results.filter((c: Contact) => !existingIds.has(c.id));
            return [...prev, ...newItems];
          });
        }
        setTotalCount(data.count || 0);
        setTotalPages(Math.ceil((data.count || 0) / pageSize));
      } else {
        const arrayData = Array.isArray(data) ? data : [];
        if (page === 1) {
          setContacts(arrayData);
        } else {
          setContacts(prev => {
            const existingIds = new Set(prev.map(c => c.id));
            const newItems = arrayData.filter((c: Contact) => !existingIds.has(c.id));
            return [...prev, ...newItems];
          });
        }
      }

      return true;
    } catch (error) {
      toast.error("Failed to fetch contacts");
      console.error('fetchContacts error:', error);
      return false;
    } finally {
      setLoadingContacts(false);
    }
  }, [pageSize]);

  // Load initial contacts and tags on mount / when organizationId changes
  useEffect(() => {
    const fetchData = async () => {
      if (!organizationId) return;

      try {
        // Fetch first page of contacts (page 1)
        const ok = await fetchContacts(organizationId, 1);
        if (ok) {
          setCurrentPage(1);
        } else {
          setCurrentPage(0);
        }

        // Fetch tags
        const tagsResponse = await fetch(`/api/contacts/tags?organization=${organizationId}`);
        if (tagsResponse.ok) {
          const tagsData = await tagsResponse.json();
          setTags(tagsData.results || tagsData || []);
        }

        // Fetch custom fields
        const customFieldsResponse = await fetch(`/api/contacts/custom-fields?organization=${organizationId}`);
        if (customFieldsResponse.ok) {
          const customFieldsData = await customFieldsResponse.json();
          const fields = customFieldsData.results || customFieldsData || [];
          // Only include active custom fields
          setCustomFields(fields.filter((f: any) => f.is_active).map((f: any) => ({
            id: f.id,
            name: f.name,
            key: f.key
          })));
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load contacts and tags');
      }
    };

    fetchData();
  }, [organizationId, fetchContacts]);

  // Prefill form when continuing a draft campaign
  useEffect(() => {
    if (!draftCampaign || hasInitializedDraft.current) return;

    setCreatedCampaignId(draftCampaign.id);
    if (draftCampaign.whatsapp_campaign_id) {
      setCreatedWhatsAppCampaignId(draftCampaign.whatsapp_campaign_id);
    } else if (draftCampaign.channel === 'whatsapp') {
      setCreatedWhatsAppCampaignId(draftCampaign.id);
    }

    setFormData(prev => ({
      ...prev,
      name: draftCampaign.name || '',
      description: draftCampaign.description || '',
      channel: draftCampaign.channel as 'whatsapp' | 'sms' | 'email',
      templateName: draftCampaign.payload?.template_name || '',
      templateLanguage: draftCampaign.payload?.template_language || '',
      bodyParameters: draftCampaign.payload?.body_parameters || prev.bodyParameters,
      headerParameters: draftCampaign.payload?.header_parameters || prev.headerParameters,
      messageContent: draftCampaign.payload?.message_content || '',
    }));

    if (draftCampaign.payload?.template_name) {
      setCampaignType('template');
    } else if (draftCampaign.payload?.message_content) {
      setCampaignType('simple');
    }

    if (draftCampaign.scheduled_at) {
      setScheduleNow(false);
      handleScheduleChange(convertUTCToLocalDateTimeString(draftCampaign.scheduled_at));
    }

    // Jump the user into recipient step so they can continue the flow
    setStep(3);

    hasInitializedDraft.current = true;
  }, [draftCampaign, handleScheduleChange, setScheduleNow]);

  useEffect(() => {
    if (!draftCampaign || campaignType !== 'template' || hasSyncedDraftTemplate.current) return;

    const templateName = draftCampaign.payload?.template_name || draftCampaign.template?.name;
    const template = approvedTemplates.find(t => t.name === templateName);

    if (template) {
      const { bodyVariables, headerVariables, buttonVariables } = extractTemplateVariables(template);
      setFormData(prev => ({
        ...prev,
        templateName: template.name,
        templateLanguage: template.language,
        bodyParameters: bodyVariables,
        headerParameters: headerVariables,
        buttonParameters: buttonVariables,
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        bodyParameters: draftCampaign.payload?.body_parameters || prev.bodyParameters,
        headerParameters: draftCampaign.payload?.header_parameters || prev.headerParameters,
      }));
    }

    hasSyncedDraftTemplate.current = true;
  }, [approvedTemplates, campaignType, draftCampaign]);

  const loadMoreContacts = async () => {
    if (!organizationId) return;
    if (loadingContacts) return;
    const nextPage = currentPage + 1;
    if (nextPage > totalPages) return;
    const ok = await fetchContacts(organizationId, nextPage);
    if (ok) {
      setCurrentPage(nextPage);
    } else {
      toast.error('Failed to load more contacts');
    }
  };

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
    }
  };

  const updateDraftCampaign = async () => {
    if (!draftCampaign || !organizationId || !createdCampaignId) {
      toast.error('Campaign not ready to update');
      return false;
    }

    setCreatingCampaign(true);
    try {
      const updateData: any = {
        name: formData.name,
        description: formData.description,
        channel: formData.channel,
        organization: organizationId,
      };

      if (formData.channel === 'whatsapp' && appService?.phone_number) {
        updateData.phone_number = appService.phone_number;
      }

      const scheduleValue = getScheduleForAPI();
      const fallbackNow = new Date().toISOString();
      updateData.scheduled_at = scheduleValue || fallbackNow;

      if (campaignType === 'template') {
        const selectedTemplate = approvedTemplates.find(t => t.name === formData.templateName);
        if (selectedTemplate) {
          updateData.template_id = selectedTemplate.id;

          const templatePayload: any = {
            template: {
              meta_template_id: selectedTemplate.id,
              name: selectedTemplate.name,
              language: selectedTemplate.language,
              category: selectedTemplate.category,
              components: selectedTemplate.components.map((component: any) => {
                const comp: any = {
                  type: component.type
                };

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

          const bodyComponent = selectedTemplate.components.find((c: any) => c.type === 'BODY');
          if (bodyComponent?.text) {
            const bodyText = bodyComponent.text;
            const paramMatches = bodyText.match(/\{\{(\w+|\d+)\}\}/g) || [];
            templatePayload.body_params = paramMatches;
          } else {
            templatePayload.body_params = [];
          }

          const headerComponent = selectedTemplate.components.find((c: any) => c.type === 'HEADER');
          if (headerComponent?.format === 'TEXT' && headerComponent?.text) {
            const headerText = headerComponent.text;
            const headerMatches = headerText.match(/\{\{(\w+|\d+)\}\}/g) || [];
            templatePayload.header_params = headerMatches;
          }

          const buttonsComponent = selectedTemplate.components.find((c: any) => c.type === 'BUTTONS');
          const buttonParams: string[] = [];

          if (buttonsComponent?.buttons) {
            buttonsComponent.buttons.forEach((button: any) => {
              if (button.type === 'URL' && button.url) {
                const urlMatches = button.url.match(/\{\{(\w+|\d+)\}\}/g) || [];
                buttonParams.push(...urlMatches);
              }
              if (button.type === 'COPY_CODE' && button.example) {
                buttonParams.push('{{copy_code}}');
              }
            });
          }

          templatePayload.button_params = buttonParams;

          updateData.payload = templatePayload;
        }
      } else {
        updateData.payload = {
          message_content: formData.messageContent,
        };
      }

      await CampaignService.updateCampaign(
        createdCampaignId,
        organizationId,
        updateData
      );

      toast.success('Draft updated');
      return true;
    } catch (error) {
      console.error('Error updating draft campaign:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update draft');
      return false;
    } finally {
      setCreatingCampaign(false);
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
      const fallbackNow = new Date().toISOString();
      campaignData.scheduled_at = scheduleValue || fallbackNow;

      // Add phone_number for WhatsApp campaigns
      if (formData.channel === 'whatsapp' && appService?.phone_number) {
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

  // Handle parameter value change for a specific recipient
  const handleParameterChange = (contactId: string, paramKey: string, value: string) => {
    setRecipientParameters(prev => ({
      ...prev,
      [contactId]: {
        ...(prev[contactId] || {}),
        [paramKey]: value
      }
    }));
  };

  // Insert custom field placeholder into parameter input
  const insertCustomFieldPlaceholder = (contactId: string, paramKey: string, fieldKey: string) => {
    const currentValue = recipientParameters[contactId]?.[paramKey] || '';
    const placeholder = `{{custom.${fieldKey}}}`;
    const newValue = currentValue ? `${currentValue} ${placeholder}` : placeholder;
    handleParameterChange(contactId, paramKey, newValue);
  };

  // CSV Import handlers
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.name.endsWith('.csv') && !file.name.endsWith('.xlsx')) {
      toast.error('Please select a CSV or Excel file');
      return;
    }

    setSelectedFile(file);

    // Parse CSV to detect headers and load all data
    if (file.name.endsWith('.csv')) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.data && results.data.length > 0) {
            const headers = Object.keys(results.data[0] as object);
            setCsvHeaders(headers);
            setCsvData(results.data as Array<Record<string, string>>);

            // NEW: Auto-mapping - only if we have template parameters
            if (campaignType === 'template' && formData.templateName) {
              const contactFieldDefs: FieldDefinition[] = contactFieldOptions
                .filter(f => !f.value.startsWith('header_') && !f.value.startsWith('body_') && !f.value.startsWith('button_'))
                .map(f => ({
                  value: f.value,
                  label: f.label,
                  required: f.value === 'phone',
                }));

              const autoResults = autoMapCSVToFields(
                headers,
                contactFieldDefs,
                {
                  header: formData.headerParameters.length,
                  body: formData.bodyParameters.length,
                  button: formData.buttonParameters.length,
                }
              );

              setAutoMappingResults(autoResults);
              setColumnMappings(autoResults.mappings);

              toast.success(`Auto-mapped ${Object.keys(autoResults.mappings).length} of ${headers.length} columns`);
            }

            // Move to mapping step
            setCsvImportStep('map');

            toast.success(`Loaded ${results.data.length} rows from CSV - ${headers.length} columns`);
          }
        },
        error: (error) => {
          console.error('Error parsing CSV:', error);
          toast.error('Failed to parse CSV file');
        },
      });
    }
  };

  // Define contact field options for mapping
  const contactFieldOptions = [
    { value: 'phone', label: 'Phone Number' },
    { value: 'fullname', label: 'Full Name' },
    { value: 'email', label: 'Email' },
    { value: 'id', label: 'Contact ID' },
    ...customFields.map(field => ({
      value: `custom.${field.key}`,
      label: field.name
    })),
    ...formData.headerParameters.map((_, idx) => ({
      value: `header_${idx}`,
      label: `Header Parameter ${idx + 1}`
    })),
    ...formData.bodyParameters.map((param, idx) => ({
      value: `body_${idx}`,
      label: param.parameter_name || `Body Parameter ${idx + 1}`
    })),
    ...formData.buttonParameters.map((_, idx) => ({
      value: `button_${idx}`,
      label: `Button Parameter ${idx + 1}`
    }))
  ];

  // Handle CSV data changes
  const handleCsvDataChange = (rowIndex: number, column: string, value: string) => {
    setCsvData(prev => {
      const newData = [...prev];
      newData[rowIndex] = { ...newData[rowIndex], [column]: value };
      return newData;
    });
  };

  const handleDeleteCsvRow = (rowIndex: number) => {
    setCsvData(prev => prev.filter((_, idx) => idx !== rowIndex));
    toast.success('Row deleted');
  };

  const handleAddCsvRow = () => {
    const newRow: Record<string, string> = {};
    csvHeaders.forEach(header => {
      newRow[header] = '';
    });
    setCsvData(prev => [...prev, newRow]);
    toast.success('Row added');
  };

  const handleImportCSV = async () => {
    if (!selectedFile) {
      toast.error('Please select a file to import');
      return;
    }

    if (!createdWhatsAppCampaignId || !organizationId) {
      toast.error('Campaign not created yet');
      return;
    }

    try {
      setUploading(true);

      // Step 1: Create a new CSV file from the edited csvData
      // This is necessary because the original file reference becomes stale after Papa Parse reads it
      const csvContent = Papa.unparse(csvData, {
        header: true,
        columns: csvHeaders
      });

      const csvBlob = new Blob([csvContent], { type: 'text/csv' });
      // Create a File object from the Blob
      const csvFile = new (File as any)([csvBlob], selectedFile.name, { type: 'text/csv' }) as File;

      // Step 2: Import contacts using the new endpoint
      const formDataPayload = new FormData();
      formDataPayload.append('file', csvFile);
      formDataPayload.append('organization', organizationId);

      // Use campaign name as tag slug
      const tagSlug = formData.name.toLowerCase().replace(/\s+/g, '-');
      formDataPayload.append('tag_slugs', tagSlug);

      const importResponse = await fetch('/api/contacts/import', {
        method: 'POST',
        body: formDataPayload,
      });

      if (!importResponse.ok) {
        throw new Error('Failed to import contacts');
      }

      const importResult = await importResponse.json();
      const importJobId = importResult.id || importResult.job_id;

      if (!importJobId) {
        throw new Error('No import job ID returned');
      }

      toast.info('Import started. Checking status...');

      // Step 2: Poll for import status
      let importComplete = false;
      let attempts = 0;
      const maxAttempts = 120; // 2 minutes max (increased from 30 seconds)
      let lastStatus = '';

      while (!importComplete && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second

        try {
          const statusResponse = await fetch(`/api/contacts/import/${importJobId}`);

          if (!statusResponse.ok) {
            console.warn(`Import status check failed (attempt ${attempts + 1}/${maxAttempts}):`, statusResponse.status);

            // If we get a 404, the job might have been cleaned up
            if (statusResponse.status === 404) {
              throw new Error('Import job not found - it may have been cancelled or expired');
            }

            // Continue trying for other errors
            attempts++;
            continue;
          }

          const statusData = await statusResponse.json();

          // Show progress updates when status changes or every 30 seconds
          const statusUpper = statusData.status?.toUpperCase();
          if (statusData.status !== lastStatus || attempts % 30 === 0) {
            const statusMessage = statusUpper === 'RUNNING'
              ? `Processing contacts... (${attempts}s elapsed)`
              : statusUpper === 'PENDING'
              ? `Import queued... (${attempts}s elapsed)`
              : `Import status: ${statusData.status}`;
            toast.info(statusMessage);
            lastStatus = statusData.status;
          }

          // Backend uses 'SUCCESS' (uppercase) for completed imports
          if (statusUpper === 'SUCCESS') {
            importComplete = true;
            toast.success(`Import completed! ${statusData.created_count || statusData.contacts_created || 0} contacts imported`);

            // Step 3: Transform CSV data to recipients using new transformation utility
            try {
              const transformResult = transformCSVToRecipients(
                csvData,
                columnMappings,
                {
                  header: formData.headerParameters.length,
                  body: formData.bodyParameters.length,
                  button: formData.buttonParameters.length,
                },
                {
                  validatePhone: true,
                  validateParams: true,
                  skipInvalidRows: true,
                }
              );

              // Show validation errors if any
              if (transformResult.errors.length > 0) {
                console.warn('CSV validation errors:', transformResult.errors);
                toast.warning(`${transformResult.errors.length} row(s) with errors were skipped`);
              }

              // Step 4: Add recipients to campaign
              if (transformResult.recipients.length > 0) {
                await CampaignService.addWhatsAppCampaignRecipients(
                  createdWhatsAppCampaignId,
                  organizationId,
                  { recipients: transformResult.recipients }
                );
                setImportedRecipientsCount(prev => prev + transformResult.recipients.length);
                toast.success(`${transformResult.recipients.length} recipients added with personalized parameters`);
              } else {
                toast.error('No valid recipients found in CSV');
              }
            } catch (error) {
              console.error('Error adding recipients to campaign:', error);
              toast.error('Failed to add recipients to campaign');
            }

            break;
          } else if (statusUpper === 'FAILED') {
            throw new Error(statusData.message || statusData.error || 'Import failed');
          }
        } catch (fetchError) {
          // Log network errors but continue polling unless it's a critical error
          if (fetchError instanceof Error && fetchError.message.includes('Import job not found')) {
            throw fetchError;
          }
          console.warn('Error checking import status:', fetchError);
        }

        attempts++;
      }

      if (!importComplete) {
        const timeoutMessage = 'Import is taking longer than expected. This could mean:\n' +
          '1. Large file is still processing\n' +
          '2. Backend service may be slow\n' +
          '3. Import job may be stuck\n\n' +
          'Please check your contacts list or try importing again with a smaller file.';
        toast.error(timeoutMessage, { duration: 10000 });
        console.error('Import timeout after', attempts, 'attempts. Job ID:', importJobId);

        // Still clear the form to allow retry
        setSelectedFile(null);
        setCsvHeaders([]);
        setCsvData([]);
        setCsvImportStep('upload');
        setColumnMappings({});
        if (fileInputRef.current) fileInputRef.current.value = '';

        throw new Error('Import timeout - please try again with a smaller file or contact support');
      }

      // Clear the file after successful import
      setSelectedFile(null);
      setCsvHeaders([]);
      setCsvData([]);
      setCsvImportStep('upload');
      setColumnMappings({});
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (error) {
      console.error('Error importing CSV:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to import CSV');
    } finally {
      setUploading(false);
    }
  };

  const handleOpenMappingDialog = () => {
    if (csvHeaders.length === 0) {

      return;
    }
    setShowMappingDialog(true);
  };

  const handleMappingCreated = (mapping: any) => {
    setSelectedMappingId(mapping.id);
    toast.success('Mapping created and selected');
  };

  const verifyRecipientsExist = async () => {
    if (!createdWhatsAppCampaignId || !organizationId) return true;
    try {
      const result = await CampaignService.getWhatsAppCampaignRecipients(
        createdWhatsAppCampaignId,
        organizationId,
        { page_size: 1 }
      );

      const total = typeof result.count === 'number'
        ? result.count
        : Array.isArray(result)
        ? result.length
        : result.results?.length || 0;

      if (total === 0) {
        toast.error('No recipients found for this campaign. Please import or select recipients before launching.');
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error verifying recipients:', error);
      return true; // Do not block launch on verification error
    }
  };

  // Ensure we have up-to-date campaign IDs before execute
  const ensureCampaignIds = async () => {
    if (!organizationId) return false;
    if (createdWhatsAppCampaignId && createdCampaignId) return true;

    try {
      if (!createdCampaignId && draftCampaign?.id) {
        setCreatedCampaignId(draftCampaign.id);
      }

      const idToFetch = createdCampaignId || draftCampaign?.id;
      if (!idToFetch) return false;

      const fresh = await CampaignService.getCampaign(idToFetch, organizationId);

      if (fresh?.id) {
        setCreatedCampaignId(fresh.id);
      }
      if (fresh?.whatsapp_campaign_id) {
        setCreatedWhatsAppCampaignId(fresh.whatsapp_campaign_id);
      } else if (fresh?.channel === 'whatsapp') {
        setCreatedWhatsAppCampaignId(fresh.id);
      }
      return true;
    } catch (error) {
      console.error('Error refreshing campaign ids before execute:', error);
      return false;
    }
  };

  // Handle select all contacts
  const handleSelectAllContacts = (checked: boolean) => {
    if (checked) {
      const allContactIds = filteredContacts.map(c => c.id);
      setFormData(prev => ({ ...prev, selectedContacts: allContactIds }));
    } else {
      setFormData(prev => ({ ...prev, selectedContacts: [] }));
    }
  };

  const validateStep = (stepNumber: number): boolean => {
    switch (stepNumber) {
      case 1:
        return formData.name.trim() !== '' && formData.description.trim() !== '';
      case 2:
        if (campaignType === 'template') {
          return !!formData.templateName;
        }
        return formData.messageContent.trim() !== '';
      case 3:
        const manualRecipientsSelected = formData.selectedContacts.length > 0 || formData.selectedTags.length > 0;
        const csvRecipientsImported = importedRecipientsCount > 0;
        if (campaignType === 'template' && !formData.templateName) {
          return false;
        }

        // For templates with variables, validate that all selected recipients have parameter values
        if (campaignType === 'template' && hasTemplateVariables) {
          if (!manualRecipientsSelected && !csvRecipientsImported) {
            return false;
          }

          // Only enforce manual parameter entry when the user selected contacts directly
          if (formData.selectedContacts.length > 0) {
            const totalParams = formData.bodyParameters.length + formData.headerParameters.length + formData.buttonParameters.length;
            for (const contactId of formData.selectedContacts) {
              const params = recipientParameters[contactId] || {};
              const filledParams = Object.keys(params).filter(k => params[k].trim() !== '').length;
              if (filledParams < totalParams) {
                return false;
              }
            }
          }
          return true;
        }
        return manualRecipientsSelected || csvRecipientsImported;
      case 4:
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
    if (step === 2) {
      if (!createdCampaignId) {
        const success = await createCampaign();
        if (!success) return;
      } else if (draftCampaign) {
        const updated = await updateDraftCampaign();
        if (!updated) return;
      }
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
      const idsReady = await ensureCampaignIds();
      if (!idsReady || !createdWhatsAppCampaignId) {
        toast.error('Unable to prepare campaign IDs for execution. Please try reopening the draft.');
        setLoading(false);
        return;
      }

      // Ensure draft campaigns are synced before execution
      if (draftCampaign) {
        const updated = await updateDraftCampaign();
        if (!updated) {
          setLoading(false);
          return;
        }
      }

      // Add recipients if campaign is WhatsApp
      if (formData.channel === 'whatsapp') {
        console.log('=== RECIPIENT SUBMISSION DEBUG ===');
        console.log('Selected contacts:', formData.selectedContacts);
        console.log('Selected tags:', formData.selectedTags);
        console.log('Has template variables:', hasTemplateVariables);

        // If template has variables, use new format with per-recipient parameters
        if (hasTemplateVariables && formData.selectedContacts.length > 0) {
          console.log('=== USING NEW RECIPIENT FORMAT WITH PARAMETERS ===');

          // Build recipients array with template parameters
          const recipientsWithParams = formData.selectedContacts.map(contactId => {
            const contact = contacts.find(c => c.id === contactId);
            if (!contact) {
              console.warn(`Contact not found for ID: ${contactId}`);
              return null;
            }

            // Validate that contact has a phone number
            if (!contact.phone) {
              console.warn(`Contact ${contactId} (${contact.fullname}) has no phone number`);
              console.warn('Contact object:', contact);
              return null;
            }

            const params = recipientParameters[contactId] || {};

            // Build header_params array
            const header_params: string[] = [];
            for (let i = 0; i < formData.headerParameters.length; i++) {
              header_params.push(params[`header_${i}`] || '');
            }

            // Build body_params array
            const body_params: string[] = [];
            for (let i = 0; i < formData.bodyParameters.length; i++) {
              body_params.push(params[`body_${i}`] || '');
            }

            // Build button_params array
            const button_params: string[] = [];
            for (let i = 0; i < formData.buttonParameters.length; i++) {
              button_params.push(params[`button_${i}`] || '');
            }

            const recipient: any = {
              phone: contact.phone,
              fullname: contact.fullname || '',
              email: contact.email || '', // Optional
              template_params: {
                header_params: header_params,
                body_params: body_params,
                button_params: button_params
              }
            };

            console.log(`Building recipient for ${contact.fullname}:`, recipient);

            return recipient;
          }).filter(r => r !== null);

          console.log('Recipients with parameters:', JSON.stringify(recipientsWithParams, null, 2));

          // Add recipients with template parameters
          await CampaignService.addWhatsAppCampaignRecipients(
            createdWhatsAppCampaignId,
            organizationId,
            { recipients: recipientsWithParams }
          );

          console.log('Recipients with parameters added successfully');

          const ok = await verifyRecipientsExist();
          if (!ok) {
            setLoading(false);
            return;
          }
        } else {
          // Use legacy format: Add recipients by tag_ids/contact_ids (no parameters)
          console.log('=== USING LEGACY RECIPIENT FORMAT ===');

          // Get tag IDs from tag slugs
          const tagIds = formData.selectedTags.length > 0
            ? formData.selectedTags.map(slug => {
                const tag = tags.find(t => t.slug === slug);
                return tag ? parseInt(tag.id) : null;
              }).filter((id): id is number => id !== null)
            : [];

          // Get contact IDs - ensure they are numbers
          const contactIds = formData.selectedContacts.length > 0
            ? formData.selectedContacts.map(id => {
                const numId = typeof id === 'string' ? parseInt(id) : id;
                console.log(`Converting contact ID: ${id} -> ${numId} (type: ${typeof numId})`);
                return numId;
              }).filter(id => !isNaN(id))
            : [];

          console.log('Converted tag IDs:', tagIds);
          console.log('Converted contact IDs:', contactIds);

          // Only add recipients if at least one type is selected
          if (tagIds.length > 0 || contactIds.length > 0) {
            const recipientData: { tag_ids?: number[]; contact_ids?: number[] } = {};

            if (tagIds.length > 0) {
              recipientData.tag_ids = tagIds;
            }

            if (contactIds.length > 0) {
              recipientData.contact_ids = contactIds;
            }

            console.log('Recipient data payload:', JSON.stringify(recipientData, null, 2));

            await CampaignService.addWhatsAppCampaignRecipients(
              createdWhatsAppCampaignId,
              organizationId,
              recipientData
            );

            console.log('Recipients added successfully');

            const ok = await verifyRecipientsExist();
            if (!ok) {
              setLoading(false);
              return;
            }
          }
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

  const stepTitles = [
    'Campaign Details',
    'Message Content',
    'Select Recipients & Parameters',
    'Review & Launch'
  ];

  const filteredContacts = contacts.filter(contact =>
    contact.fullname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.phone?.includes(searchTerm)
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

    // Include recipients that were imported via CSV for this campaign
    count += importedRecipientsCount;

    return count;
  };

  const hasMore = currentPage < totalPages;

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
              {step === 4 && <Zap className="h-6 w-6 text-primary" />}
              <div>
                <CardTitle className="text-2xl">{stepTitles[step - 1]}</CardTitle>
                <CardDescription className="mt-1">
                  {step === 1 && 'Enter the basic information for your campaign'}
                  {step === 2 && 'Choose your message type and content'}
                  {step === 3 && 'Select contacts and fill in template parameters'}
                  {step === 4 && 'Review your campaign settings before launching'}
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

            {/* Step 3: Select Recipients & Parameters */}
            {step === 3 && (
              <div className="space-y-6">
                {campaignType === 'template' && !formData.templateName && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-sm">
                      Select a template in Step 2 before adding recipients. Recipients can only be added once a template is chosen.
                    </AlertDescription>
                  </Alert>
                )}

                {importedRecipientsCount > 0 && (
                  <Alert className="bg-green-50 border-green-200">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-sm text-green-800">
                      {importedRecipientsCount} recipient{importedRecipientsCount === 1 ? '' : 's'} already imported for this campaign. You can proceed or import additional rows.
                    </AlertDescription>
                  </Alert>
                )}

                {/* Selection Mode Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Card
                    className={`cursor-pointer border ${recipientSelectionMode === 'manual' ? 'border-primary shadow-lg' : 'border-border/60'} ${campaignType === 'template' && !formData.templateName ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={() => {
                      if (campaignType === 'template' && !formData.templateName) return;
                      setRecipientSelectionMode('manual');
                    }}
                  >
                    <CardContent className="p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Users className="h-5 w-5 text-primary" />
                          <div className="font-semibold">Manual Selection</div>
                        </div>
                        {recipientSelectionMode === 'manual' && (
                          <Badge variant="secondary">Active</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Pick contacts from your list and fill template parameters per contact.
                      </p>
                    </CardContent>
                  </Card>
                  <Card
                    className={`cursor-pointer border ${recipientSelectionMode === 'csv' ? 'border-primary shadow-lg' : 'border-border/60'} ${campaignType === 'template' && !formData.templateName ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={() => {
                      if (campaignType === 'template' && !formData.templateName) return;
                      setRecipientSelectionMode('csv');
                    }}
                  >
                    <CardContent className="p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Upload className="h-5 w-5 text-primary" />
                          <div className="font-semibold">CSV Import</div>
                        </div>
                        {recipientSelectionMode === 'csv' && (
                          <Badge variant="secondary">Active</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Upload a CSV and map columns to template variables.
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Manual Selection */}
                {recipientSelectionMode === 'manual' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base font-semibold">Select Contacts</Label>
                        <p className="text-sm text-muted-foreground">Choose recipients from your contact list.</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="text-xs">
                          Selected: <span className="font-semibold ml-1 text-foreground">{formData.selectedContacts.length}</span>
                        </Badge>
                        {hasTemplateVariables && (
                          <Badge variant="secondary" className="text-xs bg-primary/10 text-primary">
                            {formData.headerParameters.length + formData.bodyParameters.length + formData.buttonParameters.length} params / contact
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-3">
                      <div className="flex flex-col md:flex-row gap-3">
                        <div className="relative flex-1">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Search contacts by name or phone..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9"
                          />
                        </div>
                        {hasMore && (
                          <Button variant="outline" onClick={loadMoreContacts} disabled={loadingContacts}>
                            {loadingContacts ? 'Loading...' : 'Load More'}
                          </Button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {filteredContacts.map(contact => (
                          <Card
                            key={contact.id}
                            className={`cursor-pointer ${formData.selectedContacts.includes(contact.id) ? 'border-primary shadow-sm' : 'border-border/60'}`}
                            onClick={() => handleContactToggle(contact.id)}
                          >
                            <CardContent className="p-4 space-y-1">
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <div className="font-semibold text-foreground">{contact.fullname || 'Unnamed Contact'}</div>
                                  <div className="text-sm text-muted-foreground">{contact.phone}</div>
                                  {contact.email && (
                                    <div className="text-xs text-muted-foreground">{contact.email}</div>
                                  )}
                                </div>
                                <Checkbox
                                  checked={formData.selectedContacts.includes(contact.id)}
                                  onCheckedChange={() => handleContactToggle(contact.id)}
                                  className="mt-1"
                                />
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>

                      {filteredContacts.length === 0 && (
                        <Alert>
                          <AlertDescription>No contacts match your search.</AlertDescription>
                        </Alert>
                      )}
                    </div>

                    {/* Parameter inputs per selected contact */}
                    {campaignType === 'template' && hasTemplateVariables && formData.selectedContacts.length > 0 && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Label className="text-base font-semibold">Template Parameters</Label>
                          <p className="text-sm text-muted-foreground">
                            Fill required values for each selected recipient.
                          </p>
                        </div>

                        <div className="space-y-3">
                          {formData.selectedContacts.map(contactId => {
                            const contact = contacts.find(c => c.id === contactId);
                            if (!contact) return null;
                            const params = recipientParameters[contactId] || {};
                            return (
                              <Card key={contactId}>
                                <CardHeader className="pb-2">
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <CardTitle className="text-sm">{contact.fullname || 'Unnamed Contact'}</CardTitle>
                                      <CardDescription>{contact.phone}</CardDescription>
                                    </div>
                                    <Badge variant="outline" className="text-xs">
                                      Params required: {formData.headerParameters.length + formData.bodyParameters.length + formData.buttonParameters.length}
                                    </Badge>
                                  </div>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                  {formData.headerParameters.map((param, idx) => (
                                    <div key={`header_${idx}`}>
                                      <Label className="text-sm font-medium">Header {idx + 1}</Label>
                                      <Input
                                        value={params[`header_${idx}`] || ''}
                                        onChange={(e) => handleParameterChange(contactId, `header_${idx}`, e.target.value)}
                                        placeholder={`Enter value for header ${idx + 1}`}
                                      />
                                    </div>
                                  ))}
                                  {formData.bodyParameters.map((param, idx) => (
                                    <div key={`body_${idx}`}>
                                      <Label className="text-sm font-medium">{param.parameter_name || `Body ${idx + 1}`}</Label>
                                      <Input
                                        value={params[`body_${idx}`] || ''}
                                        onChange={(e) => handleParameterChange(contactId, `body_${idx}`, e.target.value)}
                                        placeholder={`Enter value for ${param.parameter_name || `body ${idx + 1}`}`}
                                      />
                                    </div>
                                  ))}
                                  {formData.buttonParameters.map((param, idx) => (
                                    <div key={`button_${idx}`}>
                                      <Label className="text-sm font-medium">Button {idx + 1}</Label>
                                      <Input
                                        value={params[`button_${idx}`] || ''}
                                        onChange={(e) => handleParameterChange(contactId, `button_${idx}`, e.target.value)}
                                        placeholder={`Enter value for button ${idx + 1}`}
                                      />
                                    </div>
                                  ))}
                                </CardContent>
                              </Card>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* CSV Import */}
                {recipientSelectionMode === 'csv' && (
                  <div className="space-y-6">
                    {campaignType === 'template' && hasTemplateVariables && (
                      <Alert className="bg-blue-50 border-blue-200">
                        <AlertDescription className="text-sm text-blue-800">
                          This template requires {formData.headerParameters.length + formData.bodyParameters.length + formData.buttonParameters.length} parameter value{formData.headerParameters.length + formData.bodyParameters.length + formData.buttonParameters.length === 1 ? '' : 's'} per recipient. In your CSV, include columns for phone plus each parameter and map them on the next step.
                        </AlertDescription>
                      </Alert>
                    )}

                    {/* File Upload Section */}
                    <div className="space-y-3">
                      <Label className="text-base font-semibold">Step 1: Upload CSV File</Label>
                      <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept=".csv,.xlsx"
                          onChange={handleFileSelect}
                          className="hidden"
                        />

                        {selectedFile ? (
                          <div className="space-y-4">
                            <div className="flex items-center justify-center gap-3">
                              <FileText className="h-8 w-8 text-primary" />
                              <div className="text-left">
                                <div className="font-medium">{selectedFile.name}</div>
                                <div className="text-sm text-muted-foreground">
                                  {(selectedFile.size / 1024).toFixed(2)} KB
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedFile(null);
                                  setCsvHeaders([]);
                                  setCsvData([]);
                                  setCsvImportStep('upload');
                                  setColumnMappings({});
                                  if (fileInputRef.current) fileInputRef.current.value = '';
                                }}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>

                            {csvHeaders.length > 0 && csvData.length > 0 && (
                              <div className="text-sm text-muted-foreground">
                                {csvData.length} rows loaded • {csvHeaders.length} columns
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
                            <div>
                              <p className="font-medium mb-1">Click to upload or drag and drop</p>
                              <p className="text-sm text-muted-foreground">CSV or Excel files only</p>
                            </div>
                            <Button onClick={() => fileInputRef.current?.click()}>
                              Select File
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Column Mapping UI - Simplified Inline Editing */}
                    {csvImportStep === 'map' && csvHeaders.length > 0 && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Label className="text-base font-semibold">Step 2: Map CSV to Template Variables</Label>
                          {autoMappingResults && (
                            <Badge variant="secondary" className="bg-green-100 text-green-700">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              {Object.keys(autoMappingResults.mappings).length} auto-mapped
                            </Badge>
                          )}
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {/* Left: Mappings - Inline Editable */}
                          <Card>
                            <CardHeader>
                              <CardTitle className="text-sm">Column Mappings</CardTitle>
                              <CardDescription className="text-xs">
                                Match CSV columns to template variables
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-3 max-h-96 overflow-auto">
                                {/* Contact Fields */}
                                <div className="space-y-2">
                                  <h4 className="text-xs font-semibold text-muted-foreground uppercase">Contact Info</h4>
                                  {contactFieldOptions
                                    .filter(f => ['phone', 'fullname', 'email'].includes(f.value))
                                    .map(field => (
                                      <div key={field.value} className="flex items-center gap-2">
                                        <div className="w-32 text-sm font-medium truncate" title={field.label}>
                                          {field.label}
                                          {field.value === 'phone' && <span className="text-red-500 ml-1">*</span>}
                                        </div>
                                        <span className="text-muted-foreground">→</span>
                                        <Select
                                          value={Object.entries(columnMappings).find(([k, v]) => k === field.value)?.[1] || ''}
                                          onValueChange={(csvCol) => {
                                            setColumnMappings(prev => ({
                                              ...prev,
                                              [field.value]: csvCol
                                            }));
                                          }}
                                        >
                                          <SelectTrigger className="flex-1 h-8">
                                            <SelectValue placeholder="Select column..." />
                                          </SelectTrigger>
                                          <SelectContent>
                                            {csvHeaders.map(h => (
                                              <SelectItem key={h} value={h}>{h}</SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>
                                      </div>
                                    ))}
                                </div>

                                {/* Template Parameters */}
                                {campaignType === 'template' && (formData.bodyParameters.length > 0 || formData.headerParameters.length > 0 || formData.buttonParameters.length > 0) && (
                                  <div className="space-y-2 pt-3 border-t">
                                    <h4 className="text-xs font-semibold text-muted-foreground uppercase">Template Variables</h4>

                                    {/* Body params */}
                                    {formData.bodyParameters.map((param, idx) => (
                                      <div key={`body_${idx}`} className="flex items-center gap-2">
                                        <div className="w-32 text-sm font-medium truncate" title={param.parameter_name || `Body ${idx + 1}`}>
                                          {param.parameter_name || `Body ${idx + 1}`}
                                          <span className="text-red-500 ml-1">*</span>
                                        </div>
                                        <span className="text-muted-foreground">→</span>
                                        <Select
                                          value={Object.entries(columnMappings).find(([k]) => k === `body_${idx}`)?.[1] || ''}
                                          onValueChange={(csvCol) => {
                                            setColumnMappings(prev => ({
                                              ...prev,
                                              [`body_${idx}`]: csvCol
                                            }));
                                          }}
                                        >
                                          <SelectTrigger className="flex-1 h-8">
                                            <SelectValue placeholder="Select column..." />
                                          </SelectTrigger>
                                          <SelectContent>
                                            {csvHeaders.map(h => (
                                              <SelectItem key={h} value={h}>{h}</SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>
                                      </div>
                                    ))}

                                    {/* Header params */}
                                    {formData.headerParameters.map((param, idx) => (
                                      <div key={`header_${idx}`} className="flex items-center gap-2">
                                        <div className="w-32 text-sm font-medium truncate">Header {idx + 1}</div>
                                        <span className="text-muted-foreground">→</span>
                                        <Select
                                          value={Object.entries(columnMappings).find(([k]) => k === `header_${idx}`)?.[1] || ''}
                                          onValueChange={(csvCol) => {
                                            setColumnMappings(prev => ({
                                              ...prev,
                                              [`header_${idx}`]: csvCol
                                            }));
                                          }}
                                        >
                                          <SelectTrigger className="flex-1 h-8">
                                            <SelectValue placeholder="Select column..." />
                                          </SelectTrigger>
                                          <SelectContent>
                                            {csvHeaders.map(h => (
                                              <SelectItem key={h} value={h}>{h}</SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>
                                      </div>
                                    ))}

                                    {/* Button params */}
                                    {formData.buttonParameters.map((param, idx) => (
                                      <div key={`button_${idx}`} className="flex items-center gap-2">
                                        <div className="w-32 text-sm font-medium truncate">Button {idx + 1}</div>
                                        <span className="text-muted-foreground">→</span>
                                        <Select
                                          value={Object.entries(columnMappings).find(([k]) => k === `button_${idx}`)?.[1] || ''}
                                          onValueChange={(csvCol) => {
                                            setColumnMappings(prev => ({
                                              ...prev,
                                              [`button_${idx}`]: csvCol
                                            }));
                                          }}
                                        >
                                          <SelectTrigger className="flex-1 h-8">
                                            <SelectValue placeholder="Select column..." />
                                          </SelectTrigger>
                                          <SelectContent>
                                            {csvHeaders.map(h => (
                                              <SelectItem key={h} value={h}>{h}</SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </Card>

                          {/* Right: Live Preview */}
                          <div className="space-y-3">
                            {campaignType === 'template' && formData.templateName && csvData.length > 0 && (
                              <MappingPreviewPanel
                                template={approvedTemplates.find(t => t.name === formData.templateName)}
                                csvData={csvData.slice(0, 3)}
                                mappings={columnMappings}
                                maxPreviews={3}
                              />
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-between pt-4 border-t">
                          <Button
                            variant="outline"
                            onClick={() => {
                              setCsvImportStep('upload');
                              setColumnMappings({});
                              setAutoMappingResults(null);
                            }}
                          >
                            ← Back
                          </Button>
                          <Button
                            onClick={() => {
                              // Validate mappings
                              const requiredFields = getRequiredFields({
                                header: formData.headerParameters.length,
                                body: formData.bodyParameters.length,
                                button: formData.buttonParameters.length,
                              });

                              const validation = validateMappings(
                                columnMappings,
                                csvHeaders,
                                requiredFields
                              );

                              if (!validation.valid) {
                                validation.errors.forEach(err => toast.error(err));
                                return;
                              }

                              if (validation.warnings.length > 0) {
                                validation.warnings.forEach(warn => toast.warning(warn));
                              }

                              setCsvImportStep('verify');
                            }}
                            disabled={!columnMappings['phone']}
                            size="lg"
                          >
                            Continue to Import →
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* CSV Preview Table */}
                    {csvImportStep === 'verify' && csvData.length > 0 && csvHeaders.length > 0 && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label className="text-base font-semibold">Step 3: Review & Edit CSV Data</Label>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleAddCsvRow}
                          >
                            <X className="h-4 w-4 mr-2 rotate-45" />
                            Add Row
                          </Button>
                        </div>
                        <Card>
                          <CardContent className="p-0">
                            <div className="max-h-96 overflow-auto">
                              <Table>
                                <TableHeader className="sticky top-0 bg-muted z-10">
                                  <TableRow>
                                    <TableHead className="w-12 text-center">Actions</TableHead>
                                    {csvHeaders.map((header, idx) => (
                                      <TableHead key={idx} className="min-w-[150px]">
                                        {header}
                                      </TableHead>
                                    ))}
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {csvData.map((row, rowIndex) => (
                                    <TableRow key={rowIndex}>
                                      <TableCell className="text-center">
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => handleDeleteCsvRow(rowIndex)}
                                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                        >
                                          <X className="h-4 w-4" />
                                        </Button>
                                      </TableCell>
                                      {csvHeaders.map((header, colIndex) => (
                                        <TableCell key={colIndex}>
                                          <Input
                                            value={row[header] || ''}
                                            onChange={(e) =>
                                              handleCsvDataChange(rowIndex, header, e.target.value)
                                            }
                                            className="h-8 text-sm"
                                            placeholder={`Enter ${header}`}
                                          />
                                        </TableCell>
                                      ))}
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          </CardContent>
                        </Card>
                        <p className="text-xs text-muted-foreground">
                          You can edit values, delete rows by clicking the X button, or add new rows. Changes will be applied when you import.
                        </p>
                      </div>
                    )}

                    {/* Options */}
                    {csvImportStep === 'verify' && (
                      <div className="space-y-3">
                        <Label className="text-base font-semibold">Step 4: Import Options</Label>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="create-if-not-exists"
                            checked={createIfNotExists}
                            onCheckedChange={(checked) => setCreateIfNotExists(!!checked)}
                          />
                          <Label htmlFor="create-if-not-exists" className="cursor-pointer font-normal">
                            Create new contacts if they don&apos;t exist
                          </Label>
                        </div>
                        <p className="text-xs text-muted-foreground ml-6">
                          If enabled, contacts not found in the system will be automatically created using the CSV data.
                        </p>
                      </div>
                    )}

                    {/* Info Alert */}
                    {csvImportStep === 'upload' && (
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription className="text-sm">
                          The CSV should include columns for phone numbers (required), names, emails, template parameters,
                          and any custom fields. You&apos;ll map the columns to fields in the next step.
                        </AlertDescription>
                      </Alert>
                    )}

                    {/* Import Button */}
                    {csvImportStep === 'verify' && (
                      <div className="flex items-center justify-between pt-4">
                        <Button
                          variant="outline"
                          onClick={() => setCsvImportStep('map')}
                        >
                          Back to Mapping
                        </Button>
                        <Button
                          onClick={handleImportCSV}
                          disabled={!selectedFile || uploading || !createdWhatsAppCampaignId}
                        >
                          {uploading ? (
                            <>
                              <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                              Importing...
                            </>
                          ) : (
                            <>
                              <Upload className="h-4 w-4 mr-2" />
                              Import Recipients
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Step 4: Review */}
            {step === 4 && (
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

                              {hasTemplateVariables && (formData.selectedContacts.length > 0 || importedRecipientsCount > 0) && (
                                <>
                                  <div className="border-t border-border/30"></div>
                                  <div className="space-y-2">
                                    <div className="text-sm font-medium text-muted-foreground">Template Parameters:</div>
                                    <div className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-950/30 rounded border border-green-200 dark:border-green-900">
                                      <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                                      <span className="text-sm text-green-800 dark:text-green-200">
                                        {formData.bodyParameters.length + formData.headerParameters.length + formData.buttonParameters.length} parameter(s) configured for {formData.selectedContacts.length + importedRecipientsCount} recipient(s)
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
                          {importedRecipientsCount > 0 && (
                            <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded">
                              <div className="flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                                <div>
                                  <div className="text-sm font-semibold text-green-800">{importedRecipientsCount} recipient{importedRecipientsCount === 1 ? '' : 's'} imported via CSV</div>
                                  <div className="text-xs text-green-700">Already attached to this campaign</div>
                                </div>
                              </div>
                              <Badge variant="outline" className="text-xs border-green-300 bg-white text-green-800">
                                CSV Import
                              </Badge>
                            </div>
                          )}

                          {formData.selectedContacts.length > 0 && (
                            <div>
                              <div className="text-sm font-semibold text-muted-foreground mb-3">Selected Contacts:</div>
                              <div className="max-h-40 overflow-y-auto space-y-2">
                                {formData.selectedContacts.slice(0, 5).map(contactId => {
                                  const contact = contacts.find(c => c.id === contactId);
                                  return contact ? (
                                    <div key={contactId} className="text-sm p-2 bg-background rounded border border-border/50">
                                      <div className="font-medium text-foreground">{contact.fullname}</div>
                                      <div className="text-muted-foreground text-xs">{contact.phone}</div>
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

        {/* Import Mapping Dialog */}
        <ImportMappingDialog
          open={showMappingDialog}
          onOpenChange={setShowMappingDialog}
          organizationId={organizationId || ''}
          channel={formData.channel}
          csvHeaders={csvHeaders}
          templateId={formData.templateName ? approvedTemplates.find(t => t.name === formData.templateName)?.id : undefined}
          templateParameters={campaignType === 'template' && formData.templateName ? {
            header: formData.headerParameters.map((_, idx) => ({ index: idx })),
            body: formData.bodyParameters.map((p, idx) => ({
              index: idx,
              name: p.parameter_name,
            })),
            button: formData.buttonParameters.map((p, idx) => ({
              index: idx,
              subType: p.sub_type,
            })),
          } : undefined}
          onMappingCreated={handleMappingCreated}
        />
      </div>
    </div>
  );
}
