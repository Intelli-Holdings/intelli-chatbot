"use client";

import React, { useState } from 'react';
import { Plus, Eye, Play, Pause, Trash2, BarChart3, MessageSquare, Clock, Search, Filter, Pencil, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

import { useCampaigns } from '@/hooks/use-campaigns';
import { useAppServices } from '@/hooks/use-app-services';
import useActiveOrganizationId from '@/hooks/use-organization-id';
import { CampaignService, type Campaign } from '@/services/campaign';
import CampaignCreationFormV2 from '@/components/campaign-creation-form-v2';
import CampaignEditForm from '@/components/campaign-edit-form';
import CampaignDetailsModal from '@/components/campaign-details-modal';
import { CampaignScheduleDisplay } from '@/components/schedule-input-timezone';

export default function CampaignsPage() {
  const organizationId = useActiveOrganizationId();
  const { appServices, selectedAppService } = useAppServices();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [channelFilter, setChannelFilter] = useState<string>('all');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [showCampaignDetails, setShowCampaignDetails] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [campaignToDelete, setCampaignToDelete] = useState<Campaign | null>(null);

  const { campaigns, loading, error, refetch } = useCampaigns(organizationId || undefined, {
    status: statusFilter !== 'all' ? statusFilter : undefined,
    channel: channelFilter !== 'all' ? channelFilter : undefined,
  });

  const handleViewCampaign = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setShowCampaignDetails(true);
  };

  const handleEditCampaign = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setShowEditForm(true);
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

  const handleDeleteClick = (campaign: Campaign) => {
    setCampaignToDelete(campaign);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (!organizationId || !campaignToDelete) return;

    try {
      await CampaignService.deleteCampaign(campaignToDelete.id, organizationId);
      toast.success('Campaign deleted successfully');
      setShowDeleteDialog(false);
      setCampaignToDelete(null);
      refetch();
    } catch (error) {
      toast.error('Failed to delete campaign');
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

  const getChannelColor = (channel: string) => {
    switch (channel) {
      case 'whatsapp': return 'bg-green-100 text-green-800';
      case 'sms': return 'bg-blue-100 text-blue-800';
      case 'email': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredCampaigns = campaigns.filter((campaign: Campaign) => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         campaign.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const statsCards = [
    {
      title: 'Total Campaigns',
      value: campaigns.length,
      icon: MessageSquare,
      color: 'text-blue-600'
    },
    {
      title: 'Active Campaigns',
      value: campaigns.filter((c: Campaign) => c.status === 'active').length,
      icon: Play,
      color: 'text-green-600'
    },
    {
      title: 'Scheduled',
      value: campaigns.filter((c: Campaign) => c.status === 'scheduled').length,
      icon: Clock,
      color: 'text-orange-600'
    },
    {
      title: 'Completed',
      value: campaigns.filter((c: Campaign) => c.status === 'completed').length,
      icon: BarChart3,
      color: 'text-purple-600'
    }
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 container py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Campaign Manager</h1>
          <p className="text-muted-foreground">
            Create and manage your multi-channel broadcast campaigns
          </p>
        </div>

        {!organizationId && (
          <Alert className="mb-6">
            <AlertDescription>
              Please ensure you&apos;re logged in and have an active organization.
            </AlertDescription>
          </Alert>
        )}

        {!selectedAppService && (
          <Alert className="mb-6">
            <AlertDescription>
              Please configure your App Service first to manage campaigns.
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

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>All Campaigns</CardTitle>
                <CardDescription>
                  View and manage all your campaigns across channels
                </CardDescription>
              </div>
              <Button
                onClick={() => setShowCreateForm(true)}
                className="bg-[#0070f3] hover:bg-[#007fff]"
                disabled={!selectedAppService || !organizationId}
              >
                <Plus className="h-4 w-4 mr-2" />
                New Campaign
              </Button>
            </div>
          </CardHeader>

          <CardContent>
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 items-center mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search campaigns..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={channelFilter} onValueChange={setChannelFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Channels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Channels</SelectItem>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  <SelectItem value="sms">SMS</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Statuses" />
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
            {loading ? (
              <div className="text-center py-8">Loading campaigns...</div>
            ) : error ? (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : filteredCampaigns.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No campaigns found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm || statusFilter !== 'all' || channelFilter !== 'all'
                    ? 'Try adjusting your filters'
                    : 'Create your first campaign to get started'
                  }
                </p>
                {!searchTerm && statusFilter === 'all' && channelFilter === 'all' && (
                  <Button
                    onClick={() => setShowCreateForm(true)}
                    disabled={!selectedAppService || !organizationId}
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
                    <TableHead>Channel</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
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
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getChannelColor(campaign.channel)}>
                          {campaign.channel.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(campaign.status || 'draft')}>
                          {campaign.status ? campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1) : 'Draft'}
                        </Badge>
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
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewCampaign(campaign)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>

                            <DropdownMenuItem onClick={() => handleEditCampaign(campaign)}>
                              <Pencil className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>

                            {campaign.status === 'active' && (
                              <DropdownMenuItem onClick={() => handlePauseCampaign(campaign.id)}>
                                <Pause className="h-4 w-4 mr-2" />
                                Pause
                              </DropdownMenuItem>
                            )}

                            {campaign.status === 'paused' && (
                              <DropdownMenuItem onClick={() => handleResumeCampaign(campaign.id)}>
                                <Play className="h-4 w-4 mr-2" />
                                Resume
                              </DropdownMenuItem>
                            )}

                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDeleteClick(campaign)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Campaign Creation Dialog */}
        <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Campaign</DialogTitle>
            </DialogHeader>
            <CampaignCreationFormV2
              appService={selectedAppService}
              onSuccess={() => {
                setShowCreateForm(false);
                refetch();
              }}
            />
          </DialogContent>
        </Dialog>

        {/* Campaign Edit Dialog */}
        <Dialog open={showEditForm} onOpenChange={setShowEditForm}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Campaign</DialogTitle>
            </DialogHeader>
            {selectedCampaign && (
              <CampaignEditForm
                campaign={selectedCampaign}
                onSuccess={() => {
                  setShowEditForm(false);
                  setSelectedCampaign(null);
                  refetch();
                }}
                onCancel={() => {
                  setShowEditForm(false);
                  setSelectedCampaign(null);
                }}
              />
            )}
          </DialogContent>
        </Dialog>

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

        {/* Delete Confirmation Dialog */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Delete Campaign</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="text-sm text-muted-foreground mb-4">
                Are you sure you want to delete this campaign?
              </p>
              {campaignToDelete && (
                <div className="bg-muted p-3 rounded-md">
                  <p className="font-medium">{campaignToDelete.name}</p>
                  <p className="text-sm text-muted-foreground">{campaignToDelete.description}</p>
                  <div className="flex gap-2 mt-2">
                    <Badge className={getChannelColor(campaignToDelete.channel)}>
                      {campaignToDelete.channel.toUpperCase()}
                    </Badge>
                    <Badge className={getStatusColor(campaignToDelete.status || 'draft')}>
                      {campaignToDelete.status ? campaignToDelete.status.charAt(0).toUpperCase() + campaignToDelete.status.slice(1) : 'Draft'}
                    </Badge>
                  </div>
                </div>
              )}
              <p className="text-sm text-muted-foreground mt-4">
                This action cannot be undone.
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowDeleteDialog(false);
                  setCampaignToDelete(null);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleConfirmDelete}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Campaign
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
