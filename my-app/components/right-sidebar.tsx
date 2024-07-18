"use client";

import { Card, CardContent } from "@/components/ui/card";
import { ChartContainer } from "@/components/ui/chart";
import { PolarAngleAxis, RadialBar, RadialBarChart } from "recharts";

const RightSidebar = () => {
  return (
    <div className="hidden md:block lg:w-1/4 border-l p-4">
      {/* Sales Labels Card */}
      <Card className="mb-4">
        <CardContent>
          <h2 className="text-xl font-semibold p-2">Sales Labels</h2>
          {/* Sales labels content goes here */}
        </CardContent>
      </Card>

      {/* Sentiment Analysis Card */}
      <Card className="mb-4">
        <CardContent>
          <h2 className="text-xl font-semibold p-2">Sentiment Analysis</h2>
          <ChartContainer
            config={{
              positive: {
                label: "Positive",
                color: "hsl(var(--chart-1))",
              },
              neutral: {
                label: "Neutral",
                color: "hsl(var(--chart-2))",
              },
              negative: {
                label: "Negative",
                color: "hsl(var(--chart-3))",
              },
            }}
            className="mx-auto aspect-square w-full max-w-[80%]"
          >
            <RadialBarChart
              margin={{
                left: -10,
                right: -10,
                top: -10,
                bottom: -10,
              }}
              data={[
                {
                  sentiment: "positive",
                  value: 75,
                  fill: "var(--color-positive)",
                },
                {
                  sentiment: "neutral",
                  value: 15,
                  fill: "var(--color-neutral)",
                },
                {
                  sentiment: "negative",
                  value: 10,
                  fill: "var(--color-negative)",
                },
              ]}
              innerRadius="20%"
              barSize={24}
              startAngle={90}
              endAngle={450}
            >
              <PolarAngleAxis
                type="number"
                domain={[0, 100]}
                dataKey="value"
                tick={false}
              />
              <RadialBar dataKey="value" background cornerRadius={5} />
            </RadialBarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Multimedia/Files Card */}
      <Card>
        <CardContent>
          <h2 className="text-xl font-semibold  p-2">Multimedia/Files</h2>
          {/* Multimedia/files content goes here */}
        </CardContent>
      </Card>
    </div>
  );
};

export default RightSidebar;
