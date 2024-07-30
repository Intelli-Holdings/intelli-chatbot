import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { MessageSquare, Bot, Users,   ArrowUpRight } from 'lucide-react';
import { CardDescription, CardContent, Card, CardHeader, CardFooter, CardTitle } from "@/components/ui/card";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import Link from "next/link";
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useRouter } from 'next/navigation';
import { Skeleton } from "@/components/ui/skeleton";
import { useUser } from "@clerk/nextjs";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { PiechartChart } from '@/components/charts/piecharts';


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
  icon: React.ElementType;
  isLoading: boolean;
}

interface ChatbotCardProps {
  title: string;
  description: string;
  onClick: () => void;
  icon: React.ReactNode;
}

export function DashComponent() {
  const router = useRouter();
  const { user } = useUser();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return; 
      try {
  
        const userEmail = user.emailAddresses[0].emailAddress;
        const response = await fetch(`${API_BASE_URL}/appservice/list/${userEmail}/`);
        if (!response.ok) {
          throw new Error('Failed to fetch stats');
        }
        const data: WhatsAppAccount[] = await response.json();
        
        // Calculate stats from the fetched data
        const totalAssistants = data.length;
        const totalConversations = data.reduce((sum, account) => sum + account.chatsessions.length, 0);
        const totalLeads = new Set(data.flatMap(account => account.chatsessions.map(session => session.customer_number))).size;

        setStats({
          totalAssistants,
          totalConversations,
          totalLeads
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
        setStats(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  },[user]);

  const handleWebsiteWidgetClick = () => {
    router.push('/dashboard/create-chatbot');
  };

  const handleWhatsAppAssistantClick = () => {
    router.push('/dashboard/create-whatsapp-assistant');
  };

  const DashboardMetric: React.FC<DashboardMetricProps> = ({ title, value, icon: Icon, isLoading }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-8 w-20" />
        ) : (
          <div className="text-2xl font-bold">{value !== null ? value : 0}</div>
        )}
        <p className="text-xs text-muted-foreground">{title}</p>
      </CardContent>
    </Card>
  );
  
  const ChatbotCard: React.FC<ChatbotCardProps> = ({ title, description, onClick, icon }) => (
    <Card className="cursor-pointer" onClick={onClick}>
      <CardContent className="flex flex-col items-center justify-center p-6">
        <div className="rounded-full bg-primary p-2 mb-4">
          {icon}
        </div>
        <CardTitle>{title}</CardTitle>
        <p className="text-sm text-center text-muted-foreground mt-2">{description}</p>
      </CardContent>
    </Card>
  );

  return (
    <div className="flex">      
      <div className="flex-1">
        <main className="p-5">
          <div className="grid gap-4 md:grid-cols-3">
            <DashboardMetric
              title="Total Assistants"
              value={stats?.totalAssistants ?? null}
              icon={Bot}
              isLoading={isLoading}
            />
            <DashboardMetric
              title="Total Conversations"
              value={stats?.totalConversations ?? null}
              icon={MessageSquare}
              isLoading={isLoading}
            />
            <DashboardMetric
              title="Total Leads"
              value={stats?.totalLeads ?? null}
              icon={Users}
              isLoading={isLoading}
            />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
        <Card>
          <CardHeader>
            <CardTitle>Overview</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
  <div className="flex">
    <div className="flex flex-col items-start mr-8">
      <div className="flex items-center mb-2">
        <div className="w-3 h-3 bg-blue-500 rounded-full mr-2" />
        <span>Website Widget</span>
      </div>
      <div className="flex items-center mb-2">
        <div className="w-3 h-3 bg-green-500 rounded-full mr-2" />
        <span>WhatsApp Assistant</span>
      </div>
      <div className="flex items-center mb-2">
        <div className="w-3 h-3 bg-pink-500 rounded-full mr-2" />
        <span>Instagram Assistant</span>
      </div>
      <div className="flex items-center mb-2">
        <div className="w-3 h-3 bg-red-500 rounded-full mr-2" />
        <span>Email Assistant</span>
      </div>
      <div className="flex items-center mb-2">
        <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2" />
        <span>Others</span>
      </div>
    </div>
    <div className="flex flex-col items-center">
      <PiechartChart  />
    </div>
  </div>
</CardContent>

        </Card>
        <Card>
          <CardHeader className="">
            <CardTitle>Escalations - WhatsApp</CardTitle>
            <Button variant="outline" size="sm" >
              Filter
            </Button>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">You have 2 pending conversations</p>
            <div className="space-y-4">
              <div className="flex items-center">
                <Avatar>
                  <AvatarImage src="/placeholder-user.jpg" />
                  <AvatarFallback>MK</AvatarFallback>
                </Avatar>
                <div className="ml-4">
                  <p className="font-medium">Sent an Image</p>
                  <p className="text-sm text-muted-foreground">Martin Koji</p>
                </div>
                <Badge variant="secondary" className="ml-auto">
                  Neutral
                </Badge>
              </div>
              <div className="flex items-center">
                <Avatar>
                  <AvatarImage src="/placeholder-user.jpg" />
                  <AvatarFallback>KB</AvatarFallback>
                </Avatar>
                <div className="ml-4">
                  <p className="font-medium">Flight details</p>
                  <p className="text-sm text-muted-foreground">0567987221</p>
                </div>
                <Badge variant="secondary" className="ml-auto">
                  Excited
                </Badge>
              </div>
              <div className="flex items-center">
                <Avatar>
                  <AvatarImage src="/placeholder-user.jpg" />
                  <AvatarFallback>KB</AvatarFallback>
                </Avatar>
                <div className="ml-4">
                  <p className="font-medium">Payment</p>
                  <p className="text-sm text-muted-foreground">Kofi Bataman</p>
                </div>
                <Badge variant="secondary" className="ml-auto">
                  Money
                </Badge>
              </div>
              <div className="flex items-center">
                <Avatar>
                  <AvatarImage src="/placeholder-user.jpg" />
                  <AvatarFallback>NY</AvatarFallback>
                </Avatar>
                <div className="ml-4">
                  <p className="font-medium">Further Info</p>
                  <p className="text-sm text-muted-foreground">Nana Yaa</p>
                </div>
                <Badge variant="secondary" className="ml-auto">
                  Worried
                </Badge>
              </div>
              <div className="flex items-center">
                <Avatar>
                  <AvatarImage src="/placeholder-user.jpg" />
                  <AvatarFallback>050348567</AvatarFallback>
                </Avatar>
                <div className="ml-4">
                  <p className="font-medium">Payment</p>
                  <p className="text-sm text-muted-foreground">050348567</p>
                </div>
                <Badge variant="secondary" className="ml-auto">
                  Money
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
          <h2 className="text-2xl font-bold mt-8 mb-4">Create your Assistants</h2>
          <p className="text-muted-foreground mb-4">
            Create customized assistants for your business&apos;s customer support.
          </p>
      
          <div className="grid gap-4 md:grid-cols-2">
            <ChatbotCard
              title="Create Website Widget"
              description="Start building a new chatbot for your website"
              onClick={handleWebsiteWidgetClick}
              icon={
                <Image
                  src="/Avatar.png"
                  alt="WhatsApp Logo"
                  width={20}
                  height={20}
                  className="text-primary-foreground bg-transparent"
                />
              }
            />
            <ChatbotCard
              title="Create WhatsApp Assistant"
              description="Start building a WhatsApp assistant for your business"
              onClick={handleWhatsAppAssistantClick}
              icon={
                <Image
                  src="/whatsapp.svg"
                  alt="WhatsApp Logo"
                  width={80}
                  height={90}
                  className="text-primary-foreground"
                />
              }
            />
          </div>
        </main>
      </div>
    </div>
  );
}