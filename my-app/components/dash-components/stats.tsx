import React, { useEffect, useState } from 'react';
import { MessageSquare, Users, CalendarCheck, Bot, Globe, Contact } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { useUser } from "@clerk/nextjs";
import Link from 'next/link';

type DashboardMetricProps = {
  title: string;
  value: number | null;
  change?: string;
  icon: React.ElementType;
  isLoading: boolean;
  iconColor: string;
  href?: string;
};

const MetricSkeleton = () => (
  <div className="space-y-4">
    <div className="h-6 w-32 rounded bg-gradient-to-r from-gray-100 to-gray-200 animate-[shimmer_1s_infinite]" />
    <div className="h-8 w-24 rounded bg-gradient-to-r from-gray-100 to-gray-200 animate-[shimmer_1s_infinite]" />
  </div>
);


const DashboardMetric: React.FC<DashboardMetricProps> = ({
  title,
  value,
  change,
  icon: Icon,
  isLoading,
  iconColor,
  href
}) => {
  const CardInfo = (
    <Card className={`transform transition-all duration-200 hover:shadow-lg ${href ? "cursor-pointer hover:-translate-y-1" : ""}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between space-x-4">
          <div className="flex-1 space-y-1">
            {isLoading ? (
              <MetricSkeleton />
            ) : (
              <>
                <p className="text-sm font-medium text-muted-foreground">{title}</p>
                <div className="flex items-baseline">
                  <h2 className="text-3xl font-bold tracking-tight">
                    {value?.toLocaleString()}
                  </h2>
                  {change && (
                    <span className="ml-2 text-sm text-muted-foreground">
                      {change}
                    </span>
                  )}
                </div>
              </>
            )}
          </div>
          <div className={`p-3 rounded-full bg-opacity-20 ${iconColor.replace('text-', 'bg-')}`}>
            <Icon className={`h-6 w-6 ${iconColor}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return href ? (
    <Link href={href} className="block">
      {CardInfo}
    </Link>
  ) : CardInfo;
};

export function StatsOverview() {
  const { user } = useUser();
  const [stats, setStats] = useState<{
    totalAssistants: number;
    totalConversations: number;
    totalLeads: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;
      try {
        const userEmail = user.emailAddresses[0].emailAddress;
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/appservice/list/${userEmail}`);
        const data = await response.json();
        
        setStats({
          totalAssistants: data.length,
          totalConversations: data.reduce((total: number, account: any) => 
            total + account.chatsessions.length, 0),
          totalLeads: data.reduce((total: number, account: any) => 
            total + account.chatsessions.length, 0)
        });
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <DashboardMetric
          title="Active Assistants"
          value={stats?.totalAssistants || 0}
          icon={Bot}
          isLoading={isLoading}
          iconColor="text-blue-500"
        />
        <DashboardMetric
          title="Total Conversations"
          value={stats?.totalConversations || 0}
          icon={MessageSquare}
          isLoading={isLoading}
          iconColor="text-green-500"
          href="/dashboard/conversations/whatsapp"
        />
        <DashboardMetric
          title="Generated Leads"
          value={stats?.totalLeads || 0}
          icon={Contact}
          isLoading={isLoading}
          iconColor="text-yellow-500"
        />
      </div>
    </div>
  );
}

export default StatsOverview;