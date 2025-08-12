"use client";

import React, { useState, useEffect } from 'react';
import { Upload, Plus, Eye, Calendar, Users, MessageSquare, Clock, Play, Pause, BarChart3, Download, Filter, Search } from 'lucide-react';
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
import CampaignCreationForm from '@/components/campaign-creation-form';
import TemplateSelector from '@/components/template-selector';
import CampaignDetailsModal from '@/components/campaign-details-modal';
import { useAppServices } from '@/hooks/use-app-services';
import { useWhatsAppTemplates } from '@/hooks/use-whatsapp-templates';
import { useCampaigns } from '@/hooks/use-campaigns';
import { CampaignService } from '@/services/campaign';

interface Campaign {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'scheduled' | 'active' | 'paused' | 'completed' | 'failed';
  template?: {
    id: string;
    name: string;
  };
  audience: {
    total: number;
    uploaded: number;
    segments: string[];
  };
  schedule: {
    startDate: string;
    timezone: string;
    immediate: boolean;
  };
  stats: {
    sent: number;
    delivered: number;
    failed: number;
    read: number;
    replied: number;
    progress: number;
  };
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export default function BroadcastCampaignPage() {
  const [activeTab, setActiveTab] = useState('campaigns');
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
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

  const { campaigns, loading, error, refetch } = useCampaigns(selectedAppService?.id ? String(selectedAppService.id) : undefined);

  // Real-time stats polling for active campaigns
  useEffect(() => {
    if (!selectedAppService) return;

    const activeCampaigns = campaigns.filter((c: Campaign) => c.status === 'active');
    if (activeCampaigns.length === 0) return;

    const pollInterval = setInterval(() => {
      // Poll for stats updates every 30 seconds
      refetch();
    }, 30000);

    return () => clearInterval(pollInterval);
  }, [campaigns, selectedAppService, refetch]);

  const handleViewCampaign = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setShowCampaignDetails(true);
  };

  const handlePauseCampaign = async (campaignId: string) => {
    try {
      await CampaignService.pauseCampaign(campaignId);
      toast.success('Campaign paused successfully');
      refetch();
    } catch (error) {
      toast.error('Failed to pause campaign');
    }
  };

