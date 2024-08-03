"use client"

import { TrendingUp } from "lucide-react"
import { Bar, BarChart, XAxis, YAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
const chartData = [
  { emotion: "neutral", conversations: 275, fill: "var(--color-neutral)" },
  { emotion: "angry", conversations: 200, fill: "var(--color-angry)" },
  { emotion: "happy", conversations: 187, fill: "var(--color-happy)" },
  { emotion: "excited", conversations: 173, fill: "var(--color-excited)" },
  { emotion: "anxious", conversations: 90, fill: "var(--color-anxious)" },
]

const chartConfig = {
  conversations: {
    label: "Conversations",
  },
  neutral: {
    label: "Neutral",
    color: "hsl(var(--chart-1))",
  },
  angry: {
    label: "Angry",
    color: "hsl(var(--chart-2))",
  },
  happy: {
    label: "Happy",
    color: "hsl(var(--chart-3))",
  },
  excited: {
    label: "Excited",
    color: "hsl(var(--chart-4))",
  },
  anxious: {
    label: "Anxious",
    color: "hsl(var(--chart-5))",
  },
} satisfies ChartConfig

export function MixedBarChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Bar Chart - Mixed</CardTitle>
        <CardDescription>January - June 2024</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart
            accessibilityLayer
            data={chartData}
            layout="vertical"
            margin={{
              left: 0,
            }}
          >
            <YAxis
              dataKey="emotion"
              type="category"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) =>
                chartConfig[value as keyof typeof chartConfig]?.label
              }
            />
            <XAxis dataKey="conversations" type="number" hide />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar dataKey="conversations" layout="vertical" radius={5} />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 font-medium leading-none">
          Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          Showing total conversations for the last 6 months
        </div>
      </CardFooter>
    </Card>
  )
}
