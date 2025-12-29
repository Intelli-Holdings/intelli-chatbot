"use client"

import React from 'react';
import { useRouter } from 'next/navigation';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  MessageSquare,
  Users,
  BarChart3,
  ArrowRight,
  Rocket
} from 'lucide-react';

interface EmptyStateProps {
  userName?: string;
  onWhatsAppSetup?: () => void;
  onWebsiteSetup?: () => void;
}

export const DashboardEmptyState: React.FC<EmptyStateProps> = ({
  userName = "there",
  onWhatsAppSetup,
  onWebsiteSetup
}) => {
  const router = useRouter();

  return (
    <div className="space-y-6">
      {/* Welcome Card */}
      <Card className="rounded-xl border border-gray-200 bg-gradient-to-br from-blue-50 via-white to-purple-50 p-8 shadow-sm">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#007fff] text-white">
            <Rocket className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome to IntelliConcierge, <span className="text-[#007fff]">{userName}</span>!
            </h1>
            <p className="mt-2 text-lg text-gray-600">
              Let's get you started with your AI-powered customer engagement platform
            </p>
          </div>
        </div>
      </Card>

      {/* Getting Started Steps */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Get Started in 3 Simple Steps
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          {/* Step 1 */}
          <Card className="rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-[#007fff] mb-4">
              <span className="text-lg font-bold">1</span>
            </div>
            <div className="flex items-start gap-3 mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-50">
                <MessageSquare className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Connect a Channel</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Connect WhatsApp, Website Widget, or other channels
                </p>
              </div>
            </div>
            {onWhatsAppSetup && (
              <Button
                onClick={onWhatsAppSetup}
                variant="outline"
                className="w-full mt-4"
                size="sm"
              >
                Setup WhatsApp <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
            <Button
              onClick={() => router.push('/dashboard/widgets')}
              variant="outline"
              className="w-full mt-2"
              size="sm"
            >
              Setup Website Widget <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Card>

          {/* Step 2 */}
          <Card className="rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-[#007fff] mb-4">
              <span className="text-lg font-bold">2</span>
            </div>
            <div className="flex items-start gap-3 mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-50">
                <Sparkles className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Create AI Assistant</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Train your AI assistant with your business knowledge
                </p>
              </div>
            </div>
            <Button
              onClick={() => router.push('/dashboard/assistants')}
              variant="outline"
              className="w-full mt-4"
              size="sm"
            >
              Create AI Assistant <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Card>

          {/* Step 3 */}
          <Card className="rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-[#007fff] mb-4">
              <span className="text-lg font-bold">3</span>
            </div>
            <div className="flex items-start gap-3 mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-50">
                <Users className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Engage Customers</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Start conversations and watch your metrics grow
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              className="w-full mt-4"
              size="sm"
              disabled
            >
              Start engaging
            </Button>
          </Card>
        </div>
      </div>

      {/* What You'll See */}
      <Card className="rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-start gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-50">
            <BarChart3 className="h-5 w-5 text-indigo-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">What You'll See Here</h3>
            <p className="text-sm text-gray-600 mt-1">
              Once you start engaging with customers, this dashboard will show:
            </p>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 mt-4">
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
            <p className="text-xs font-medium text-gray-500">Total Conversations</p>
            <p className="text-2xl font-bold text-gray-300 mt-1">0</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
            <p className="text-xs font-medium text-gray-500">Messages Sent</p>
            <p className="text-2xl font-bold text-gray-300 mt-1">0</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
            <p className="text-xs font-medium text-gray-500">Active Tickets</p>
            <p className="text-2xl font-bold text-gray-300 mt-1">0</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
            <p className="text-xs font-medium text-gray-500">Token Usage</p>
            <p className="text-2xl font-bold text-gray-300 mt-1">0%</p>
          </div>
        </div>
      </Card>

      {/* Help Section */}
      <Card className="rounded-xl border border-blue-200 bg-blue-50 p-6 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
            <Sparkles className="h-5 w-5 text-[#007fff]" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">Need Help Getting Started?</h3>
            <p className="text-sm text-gray-600 mt-1">
              Check out our documentation or click the "Take Tour" button above to learn about all features.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default DashboardEmptyState;
