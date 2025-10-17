"use client"
import React from "react"
import { ChevronDown, Info, MessageSquare, RefreshCw, ExternalLink, Shield, TrendingUp } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { AppSidebar } from "@/components/app-sidebar"
import { Progress } from "@/components/ui/progress"
import DashboardHeader from "@/components/dashboard-header"
import AppServiceCredentials from "@/components/app-service-credentials"
import { useAppServices } from "@/hooks/use-app-services"
import { useWhatsAppAnalytics } from "@/hooks/use-whatsapp-analytics"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// Skeleton component with shimmer animation
const Skeleton = ({ className = "" }: { className?: string }) => (
  <div className={`skeleton-animate ${className}`} />
)


// Quality rating badge component
const QualityRatingBadge = ({ rating }: { rating?: string }) => {
  const getQualityColor = (rating?: string) => {
    switch (rating?.toUpperCase()) {
      case 'GREEN':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'YELLOW':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'RED':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  // Fix: Add proper null checking before string operations
  const formatRating = (rating?: string) => {
    if (!rating) return 'Unknown'
    return rating.charAt(0).toUpperCase() + rating.slice(1).toLowerCase()
  }

  return (
    <Badge variant="outline" className={`${getQualityColor(rating)} px-2 py-0.5 text-xs`}>
      {formatRating(rating)}
    </Badge>
  )
}

// Messaging tier badge component
const MessagingTierBadge = ({ tier }: { tier?: string }) => {
  const getTierInfo = (tier?: string) => {
    switch (tier) {
      case 'TIER_4':
        return { label: 'Unlimited', color: 'bg-purple-100 text-purple-800 border-purple-200' }
      case 'TIER_3':
        return { label: '100K/day', color: 'bg-blue-100 text-blue-800 border-blue-200' }
      case 'TIER_2':
        return { label: '10K/day', color: 'bg-green-100 text-green-800 border-green-200' }
      case 'TIER_1':
      default:
        return { label: '2K/day', color: 'bg-gray-100 text-gray-800 border-gray-200' }
    }
  }

  const tierInfo = getTierInfo(tier)
  
  return (
    <Badge variant="outline" className={`${tierInfo.color} px-2 py-0.5 text-xs`}>
      <TrendingUp className="h-3 w-3 mr-1" />
      {tierInfo.label}
    </Badge>
  )
}

export default function OverviewPage() {
  const {
    appServices,
    loading: appServicesLoading,
    error: appServicesError,
    refetch,
    selectedAppService,
    setSelectedAppService,
  } = useAppServices();

  const {
    analytics,
    loading: analyticsLoading,
    error: analyticsError,
    refetch: refetchAnalytics
  } = useWhatsAppAnalytics(selectedAppService, 30); // Last 30 days

  const isLoading = appServicesLoading || analyticsLoading;
  const hasError = appServicesError || analyticsError;

  // Function to open Meta Business Dashboard
  const openMetaDashboard = () => {
    if (!selectedAppService?.whatsapp_business_account_id) {
      toast.error("No WhatsApp Business Account selected");
      return;
    }

    const metaDashboardUrl = `https://business.facebook.com/wa/manage/home/?waba_id=${selectedAppService.whatsapp_business_account_id}`;
    window.open(metaDashboardUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <TooltipProvider>
      <div className="flex h-screen">
        <div className="">
          <main className="p-6">
            <div className="grid gap-6">
              <div className="flex items-start justify-between">
                <h2 className="text-xl font-semibold">
                  WhatsApp Account Overview
                </h2>
              </div>

              <AppServiceCredentials
                appServices={appServices}
                selectedAppService={selectedAppService}
                onSelectAppService={setSelectedAppService}
                loading={appServicesLoading}
                error={appServicesError}
                onRefresh={refetch}
              />

              <div className="grid grid-cols-1 gap-6 md:grid-cols-[2fr_1fr]">
                <Card className="overflow-hidden">
                  <div className="flex items-center justify-between border-b p-4">
                    <h3 className="text-lg font-medium">
                      {selectedAppService?.name || "WhatsApp Business Account"}
                    </h3>
                    <div className="flex gap-2">
                      {selectedAppService && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={openMetaDashboard}
                          className="gap-2"
                        >
                          <ExternalLink className="h-4 w-4" />
                          Manage in Meta Dashboard
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="p-4">
                    <h4 className="mb-4 font-medium">Insights this month</h4>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                      <Card>
                        <CardContent className="flex flex-col gap-1 p-4">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">
                              All conversations
                            </span>
                            <Info className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <span className="text-2xl font-medium">
                            {isLoading ? (
                              <Skeleton className="h-8 w-16 rounded" />
                            ) : (
                              analytics?.totalConversations?.toLocaleString() || 0
                            )}
                          </span>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="flex flex-col gap-1 p-4">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">
                              Free tier conversations
                            </span>
                            <Info className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <span className="text-2xl font-medium">
                            {isLoading ? (
                              <Skeleton className="h-8 w-12 rounded" />
                            ) : (
                              analytics?.freeTierConversations?.toLocaleString() || 0
                            )}
                          </span>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="flex flex-col gap-1 p-4">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">
                              Approximate charges
                            </span>
                            <Info className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <span className="text-2xl font-medium">
                            {isLoading ? (
                              <Skeleton className="h-8 w-20 rounded" />
                            ) : (
                              `$${analytics?.approximateCharges?.toFixed(2) || "0.00"}`
                            )}
                          </span>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="mt-6">
                      <div className="mb-4 grid grid-cols-12 gap-4 text-sm font-medium text-muted-foreground">
                        <div className="col-span-3">Phone Number</div>
                        <div className="col-span-2">Display Name</div>
                        <div className="col-span-2">Quality</div>
                        <div className="col-span-2">Tier</div>
                        <div className="col-span-3">
                          <div className="flex items-center gap-1">
                            Business Conversations
                            <Tooltip>
                              <TooltipTrigger>
                                <Info className="h-3 w-3" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Business-initiated conversations in the current period</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        </div>
                      </div>

                      {isLoading ? (
                        <>
                          {[1, 2].map((index) => (
                            <div key={index} className="grid grid-cols-12 gap-4 border-t py-4">
                              <div className="col-span-3 flex items-center gap-2">
                                <Skeleton className="h-8 w-8 rounded-full" />
                                <div>
                                  <Skeleton className="h-4 w-32 mb-1" />
                                  <Skeleton className="h-3 w-20" />
                                </div>
                              </div>
                              <div className="col-span-2 flex items-center">
                                <Skeleton className="h-4 w-24" />
                              </div>
                              <div className="col-span-2 flex items-center">
                                <Skeleton className="h-6 w-16 rounded" />
                              </div>
                              <div className="col-span-2 flex items-center">
                                <Skeleton className="h-6 w-20 rounded" />
                              </div>
                              <div className="col-span-3 flex items-center">
                                <Skeleton className="h-4 w-32" />
                              </div>
                            </div>
                          ))}
                        </>
                      ) : analytics?.phoneNumberProfiles && analytics.phoneNumberProfiles.length > 0 ? (
                        analytics.phoneNumberProfiles.map((profile, index) => (
                          <div key={profile.id} className="grid grid-cols-12 gap-4 border-t py-4 items-center">
                            <div className="col-span-3 flex items-center gap-2">
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                                <svg
                                  width="20"
                                  height="20"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    d="M22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12Z"
                                    stroke="#0086ff"
                                    strokeWidth="2"
                                  />
                                </svg>
                              </div>
                              <div>
                                <div className="text-sm font-medium">
                                  {profile.display_phone_number}
                                </div>
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  {profile.code_verification_status === 'VERIFIED' && (
                                    <Shield className="h-3 w-3 text-green-600" />
                                  )}
                                  <span>{profile.verified_name || profile.country || 'Global'}</span>
                                </div>
                              </div>
                            </div>
                            <div className="col-span-2 flex items-center">
                              <span className="text-sm truncate">
                                {profile.display_name || profile.verified_name || '-'}
                              </span>
                            </div>
                            <div className="col-span-2 flex items-center">
                              <QualityRatingBadge rating={profile.quality_rating} />
                            </div>
                            <div className="col-span-2 flex items-center">
                              <MessagingTierBadge tier={profile.messaging_limit?.tier} />
                            </div>
                            <div className="col-span-3 flex items-center">
                              <div className="w-full">
                                <div className="text-sm mb-1">
                                  {profile.business_initiated_conversations?.toLocaleString() || 0} of{' '}
                                  {profile.messaging_limit?.max?.toLocaleString() || 250} used
                                </div>
                                <Progress
                                  value={
                                    profile.messaging_limit?.max
                                      ? Math.min(
                                          ((profile.business_initiated_conversations || 0) /
                                            profile.messaging_limit.max) *
                                            100,
                                          100
                                        )
                                      : 0
                                  }
                                  className="h-1.5"
                                />
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="border-t py-8 text-center text-muted-foreground">
                          <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">No phone number data available</p>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>

                <div className="flex flex-col gap-6">
                  <Card className="p-4">
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-medium">
                          Messaging Limits
                        </span>
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </div>
                      
                      {analytics?.phoneNumberProfiles?.[0] && (
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Current Tier:</span>
                            <MessagingTierBadge tier={analytics.phoneNumberProfiles[0].messaging_limit?.tier} />
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Daily Limit:</span>
                            <span className="font-medium">
                              {analytics.phoneNumberProfiles[0].messaging_limit?.max?.toLocaleString() || 250} conversations
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Quality Rating:</span>
                            <QualityRatingBadge rating={analytics.phoneNumberProfiles[0].quality_rating} />
                          </div>
                        </div>
                      )}

                      <div className="border-t pt-4">
                        <h4 className="mb-2 font-medium">Grow your business</h4>
                        <ol className="list-decimal pl-5 text-sm space-y-1">
                          <li>
                            Increase your daily limit by maintaining high quality ratings.
                          </li>
                          <li>
                            Verify your business to show your display name in chats.
                          </li>
                        </ol>
                      </div>

                      <div className="border-t pt-4">
                        <h4 className="mb-2 font-medium">
                          How to increase your limits:
                        </h4>

                        <Card className="mb-4 border p-4">
                          <div className="flex items-start gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100">
                              <svg
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M12 16V12M12 8H12.01M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z"
                                  stroke="#f59e0b"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <h5 className="font-medium">
                                  Improve message quality
                                </h5>
                                <Info className="h-4 w-4 text-muted-foreground" />
                              </div>
                             
                              <Button
                                variant="link"
                                className="mt-1 h-auto p-0 text-sm"
                                onClick={() =>
                                  window.open(
                                    "https://developers.facebook.com/docs/whatsapp/messaging-limits/",
                                    "_blank"
                                  )
                                }
                              >
                                Learn how to improve quality
                              </Button>
                            </div>
                          </div>
                        </Card>
                      </div>
                    </div>
                  </Card>

                  {/* Analytics Overview Cards */}
                  <Card className="p-4">
                    <h3 className="mb-4 text-lg font-medium">
                      Message Analytics
                    </h3>
                    {analytics ? (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">
                            Total Messages Sent
                          </span>
                          <span className="font-medium">
                            {analytics.totalSent?.toLocaleString() || 0}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">
                            Delivery Rate
                          </span>
                          <span className="font-medium">
                            {analytics.totalSent > 0
                              ? (
                                  (analytics.totalDelivered /
                                    analytics.totalSent) *
                                  100
                                ).toFixed(1)
                              : "0"}
                            %
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">
                            Free Tier Conversations
                          </span>
                          <span className="font-medium">
                            {analytics.freeTierConversations?.toLocaleString() ||
                              0}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">
                            Total Cost (USD)
                          </span>
                          <span className="font-medium">
                            ${analytics.approximateCharges?.toFixed(2) || "0.00"}
                          </span>
                        </div>
                      </div>
                    ) : isLoading ? (
                      <div className="space-y-3">
                        <Skeleton className="h-4 rounded" />
                        <Skeleton className="h-4 rounded" />
                        <Skeleton className="h-4 rounded" />
                        <Skeleton className="h-4 rounded" />
                      </div>
                    ) : (
                      <div className="text-center text-muted-foreground">
                        <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No analytics data available</p>
                      </div>
                    )}
                  </Card>

                  {/* Conversation Breakdown */}
                  {analytics?.conversationBreakdown &&
                    analytics.conversationBreakdown.length > 0 && (
                      <Card className="p-4">
                        <h3 className="mb-4 text-lg font-medium">
                          Conversation Types
                        </h3>
                        <div className="space-y-3">
                          {analytics.conversationBreakdown.map(
                            (breakdown, index) => (
                              <div
                                key={index}
                                className="flex items-center justify-between"
                              >
                                <div className="flex items-center gap-2">
                                  <div
                                    className={`w-3 h-3 rounded-full ${
                                      breakdown.category === "MARKETING"
                                        ? "bg-blue-500"
                                        : breakdown.category === "UTILITY"
                                          ? "bg-green-500"
                                          : breakdown.category ===
                                              "AUTHENTICATION"
                                            ? "bg-orange-500"
                                            : "bg-gray-500"
                                    }`}
                                  />
                                  <span className="text-sm font-medium">
                                    {breakdown.category.charAt(0) +
                                      breakdown.category.slice(1).toLowerCase()}
                                  </span>
                                </div>
                                <div className="text-right">
                                  <div className="font-medium">
                                    {breakdown.conversations?.toLocaleString() ||
                                      0}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    ${breakdown.cost?.toFixed(2) || "0.00"}
                                  </div>
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      </Card>
                    )}
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
}