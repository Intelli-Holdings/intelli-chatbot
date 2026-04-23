"use client";

import React, { useState, useEffect } from 'react';
import { Ban, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { CampaignService, type Campaign, type ValidationIssue } from '@/services/campaign';
import { CampaignValidationResult } from '@/components/campaign-validation-result';
import useActiveOrganizationId from '@/hooks/use-organization-id';
import { CampaignStatusBadge, getCampaignStatus, statusHelpers } from '@/components/campaign-status-badge';
import { logger } from "@/lib/logger";
import { useCampaignRecipients } from '@/hooks/use-campaign-recipients';
import { formatUTCForDisplay } from '@/lib/timezone-utils';
import { getMetaErrorInfo, getHumanReadableError, getErrorResolution } from "@/utils/meta-error-codes";

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
  const campaignStatus = getCampaignStatus(campaign);
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

    // Refresh immediately and then every 30 seconds for active or scheduled campaigns
    refreshStats();
    if (campaignStatus === 'scheduled' || campaignStatus === 'sending') {
      const interval = setInterval(refreshStats, 30000);
      return () => clearInterval(interval);
    }
  }, [campaign.id, campaignStatus, open, organizationId]);

  const handleCancel = async () => {
    if (!organizationId) return;
    if (!campaign.whatsapp_campaign_id) {
      toast.error('WhatsApp campaign ID is missing');
      return;
    }
    setLoading(true);
    try {
      await CampaignService.cancelCampaign(campaign.whatsapp_campaign_id, organizationId);
      toast.success('Cancellation recorded — the running task will exit shortly.');
      onRefresh();
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to cancel campaign');
    } finally {
      setLoading(false);
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

  const failureReasonLabels: Record<string, string> = {
    cancelled_by_user: 'Cancelled by user',
    technical_error: 'Technical error',
    validation_error: 'Validation error',
    expired: 'Expired (scheduler missed it)',
  };

  // Surface the canonical validator output captured by the scheduler when a
  // campaign was rejected at pickup time. The history row carries the full
  // ValidationIssue list inside metadata.validation_errors.
  const validationErrorsFromHistory: ValidationIssue[] = (() => {
    if (campaignStatus !== 'failed' || campaign.failure_reason !== 'validation_error') {
      return [];
    }
    const latest = campaign.status_history?.[0];
    const raw = latest?.metadata?.validation_errors;
    if (!Array.isArray(raw)) return [];
    return raw as ValidationIssue[];
  })();

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-xl">{campaign.name}</DialogTitle>
              <p className="text-muted-foreground mt-1">{campaign.description}</p>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <CampaignStatusBadge status={campaignStatus} />
                {campaignStatus === 'failed' && campaign.failure_reason && (
                  <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                    {failureReasonLabels[campaign.failure_reason] || campaign.failure_reason}
                  </Badge>
                )}
                {campaign.template && (
                  <Badge variant="outline">Template: {campaign.template.name}</Badge>
                )}
                {campaign.payload?.template_name && (
                  <Badge variant="outline">Template: {campaign.payload.template_name}</Badge>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {statusHelpers.canCancel(campaignStatus) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancel}
                  disabled={loading}
                  className="text-red-600 border-red-200 hover:bg-red-50"
                >
                  <Ban className="h-4 w-4 mr-1" />
                  Cancel
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>

        {validationErrorsFromHistory.length > 0 && (
          <CampaignValidationResult
            result={{ valid: false, errors: validationErrorsFromHistory, warnings: [] }}
            title="The scheduler rejected this campaign at pickup time:"
            className="mb-2"
          />
        )}

        <Tabs defaultValue="stats" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="stats">Statistics</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
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
                            <React.Fragment key={recipient.id}>
                              <TableRow>
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
                              {recipient.status === 'failed' && recipient.error_info && (() => {
                                const mapped = getMetaErrorInfo(recipient.error_info.error_code)
                                const humanError = getHumanReadableError(recipient.error_info)
                                const resolution = getErrorResolution(recipient.error_info.error_code)
                                return (
                                <TableRow className="bg-red-50/50">
                                  <TableCell colSpan={6} className="py-2">
                                    <div className="flex items-start gap-2 text-sm">
                                      <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                                      <div className="space-y-1">
                                        <p className="text-red-700 font-medium">
                                          {mapped?.title || 'Message delivery failed'}
                                        </p>
                                        <p className="text-red-600 text-xs">
                                          {humanError}
                                        </p>
                                        {resolution && (
                                          <p className="text-amber-700 text-xs bg-amber-50 rounded px-2 py-1 inline-block">
                                            {resolution}
                                          </p>
                                        )}
                                        <p className="text-red-400 text-[10px]">
                                          {[
                                            recipient.error_info.error_code && `Code: ${recipient.error_info.error_code}`,
                                            recipient.error_info.error_subcode && `Subcode: ${recipient.error_info.error_subcode}`,
                                          ].filter(Boolean).join(' | ')}
                                        </p>
                                      </div>
                                    </div>
                                  </TableCell>
                                </TableRow>
                                )
                              })()}
                            </React.Fragment>
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

          <TabsContent value="timeline" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Status timeline</CardTitle>
                <CardDescription>
                  Every status transition recorded for this campaign, newest first.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {(!campaign.status_history || campaign.status_history.length === 0) ? (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    No transitions recorded yet.
                  </div>
                ) : (
                  <ol className="relative border-l border-border ml-3 space-y-5">
                    {campaign.status_history.map((entry, idx) => (
                      <li key={`${entry.transitioned_at}-${idx}`} className="ml-4">
                        <span className="absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full border border-border bg-background" />
                        <div className="flex flex-wrap items-center gap-2 text-sm">
                          {entry.from_status ? (
                            <>
                              <CampaignStatusBadge status={entry.from_status as never} />
                              <span className="text-muted-foreground">→</span>
                            </>
                          ) : (
                            <span className="text-muted-foreground italic text-xs">created</span>
                          )}
                          <CampaignStatusBadge status={entry.to_status as never} />
                          <span className="text-xs text-muted-foreground">
                            {entry.actor ? 'by user' : 'by system'}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {formatUTCForDisplay(entry.transitioned_at)} · reason: <code className="text-foreground">{entry.reason}</code>
                        </p>
                      </li>
                    ))}
                  </ol>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
