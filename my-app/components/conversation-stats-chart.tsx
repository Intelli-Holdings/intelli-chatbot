"use client"

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import { Card, CardContent } from "@/components/ui/card"

interface ConversationStatsChartProps {
  data: {
    num_conversations: number
    num_pending: number
    num_assigned: number
    num_resolved: number
  }
}

export function ConversationStatsChart({ data }: ConversationStatsChartProps) {
  const chartData = [
    { name: "Total", value: data.num_conversations, color: "hsl(var(--primary))" },
    { name: "Pending", value: data.num_pending, color: "hsl(var(--secondary))" },
    { name: "Assigned", value: data.num_assigned, color: "hsl(var(--accent))" },
    { name: "Resolved", value: data.num_resolved, color: "hsl(var(--muted))" },
  ]

  return (
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} layout="vertical" margin={{ left: 50 }}>
          <XAxis type="number" />
          <YAxis dataKey="name" type="category" />
          <Tooltip
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                return (
                  <Card>
                    <CardContent className="p-2">
                      <p className="text-sm font-bold">{label}</p>
                      <p className="text-sm">{payload[0].value} conversations</p>
                    </CardContent>
                  </Card>
                )
              }
              return null
            }}
          />
          {chartData.map((entry, index) => (
            <Bar key={entry.name} dataKey="value" fill={entry.color} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

