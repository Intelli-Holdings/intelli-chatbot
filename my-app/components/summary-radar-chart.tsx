"use client"

import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts"

interface SummaryRadarChartProps {
  data: {
    num_conversations: number
    num_messages: number
    num_escalations: number
    num_pending: number
    num_assigned: number
    num_resolved: number
  }
}

export function SummaryRadarChart({ data }: SummaryRadarChartProps) {
  const chartData = [
    { subject: "Conversations", A: data.num_conversations, fullMark: Math.max(data.num_conversations, 10) },
    { subject: "Messages", A: data.num_messages, fullMark: Math.max(data.num_messages, 100) },
    { subject: "Escalations", A: data.num_escalations, fullMark: Math.max(data.num_escalations, 10) },
    { subject: "Pending", A: data.num_pending, fullMark: Math.max(data.num_pending, 100) },
    { subject: "Assigned", A: data.num_assigned, fullMark: Math.max(data.num_assigned, 10) },
    { subject: "Resolved", A: data.num_resolved, fullMark: Math.max(data.num_resolved, 10) },
  ]

  return (
    <div className="h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
          <PolarGrid />
          <PolarAngleAxis dataKey="subject" />
          <PolarRadiusAxis angle={30} domain={[0, "auto"]} />
          <Radar name="Summary" dataKey="A" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.6} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  )
}

