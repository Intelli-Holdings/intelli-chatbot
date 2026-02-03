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
import { Check, X, AlertTriangle } from "lucide-react";
import Link from "next/link";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Image from "next/image";

export default function WhatsAppAPIPage() {
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
            API
          </span>
        </h1>
        <p className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 mx-auto mb-8 max-w-4xl">
          Which WhatsApp solution is best for your business? Let&apos;s help you decide.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="https://intelli-app.com/register" target="_blank">
            <Button 
              size="lg" 
              className="text-base sm:text-lg md:text-xl font-bold py-4 sm:py-6 md:py-8 px-6 sm:px-8 bg-gradient-to-r from-green-400 to-blue-600 text-white rounded-xl shadow-lg 
              hover:bg-gradient-to-r hover:from-green-500 hover:to-blue-700 bg-left bg-[length:200%_200%] hover:bg-right 
              ring-1 ring-green-400 ring-offset-2 ring-opacity-60 transition-all duration-500 ease-in-out"
            >
              Get WhatsApp API
            </Button>
          </Link>
        </div>
      </section>

      {/* Overview Section */}
      <section className="mb-16">
        <div className="flex justify-center mb-4">
          <Badge>Overview</Badge>
        </div>
        <h2 className="text-center text-5xl font-bold mb-10 text-gray-800">
          Understanding Your Options
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="p-6">
            <CardHeader>
              <CardTitle className="text-2xl text-green-600">WhatsApp Business App</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">
                A free, simple mobile app best suited for individuals or small businesses handling low message volumes. 
                You can reply to customers, set quick replies, and manage chats with a handful of users.
              </p>
              <div className="bg-green-50 p-3 rounded-lg">
                <p className="text-sm font-semibold text-green-800">Perfect for: Small businesses with basic needs</p>
              </div>
            </CardContent>
          </Card>

          <Card className="p-6">
            <CardHeader>
              <CardTitle className="text-2xl text-blue-600">WhatsApp Business API</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">
                A powerful, scalable solution built for growing businesses that need automation, 
                team access, and integration with other tools. Perfect for handling large volumes of customer conversations.
              </p>
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm font-semibold text-blue-800">Perfect for: Growing businesses needing scale</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div>
              <p className="font-semibold text-yellow-800">Important Note:</p>
              <p className="text-yellow-700">
                The WhatsApp API doesn&apos;t come with a built-in chat interface. That&apos;s why you need to connect it
                to a WhatsApp Tech Provider like Intelli to fully manage your messaging, automation, and analytics. We provide a dashboard to manage messages, campaigns, and performance metrics.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="mb-16">
        <div className="flex justify-center mb-4">
          <Badge>Comparison</Badge>
        </div>
        <h2 className="text-center text-5xl font-bold mb-10 text-gray-800">
          Quick Comparison
        </h2>
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-green-50 to-blue-50">
                <tr>
                  <th className="text-left p-4 font-bold text-gray-800">Feature</th>
                  <th className="text-center p-4 font-bold text-green-600">WhatsApp Business App</th>
                  <th className="text-center p-4 font-bold text-blue-600">WhatsApp Business API</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-4 font-semibold">Best for</td>
                  <td className="p-4 text-center">Small businesses</td>
                  <td className="p-4 text-center">Medium to large businesses</td>
                </tr>
                <tr className="border-b bg-gray-50">
                  <td className="p-4 font-semibold">Number of Users</td>
                  <td className="p-4 text-center">1 phone (single device)</td>
                  <td className="p-4 text-center">Unlimited</td>
                </tr>
                <tr className="border-b">
                  <td className="p-4 font-semibold">Broadcast Limit</td>
                  <td className="p-4 text-center">256 contacts per broadcast</td>
                  <td className="p-4 text-center">Unlimited (tier-based)</td>
                </tr>
                <tr className="border-b bg-gray-50">
                  <td className="p-4 font-semibold">Automation Capabilities</td>
                  <td className="p-4 text-center">Limited</td>
                  <td className="p-4 text-center">Advanced AI and automation</td>
                </tr>
                <tr className="border-b">
                  <td className="p-4 font-semibold">Third-party Integrations</td>
                  <td className="p-4 text-center"><X className="w-5 h-5 text-red-500 mx-auto" /></td>
                  <td className="p-4 text-center"><Check className="w-5 h-5 text-green-500 mx-auto" /></td>
                </tr>
                <tr className="border-b bg-gray-50">
                  <td className="p-4 font-semibold">Voice Call Support</td>
                  <td className="p-4 text-center"><Check className="w-5 h-5 text-green-500 mx-auto" /></td>
                  <td className="p-4 text-center">
                    <div className="text-center">
                      <Check className="w-5 h-5 text-green-500 mx-auto" />
                      <p className="text-xs text-gray-600 mt-1">Coming soon on Intelli</p>
                    </div>
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="p-4 font-semibold">Blue Tick Verification</td>
                  <td className="p-4 text-center">
                    <div className="text-center">
                      <Check className="w-5 h-5 text-green-500 mx-auto" />
                      <p className="text-xs text-gray-600 mt-1">Paid, easy to get</p>
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <div className="text-center">
                      <Check className="w-5 h-5 text-green-500 mx-auto" />
                      <p className="text-xs text-gray-600 mt-1">Free, requires Meta approval</p>
                    </div>
                  </td>
                </tr>
                <tr className="border-b bg-gray-50">
                  <td className="p-4 font-semibold">Reports/Analytics</td>
                  <td className="p-4 text-center"><X className="w-5 h-5 text-red-500 mx-auto" /></td>
                  <td className="p-4 text-center"><Check className="w-5 h-5 text-green-500 mx-auto" /></td>
                </tr>
                <tr>
                  <td className="p-4 font-semibold">Lead Management</td>
                  <td className="p-4 text-center">Basic tags</td>
                  <td className="p-4 text-center">Manage entire customer lifecycle</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
      </section>

      {/* Pricing Section */}
      <section className="mb-16">
        <div className="flex justify-center mb-4">
          <Badge>Pricing</Badge>
        </div>
        <h2 className="text-center text-5xl font-bold mb-10 text-gray-800">
          How much does WhatsApp Business API cost?
        </h2>
        <Card className="p-8 bg-gradient-to-r from-green-50 to-blue-50">
          <CardContent className="space-y-6">
            <p className="text-xl text-gray-700 text-center leading-relaxed">
              While all incoming messages and messages sent to customers within a 24-hour window are free, 
              there are two key costs to consider for outgoing messages.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg">
                <h3 className="text-2xl font-bold text-green-600 mb-4">Meta Fees</h3>
                <p className="text-gray-700 mb-3">
                  Based on the recipient&apos;s country, message type, and monthly volume.
                </p>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>• Marketing messages</p>
                  <p>• Utility messages</p>
                  <p>• Authentication messages</p>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg">
                <h3 className="text-2xl font-bold text-blue-600 mb-4">Tech Provider Fees</h3>
                <p className="text-gray-700 mb-3">
                  Setup fees depending on message tier volume and message credits.
                </p>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>• One-time setup fees</p>
                  <p>• Monthly message credit packages</p>
                  <p>• Platform management tools</p>
                </div>
              </div>
            </div>
            
            <div className="text-center">
              <Link href="/whatsapp-broadcast" className="inline-block">
                <Button 
                  size="lg"
                  className="text-lg font-bold py-4 px-8 bg-gradient-to-r from-green-400 to-blue-600 text-white rounded-xl shadow-lg 
                  hover:bg-gradient-to-r hover:from-green-500 hover:to-blue-700 transition-all duration-500"
                >
                  Calculate Your Costs
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* FAQ Section */}
      <section className="mb-16">
        <div className="flex justify-center mb-4">
          <Badge>FAQ</Badge>
        </div>
        <h2 className="text-center text-5xl font-bold mb-10 text-gray-800">
          WhatsApp Business API — Intelli FAQ
        </h2>
        <Card className=" mx-auto">
          <CardContent className="p-8">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger className="text-left">
                  1. What is the WhatsApp Business API?
                </AccordionTrigger>
                <AccordionContent>
                  It&apos;s a tool made for medium to large businesses to talk to customers on WhatsApp at scale. 
                  Unlike the WhatsApp Business App, it has no chat screen — you connect it to a platform like Intelli to manage everything.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2">
                <AccordionTrigger className="text-left">
                  2. Do I need a special setup to use it?
                </AccordionTrigger>
                <AccordionContent>
                  <p className="mb-3">Yes. You need:</p>
                  <ul className="space-y-1 ml-4">
                    <li>• A Meta Business account</li>
                    <li>• A phone number not linked to WhatsApp</li>
                    <li>• A Meta Tech provider like Intelli to connect and manage it</li>
                  </ul>
                  <p className="mt-3">We&apos;ll guide you through the setup.</p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3">
                <AccordionTrigger className="text-left">
                  3. Is WhatsApp API free?
                </AccordionTrigger>
                <AccordionContent>
                  <p className="mb-3">No, but there are no hidden fees with Intelli. You only pay:</p>
                  <ul className="space-y-1 ml-4">
                    <li>• Meta&apos;s messaging charges</li>
                    <li>• Intelli&apos;s monthly plan</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4">
                <AccordionTrigger className="text-left">
                  4. How many team members can use it?
                </AccordionTrigger>
                <AccordionContent>
                  With Intelli, you can start small and add more users anytime. No limits, just pay for what you need.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-5">
                <AccordionTrigger className="text-left">
                  5. Can I automate responses with Intelli?
                </AccordionTrigger>
                <AccordionContent>
                  Yes! Intelli lets you build smart AI chatbots, handle FAQs, collect info, and even assist live agents.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-6">
                <AccordionTrigger className="text-left">
                  6. Can Intelli connect with my CRM or tools like Google Sheets?
                </AccordionTrigger>
                <AccordionContent>
                  Absolutely. Intelli integrates with CRMs, Google Sheets, and more — all in a few clicks.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-7">
                <AccordionTrigger className="text-left">
                  7. Can I move from WhatsApp Business App to the API?
                </AccordionTrigger>
                <AccordionContent>
                  Yes, but you&apos;ll need a new phone number for now. Migration from an existing number will be possible soon.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-8">
                <AccordionTrigger className="text-left">
                  8. Will my contacts and messages move over too?
                </AccordionTrigger>
                <AccordionContent>
                  Not yet, but don&apos;t worry — you can import contacts into Intelli, and old chats will still be saved on your original device.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
      </section>

      {/* CTA Section */}
      <section className="text-center">
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-12">
          <h2 className="text-4xl font-bold mb-6 text-gray-800">
            Ready to Scale Your WhatsApp Communication?
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Join businesses already using WhatsApp Business API with Intelli&apos;s multi-channel platform.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="https://intelli-app.com/register" target="_blank">
              <Button 
                size="lg"
                className="text-base sm:text-lg md:text-xl font-bold py-4 sm:py-6 md:py-8 px-6 sm:px-8 bg-gradient-to-r from-green-400 to-blue-600 text-white rounded-xl shadow-lg 
                hover:bg-gradient-to-r hover:from-green-500 hover:to-blue-700 bg-left bg-[length:200%_200%] hover:bg-right 
                ring-1 ring-green-400 ring-offset-2 ring-opacity-60 transition-all duration-500 ease-in-out"
              >
                Get Started with API
              </Button>
            </Link>
            <Link href="https://calendly.com/intelli-demo/demo" target="_blank">
              <Button size="lg" variant="outline" className="text-base sm:text-lg font-bold py-4 sm:py-6 px-6 sm:px-8">
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
