import React, { useEffect, useState } from 'react';
import { MessageSquare, Users, CalendarCheck } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { useUser } from "@clerk/nextjs";
import Link from 'next/link';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

type Business = {
  id: number;
  name: string;
  slug: string;
  owner: string;
  org_id: string;
  created_at: string;
};

type ChatSession = {
  id: number;
  customer_number: string;
  updated_at: string;
};

type WhatsAppAccount = {
  id: number;
  business: Business;
  phone_number_id: string;
  phone_number: string;
  app_secret: string;
  created_at: string;
  chatsessions: ChatSession[];
  whatsapp_business_account_id: string;
};

type DashboardStats = {
  totalAssistants: number;
  totalConversations: number;
  totalLeads: number;
};

interface DashboardMetricProps {
  title: string;
  value: number | null;
  change?: string;
  icon: React.ElementType;
  isLoading: boolean;
  iconColor: string;
  href?: string;
}

const DashboardMetric: React.FC<DashboardMetricProps> = ({ title, value, change, icon: Icon, isLoading, iconColor, href }) => {
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
            {change && <p className="text-xs text-muted-foreground mt-1">{change}</p>}
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

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;
      try {
        const userEmail = user.emailAddresses[0].emailAddress;
        const response = await fetch(`${API_BASE_URL}/appservice/list/${userEmail}`);
        const data: WhatsAppAccount[] = await response.json();
        const totalAssistants = data.length;
        const totalConversations = data.reduce((total, account) => total + account.chatsessions.length, 0);
        const totalLeads = totalConversations;
        setStats({ totalAssistants, totalConversations, totalLeads });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <DashboardMetric
          title="Total Assistants"
          value={stats?.totalAssistants || 0}
          change=""
          icon={Users}
          isLoading={isLoading}
          iconColor="text-blue-500"
        />
        <DashboardMetric
          title="Total Conversations"
          value={stats?.totalConversations || 0}
          change=""
          icon={MessageSquare}
          isLoading={isLoading}
          iconColor="text-green-500"
          href="/dashboard/conversations/whatsapp"
        />
        <DashboardMetric
          title="Total Leads"
          value={stats?.totalLeads || 0}
          change=""
          icon={CalendarCheck}
          isLoading={isLoading}
          iconColor="text-yellow-500"
        />
      </div>
    </div>
  );
}