  const handleResumeCampaign = async (campaignId: string) => {
    try {
      await CampaignService.resumeCampaign(campaignId);
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

  const filteredCampaigns = campaigns.filter((campaign: Campaign) => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         campaign.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || campaign.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statsCards = [
    {
      title: 'Active Campaigns',
      value: campaigns.filter((c: Campaign) => c.status === 'active').length,
      icon: Play,
      color: 'text-green-600'
    },
    {
      title: 'Total Messages Sent',
      value: campaigns.reduce((sum: number, c: Campaign) => sum + c.stats.sent, 0).toLocaleString(),
      icon: MessageSquare,
      color: 'text-blue-600'
    },
    {
      title: 'Delivery Rate',
      value: `${Math.round((campaigns.reduce((sum: number, c: Campaign) => sum + c.stats.delivered, 0) / Math.max(campaigns.reduce((sum: number, c: Campaign) => sum + c.stats.sent, 0), 1)) * 100)}%`,
      icon: BarChart3,
      color: 'text-purple-600'
    },
    {
      title: 'Scheduled Campaigns',
      value: campaigns.filter((c: Campaign) => c.status === 'scheduled').length,
      icon: Clock,
      color: 'text-orange-600'
    }
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader />
      
      <main className="flex-1 container py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Broadcast Campaign Manager</h1>
          <p className="text-muted-foreground">
            Create, manage, and monitor your WhatsApp broadcast campaigns using Meta templates
          </p>
        </div>

        {!selectedAppService && (
          <Alert className="mb-6">
            <AlertDescription>
              Please configure your WhatsApp App Service first to manage broadcast campaigns.
            </AlertDescription>
          </Alert>
        )}

        {templatesError && (
          <Alert className="mb-6" variant="destructive">
            <AlertDescription>
              Error loading templates: {templatesError}
            </AlertDescription>
          </Alert>
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {statsCards.map((stat) => {
            const IconComponent = stat.icon;
            return (
              <Card key={stat.title}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                      <p className="text-2xl font-bold">{stat.value}</p>
                    </div>
                    <IconComponent className={`h-8 w-8 ${stat.color}`} />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex items-center justify-between mb-4">
            <TabsList className="grid w-auto grid-cols-4">
              <TabsTrigger value="campaigns">Active Campaigns</TabsTrigger>
              <TabsTrigger value="create">Create Campaign</TabsTrigger>
              <TabsTrigger value="contacts">Manage Contacts</TabsTrigger>
              <TabsTrigger value="templates">Templates</TabsTrigger>
            </TabsList>

            {activeTab === 'campaigns' && (
              <Button 
                onClick={() => setShowCreateForm(true)}
                className="bg-green-600 hover:bg-green-700"
                disabled={!selectedAppService}
              >
                <Plus className="h-4 w-4 mr-2" />
                New Campaign
              </Button>
            )}
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
                    {!searchTerm && statusFilter === 'all' && (
                      <Button 
                        onClick={() => setShowCreateForm(true)}
                        disabled={!selectedAppService}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Create Campaign
                      </Button>
                    )}
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Campaign</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Audience</TableHead>
                        <TableHead>Progress</TableHead>
                        <TableHead>Delivery Stats</TableHead>
                        <TableHead>Schedule</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCampaigns.map((campaign: Campaign) => (
                        <TableRow key={campaign.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{campaign.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {campaign.description}
                              </div>
                              {campaign.template && (
                                <div className="text-xs text-blue-600 mt-1">
                                  Template: {campaign.template.name}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(campaign.status)}>
                              {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Users className="h-4 w-4 text-muted-foreground" />
                              <span>{campaign.audience.total.toLocaleString()}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {campaign.status === 'active' && (
                              <div className="space-y-1">
                                <Progress value={campaign.stats.progress} className="w-[80px]" />
                                <div className="text-xs text-muted-foreground">
                                  {campaign.stats.progress}%
                                </div>
                              </div>
                            )}
                            {campaign.status === 'completed' && (
                              <Badge variant="outline" className="text-green-600">
                                100% Complete
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="text-sm space-y-1">
                              <div>
                                <span className="text-green-600">{campaign.stats.delivered}</span>
                                <span className="text-muted-foreground"> delivered</span>
                              </div>
                              <div>
                                <span className="text-red-600">{campaign.stats.failed}</span>
                                <span className="text-muted-foreground"> failed</span>
                              </div>
                              {campaign.stats.read > 0 && (
                                <div>
                                  <span className="text-blue-600">{campaign.stats.read}</span>
                                  <span className="text-muted-foreground"> read</span>
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {campaign.schedule.immediate ? (
                                <span className="text-muted-foreground">Immediate</span>
                              ) : (
                                <div>
                                  <div>{new Date(campaign.schedule.startDate).toLocaleDateString()}</div>
                                  <div className="text-muted-foreground">
                                    {new Date(campaign.schedule.startDate).toLocaleTimeString()}
                                  </div>
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewCampaign(campaign)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              {campaign.status === 'active' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handlePauseCampaign(campaign.id)}
                                >
                                  <Pause className="h-4 w-4" />
                                </Button>
                              )}
                              {campaign.status === 'paused' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleResumeCampaign(campaign.id)}
                                >
                                  <Play className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
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
            <CampaignCreationForm 
              appService={selectedAppService}
              onSuccess={() => {
                setActiveTab('campaigns');
                refetch();
                toast.success('Campaign created successfully');
              }}
            />
          </TabsContent>

          <TabsContent value="contacts">
            <BulkContactUpload 
              appService={selectedAppService}
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
