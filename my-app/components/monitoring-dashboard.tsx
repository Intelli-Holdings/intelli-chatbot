"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TokenUsageChart } from "@/components/token-usage-chart"
import { ConversationStatsChart } from "@/components/conversation-stats-chart"
import { ChannelBreakdownTable } from "@/components/channel-breakdown-table"
import { SummaryRadarChart } from "@/components/summary-radar-chart"

const data = {
  id: 12,
  free_token: 1000000,
  used_token: 131000,
  payed_token: 0,
  total_token: 1000000,
  remaining_token: 869000,
  num_conversations: 4,
  num_messages: 131,
  num_escalations: 1,
  num_pending: 94,
  num_assigned: 1,
  num_resolved: 0,
  conversations_per_channel: {
    whatsapp: {
      number_of_conversation: 3,
      number_of_messages: 122,
      number_of_escalations: {
        channel: 58,
        total: 62,
      },
      number_of_app: 1,
    },
    website: {
      number_of_conversation: 1,
      number_of_messages: 9,
      number_of_escalations: {
        channel: 0,
        total: 4,
      },
      number_of_app: 2,
    },
  },
  created_at: "2025-02-18T08:02:20.550033Z",
  updated_at: "2025-02-18T08:02:20.711623Z",
  organization: "org_2rFRp3tQr9B4gFs0zX4T2lJhRuH",
}

export default function MonitoringDashboard() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle>Token Usage</CardTitle>
        </CardHeader>
        <CardContent>
          <TokenUsageChart data={data} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Conversation Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <ConversationStatsChart data={data} />
        </CardContent>
      </Card>
      <Card className="md:col-span-2 lg:col-span-1">
        <CardHeader>
          <CardTitle>Channel Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <ChannelBreakdownTable data={data.conversations_per_channel} />
        </CardContent>
      </Card>
      <Card className="md:col-span-2 lg:col-span-3">
        <CardHeader>
          <CardTitle>Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <SummaryRadarChart data={data} />
        </CardContent>
      </Card>
    </div>
  )
}

