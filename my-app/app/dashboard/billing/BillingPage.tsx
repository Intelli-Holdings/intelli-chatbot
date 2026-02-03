"use client"
import { Button } from "@/components/ui/button";
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { PaymentMethod } from "@/components/payment-method";
import AddPaymentMethodModal from '@/components/modal/addpayment-modal';
import StripePaymentModal from '@/components/modal/stripe-payment-modal';
import CardWallet from '@/components/ui/card-wallet';
import { usePaymentCards } from '@/hooks/use-payment-cards';
import { toast } from 'sonner';
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
  const {
    cards,
    isLoading,
    error,
    addCard,
    removeCard,
    setDefaultCard,
  } = usePaymentCards();
  
  const [isStripeModalOpen, setIsStripeModalOpen] = useState(false);

  const handleAddPaymentMethod = async (paymentMethod: any) => {
    try {
      await addCard(paymentMethod, paymentMethod.isDefault);
      setIsStripeModalOpen(false);
      toast.success('Payment method added successfully!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to add payment method');
    }
  };

  const handleSetDefault = async (cardId: string) => {
    try {
      await setDefaultCard(cardId);
      toast.success('Default payment method updated!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update default payment method');
    }
  };

  const handleDeleteCard = async (cardId: string) => {
    try {
      await removeCard(cardId);
      toast.success('Payment method removed successfully!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to remove payment method');
    }
  };

  const handleViewDetails = (cardId: string) => {
    // Implement view details functionality
    toast.info('View details functionality coming soon!');
  };
   
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
                <TabsTrigger
                  className="border-blue-500 text-blue-600 font-medium"
                  value="invoices"
                >
                  Invoices/Receipts
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
                    <DropdownMenuItem>Successful</DropdownMenuItem>
                    <DropdownMenuItem>Failed</DropdownMenuItem>
                    <DropdownMenuItem>Pending</DropdownMenuItem>
                    <DropdownMenuItem>Refunded</DropdownMenuItem>
                    <DropdownMenuItem>Disputed</DropdownMenuItem>
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
                  <CardTitle className="flex items-center justify-between">
                    Payment Methods
                    <span className="text-sm font-normal text-gray-500">
                      {cards.length}/4 cards
                    </span>
                  </CardTitle>
                  <CardDescription>
                    Manage your payment methods. You can add up to 4 cards.
                  </CardDescription>
                </CardHeader>
                <div className="border-b border-gray-200"></div>
                <div className="mt-4 p-5">
                  <Button
                    onClick={() => setIsStripeModalOpen(true)}
                    disabled={isLoading || cards.length >= 4}
                    className="bg-blue-600 hover:bg-blue-800 text-white font-medium py-2 px-4 rounded-md"
                  >
                    + Add Payment Method {cards.length >= 4 && '(Limit Reached)'}
                  </Button>
                  {error && (
                    <div className="mt-2 text-sm text-red-600">
                      {error}
                    </div>
                  )}
                </div>
                <CardContent>
              
                  <CardWallet
                    cards={cards}
                    onSetDefault={handleSetDefault}
                    onDeleteCard={handleDeleteCard}
                    onViewDetails={handleViewDetails}
                  />
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
            
            <TabsContent value="invoices">
              <Card>
                <CardHeader className="px-7">
                  <CardTitle>Invoices & Receipts</CardTitle>
                  <CardDescription>
                    Download and manage your invoices and receipts.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table className="bg-gray-100 shadow-md center-items bg-gradient-to-r from-accent-500 text-gray-900 rounded-xl shadow-md">
                    <TableHeader className="mt-4 p-8 center-items bg-gradient-to-r from-accent-500 text-gray-900 ">
                      <TableRow>
                        <TableHead>Invoice #</TableHead>
                        <TableHead className="font-medium sm:table-cell">
                          Date
                        </TableHead>
                        <TableHead className="font-medium sm:table-cell">
                          Status
                        </TableHead>
                        <TableHead className="font-medium md:table-cell">
                          Amount
                        </TableHead>
                        <TableHead className="font-medium text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow className="bg-accent">
                        <TableCell>
                          <div className="font-medium">INV-2023-001</div>
                          <div className="hidden text-sm text-muted-foreground md:inline">
                            Pro Plan Monthly
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          2023-06-23
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <Badge className="text-xs" variant="secondary">
                            Paid
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          $250.00
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" size="sm">
                            <File className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <div className="font-medium">INV-2023-002</div>
                          <div className="hidden text-sm text-muted-foreground md:inline">
                            Business Plan Yearly
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          2023-06-24
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <Badge className="text-xs" variant="secondary">
                            Paid
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          $2,400.00
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" size="sm">
                            <File className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <div className="font-medium">INV-2023-003</div>
                          <div className="hidden text-sm text-muted-foreground md:inline">
                            Pro Plan Monthly
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          2023-07-23
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <Badge className="text-xs" variant="destructive">
                            Overdue
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          $250.00
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" size="sm">
                            <File className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
            
          </Tabs>
        </div>
      </main>
      
      {/* Stripe Payment Modal */}
      <StripePaymentModal
        isOpen={isStripeModalOpen}
        onClose={() => setIsStripeModalOpen(false)}
        onSuccess={handleAddPaymentMethod}
        loading={isLoading}
      />
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
