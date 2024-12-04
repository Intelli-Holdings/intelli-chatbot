import { Button } from "@/components/ui/button";
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { PaymentMethod } from "@/components/payment-method";
import AddPaymentMethodModal from '@/components/modal/addpayment-modal';
import {
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
  DropdownMenuContent,
  DropdownMenu,
} from "@/components/ui/dropdown-menu";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";

import {
  ChevronLeft,
  ChevronRight,
  Copy,
  CreditCard,
  File,
  Home,
  LineChart,
  ListFilter,
  MoreVertical,
  Package,
  Package2,
  PanelLeft,
  Search,
  Settings,
  ShoppingCart,
  Truck,
  Users2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Icons } from "@/components/icons";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function BillingPage() {
   
  return (
    <div className="grid w-full ">
        
      <main className="flex-1 bg-white p-6 ml-4">
        <h1 className="text-2xl font-semibold mb-4">Billing</h1>
        <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
          <Tabs defaultValue="payment">
            <div className="flex items-center">
              <TabsList className="-mb-px flex space-x-2">
                <TabsTrigger
                  className="border-blue-500 text-blue-600 font-medium"
                  value="payment"
                >
                  Payment Methods
                </TabsTrigger>
                <TabsTrigger
                  className="border-blue-500 text-blue-600 font-medium"
                  value="history"
                >
                  Billing History
                </TabsTrigger>
              </TabsList>
              <div className="ml-auto flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 gap-1 text-sm"
                    >
                      <ListFilter className="h-3.5 w-3.5" />
                      <span className="sr-only sm:not-sr-only">Filter</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Filter by</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem >Fulfilled</DropdownMenuItem>
                    <DropdownMenuItem>Declined</DropdownMenuItem>
                    <DropdownMenuItem>Refunded</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 gap-1 text-sm"
                >
                  <File className="h-3.5 w-3.5" />
                  <span className="sr-only sm:not-sr-only">Export</span>
                </Button>
              </div>
            </div>
            <TabsContent value="payment">
              <Card>
                <CardHeader className="px-7">
                  <CardTitle>Payment Methods</CardTitle>
                  <CardDescription>
                    Manage your payment methods.
                  </CardDescription>
                </CardHeader>
                <div className="border-b border-gray-200"></div>
                <div className="mt-4 p-5">
                <Button
       
        className="bg-blue-600 hover:bg-blue-800 text-white font-medium py-2 px-4 rounded-md"
      >
        + Add Payment Method
      </Button>
      </div>
                <CardContent>             
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="">
                      <Card className="mt-4 p-8 center-items max-w-sm bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-md">
                        <div className="flex justify-between items-center mb-4">
                          <CreditCardIcon className="text-white" />
                          <div className="text-sm text-white">
                            VALID TILL 05/29
                          </div>
                        </div>
                        <div className="text-white">
                          <div className="text-2xl font-medium">
                            XXXX - XXXX - XXXX - 0001
                          </div>
                          <div className="mt-2 text-sm">NAME</div>
                          <div className="text-sm font-medium">
                            CARD HOLDER NAME
                          </div>
                        </div>
                      </Card>
                    </div>
                    
                    <Card>
                      <CardHeader className="px-6">
                        <CardTitle>PayPal</CardTitle>
                        <CardDescription></CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-muted-foreground">
                            Connected
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="history">
              <Card>
                <CardHeader className="px-7">
                  <CardTitle>Billing History</CardTitle>
                  <CardDescription>
                    Your recent subscription and payments history.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table className="bg-gray-100 shadow-md center-items bg-gradient-to-r from-accent-500 text-gray-900 rounded-xl shadow-md">
                    <TableHeader className="mt-4 p-8 center-items bg-gradient-to-r from-accent-500 text-gray-900 ">
                      <TableRow>
                        <TableHead>Customer Name</TableHead>
                        <TableHead className="font-medium sm:table-cell">
                          Type
                        </TableHead>
                        <TableHead className="font-medium sm:table-cell">
                          Status
                        </TableHead>
                        <TableHead className="font-medium md:table-cell">
                          Date
                        </TableHead>
                        <TableHead className="font-medium text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow className="bg-accent">
                        <TableCell>
                          <div className="font-medium">Liam Johnson</div>
                          <div className="hidden text-sm text-muted-foreground md:inline">
                            liam@example.com
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          Sale
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <Badge className="text-xs" variant="secondary">
                            Successful
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          2023-06-23
                        </TableCell>
                        <TableCell className="text-right">$250.00</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <div className="font-medium">Olivia Smith</div>
                          <div className="hidden text-sm text-muted-foreground md:inline">
                            olivia@example.com
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          Refund
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <Badge className="text-xs" variant="destructive">
                            Failed
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          2023-06-24
                        </TableCell>
                        <TableCell className="text-right">$150.00</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <div className="font-medium">Liam Johnson</div>
                          <div className="hidden text-sm text-muted-foreground md:inline">
                            liam@example.com
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          Sale
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <Badge className="text-xs" variant="default">
                            Normal
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          2023-06-23
                        </TableCell>
                        <TableCell className="text-right">$250.00</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <div className="font-medium">Noah Williams</div>
                          <div className="hidden text-sm text-muted-foreground md:inline">
                            noah@example.com
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          Subscription
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <Badge className="text-xs" variant="secondary">
                            Successful
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          2023-06-25
                        </TableCell>
                        <TableCell className="text-right">$350.00</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <div className="font-medium">Emma Brown</div>
                          <div className="hidden text-sm text-muted-foreground md:inline">
                            emma@example.com
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          Sale
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <Badge className="text-xs" variant="secondary">
                            Successful
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          2023-06-26
                        </TableCell>
                        <TableCell className="text-right">$450.00</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
            
          </Tabs>
        </div>
      </main>
    </div>
  );
}

function CreditCardIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="14" x="2" y="5" rx="2" />
      <line x1="2" x2="22" y1="10" y2="10" />
    </svg>
  );
}
