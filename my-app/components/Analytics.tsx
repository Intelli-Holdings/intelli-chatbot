"use client";

import React, { useState, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Rocket,
  MessageCircle,
  UserPlus,
  AlertTriangle,
  Share2,
  Smile,
  Download,
} from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

// Mock data generator function
const generateMockData = (days: number) => {
  const data = [];
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    data.push({
      date: date.toISOString().split("T")[0],
      messageCredits: Math.floor(Math.random() * 100) + 50,
      conversations: Math.floor(Math.random() * 50) + 10,
      leads: Math.floor(Math.random() * 20) + 5,
      escalations: Math.floor(Math.random() * 10) + 1,
      sentiment: Math.random(),
    });
  }

  return data;
};

interface DataPoint {
  date: string;
  messageCredits: number;
  conversations: number;
  leads: number;
  escalations: number;
  sentiment: number;
}

const rawData: DataPoint[] = generateMockData(90); // Generate 90 days of data

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884D8",
  "#82ca9d",
];

const timeRanges = {
  daily: 1,
  weekly: 7,
  monthly: 30,
};

export default function Analytics() {
  const [timeRange, setTimeRange] = useState<"daily" | "weekly" | "monthly">(
    "daily"
  );
  const [exportFormat, setExportFormat] = useState<
    "pdf" | "svg" | "png" | "jpeg"
  >("pdf");
  const dashboardRef = useRef<HTMLDivElement>(null);

  const aggregateData = useMemo(() => {
    const days = timeRanges[timeRange];
    return rawData.reduce<DataPoint[]>((acc, curr, index) => {
      if (index % days === 0) {
        acc.push({
          date: curr.date,
          messageCredits: rawData
            .slice(index, index + days)
            .reduce((sum, item) => sum + item.messageCredits, 0),
          conversations: rawData
            .slice(index, index + days)
            .reduce((sum, item) => sum + item.conversations, 0),
          leads: rawData
            .slice(index, index + days)
            .reduce((sum, item) => sum + item.leads, 0),
          escalations: rawData
            .slice(index, index + days)
            .reduce((sum, item) => sum + item.escalations, 0),
          sentiment:
            rawData
              .slice(index, index + days)
              .reduce((sum, item) => sum + item.sentiment, 0) / days,
        });
      }
      return acc;
    }, []);
  }, [timeRange]);

  const totalStats = useMemo(
    () => ({
      messageCredits: aggregateData.reduce(
        (sum, item) => sum + item.messageCredits,
        0
      ),
      conversations: aggregateData.reduce(
        (sum, item) => sum + item.conversations,
        0
      ),
      leads: aggregateData.reduce((sum, item) => sum + item.leads, 0),
      escalations: aggregateData.reduce(
        (sum, item) => sum + item.escalations,
        0
      ),
    }),
    [aggregateData]
  );

  const channelData = [
    { name: "Website", value: 400 },
    { name: "Facebook", value: 300 },
    { name: "WhatsApp", value: 300 },
    { name: "Instagram", value: 200 },
  ];

  const sentimentData = useMemo(() => {
    const sentiments = aggregateData.map((item) => item.sentiment);
    const positive = sentiments.filter((s) => s > 0.66).length;
    const neutral = sentiments.filter((s) => s >= 0.33 && s <= 0.66).length;
    const negative = sentiments.filter((s) => s < 0.33).length;
    return [
      { name: "Positive", value: positive },
      { name: "Neutral", value: neutral },
      { name: "Negative", value: negative },
    ];
  }, [aggregateData]);

  const generateReport = async () => {
    if (!dashboardRef.current) return;

    if (exportFormat === "pdf") {
      const pdf = new jsPDF("p", "mm", "a4");
      const elements = dashboardRef.current.querySelectorAll(".export-section");
      let yOffset = 10;

      for (let i = 0; i < elements.length; i++) {
        const element = elements[i] as HTMLElement;
        const canvas = await html2canvas(element);
        const imgData = canvas.toDataURL("image/png");

        if (i > 0) {
          pdf.addPage();
          yOffset = 10;
        }

        const imgWidth = 190;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        pdf.addImage(imgData, "PNG", 10, yOffset, imgWidth, imgHeight);
        yOffset += imgHeight + 10;
      }

      pdf.save("analytics-report.pdf");
    } else {
      const elements = dashboardRef.current.querySelectorAll(".export-section");
      elements.forEach(async (element, index) => {
        const canvas = await html2canvas(element as HTMLElement);
        const link = document.createElement("a");
        link.download = `analytics-section-${index + 1}.${exportFormat}`;
        link.href = canvas.toDataURL(`image/${exportFormat}`);
        link.click();
      });
    }
  };

  return (
    <div
      ref={dashboardRef}
      className="border rounded-xl space-y-8 p-8 bg-white shadow-md"
    >
      <div className="mb-6 flex justify-between items-center">
        <Select
          value={timeRange}
          onValueChange={(value: "daily" | "weekly" | "monthly") =>
            setTimeRange(value)
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="daily">Daily</SelectItem>
            <SelectItem value="weekly">Weekly</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={exportFormat}
          onValueChange={(value: "pdf" | "svg" | "png" | "jpeg") =>
            setExportFormat(value)
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select export format" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pdf">PDF</SelectItem>
            <SelectItem value="svg">SVG</SelectItem>
            <SelectItem value="png">PNG</SelectItem>
            <SelectItem value="jpeg">JPEG</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="overview" className="w-full mb-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="conversations">Conversations</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="export-section">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Message Credits
                  </CardTitle>
                  <Rocket className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {totalStats.messageCredits}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Conversations
                  </CardTitle>
                  <MessageCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {totalStats.conversations}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Leads
                  </CardTitle>
                  <UserPlus className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalStats.leads}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Escalations
                  </CardTitle>
                  <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {totalStats.escalations}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Rocket className="mr-2 h-5 w-5 text-purple-500" />
                    Message Credits Usage
                  </CardTitle>
                  <CardDescription>
                    Control your messaging costs
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      credits: {
                        label: "Credits",
                        color: "hsl(var(--chart-1))",
                      },
                    }}
                    className="h-[300px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={aggregateData}>
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip content={<ChartTooltipContent />} />
                        <Line
                          type="monotone"
                          dataKey="messageCredits"
                          stroke="var(--color-credits)"
                          strokeWidth={2}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MessageCircle className="mr-2 h-5 w-5 text-blue-500" />
                    Conversations
                  </CardTitle>
                  <CardDescription>Measure customer engagement</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      conversations: {
                        label: "Conversations",
                        color: "hsl(var(--chart-2))",
                      },
                    }}
                    className="h-[300px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={aggregateData}>
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip content={<ChartTooltipContent />} />
                        <Bar
                          dataKey="conversations"
                          fill="var(--color-conversations)"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="conversations">
          <div className="export-section">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <UserPlus className="mr-2 h-5 w-5 text-green-500" />
                    Leads Collected
                  </CardTitle>
                  <CardDescription>Grow your sales pipeline</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      leads: { label: "Leads", color: "hsl(var(--chart-3))" },
                    }}
                    className="h-[300px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={aggregateData}>
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip content={<ChartTooltipContent />} />
                        <Line
                          type="monotone"
                          dataKey="leads"
                          stroke="var(--color-leads)"
                          strokeWidth={2}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Share2 className="mr-2 h-5 w-5 text-indigo-500" />
                    Conversations per Channel
                  </CardTitle>
                  <CardDescription>
                    Optimize your channel strategy
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      channel: {
                        label: "Channel",
                        color: "hsl(var(--chart-5))",
                      },
                    }}
                    className="h-[300px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={channelData}
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                          label
                        >
                          {channelData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip content={<ChartTooltipContent />} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="performance">
          <div className="export-section">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <AlertTriangle className="mr-2 h-5 w-5 text-yellow-500" />
                    Escalations
                  </CardTitle>
                  <CardDescription>
                    Monitor and improve resolution times
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      escalations: {
                        label: "Escalations",
                        color: "hsl(var(--chart-4))",
                      },
                    }}
                    className="h-[300px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={aggregateData}>
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip content={<ChartTooltipContent />} />
                        <Line
                          type="monotone"
                          dataKey="escalations"
                          stroke="var(--color-escalations)"
                          strokeWidth={2}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Smile className="mr-2 h-5 w-5 text-yellow-500" />
                    Sentiment Analysis
                  </CardTitle>
                  <CardDescription>
                    Gauge overall customer satisfaction
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      sentiment: {
                        label: "Sentiment",
                        color: "hsl(var(--chart-6))",
                      },
                    }}
                    className="h-[300px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={sentimentData}
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                          label
                        >
                          {sentimentData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip content={<ChartTooltipContent />} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <motion.div
        className="bottom-8 right-8"
        whileHover={{ scale: 1.0 }}
        whileTap={{ scale: 1.1 }}
      >
        <Button
          size="sm"
          className="bg-blue-600 hover:bg-blue-700 text-white"
          onClick={generateReport}
        >
          <Download className="mr-2 h-4 w-4" />
          Generate Report
        </Button>
      </motion.div>
    </div>
  );
}
