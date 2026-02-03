import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarLineChart } from '@/components/charts/barchart';
import { LineMultipleChart } from '@/components/charts/linechart';
import { PiechartChart } from '@/components/charts/piecharts';
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { BarChart as BarChartIcon, LineChart as LineChartIcon, PieChartIcon } from 'lucide-react';

export function OverviewChart() {
  const [chartType, setChartType] = useState('bar');

  return (
    <Card>
  <CardHeader className="flex flex-row items-center justify-between">
    <CardTitle>Overview</CardTitle>
    <ToggleGroup type="single" value={chartType} onValueChange={(value) => value && setChartType(value)}>
      <ToggleGroupItem value="bar" aria-label="Toggle bar chart">
        <BarChartIcon className="h-4 w-4" />
      </ToggleGroupItem>
      <ToggleGroupItem value="line" aria-label="Toggle line chart">
        <LineChartIcon className="h-4 w-4" />
      </ToggleGroupItem>
      <ToggleGroupItem value="pie" aria-label="Toggle pie chart">
        <PieChartIcon className="h-4 w-4" />
      </ToggleGroupItem>
    </ToggleGroup>
  </CardHeader>
  <CardContent>
    {chartType === 'bar' ? <BarLineChart /> : chartType === 'line' ? <LineMultipleChart /> : <PiechartChart />}
  </CardContent>
</Card>
  );
}