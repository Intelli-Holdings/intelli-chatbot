"use client";

import React, { useState, useEffect } from 'react';
import { Upload, Plus, Eye, Calendar, Users, MessageSquare, Clock, Play, Pause, BarChart3, Download, Filter, Search, CheckCheck, User, ImageIcon, PlayCircle, FileText, ExternalLink, Phone  } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';

import DashboardHeader from '@/components/dashboard-header';
import BulkContactUpload from '@/components/bulk-contact-upload';
import CampaignCreationFormV2 from '@/components/campaign-creation-form-v2';
import TemplateSelector from '@/components/template-selector';
import CampaignDetailsModal from '@/components/campaign-details-modal';
import { CampaignScheduleDisplay } from '@/components/schedule-input-timezone';
import { useAppServices } from '@/hooks/use-app-services';
import { useWhatsAppTemplates } from '@/hooks/use-whatsapp-templates';
import { useWhatsAppCampaigns } from '@/hooks/use-campaigns';
import { CampaignService } from '@/services/campaign';
import useActiveOrganizationId from '@/hooks/use-organization-id';

export default function BroadcastCampaignPage() {
  const organizationId = useActiveOrganizationId();
  const [activeTab, setActiveTab] = useState('campaigns');
  const [selectedCampaign, setSelectedCampaign] = useState<any>(null);
  const [showCampaignDetails, setShowCampaignDetails] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showCreateForm, setShowCreateForm] = useState(false);

  const { appServices, selectedAppService } = useAppServices();

  // Fetch templates from Meta using the existing hook
  const {
    templates,
    loading: templatesLoading,
    error: templatesError,
  } = useWhatsAppTemplates(selectedAppService);

  const { campaigns, loading, error, refetch } = useWhatsAppCampaigns(organizationId || undefined, {
    status: statusFilter !== 'all' ? statusFilter : undefined,
  });

  // Real-time stats polling for active campaigns
  useEffect(() => {
    if (!selectedAppService) return;

    const activeCampaigns = campaigns.filter((c: any) => c.status === 'active');
    if (activeCampaigns.length === 0) return;

    const pollInterval = setInterval(() => {
      // Poll for stats updates every 30 seconds
      refetch();
    }, 30000);

    return () => clearInterval(pollInterval);
  }, [campaigns, selectedAppService, refetch]);

  const handleViewCampaign = (campaign: any) => {
    setSelectedCampaign(campaign);
    setShowCampaignDetails(true);
  };

  const handlePauseCampaign = async (campaignId: string) => {
    if (!organizationId) return;
    try {
      await CampaignService.pauseCampaign(campaignId, organizationId);
      toast.success('Campaign paused successfully');
      refetch();
    } catch (error) {
      toast.error('Failed to pause campaign');
    }
  };

  const handleResumeCampaign = async (campaignId: string) => {
    if (!organizationId) return;
    try {
      await CampaignService.resumeCampaign(campaignId, organizationId);
      toast.success('Campaign resumed successfully');
      refetch();
    } catch (error) {
      toast.error('Failed to resume campaign');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'scheduled': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'paused': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'completed': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'failed': return 'bg-red-100 text-red-800 border-red-200';
      case 'draft': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filteredCampaigns = campaigns.filter((campaign: any) => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         campaign.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || campaign.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex min-h-screen flex-col">      
      <main className="flex-1 container py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Broadcast Campaign Manager</h1>
          <p className="text-muted-foreground">
            Create, manage, and monitor your WhatsApp broadcast campaigns using Meta templates
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex items-center justify-between mb-4">
            <TabsList className="grid w-auto grid-cols-3">
              <TabsTrigger value="campaigns">Active Campaigns</TabsTrigger>
              <TabsTrigger value="create">Create Campaign</TabsTrigger>
              <TabsTrigger value="templates">Templates</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="campaigns" className="space-y-4">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search campaigns..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Campaign Table */}
            <Card>
              <CardHeader>
                <CardTitle>Campaign Overview</CardTitle>
                <CardDescription>
                  Monitor and manage your broadcast campaigns
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">Loading campaigns...</div>
                ) : filteredCampaigns.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No campaigns found</h3>
                    <p className="text-muted-foreground mb-4">
                      {searchTerm || statusFilter !== 'all' 
                        ? 'Try adjusting your filters' 
                        : 'Create your first broadcast campaign to get started'
                      }
                    </p>                   
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Campaign</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Schedule</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCampaigns.map((campaign: any) => (
                        <TableRow key={campaign.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{campaign.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {campaign.description}
                              </div>
                              {campaign.payload?.template_name && (
                                <div className="text-xs text-blue-600 mt-1">
                                  Template: {campaign.payload.template_name}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {campaign.created_at ? new Date(campaign.created_at).toLocaleDateString() : '-'}
                            </div>
                          </TableCell>
                          <TableCell>
                            <CampaignScheduleDisplay
                              scheduledAt={campaign.scheduled_at}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="create">
            <CampaignCreationFormV2
              appService={selectedAppService}
              onSuccess={() => {
                setActiveTab('campaigns');
                refetch();
                toast.success('Campaign created successfully');
              }}
            />
          </TabsContent>

          <TabsContent value="templates">
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Available Templates</CardTitle>
                  <CardDescription>
                    Templates fetched from your Meta Business account for broadcast campaigns
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {templatesLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                      Loading templates from Meta...
                    </div>
                  ) : templates.length === 0 ? (
                    <div className="text-center py-8">
                      <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No templates found</h3>
                      <p className="text-muted-foreground">
                        Create templates in your Meta Business Manager to use them for broadcasts
                      </p>
                    </div>
                  ) : (
                    <TemplateSelector 
                      appService={selectedAppService}
                      mode="browse"
                    />
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Campaign Details Modal */}
        {selectedCampaign && (
          <CampaignDetailsModal
            campaign={selectedCampaign}
            open={showCampaignDetails}
            onClose={() => {
              setShowCampaignDetails(false);
              setSelectedCampaign(null);
            }}
            onRefresh={refetch}
          />
        )}
      </main>
    </div>
  );
}
