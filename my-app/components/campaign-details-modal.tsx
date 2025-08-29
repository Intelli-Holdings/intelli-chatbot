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
import { toast } from 'sonner';
import { CampaignService, type Campaign } from '@/services/campaign';

interface CampaignDetailsModalProps {
  campaign: Campaign;
  open: boolean;
  onClose: () => void;
  onRefresh: () => void;
}

export default function CampaignDetailsModal({ campaign, open, onClose, onRefresh }: CampaignDetailsModalProps) {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(campaign.stats);

  // Refresh stats for active campaigns
  useEffect(() => {
    if (!open || campaign.status !== 'active') return;

    const refreshStats = async () => {
      try {
        const updatedStats = await CampaignService.getCampaignStats(campaign.id);
        setStats(updatedStats);
      } catch (error) {
        console.error('Error refreshing stats:', error);
      }
    };

    // Refresh immediately and then every 30 seconds
    refreshStats();
    const interval = setInterval(refreshStats, 30000);

    return () => clearInterval(interval);
  }, [campaign.id, campaign.status, open]);

  const handlePause = async () => {
    setLoading(true);
    try {
      await CampaignService.pauseCampaign(campaign.id);
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
    setLoading(true);
    try {
      await CampaignService.resumeCampaign(campaign.id);
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

  const mockMessageDetails = [
    { id: '1', recipient: '+1234567890', status: 'delivered', sentAt: '2024-01-15 10:30:00', deliveredAt: '2024-01-15 10:30:05' },
    { id: '2', recipient: '+1234567891', status: 'read', sentAt: '2024-01-15 10:30:01', deliveredAt: '2024-01-15 10:30:06', readAt: '2024-01-15 10:32:15' },
    { id: '3', recipient: '+1234567892', status: 'failed', sentAt: '2024-01-15 10:30:02', error: 'Invalid phone number' },
    { id: '4', recipient: '+1234567893', status: 'replied', sentAt: '2024-01-15 10:30:03', deliveredAt: '2024-01-15 10:30:08', readAt: '2024-01-15 10:33:20', repliedAt: '2024-01-15 10:35:45' },
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-xl">{campaign.name}</DialogTitle>
              <p className="text-muted-foreground mt-1">{campaign.description}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge className={getStatusColor(campaign.status)}>
                  {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                </Badge>
                {campaign.template && (
                  <Badge variant="outline">Template: {campaign.template.name}</Badge>
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
                    <div className="flex justify-between">
                      <span>Total Contacts:</span>
                      <span className="font-medium">{campaign.audience.total.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Lists:</span>
                      <span className="font-medium">{campaign.audience.segments.length}</span>
                    </div>
                    {campaign.audience.segments.length > 0 && (
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
                    <div className="flex justify-between">
                      <span>Type:</span>
                      <span className="font-medium">
                        {campaign.schedule.immediate ? 'Immediate' : 'Scheduled'}
                      </span>
                    </div>
                    {!campaign.schedule.immediate && (
                      <>
                        <div className="flex justify-between">
                          <span>Start Date:</span>
                          <span className="font-medium">
                            {new Date(campaign.schedule.startDate).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Start Time:</span>
                          <span className="font-medium">
                            {new Date(campaign.schedule.startDate).toLocaleTimeString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Timezone:</span>
                          <span className="font-medium">{campaign.schedule.timezone}</span>
                        </div>
                      </>
                    )}
                    <div className="flex justify-between">
                      <span>Created:</span>
                      <span className="font-medium">
                        {new Date(campaign.createdAt).toLocaleDateString()}
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
                <CardTitle>Message Details</CardTitle>
                <CardDescription>
                  Individual message delivery status and timestamps
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Recipient</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Sent At</TableHead>
                      <TableHead>Delivered At</TableHead>
                      <TableHead>Read At</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockMessageDetails.map((message) => (
                      <TableRow key={message.id}>
                        <TableCell className="font-mono">{message.recipient}</TableCell>
                        <TableCell>
                          <Badge
                            className={
                              message.status === 'delivered' ? 'bg-green-100 text-green-800' :
                              message.status === 'read' ? 'bg-blue-100 text-blue-800' :
                              message.status === 'replied' ? 'bg-purple-100 text-purple-800' :
                              message.status === 'failed' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }
                          >
                            {message.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{message.sentAt}</TableCell>
                        <TableCell>{message.deliveredAt || '-'}</TableCell>
                        <TableCell>{message.readAt || '-'}</TableCell>
                        <TableCell>
                          {message.error && (
                            <span className="text-red-600 text-sm">{message.error}</span>
                          )}
                          {message.repliedAt && (
                            <span className="text-purple-600 text-sm">
                              Replied at {message.repliedAt}
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
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
                          <span>Created By:</span>
                          <span>{campaign.createdBy}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Created At:</span>
                          <span>{new Date(campaign.createdAt).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Last Updated:</span>
                          <span>{new Date(campaign.updatedAt).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Template Information</h4>
                      {campaign.template && (
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Template ID:</span>
                            <span className="font-mono">{campaign.template.id}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Template Name:</span>
                            <span>{campaign.template.name}</span>
                          </div>
                        </div>
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
