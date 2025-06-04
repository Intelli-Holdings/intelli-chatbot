"use client"
import React from "react"
import { ChevronDown, Info } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { AppSidebar } from "@/components/app-sidebar"
import { Progress } from "@/components/ui/progress"
import DashboardHeader from "@/components/dashboard-header"

export default function OverviewPage() {
  return (
    <div className="flex h-screen">     
      <div className="">
        <header className="flex h-16 items-start justify-between border-b px-6">
           <DashboardHeader />
          <div className="flex items-center gap-2">
            
          </div>
        </header>

        <main className="p-6">
          <div className="grid gap-6">
            <div className="flex items-start justify-between">
              <h2 className="text-xl font-semibold">WhatsApp accounts</h2>
              <div className="flex items-center gap-4">
                <h2 className="text-xl font-semibold">Limits</h2>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-[2fr_1fr]">
              <Card className="overflow-hidden">
                <div className="flex items-center justify-between border-b p-4">
                  <h3 className="text-lg font-medium">Intelli</h3>
                  <div className="flex gap-2">
                    
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
                        <span className="text-2xl font-medium">43</span>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="flex flex-col gap-1 p-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Free tier conversations</span>
                          <Info className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <span className="text-2xl font-medium">5</span>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="flex flex-col gap-1 p-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Approximate charges</span>
                          <Info className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <span className="text-2xl font-medium">$0.34</span>
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
                          <div></div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <span className="inline-block h-3 w-4 overflow-hidden">
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
                                <path fill="#FFDA44" d="M0 85.337h512v341.326H0z" />
                                <path fill="#D80027" d="M0 85.337h170.663v341.326H0z" />
                                <path fill="#496E2D" d="M341.337 85.337H512v341.326H341.337z" />
                              </svg>
                            </span>
                            Senegal
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <span>Intelli-notifications</span>
                      </div>
                      <div className="flex items-center">
                        <span>of 250 used</span>
                      </div>
                    </div>
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
                            <p className="text-sm text-muted-foreground">13 conversations started/30d</p>
                            <Progress value={43} className="mt-2 h-2" />
                            <Button variant="link" className="mt-1 h-auto p-0 text-sm">
                              Learn how to improve quality
                            </Button>
                          </div>
                        </div>
                      </Card>

                      <div className="text-center text-sm font-medium">OR</div>

                      <Card className="mt-4 border p-4">
                        <div className="flex items-start gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">
                            <svg
                              width="20"
                              height="20"
                              viewBox="0 0 24 24"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                              <path
                                d="M12 8V16"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                              <path
                                d="M8 12H16"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <h5 className="font-medium">Business verification in progress</h5>
                            <Button variant="link" className="mt-1 h-auto p-0 text-sm">
                              View details
                            </Button>
                          </div>
                        </div>
                      </Card>
                    </div>
                  </div>
                </Card>

                <Card className="p-4">
                  <h3 className="mb-4 text-lg font-medium">What&apos;s new</h3>
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M13 10V3L4 14H11V21L20 10H13Z"
                          stroke="#10b981"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-medium">Template groups</h4>
                      <p className="text-sm text-muted-foreground">November 1, 2024</p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
