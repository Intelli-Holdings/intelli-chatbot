"use client";
import { Navbar } from "@/components/navbar";
import {
  Button,} from "@/components/ui/button";
import {
  Card,
    CardTitle,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card"; 
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import Image from "next/image";

export default function WhatsAppBroadcastPage() {
  const [messages, setMessages] = useState("");
  const [users, setUsers] = useState("");

  const calculatePrice = () => {
    const messageCount = parseInt(messages) || 0;
    const userCount = parseInt(users) || 0;
    
    if (messageCount === 0) return "0.00";
    
    // Meta's per-conversation rate for Kenya (example)
    const metaRate = 0.0225;
    const metaCost = messageCount * metaRate;
    
    // Intelli message credits pricing
    let creditPackage = "";
    let monthlyFee = 0;
    
    if (messageCount <= 100000) {
      creditPackage = "100K Message Credits";
      monthlyFee = 30;
    } else if (messageCount <= 250000) {
      creditPackage = "250K Message Credits";
      monthlyFee = 40;
    } else if (messageCount <= 500000) {
      creditPackage = "500K Message Credits";
      monthlyFee = 53;
    } else {
      creditPackage = "1M+ Message Credits";
      monthlyFee = 71;
    }
    
    return {
      metaCost: metaCost.toFixed(2),
      monthlyFee: monthlyFee,
      creditPackage: creditPackage,
      total: (metaCost + monthlyFee).toFixed(2)
    };
  };

  const pricing = calculatePrice();

  return (
   <div className="min-h-screen py-12">
    <Navbar />
 
    <div className="container py-12 mx-auto px-4">
      {/* Meta Tech Provider Badge */}
      <div className="flex justify-center mb-8">
        <Image 
          src="/meta_techprovider_badge.webp" 
          alt="Meta Business Tech Provider Badge" 
          width={200}
          height={50}
          className="h-12 w-auto"
        />
      </div>

      {/* Hero Section */}
      <section className="text-center mb-16">
        <h1 className="text-4xl sm:text-6xl md:text-8xl font-extrabold mb-6">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-blue-500">
            WhatsApp Business
          </span>
          <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-green-500">
            Broadcasts
          </span>
        </h1>
        <p className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 mx-auto mb-8 max-w-4xl">
          Transform your business communication with our Meta-verified WhatsApp Broadcast.
          Reach millions, engage authentically, and drive conversions.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="https://intelli-app.com/register" target="_blank">
            <Button 
              size="lg" 
              className="text-base sm:text-lg md:text-xl font-bold py-4 sm:py-6 md:py-8 px-6 sm:px-8 bg-gradient-to-r from-green-400 to-blue-600 text-white rounded-xl shadow-lg 
              hover:bg-gradient-to-r hover:from-green-500 hover:to-blue-700 bg-left bg-[length:200%_200%] hover:bg-right 
              ring-1 ring-green-400 ring-offset-2 ring-opacity-60 transition-all duration-500 ease-in-out"
            >
              Get Started
            </Button>
          </Link>
        </div>
      </section>

      {/* WhatsApp Broadcasts Overview */}
      <section className="mb-16">
        <div className="flex justify-center mb-4">
          <Badge>Overview</Badge>
        </div>
        <h2 className="text-center text-5xl font-bold mb-10 text-gray-800">
          WhatsApp Broadcasts Overview
        </h2>
        <Card className="p-8 bg-gradient-to-r from-green-50 to-blue-50">
          <CardContent className="space-y-6">
            <div className="text-center mb-8">
              <p className="text-xl text-gray-700 leading-relaxed">
                WhatsApp Broadcasts allow organizations like yours to send high-volume, media-rich, personalized messages to large groups of users efficiently. 
                Perfect for reminders, announcements, updates, and program communications without messaging each person individually.
              </p>
              <div className="mt-6 p-4 bg-green-100 rounded-lg">
                <p className="text-lg font-semibold text-green-800">
                  📈 Up to 98% open rate compared to traditional channels like SMS and email
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">How It Works</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <p className="text-gray-700">Business-initiated conversations using approved templates</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <p className="text-gray-700">Messages appear as 1:1 conversations, keeping communication personal</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <p className="text-gray-700">Only sent to users who have opted in to receive your messages</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <p className="text-gray-700">Easy performance tracking and analytics</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Tier Upgrade Support</h3>
                <div className="bg-white p-4 rounded-lg">
                  <p className="text-gray-700 mb-3">
                    Each tier comes with specific criteria that must be met to unlock higher broadcast volumes, as determined by Meta.
                  </p>
                  <div className="bg-blue-50 p-3 rounded">
                    <p className="font-semibold text-blue-800">
                      🚀 Intelli provides dedicated support and guidance at every stage, helping your business reach the unlimited tier.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Why Choose Us Section */}
      <section className="mb-16">
        <div className="flex justify-center mb-4">
          <Badge>Performance</Badge>
        </div>
        <h2 className="text-center text-5xl font-bold mb-10 text-gray-800">
          Why Businesses Choose Our WhatsApp Solution
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center p-6">
            <h3 className="text-4xl font-bold text-green-600 mb-2">98%</h3>
            <p className="text-lg font-semibold mb-2">Open Rate</p>
            <p className="text-gray-600">Higher engagement than email or SMS</p>
          </div>
          <div className="text-center p-6">
            <h3 className="text-4xl font-bold text-blue-600 mb-2">Instant</h3>
            <p className="text-lg font-semibold mb-2">Delivery</p>
            <p className="text-gray-600">Real-time message delivery worldwide</p>
          </div>
          <div className="text-center p-6">
            <h3 className="text-4xl font-bold text-orange-600 mb-2">100%</h3>
            <p className="text-lg font-semibold mb-2">Compliant</p>
            <p className="text-gray-600">Meta-approved templates and policies</p>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="mb-16">
        <div className="flex justify-center mb-4">
          <Badge>Features</Badge>
        </div>
        <h2 className="text-center text-5xl font-bold mb-10 text-gray-800">
          Everything you need to succeed
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              title: "Mass Broadcasts",
              description: "Send promos, delivery notifications, and alerts to thousands of opted‑in customers.",
              gradient: "from-green-100 to-green-200"
            },
            {
              title: "Personalized Templates",
              description: "Dynamic content with variables, rich media, CTAs, and WhatsApp-approved templates.",
              gradient: "from-blue-100 to-blue-200"
            },
            {
              title: "Schedule & Automate",
              description: "Plan campaigns, segment audiences, and trigger workflows from our platform.",
              gradient: "from-purple-100 to-purple-200"
            },
            {
              title: "Compliance & Security",
              description: "Meta-authorized green-tick, policy compliance, and secure message delivery.",
              gradient: "from-orange-100 to-orange-200"
            },
            {
              title: "Unified Inbox",
              description: "Manage broadcasts and campaigns from one dashboard.",
              gradient: "from-pink-100 to-pink-200"
            },
            {
              title: "Rich Analytics",
              description: "Track deliveries, read rates, reply performance, and template metrics.",
              gradient: "from-indigo-100 to-indigo-200"
            }
          ].map((feature) => (
            <Card key={feature.title} className="p-6 hover:shadow-lg transition-all hover:scale-105">
              <CardHeader className="pb-4">
                <div className={`h-2 w-16 rounded-full bg-gradient-to-r ${feature.gradient} mb-4`}></div>
                <CardTitle className="text-xl mb-2">{feature.title}</CardTitle>
                <CardDescription className="text-gray-600">
                  {feature.description}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      {/* Pricing Calculator */}
      <section className="mb-16">
        <div className="flex justify-center mb-4">
          <Badge>Pricing</Badge>
        </div>
        <h2 className="text-center text-5xl font-bold mb-10 text-gray-800">
          Calculate your WhatsApp Business costs
        </h2>
        
        {/* Tier Information */}
        <div className=" mx-auto mb-8">
          <Card className="p-6 bg-gradient-to-r from-blue-50 to-green-50">
            <CardHeader>
              <CardTitle className="text-center text-2xl text-gray-800">WhatsApp Business API Tiers</CardTitle>
              <CardDescription className="text-center">Meta uses a tiered system for broadcast volume limits</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-white rounded-lg">
                  <h4 className="font-bold text-sm">Tier 1</h4>
                  <p className="text-xs text-gray-600">1,000/day</p>
                </div>
                <div className="text-center p-3 bg-white rounded-lg">
                  <h4 className="font-bold text-sm">Tier 2</h4>
                  <p className="text-xs text-gray-600">10,000/day</p>
                </div>
                <div className="text-center p-3 bg-white rounded-lg">
                  <h4 className="font-bold text-sm">Tier 3</h4>
                  <p className="text-xs text-gray-600">100,000/day</p>
                </div>
                <div className="text-center p-3 bg-white rounded-lg">
                  <h4 className="font-bold text-sm">Tier 4</h4>
                  <p className="text-xs text-gray-600">Unlimited</p>
                </div>
              </div>
              <p className="text-center text-sm text-gray-600 mt-4">
                All verified accounts start at Tier 1. Unverified accounts: 250 messages/day
              </p>
            </CardContent>
          </Card>
        </div>



        <Card className=" mx-auto p-8">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-gray-800">Whatsapp Broadcast Pricing Calculator</CardTitle>
          <CardDescription className="text-gray-600">
            Use this tool to estimate how much your WhatsApp Business costs will be. Enter your monthly message volume and unique recipients to calculate costs
          </CardDescription>
        </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="messages" className="text-lg font-semibold">Monthly Messages</Label>
                <Input
                  id="messages"
                  type="number"
                  value={messages}
                  onChange={(e) => setMessages(e.target.value)}
                  placeholder="Number of messages per month"
                  className="mt-2 text-lg p-4"
                />
              </div>
              <div>
                <Label htmlFor="users" className="text-lg font-semibold">Unique Recipients</Label>
                <Input
                  id="users"
                  type="number"
                  value={users}
                  onChange={(e) => setUsers(e.target.value)}
                  placeholder="Number of unique whatsapp users"
                  className="mt-2 text-lg p-4"
                />
              </div>
            </div>
            
            {typeof pricing === 'object' && (
              <div className="space-y-4">
                <div className="text-center p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-700 mb-1">Meta Conversation Fees</p>
                      <p className="text-2xl font-bold text-green-600">${pricing.metaCost}</p>
                      <p className="text-xs text-gray-600">@$0.0225 per conversation</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-700 mb-1">Intelli Platform Fee</p>
                      <p className="text-2xl font-bold text-blue-600">${pricing.monthlyFee}</p>
                      <p className="text-xs text-gray-600">{pricing.creditPackage}</p>
                    </div>
                  </div>
                  <div className="border-t pt-4">
                    <p className="text-lg text-gray-700 mb-2">Total Monthly Cost</p>
                    <p className="text-4xl font-bold text-gray-800">${pricing.total}</p>
                  </div>
                </div>
                
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-semibold text-yellow-800 mb-2">Setup & Tier Progression</h4>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>• One-time setup fee varies by required tier</li>
                    <li>• Intelli provides dedicated support for tier upgrades</li>
                    <li>• All verified accounts start at Tier 1 (1,000 messages/day)</li>
                    <li>• Billing for Meta fees handled directly by Meta via Business Account</li>
                  </ul>
                </div>
              </div>
            )}
            
            <div className="text-center">
              <Link href="https://intelli-app.com/register" target="_blank">
                <Button 
                  size="lg"
                  className="text-lg font-bold py-4 px-8 bg-gradient-to-r from-green-400 to-blue-600 text-white rounded-xl shadow-lg 
                  hover:bg-gradient-to-r hover:from-green-500 hover:to-blue-700 transition-all duration-500"
                >
                  Start Your Journey
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Marketing Benefits */}
      <section className="mb-16">
        <div className="flex justify-center mb-4">
          <Badge>Benefits</Badge>
        </div>
        <h2 className="text-center text-5xl font-bold mb-10 text-gray-800">
          Standout in your campaigns, and get results.
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="text-center p-6">
            <div className="h-1 w-12 bg-gradient-to-r from-green-400 to-blue-600 mx-auto mb-4"></div>
            <h3 className="text-2xl font-bold mb-2">5x Higher Conversions</h3>
            <p className="text-gray-600">Better conversion rates than traditional channels</p>
          </div>
          <div className="text-center p-6">
            <div className="h-1 w-12 bg-gradient-to-r from-blue-400 to-purple-600 mx-auto mb-4"></div>
            <h3 className="text-2xl font-bold mb-2">Meta Compliance</h3>
            <p className="text-gray-600">Pre-approved templates ensure delivery success</p>
          </div>
          <div className="text-center p-6">
            <div className="h-1 w-12 bg-gradient-to-r from-purple-400 to-pink-600 mx-auto mb-4"></div>
            <h3 className="text-2xl font-bold mb-2">Global Reach</h3>
            <p className="text-gray-600">Connect with 2B+ WhatsApp users worldwide</p>
          </div>
          <div className="text-center p-6">
            <div className="h-1 w-12 bg-gradient-to-r from-pink-400 to-orange-600 mx-auto mb-4"></div>
            <h3 className="text-2xl font-bold mb-2">Rich Analytics</h3>
            <p className="text-gray-600">Track every metric that matters for ROI</p>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="mb-16">
        <div className="flex justify-center mb-4">
          <Badge>Use Cases</Badge>
        </div>
        <h2 className="text-center text-5xl font-bold mb-10 text-gray-800">
          Ideal Use Cases by Business Type
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6 hover:shadow-lg transition-all hover:scale-105">
            <CardHeader className="pb-4">
              <div className="text-4xl mb-3">🧳</div>
              <CardTitle className="text-xl mb-2">Travel & Tours</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Travel packages offers (Lipa polepole)</li>
                <li>• Holiday wishes</li>
                <li>• Travel deal promos</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-all hover:scale-105">
            <CardHeader className="pb-4">
              <div className="text-4xl mb-3">🏫</div>
              <CardTitle className="text-xl mb-2">Education</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Enrollment updates</li>
                <li>• Application status</li>
                <li>• Fee reminders</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-all hover:scale-105">
            <CardHeader className="pb-4">
              <div className="text-4xl mb-3">💳</div>
              <CardTitle className="text-xl mb-2">Fintech & Lending</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Payment reminders</li>
                <li>• Document requests</li>
                <li>• Loan status notifications</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-all hover:scale-105">
            <CardHeader className="pb-4">
              <div className="text-4xl mb-3">🛍</div>
              <CardTitle className="text-xl mb-2">E-Commerce & Retail</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Abandoned cart follow-ups</li>
                <li>• Product launches</li>
                <li>• Order confirmations</li>
                <li>• Flash sale alerts</li>
              </ul>
            </CardContent>
          </Card>
        </div>
        
        <div className="text-center mt-8">
          <p className="text-lg text-gray-600 mb-4">
            Don&apos;t see your industry? WhatsApp Broadcasts work for any business that needs to communicate with customers at scale.
          </p>
          <Link href="https://calendly.com/intelli-demo/demo" target="_blank">
            <Button 
              size="lg"
              className="text-lg font-bold py-4 px-8 bg-gradient-to-r from-green-400 to-blue-600 text-white rounded-xl shadow-lg 
              hover:bg-gradient-to-r hover:from-green-500 hover:to-blue-700 transition-all duration-500"
            >
              Explore Your Use Case
            </Button>
          </Link>
        </div>
      </section>

      {/* CTA Section */}
      <section className="text-center">
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-12">
          <h2 className="text-4xl font-bold mb-6 text-gray-800">
            Ready to Run Successful Marketing Campaigns?
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Join businesses already using our Meta-verified WhatsApp solution.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="https://intelli-app.com/register" target="_blank">
              <Button 
                size="lg"
                className="text-base sm:text-lg md:text-xl font-bold py-4 sm:py-6 md:py-8 px-6 sm:px-8 bg-gradient-to-r from-green-400 to-blue-600 text-white rounded-xl shadow-lg 
                hover:bg-gradient-to-r hover:from-green-500 hover:to-blue-700 bg-left bg-[length:200%_200%] hover:bg-right 
                ring-1 ring-green-400 ring-offset-2 ring-opacity-60 transition-all duration-500 ease-in-out"
              >
                Start Free Trial
              </Button>
            </Link>
            <Link href="https://calendly.com/intelli-demo/demo" target="_blank">
              <Button size="lg" variant="ghost" className="text-base sm:text-lg md:text-xl font-bold py-4 sm:py-6 md:py-8 px-6 sm:px-8 bg-gradient-to-r from-green-400 to-green-600 text-white rounded-xl shadow-lg 
                transition-all duration-200 ease-in-out">
                Book a Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
   </div>    
  );
}
