"use client"

import { Bar, BarChart, Cell, Pie, PieChart } from "recharts"
import { Package2, ShoppingCart, Users, Zap, Check, X, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useState } from "react"
import { Badge } from "@/components/ui/badge"


const weeklyData = [
  { day: "Mon", value: 240 },
  { day: "Tue", value: 280 },
  { day: "Wed", value: 180 },
  { day: "Thu", value: 140 },
  { day: "Fri", value: 260 },
  { day: "Sat", value: 160 },
  { day: "Sun", value: 220 },
]

const pieData = [
  { name: "Complete", value: 75 },
  { name: "Remaining", value: 25 },
]

const inventoryData = [
  { id: 1, name: "Product A", stock: 150, price: "$299", category: "Electronics" },
  { id: 2, name: "Product B", stock: 89, price: "$199", category: "Accessories" },
  { id: 3, name: "Product C", stock: 250, price: "$99", category: "Electronics" },
  { id: 4, name: "Product D", stock: 45, price: "$499", category: "Gadgets" },
]

const ordersData = [
  { id: "#12345", customer: "John Doe", status: "fulfilled", total: "$299", date: "2024-01-23" },
  { id: "#12346", customer: "Jane Smith", status: "pending", total: "$199", date: "2024-01-23" },
  { id: "#12347", customer: "Bob Johnson", status: "canceled", total: "$599", date: "2024-01-22" },
  { id: "#12348", customer: "Alice Brown", status: "fulfilled", total: "$399", date: "2024-01-22" },
]

const contactsData = [
  { id: 1, name: "John Doe", email: "john@example.com", phone: "+1 234 567 890", type: "Customer" },
  { id: 2, name: "Jane Smith", email: "jane@example.com", phone: "+1 234 567 891", type: "Supplier" },
  { id: 3, name: "Bob Johnson", email: "bob@example.com", phone: "+1 234 567 892", type: "Partner" },
]

const connectedApps = [
  { id: 1, name: "Slack", status: "Connected", lastSync: "2024-01-23" },
  { id: 2, name: "Google Analytics", status: "Connected", lastSync: "2024-01-23" },
  { id: 3, name: "Stripe", status: "Connected", lastSync: "2024-01-23" },
]

type TabType = "dashboard" | "inventory" | "orders" | "crm" | "apps";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<TabType>("dashboard")

  const renderTabContent = () => {
    switch (activeTab) {
      case "inventory":
        return (
          <Card className="border-b bg-gradient-to-b from-blue-50 to-background p-2 shadow-sm border rounded-xl border-indigo-200  ">
            <CardHeader>
              <CardTitle>Inventory Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Category</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inventoryData.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.stock}</TableCell>
                      <TableCell>{item.price}</TableCell>
                      <TableCell>{item.category}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )
      case "orders":
        return (
          <Card className="border-b bg-gradient-to-b from-blue-50 to-background p-2 shadow-sm border rounded-xl border-indigo-200  ">
            <CardHeader>
              <CardTitle>Orders Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ordersData.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>{order.id}</TableCell>
                      <TableCell>{order.customer}</TableCell>
                      <TableCell>
                        <Badge variant={
                          order.status === "fulfilled" ? "default" :
                          order.status === "pending" ? "secondary" : "destructive"
                        }>
                          {order.status === "fulfilled" && <Check className="w-3 h-3 mr-1" />}
                          {order.status === "pending" && <Clock className="w-3 h-3 mr-1" />}
                          {order.status === "canceled" && <X className="w-3 h-3 mr-1" />}
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{order.total}</TableCell>
                      <TableCell>{order.date}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )
      case "crm":
        return (
          <Card className="border-b bg-gradient-to-b from-blue-50 to-background p-2 shadow-sm border rounded-xl border-indigo-200  ">
            <CardHeader>
              <CardTitle>Contacts</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Type</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contactsData.map((contact) => (
                    <TableRow key={contact.id}>
                      <TableCell>{contact.name}</TableCell>
                      <TableCell>{contact.email}</TableCell>
                      <TableCell>{contact.phone}</TableCell>
                      <TableCell>{contact.type}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )
      case "apps":
        return (
          <Card className="border-b bg-gradient-to-b from-blue-50 to-background p-2 shadow-sm border rounded-xl border-indigo-200  ">
            <CardHeader>
              <CardTitle>Connected Applications</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>App Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Synced</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {connectedApps.map((app) => (
                    <TableRow key={app.id}>
                      <TableCell>{app.name}</TableCell>
                      <TableCell>
                        <Badge variant="default">
                          <Check className="w-3 h-3 mr-1" />
                          {app.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{app.lastSync}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )
      default:
        return (
          <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {/* Today's sales */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Today&apos;s sales
                  </CardTitle>
                  <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$4,485</div>
                  <div className="h-[80px]">
                    <BarChart width={200} height={80} data={weeklyData}>
                      <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </div>
                </CardContent>
              </Card>

              {/* Today's profit */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Today&apos;s profit
                  </CardTitle>
                  <Zap className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$1,485</div>
                  <div className="h-[80px] flex items-center justify-center">
                    <PieChart width={80} height={80}>
                      <Pie
                        data={pieData}
                        innerRadius={30}
                        outerRadius={40}
                        paddingAngle={0}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={index === 0 ? "#22c55e" : "#e5e7eb"}
                          />
                        ))}
                      </Pie>
                    </PieChart>
                  </div>
                </CardContent>
              </Card>

              {/* Weekly revenue */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Weekly revenue
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$124,682</div>
                  <div className="h-[80px]">
                    <BarChart width={200} height={80} data={weeklyData.slice(0, 3)}>
                      <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </div>
                </CardContent>
              </Card>

              {/* Weekly stock */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Weekly stock
                  </CardTitle>
                  <Package2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">8,697</div>
                  <div className="h-[80px]">
                    <BarChart width={200} height={80} data={weeklyData}>
                      <Bar dataKey="value" fill="#22c55e" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="mt-6 grid gap-6 md:grid-cols-2">
              <Card className="col-span-2">
                <CardHeader>
                  <CardTitle>Weekly Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <BarChart width={800} height={300} data={weeklyData}>
                    <Bar dataKey="value" fill="#22c55e" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </CardContent>
              </Card>
            </div>
          </>
        )
    }
  }

  return (
    <div className="flex ">
      {/* Main content */}
      <div className="flex-1">
        {/* Top navigation */}
        <div className="border-b bg-gradient-to-b from-blue-100 to-background p-1 shadow-sm border rounded-3xl border-indigo-200 width-auto">
          <div className="mx-auto flex max-w-screen-xl items-center justify-between">
            <div className="flex gap-2">
              {(["dashboard", "inventory", "orders", "crm", "apps"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`rounded-full px-4 py-2 border border-indigo-100 text-sm font-medium transition-colors ${
                    activeTab === tab
                      ? "bg-white shadow-sm"
                      : "hover:bg-white/50"
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
            <Input 
              type="search" 
              placeholder="Search" 
              className="w-auto rounded-full bg-white px-4 py-2 shadow-sm focus:outline-none focus:ring focus:ring-blue-200"
            />
            
          </div>
        </div>

        {/* Dashboard content */}
        <div className="p-6 ">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p className="text-sm text-muted-foreground">Your business control center</p>
          </div>

          {renderTabContent()}
        </div>
      </div>
    </div>
  )
}

