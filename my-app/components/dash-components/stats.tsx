import React, { useEffect, useState } from 'react';
import { MessageSquare, Users, CalendarCheck, DollarSign, BarChart2, Mail, Globe, Zap, Percent } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { useUser } from "@clerk/nextjs";
import Link from 'next/link';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DatePickerWithRange } from "@/components/ui/date-picker-with-range";
import { addDays } from 'date-fns';
import { DateRange } from 'react-day-picker';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

type Channel = 'all' | 'website' | 'facebook' | 'instagram' | 'whatsapp';

type DashboardStats = {
  responses: number;
  siteVisitors: number;
  conversations: number;
  avgMessagesPerConversation: number;
  takeoverResponses: number;
  conversationsVsVisitors: string;
  won: number;
  wonValue: number;
  requiringHumanTakeover: number;
  responseUsage: { date: string; usage: number }[];
  currentlyFollowing: {
    website: number;
    whatsapp: number;
    instagram: number;
    facebook: number;
    email: number;
  };
};

interface DashboardMetricProps {
  title: string;
  value: number | string;
  icon: React.ElementType;
  isLoading: boolean;
  iconColor: string;
  href?: string;
}

const DashboardMetric: React.FC<DashboardMetricProps> = ({ title, value, icon: Icon, isLoading, iconColor, href }) => {
  const CardInfo = (
    <Card className={href ? "cursor-pointer" : ""}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xl font-medium text-muted-foreground mb-1">{title}</p>
            {isLoading ? (
              <div className="text-lg font-thin animate-shimmer">Fetching data...</div>
            ) : (
              <h2 className="text-3xl font-bold">{value}</h2>
            )}
          </div>
          <div className="p-2 bg-primary/10 rounded-full">
            <Icon className={`h-6 w-6 ${iconColor}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return href ? (
    <Link href={href} passHref>
      {CardInfo}
    </Link>
  ) : (
    CardInfo
  );
};

export function StatsOverview() {
  const { user } = useUser();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [channel, setChannel] = useState<Channel>('all');
  const [dateRange, setDateRange] = useState({
    from: addDays(new Date(), -7),
    to: new Date(),
  });

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;
      setIsLoading(true);
      try {
        const userEmail = user.emailAddresses[0].emailAddress;
        const response = await fetch(`${API_BASE_URL}/appservice/stats/${userEmail}?channel=${channel}&from=${dateRange.from.toISOString()}&to=${dateRange.to.toISOString()}`);
        const data: DashboardStats = await response.json();
        setStats(data);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [user, channel, dateRange]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <Select onValueChange={(value) => setChannel(value as Channel)} defaultValue={channel}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select channel" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Channels</SelectItem>
            <SelectItem value="website">Website</SelectItem>
            <SelectItem value="facebook">Facebook</SelectItem>
            <SelectItem value="instagram">Instagram</SelectItem>
            <SelectItem value="whatsapp">WhatsApp</SelectItem>
          </SelectContent>
        </Select>
        <DatePickerWithRange date={undefined} setDate={function (value: React.SetStateAction<DateRange | undefined>): void {
          throw new Error('Function not implemented.');
        } } />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <DashboardMetric
          title="Responses"
          value={stats?.responses || 0}
          icon={MessageSquare}
          isLoading={isLoading}
          iconColor="text-blue-500"
        />
        <DashboardMetric
          title="Site Visitors"
          value={stats?.siteVisitors || 0}
          icon={Users}
          isLoading={isLoading}
          iconColor="text-green-500"
        />
        <DashboardMetric
          title="Conversations"
          value={stats?.conversations || 0}
          icon={MessageSquare}
          isLoading={isLoading}
          iconColor="text-yellow-500"
        />
        <DashboardMetric
          title="Avg Messages/Conversation"
          value={stats?.avgMessagesPerConversation || 0}
          icon={BarChart2}
          isLoading={isLoading}
          iconColor="text-purple-500"
        />
        <DashboardMetric
          title="Takeover Responses"
          value={stats?.takeoverResponses || 0}
          icon={Users}
          isLoading={isLoading}
          iconColor="text-red-500"
        />
        <DashboardMetric
          title="Conversations vs Visitors"
          value={stats?.conversationsVsVisitors || '0%'}
          icon={Percent}
          isLoading={isLoading}
          iconColor="text-indigo-500"
        />
        <DashboardMetric
          title="Won"
          value={stats?.won || 0}
          icon={DollarSign}
          isLoading={isLoading}
          iconColor="text-green-500"
        />
        <DashboardMetric
          title="Won Value"
          value={`$${stats?.wonValue || 0}`}
          icon={DollarSign}
          isLoading={isLoading}
          iconColor="text-green-700"
        />
        <DashboardMetric
          title="Requiring Human Takeover"
          value={stats?.requiringHumanTakeover || 0}
          icon={Mail}
          isLoading={isLoading}
          iconColor="text-orange-500"
        />
      </div>
      <Card className="mt-8">
        <CardContent className="p-6">
          <h3 className="text-xl font-bold mb-4">Response Usage</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats?.responseUsage || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="usage" stroke="#8884d8" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      <Card className="mt-8">
        <CardContent className="p-6">
          <h3 className="text-xl font-bold mb-4">Currently Following</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            <DashboardMetric
              title="Website"
              value={stats?.currentlyFollowing.website || 0}
              icon={Globe}
              isLoading={isLoading}
              iconColor="text-blue-500"
            />
            <DashboardMetric
              title="WhatsApp"
              value={stats?.currentlyFollowing.whatsapp || 0}
              icon={MessageSquare}
              isLoading={isLoading}
              iconColor="text-green-500"
            />
            <DashboardMetric
              title="Instagram"
              value={stats?.currentlyFollowing.instagram || 0}
              icon={Zap}
              isLoading={isLoading}
              iconColor="text-pink-500"
            />
            <DashboardMetric
              title="Facebook"
              value={stats?.currentlyFollowing.facebook || 0}
              icon={Users}
              isLoading={isLoading}
              iconColor="text-blue-700"
            />
            <DashboardMetric
              title="Email"
              value={stats?.currentlyFollowing.email || 0}
              icon={Mail}
              isLoading={isLoading}
              iconColor="text-yellow-500"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

