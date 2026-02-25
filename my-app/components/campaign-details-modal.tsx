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
import { logger } from "@/lib/logger";
import { useCampaignRecipients } from '@/hooks/use-campaign-recipients';
import { formatUTCForDisplay } from '@/lib/timezone-utils';

interface CampaignDetailsModalProps {
  campaign: Campaign;
  open: boolean;
  onClose: () => void;
  onRefresh: () => void;
}

interface CampaignStats {
  total: number;
  sent: number;
  delivered: number;
  failed: number;
  read: number;
  replied: number;
  progress: number;
}

const buildInitialStats = (campaign: Campaign): CampaignStats => ({
  total: campaign.stats?.total || campaign.audience?.total || 0,
  sent: campaign.stats?.sent || 0,
  delivered: campaign.stats?.delivered || 0,
  failed: campaign.stats?.failed || 0,
  read: campaign.stats?.read || 0,
  replied: campaign.stats?.replied || 0,
  progress: campaign.stats?.progress || 0
});

export default function CampaignDetailsModal({ campaign, open, onClose, onRefresh }: CampaignDetailsModalProps) {
  const organizationId = useActiveOrganizationId();
  const [recipientStatusFilter, setRecipientStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<CampaignStats>(() => buildInitialStats(campaign));

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
    if (!open || !organizationId) return;

    const refreshStats = async () => {
      try {
        const summary = await CampaignService.getCampaignStats(campaign.id, organizationId!);

        // Extract stats from the summary response
          if (summary.whatsapp_campaign?.statistics) {
            const backendStats = summary.whatsapp_campaign.statistics;
            setStats({
              total: backendStats.total || 0,
              sent: backendStats.sent || 0,
              delivered: backendStats.delivered || 0,
              failed: backendStats.failed || 0,
              read: backendStats.read || 0,
              replied: backendStats.replied || 0,
              progress: backendStats.progress || 0
            });
          }
        } catch (error) {
        logger.error("Error refreshing stats", { error: error instanceof Error ? error.message : String(error) });
      }
    };

    // Refresh immediately and then every 30 seconds for ready/scheduled campaigns
    refreshStats();
    if (campaign.status === 'ready' || campaign.status === 'scheduled') {
      const interval = setInterval(refreshStats, 30000);
      return () => clearInterval(interval);
    }
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
      case 'ready': return 'bg-green-100 text-green-800 border-green-200';
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

  const calculateSentRate = () => {
    if (stats.total === 0) return 0;
    return Math.round((stats.sent / stats.total) * 100);
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
              {campaign.status === 'ready' && (
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

        <Tabs defaultValue="stats" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="stats">Statistics</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
          </TabsList>

          <TabsContent value="stats" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-center">Sent Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-indigo-600 mb-2">
                      {calculateSentRate()}%
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {stats.sent} of {stats.total || stats.sent} sent
                    </div>
                    <Progress value={calculateSentRate()} className="mt-2" />
                  </div>
                </CardContent>
              </Card>
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
                            <TableHead>Phone</TableHead>
                            <TableHead>Message</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Sent</TableHead>
                            <TableHead>Delivered</TableHead>
                            <TableHead>Read</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {recipients.map((recipient) => (
                            <TableRow key={recipient.id}>
                              <TableCell>
                                <div className="font-medium text-foreground">{recipient.contact_phone || '-'}</div>
                                <div className="text-xs text-muted-foreground">{recipient.contact_name}</div>
                              </TableCell>
                              <TableCell>
                                <div className="text-sm text-foreground line-clamp-2">
                                  {recipient.message_content || '—'}
                                </div>
                              </TableCell>
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
                                <span className="text-xs text-muted-foreground">
                                  {recipient.sent_at ? formatUTCForDisplay(recipient.sent_at) : '—'}
                                </span>
                              </TableCell>
                              <TableCell>
                                <span className="text-xs text-muted-foreground">
                                  {recipient.delivered_at ? formatUTCForDisplay(recipient.delivered_at) : '—'}
                                </span>
                              </TableCell>
                              <TableCell>
                                <span className="text-xs text-muted-foreground">
                                  {recipient.read_at ? formatUTCForDisplay(recipient.read_at) : '—'}
                                </span>
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
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
