"use client";

import React, { useState, useEffect } from 'react';
import { X, Play, Pause, BarChart3, Users, MessageSquare, Clock, Calendar, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { CampaignService, type Campaign } from '@/services/campaign';
import useActiveOrganizationId from '@/hooks/use-organization-id';
import { useCampaignRecipients } from '@/hooks/use-campaign-recipients';

interface CampaignDetailsModalProps {
  campaign: Campaign;
  open: boolean;
  onClose: () => void;
  onRefresh: () => void;
}

export default function CampaignDetailsModal({ campaign, open, onClose, onRefresh }: CampaignDetailsModalProps) {
  const organizationId = useActiveOrganizationId();
  const [recipientStatusFilter, setRecipientStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(campaign.stats || {
    sent: 0,
    delivered: 0,
    failed: 0,
    read: 0,
    replied: 0,
    progress: 0
  });

  // Fetch recipients if campaign is WhatsApp
  const {
    recipients,
    loading: recipientsLoading,
    error: recipientsError,
    refetch: refetchRecipients,
  } = useCampaignRecipients(
    campaign.channel === 'whatsapp' ? campaign.whatsapp_campaign_id : undefined,
    organizationId || undefined,
    recipientStatusFilter !== 'all' ? recipientStatusFilter : undefined
  );

  // Refresh stats for active campaigns
  useEffect(() => {
    if (!open || campaign.status !== 'active' || !organizationId) return;

    const refreshStats = async () => {
      try {
        const updatedStats = await CampaignService.getCampaignStats(campaign.id, organizationId!);
        setStats(updatedStats);
      } catch (error) {
        // Error refreshing stats
      }
    };

    // Refresh immediately and then every 30 seconds
    refreshStats();
    const interval = setInterval(refreshStats, 30000);

    return () => clearInterval(interval);
  }, [campaign.id, campaign.status, open, organizationId]);

  const handlePause = async () => {
    if (!organizationId) return;
    setLoading(true);
    try {
      await CampaignService.pauseCampaign(campaign.id, organizationId);
      toast.success('Campaign paused successfully');
      onRefresh();
      onClose();
    } catch (error) {
      toast.error('Failed to pause campaign');
    } finally {
      setLoading(false);
    }
  };

  const handleResume = async () => {
    if (!organizationId) return;
    setLoading(true);
    try {
      await CampaignService.resumeCampaign(campaign.id, organizationId);
      toast.success('Campaign resumed successfully');
      onRefresh();
      onClose();
    } catch (error) {
      toast.error('Failed to resume campaign');
    } finally {
      setLoading(false);
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

  const calculateDeliveryRate = () => {
    if (stats.sent === 0) return 0;
    return Math.round((stats.delivered / stats.sent) * 100);
  };

  const calculateReadRate = () => {
    if (stats.delivered === 0) return 0;
    return Math.round((stats.read / stats.delivered) * 100);
  };

  const calculateReplyRate = () => {
    if (stats.delivered === 0) return 0;
    return Math.round((stats.replied / stats.delivered) * 100);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-xl">{campaign.name}</DialogTitle>
              <p className="text-muted-foreground mt-1">{campaign.description}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge className={getStatusColor(campaign.status || 'draft')}>
                  {campaign.status ? campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1) : 'Draft'}
                </Badge>
                {campaign.template && (
                  <Badge variant="outline">Template: {campaign.template.name}</Badge>
                )}
                {campaign.payload?.template_name && (
                  <Badge variant="outline">Template: {campaign.payload.template_name}</Badge>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {campaign.status === 'active' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePause}
                  disabled={loading}
                >
                  <Pause className="h-4 w-4 mr-1" />
                  Pause
                </Button>
              )}
              {campaign.status === 'paused' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleResume}
                  disabled={loading}
                >
                  <Play className="h-4 w-4 mr-1" />
                  Resume
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="stats">Statistics</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {/* Progress */}
            {(campaign.status === 'active' || campaign.status === 'completed') && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Campaign Progress
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Overall Progress</span>
                        <span>{stats.progress}%</span>
                      </div>
                      <Progress value={stats.progress} className="h-2" />
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-blue-600">{stats.sent}</div>
                        <div className="text-sm text-muted-foreground">Sent</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-green-600">{stats.delivered}</div>
                        <div className="text-sm text-muted-foreground">Delivered</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-purple-600">{stats.read}</div>
                        <div className="text-sm text-muted-foreground">Read</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
                        <div className="text-sm text-muted-foreground">Failed</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Campaign Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Audience
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {campaign.audience ? (
                      <>
                        <div className="flex justify-between">
                          <span>Total Contacts:</span>
                          <span className="font-medium">{campaign.audience.total?.toLocaleString() || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Lists:</span>
                          <span className="font-medium">{campaign.audience.segments?.length || 0}</span>
                        </div>
                        {campaign.audience.segments && campaign.audience.segments.length > 0 && (
                          <div className="mt-2">
                            <div className="text-sm text-muted-foreground mb-1">Targeted Lists:</div>
                            <div className="space-y-1">
                              {campaign.audience.segments.map((segment, index) => (
                                <Badge key={index} variant="outline" className="mr-1">
                                  {segment}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-sm text-muted-foreground">Audience information not available</div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Schedule
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {campaign.scheduled_at ? (
                      <>
                        <div className="flex justify-between">
                          <span>Type:</span>
                          <span className="font-medium">Scheduled</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Start Date:</span>
                          <span className="font-medium">
                            {new Date(campaign.scheduled_at).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Start Time:</span>
                          <span className="font-medium">
                            {new Date(campaign.scheduled_at).toLocaleTimeString()}
                          </span>
                        </div>
                      </>
                    ) : (
                      <div className="flex justify-between">
                        <span>Type:</span>
                        <span className="font-medium">Immediate</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Created:</span>
                      <span className="font-medium">
                        {campaign.created_at
                          ? new Date(campaign.created_at).toLocaleDateString()
                          : '-'
                        }
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="stats" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-center">Delivery Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600 mb-2">
                      {calculateDeliveryRate()}%
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {stats.delivered} of {stats.sent} delivered
                    </div>
                    <Progress value={calculateDeliveryRate()} className="mt-2" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-center">Read Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">
                      {calculateReadRate()}%
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {stats.read} of {stats.delivered} read
                    </div>
                    <Progress value={calculateReadRate()} className="mt-2" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-center">Reply Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600 mb-2">
                      {calculateReplyRate()}%
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {stats.replied} replies received
                    </div>
                    <Progress value={calculateReplyRate()} className="mt-2" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Real-time Stats Chart Placeholder */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Over Time</CardTitle>
                <CardDescription>
                  {campaign.status === 'active' && 'Stats update every 30 seconds'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                  <div className="text-center text-muted-foreground">
                    <BarChart3 className="h-12 w-12 mx-auto mb-2" />
                    <p>Performance chart would be displayed here</p>
                    <p className="text-sm">Integration with charting library needed</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="messages" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Message Details</CardTitle>
                    <CardDescription>
                      Individual message delivery status and timestamps
                    </CardDescription>
                  </div>
                  {campaign.channel === 'whatsapp' && (
                    <Select value={recipientStatusFilter} onValueChange={setRecipientStatusFilter}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Recipients</SelectItem>
                        <SelectItem value="sent">Sent</SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                        <SelectItem value="read">Read</SelectItem>
                        <SelectItem value="failed">Failed</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {campaign.channel === 'whatsapp' ? (
                  <>
                    {recipientsLoading ? (
                      <div className="text-center py-8">Loading recipients...</div>
                    ) : recipientsError ? (
                      <div className="text-center py-8 text-red-600">{recipientsError}</div>
                    ) : recipients.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        No recipients found
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Contact ID</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Sent At</TableHead>
                            <TableHead>Delivered At</TableHead>
                            <TableHead>Read At</TableHead>
                            <TableHead>Notes</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {recipients.map((recipient) => (
                            <TableRow key={recipient.id}>
                              <TableCell className="font-mono">{recipient.contact_id}</TableCell>
                              <TableCell>
                                <Badge
                                  className={
                                    recipient.status === 'delivered' ? 'bg-green-100 text-green-800' :
                                    recipient.status === 'read' ? 'bg-blue-100 text-blue-800' :
                                    recipient.status === 'sent' ? 'bg-blue-100 text-blue-800' :
                                    recipient.status === 'failed' ? 'bg-red-100 text-red-800' :
                                    'bg-gray-100 text-gray-800'
                                  }
                                >
                                  {recipient.status}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {recipient.sent_at ? new Date(recipient.sent_at).toLocaleString() : '-'}
                              </TableCell>
                              <TableCell>
                                {recipient.delivered_at ? new Date(recipient.delivered_at).toLocaleString() : '-'}
                              </TableCell>
                              <TableCell>
                                {recipient.read_at ? new Date(recipient.read_at).toLocaleString() : '-'}
                              </TableCell>
                              <TableCell>
                                {recipient.error_message && (
                                  <span className="text-red-600 text-sm">{recipient.error_message}</span>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    Recipient details are only available for WhatsApp campaigns
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Campaign Settings</CardTitle>
                <CardDescription>
                  Configuration and metadata for this campaign
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">Basic Information</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Campaign ID:</span>
                          <span className="font-mono">{campaign.id}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Organization:</span>
                          <span className="font-mono text-xs">{campaign.organization}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Created At:</span>
                          <span>{campaign.created_at ? new Date(campaign.created_at).toLocaleString() : '-'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Last Updated:</span>
                          <span>{campaign.updated_at ? new Date(campaign.updated_at).toLocaleString() : '-'}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Template Information</h4>
                      {campaign.payload?.template_name ? (
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Template Name:</span>
                            <span>{campaign.payload.template_name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Language:</span>
                            <span>{campaign.payload.template_language || 'en'}</span>
                          </div>
                        </div>
                      ) : campaign.payload?.message_content ? (
                        <div className="space-y-2 text-sm">
                          <div>
                            <span>Simple Text Message:</span>
                            <div className="mt-1 p-2 bg-gray-50 rounded text-sm">
                              {campaign.payload.message_content}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">No message content available</p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
