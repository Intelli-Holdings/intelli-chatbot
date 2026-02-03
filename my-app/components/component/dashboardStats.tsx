// components/DashboardStats.tsx
import React from 'react';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import {  Button } from '@/components/ui/button';

interface StatCardProps {
  title: string;
  value: string;
  max: string;
  icon: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, max, icon }) => (
  <Card className="flex-1 p-4">
    <CardHeader className="flex items-center justify-between">
      <h5>{title}</h5>
      {icon}
    </CardHeader>
    <CardContent className="flex items-center justify-center">
      <h2 className="font-bold">
        {value}/{max}
      </h2>
    </CardContent>
  </Card>
);

const DashboardStats: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <StatCard
        title="Total Chatbots"
        value="0"
        max="1"
        icon={<i className="icon-chatbot" />}
      />
      <StatCard
        title="Total Messages"
        value="0"
        max="40"
        icon={<i className="icon-messages" />}
      />
      <StatCard
        title="Total Leads"
        value="0"
        max="5"
        icon={<i className="icon-leads" />}
      />
    </div>
  );
};

export default DashboardStats;
