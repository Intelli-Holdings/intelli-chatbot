"use client"
import React from "react"
import { ChevronDown, Info, MessageSquare, RefreshCw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { AppSidebar } from "@/components/app-sidebar"
import { Progress } from "@/components/ui/progress"
import DashboardHeader from "@/components/dashboard-header"
import AppServiceCredentials from "@/components/app-service-credentials"
import { useAppServices } from "@/hooks/use-app-services"
import { useWhatsAppAnalytics } from "@/hooks/use-whatsapp-analytics"

// Country Flag Component
const CountryFlag: React.FC<{ countryCode: string; className?: string }> = ({ countryCode, className = "w-full h-full" }) => {
  const [FlagComponent, setFlagComponent] = React.useState<React.ComponentType<{ className?: string }> | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const loadFlag = async () => {
      setLoading(true);
      try {
        const flagModule = await import(`country-flag-icons/react/3x2/${countryCode.toUpperCase()}.js`);
        setFlagComponent(() => flagModule.default);
      } catch (error) {
        console.warn(`Failed to load flag for country: ${countryCode}`);
        setFlagComponent(null);
      } finally {
        setLoading(false);
      }
    };

    if (countryCode) {
      loadFlag();
    }
  }, [countryCode]);

  if (loading) {
    return (
      <div className={`${className} bg-gray-100 animate-pulse rounded`} />
    );
  }

  if (FlagComponent) {
    return <FlagComponent className={className} />;
  }

  // Fallback for unknown countries
  return (
    <div className={`${className} bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600`}>
      {countryCode.toUpperCase()}
    </div>
  );
};

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

  return (
    <div className="flex h-screen">     
      <div className="">
        <main className="p-6">
          <div className="grid gap-6">
            <div className="flex items-start justify-between">
              <h2 className="text-xl font-semibold">Whatsapp Account Overview</h2>
            </div>

            <AppServiceCredentials
              appServices={appServices}
              selectedAppService={selectedAppService}
              onSelectAppService={setSelectedAppService}
              loading={appServicesLoading}
              error={appServicesError}
              onRefresh={refetch}
            />

            {hasError && (
              <Card className="border-destructive">
                <CardContent className="p-4">
                  <div className="text-destructive text-sm">
                    {appServicesError || analyticsError}
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2"
                    onClick={() => {
                      refetch();
                      refetchAnalytics();
                    }}
                  >
                    Retry
                  </Button>
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-1 gap-6 md:grid-cols-[2fr_1fr]">
              <Card className="overflow-hidden">
                <div className="flex items-center justify-between border-b p-4">
                  <h3 className="text-lg font-medium">
                    {selectedAppService?.name || 'WhatsApp Business Account'}
                  </h3>
                  <div className="flex gap-2">
                   
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        refetch();
                        refetchAnalytics();
                      }}
                      disabled={isLoading}
                      className="h-8 w-8 p-0"
                    >
                      <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                    </Button>
                  </div>
                </div>

                <div className="p-4">
                  <h4 className="mb-4 font-medium">Insights this month</h4>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <Card>
                      <CardContent className="flex flex-col gap-1 p-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">All conversations</span>
                          <Info className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <span className="text-2xl font-medium">
                          {isLoading ? (
                            <div className="h-8 w-16 bg-gray-200 animate-pulse rounded"></div>
                          ) : (
                            analytics?.totalConversations || 0
                          )}
                        </span>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="flex flex-col gap-1 p-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Free tier conversations</span>
                          <Info className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <span className="text-2xl font-medium">
                          {isLoading ? (
                            <div className="h-8 w-12 bg-gray-200 animate-pulse rounded"></div>
                          ) : (
                            analytics?.freeTierConversations || 0
                          )}
                        </span>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="flex flex-col gap-1 p-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Approximate charges</span>
                          <Info className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <span className="text-2xl font-medium">
                          {isLoading ? (
                            <div className="h-8 w-20 bg-gray-200 animate-pulse rounded"></div>
                          ) : (
                            `$${analytics?.approximateCharges?.toFixed(2) || '0.00'}`
                          )}
                        </span>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="mt-6">
                    <div className="mb-2 grid grid-cols-3 gap-4">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Phone number</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Name</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Business-initiated conversations</span>
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>

                    {analytics?.phoneNumberLimits?.map((phoneLimit, index) => (
                      <div key={index} className="grid grid-cols-3 gap-4 border-t py-4">
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center  bg-blue-100">
                            <CountryFlag countryCode={phoneLimit.country} className="h-6 w-8" />
                          </div>
                          <div>
                            <div className="text-sm font-medium">{phoneLimit.phone_number}</div>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">                      
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <span>{phoneLimit.name}</span>
                        </div>
                        <div className="flex items-center">
                          <span>{phoneLimit.business_initiated_conversations} of {phoneLimit.limit} used</span>
                        </div>
                      </div>
                    )) || (
                      selectedAppService ? (
                        <div className="grid grid-cols-3 gap-4 border-t py-4">
                          <div className="flex items-center gap-2">
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
                              <div className="text-sm font-medium">{selectedAppService.phone_number}</div>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <span className="inline-block h-3 w-4 overflow-hidden rounded-sm">
                                  <CountryFlag countryCode="SN" />
                                </span>
                                Loading...
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center">
                            <span>{selectedAppService.name || 'Loading...'}</span>
                          </div>
                          <div className="flex items-center">
                            <span>{isLoading ? 'Loading...' : '0 of 250 used'}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="border-t py-4 text-center text-muted-foreground">
                          No phone number data available
                        </div>
                      )
                    )}
                  </div>
                </div>
              </Card>

              <div className="flex flex-col gap-6">
                <Card className="p-4">
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-medium">250 new conversations per day</span>
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground">Business-initiated conversations/phone number</p>

                    <div className="border-t pt-4">
                      <h4 className="mb-2 font-medium">Grow your business</h4>
                      <ol className="list-decimal pl-5 text-sm">
                        <li className="mb-2">
                          Get 1000+ daily business-initiated conversations to increase your customer reach.
                        </li>
                        <li>
                          Show your business display name in chats and notifications so your customers know it&apos;s you.
                        </li>
                      </ol>
                    </div>

                    <div className="border-t pt-4">
                      <h4 className="mb-2 font-medium">How to unlock your limits:</h4>

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
                              <h5 className="font-medium">Improve message quality</h5>
                              <Info className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {analytics?.totalConversations || 0} conversations started/30d
                            </p>
                            <Progress 
                              value={analytics ? Math.min((analytics.totalConversations / 1000) * 100, 100) : 0} 
                              className="mt-2 h-2" 
                            />
                            <Button 
                              variant="link" 
                              className="mt-1 h-auto p-0 text-sm"
                              onClick={() => window.open("https://developers.facebook.com/docs/whatsapp/messaging-limits/", "_blank")}
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
                  <h3 className="mb-4 text-lg font-medium">Message Analytics</h3>
                  {analytics ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Total Messages Sent</span>
                        <span className="font-medium">{analytics.totalSent?.toLocaleString() || 0}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Delivery Rate</span>
                        <span className="font-medium">
                          {analytics.totalSent > 0 
                            ? ((analytics.totalDelivered / analytics.totalSent) * 100).toFixed(1)
                            : '0'
                          }%
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Free Tier Conversations</span>
                        <span className="font-medium">{analytics.freeTierConversations?.toLocaleString() || 0}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Total Cost (USD)</span>
                        <span className="font-medium">${analytics.approximateCharges?.toFixed(2) || '0.00'}</span>
                      </div>
                    </div>
                  ) : isLoading ? (
                    <div className="space-y-3">
                      <div className="h-4 bg-muted animate-pulse rounded"></div>
                      <div className="h-4 bg-muted animate-pulse rounded"></div>
                      <div className="h-4 bg-muted animate-pulse rounded"></div>
                      <div className="h-4 bg-muted animate-pulse rounded"></div>
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground">
                      <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No analytics data available</p>
                    </div>
                  )}
                </Card>

                {/* Conversation Breakdown */}
                {analytics?.conversationBreakdown && analytics.conversationBreakdown.length > 0 && (
                  <Card className="p-4">
                    <h3 className="mb-4 text-lg font-medium">Conversation Types</h3>
                    <div className="space-y-3">
                      {analytics.conversationBreakdown.map((breakdown, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div 
                              className={`w-3 h-3 rounded-full ${
                                breakdown.category === 'MARKETING' ? 'bg-blue-500' :
                                breakdown.category === 'UTILITY' ? 'bg-green-500' :
                                breakdown.category === 'AUTHENTICATION' ? 'bg-orange-500' :
                                'bg-gray-500'
                              }`}
                            />
                            <span className="text-sm font-medium">
                              {breakdown.category.charAt(0) + breakdown.category.slice(1).toLowerCase()}
                            </span>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">{breakdown.conversations?.toLocaleString() || 0}</div>
                            <div className="text-xs text-muted-foreground">
                              ${breakdown.cost?.toFixed(2) || '0.00'}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
