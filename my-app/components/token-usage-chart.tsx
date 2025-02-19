"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardContent } from "@/components/ui/card";

interface TokenUsageChartProps {
  data: {
    used_token: number;
    remaining_token: number;
  };
}

export function TokenUsageChart({ data }: TokenUsageChartProps) {
  const chartData = [
    { name: "Used Tokens", value: data.used_token },
    { name: "Remaining Tokens", value: data.remaining_token },
  ];

  const COLORS = [
    "hsl(var(--primary))",
    "hsl(var(--secondary))",
    "hsl(var(--accent))",
    "hsl(var(--muted))",
  ];

  return (
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            fill="#8884d8"
            paddingAngle={5}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <Card>
                    <CardContent className="p-2">
                      <p className="text-sm font-bold">{payload[0].name}</p>
                      <p className="text-sm">
                        {payload[0].value.toLocaleString()} tokens
                      </p>

                      <div className="flex justify-center gap-4 mt-4">
                        {chartData.map((entry, index) => (
                          <div key={entry.name} className="flex items-center">
                            <div
                              className="w-3 h-3 mr-2"
                              style={{ backgroundColor: COLORS[index] }}
                            ></div>
                            <span className="text-sm">{entry.name}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                );
              }
              return null;
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
