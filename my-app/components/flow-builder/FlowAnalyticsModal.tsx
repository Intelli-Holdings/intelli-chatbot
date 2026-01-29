'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Loader2,
  ArrowRight,
} from 'lucide-react';
import { ChatbotAutomationService, FlowAnalytics } from '@/services/chatbot-automation';

interface FlowAnalyticsModalProps {
  open: boolean;
  onClose: () => void;
  flowId: string;
  flowName: string;
}

export function FlowAnalyticsModal({
  open,
  onClose,
  flowId,
  flowName,
}: FlowAnalyticsModalProps) {
  const [analytics, setAnalytics] = useState<FlowAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [periodDays, setPeriodDays] = useState(30);

  useEffect(() => {
    if (open && flowId) {
      fetchAnalytics();
    }
  }, [open, flowId, periodDays]);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await ChatbotAutomationService.getFlowAnalytics(flowId, periodDays);
      setAnalytics(data);
    } catch (err) {
      setError('Failed to load analytics');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number | null) => {
    if (seconds === null) return 'N/A';
    if (seconds < 60) return `${Math.round(seconds)}s`;
    if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
    return `${Math.round(seconds / 3600)}h`;
  };

  const getNodeTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      start: 'bg-green-100 text-green-700',
      text: 'bg-blue-100 text-blue-700',
      question: 'bg-purple-100 text-purple-700',
      media: 'bg-orange-100 text-orange-700',
      action: 'bg-red-100 text-red-700',
      condition: 'bg-yellow-100 text-yellow-700',
    };
    return colors[type] || 'bg-gray-100 text-gray-700';
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Flow Analytics: {flowName}
          </DialogTitle>
        </DialogHeader>

        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-muted-foreground">
            Track completion rates, drop-offs, and user paths
          </p>
          <Select
            value={periodDays.toString()}
            onValueChange={(v) => setPeriodDays(parseInt(v))}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="text-center py-12 text-red-500">{error}</div>
        ) : analytics ? (
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="dropoffs">Drop-offs</TabsTrigger>
              <TabsTrigger value="nodes">Node Stats</TabsTrigger>
              <TabsTrigger value="paths">Popular Paths</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-4">
              {/* Summary Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Runs</p>
                        <p className="text-2xl font-bold">{analytics.summary.total_executions}</p>
                      </div>
                      <Users className="h-8 w-8 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Completion Rate</p>
                        <p className="text-2xl font-bold">{analytics.summary.completion_rate}%</p>
                      </div>
                      {analytics.summary.completion_rate >= 50 ? (
                        <TrendingUp className="h-8 w-8 text-green-500" />
                      ) : (
                        <TrendingDown className="h-8 w-8 text-red-500" />
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Completed</p>
                        <p className="text-2xl font-bold text-green-600">{analytics.summary.completed}</p>
                      </div>
                      <CheckCircle2 className="h-8 w-8 text-green-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Avg. Time</p>
                        <p className="text-2xl font-bold">
                          {formatTime(analytics.summary.avg_completion_time_seconds)}
                        </p>
                      </div>
                      <Clock className="h-8 w-8 text-purple-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Status Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Status Breakdown</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Completed</span>
                    <div className="flex items-center gap-2">
                      <Progress
                        value={(analytics.summary.completed / (analytics.summary.total_executions || 1)) * 100}
                        className="w-32 h-2"
                      />
                      <span className="text-sm font-medium w-12 text-right">
                        {analytics.summary.completed}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Failed</span>
                    <div className="flex items-center gap-2">
                      <Progress
                        value={(analytics.summary.failed / (analytics.summary.total_executions || 1)) * 100}
                        className="w-32 h-2 [&>div]:bg-red-500"
                      />
                      <span className="text-sm font-medium w-12 text-right">
                        {analytics.summary.failed}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Waiting for Input</span>
                    <div className="flex items-center gap-2">
                      <Progress
                        value={(analytics.summary.waiting / (analytics.summary.total_executions || 1)) * 100}
                        className="w-32 h-2 [&>div]:bg-yellow-500"
                      />
                      <span className="text-sm font-medium w-12 text-right">
                        {analytics.summary.waiting}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Cancelled</span>
                    <div className="flex items-center gap-2">
                      <Progress
                        value={(analytics.summary.cancelled / (analytics.summary.total_executions || 1)) * 100}
                        className="w-32 h-2 [&>div]:bg-gray-500"
                      />
                      <span className="text-sm font-medium w-12 text-right">
                        {analytics.summary.cancelled}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* All-time Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">All-time Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold">{analytics.all_time.total_executions}</p>
                      <p className="text-sm text-muted-foreground">Total Runs</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-green-600">{analytics.all_time.completed}</p>
                      <p className="text-sm text-muted-foreground">Completed</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{analytics.all_time.completion_rate}%</p>
                      <p className="text-sm text-muted-foreground">Completion Rate</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Drop-offs Tab */}
            <TabsContent value="dropoffs" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    Where Users Drop Off
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {analytics.drop_offs.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No drop-off data available yet
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {analytics.drop_offs.map((dropOff, index) => (
                        <div
                          key={dropOff.node_id}
                          className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-lg font-bold text-muted-foreground">
                              #{index + 1}
                            </span>
                            <div>
                              <div className="flex items-center gap-2">
                                <Badge className={getNodeTypeColor(dropOff.node_type)}>
                                  {dropOff.node_type}
                                </Badge>
                                <span className="font-medium">{dropOff.node_label}</span>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                {dropOff.count} users stopped here
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-red-500">{dropOff.percentage.toFixed(1)}%</p>
                            <p className="text-xs text-muted-foreground">of incomplete</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Node Stats Tab */}
            <TabsContent value="nodes" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Node Visit Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  {analytics.node_stats.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No node statistics available yet
                    </p>
                  ) : (
                    <div className="space-y-2 max-h-[400px] overflow-y-auto">
                      {analytics.node_stats.map((node) => (
                        <div
                          key={node.node_id}
                          className="flex items-center justify-between p-2 hover:bg-muted/50 rounded-lg"
                        >
                          <div className="flex items-center gap-2">
                            <Badge className={getNodeTypeColor(node.node_type)}>
                              {node.node_type}
                            </Badge>
                            <span className="text-sm">{node.node_label || 'Unnamed'}</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="w-24">
                              <Progress value={node.visit_rate} className="h-2" />
                            </div>
                            <span className="text-sm font-medium w-16 text-right">
                              {node.visits} visits
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Popular Paths Tab */}
            <TabsContent value="paths" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Most Common User Paths</CardTitle>
                </CardHeader>
                <CardContent>
                  {analytics.popular_paths.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No path data available yet (requires completed executions)
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {analytics.popular_paths.map((pathData, pathIndex) => (
                        <div
                          key={pathIndex}
                          className="p-3 bg-muted/50 rounded-lg space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium">Path #{pathIndex + 1}</span>
                            <div className="text-right">
                              <span className="text-sm font-bold">{pathData.count} users</span>
                              <span className="text-xs text-muted-foreground ml-2">
                                ({pathData.percentage.toFixed(1)}%)
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 flex-wrap">
                            {pathData.path.map((node, nodeIndex) => (
                              <div key={nodeIndex} className="flex items-center gap-1">
                                <Badge variant="outline" className="text-xs">
                                  {node.node_label || node.node_type}
                                </Badge>
                                {nodeIndex < pathData.path.length - 1 && (
                                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            No analytics data available
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
