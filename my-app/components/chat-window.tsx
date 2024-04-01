import { AvatarImage, AvatarFallback, Avatar } from "@/components/ui/avatar";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useChat } from "ai/react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { ScrollArea } from "@/components/ui/scroll-area";
import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function ChatWindow() {
  const { messages, input, handleInputChange, handleSubmit } = useChat();
  const [reservationOpen, setReservationOpen] = useState(false);

  const openReservationModal = () => {
    setReservationOpen(true);
  };

  const closeReservationModal = () => {
    setReservationOpen(false);
  };

  const handleSubmitReservation = (e: any) => {
    e.preventDefault();
    // Handle reservation submission
    // You can implement your logic to handle the form submission here
    // Example: validate inputs, send reservation data to server, etc.
  };

  return (
    <div
      key="1"
      className="flex flex-col h-full max-w-md mx-auto bg-white rounded-lg shadow-lg"
    >
      <div className="flex items-center justify-between p-4 bg-[#007FFF] text-white rounded-t-lg">
        <div className="flex items-center space-x-2">
          <Avatar>
            <AvatarImage
              alt="Ellie's avatar"
              src="/Ellis.png?height=80&width=80"
            />
            <AvatarFallback></AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <p className="text-xs font-semibold">Elli</p>
          </div>
        </div>
      </div>
      <div className="flex flex-col items-start justify-between flex-1 p-2">
        <ScrollArea className="h-[calc(50vh-100px)]">
         
          {messages.map((m) => (
            <div
              key={m.id}
              className={`${
                m.role === "user"
                  ? "flex items-end space-x-2"
                  : "flex items-start justify-end space-x-2"
              } px-4 py-2 space-y-2`}
            >
              {m.role === "user" ? (
                <Avatar>
                  <AvatarImage alt="User" src="/user.jpg?height=30&width=30" />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
              ) : (
                <Avatar>
                  <AvatarImage
                    alt="Elli"
                    src="/Avatar.png?height=50&width=50"
                  />
                  <AvatarFallback>E</AvatarFallback>
                </Avatar>
              )}
              <div
                className={`max-w-xs px-4 py-2 text-sm text-gray-700 rounded-lg bg-[E5EEFF] text-gray p-3 rounded-lg ${
                  m.role === "user" ? "bg-gray-100" : "bg-[#E5EEFF]"
                }`}
              >
                {m.content}
              </div>
            </div>
          ))}
        </ScrollArea>
      </div>

      <form onSubmit={handleSubmitReservation}>{/* Reservation form */}</form>
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col justify-between p-1">
          <div className="flex items-center px-1 py-2 bg-white">
            <Input
              className="flex-grow w-full p-2 rounded shadow-sm"
              value={input}
              placeholder="How may I help you today?..."
              onChange={handleInputChange}
            />
            <Button type="submit" className="rounded p-2 ml-1">
              <SendIcon className="w-6 h-6" />
            </Button>
            
          </div>
        </div>
      </form>

      <div className="flex items-center justify-between px-4 py-2 bg-gray-100 rounded-b-lg">
        <Tabs defaultValue="account" className="w-[400px]">
          <TabsList className="grid w-full grid-cols-2">
            
            <TabsTrigger
              className="w-full bg-gray-900 text-white shadow-sm"
              onClick={openReservationModal}
              value="reservations"

            >
              Make A Reservation
            </TabsTrigger>
          </TabsList>
          <TabsContent value="messages"></TabsContent>
          <TabsContent value="reservations">
            {/* Reservation Modal */}
            {reservationOpen && (
              <div className="fixed top-0 left-0 w-full h-full bg-gray-800 bg-opacity-70 flex justify-center items-center">
                <Card className="w-[414px]">
                  <CardHeader>
                    <CardTitle>Make a Reservation</CardTitle>
                    <CardDescription>
                      Fill in this form to book our services.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form id="paymentForm" onSubmit={handleSubmitReservation}>
                      <div className="grid w-full items-center gap-4">
                        <div className="flex flex-col space-y-1.5">
                          {/* Reservation form fields */}
                          <Label htmlFor="name">First Name</Label>
                          <Input
                            type="text"
                            placeholder="First Name"
                            className="mb-2"
                            id="first-name"
                          />
                          <Label htmlFor="name">Last Name</Label>
                          <Input
                            type="text"
                            placeholder="Last Name"
                            className="mb-2"
                            id="last-name"
                          />
                          <Label htmlFor="email">Email Address</Label>
                          <Input
                            type="email"
                            placeholder="Email"
                            id="email-address" required
                            className="mb-2"
                          />
                          <Label htmlFor="email">Phone Number</Label>
                          <Input
                            type="tel"
                            placeholder="Phone Number"
                            className="mb-2"
                          />
                          <Label htmlFor="email">Number of People</Label>
                          <Input
                            type="number"
                            placeholder="Adults"
                            className="mb-2"
                          />
                          <Input
                            type="number"
                            placeholder="Children"
                            className="mb-2"
                          />
                        </div>
                        <div className="flex flex-col space-y-1.5">
                          <Label htmlFor="roomtypes">Type of Room</Label>
                          <Select>
                            <SelectTrigger id="roomtypes">
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent position="popper">
                              <SelectItem value="next">Standard</SelectItem>
                              <SelectItem value="sveltekit">Deluxe</SelectItem>
                              <SelectItem value="astro">Executive</SelectItem>
                              <SelectItem value="nuxt">
                                Presidential Suite
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <Label htmlFor="checkin">Check-in Date</Label>
                          <Input type="date" id="checkin" />
                          <Label htmlFor="checkout">Check-out Date</Label>
                          <Input type="date" id="checkout" />

                          <div className="form-group">
                            <label htmlFor="amount">Amount</label>
                            <Input type="tel" id="amount" required />
                          </div>
                        </div>
                      </div>
                    </form>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" onClick={closeReservationModal}>
                      Close
                    </Button>
                    <Button>Proceed</Button>
                  </CardFooter>
                </Card>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function ArrowLeftIcon(props: any) {
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
      <path d="m12 19-7-7 7-7" />
      <path d="M19 12H5" />
    </svg>
  );
}

function SendIcon(props: any) {
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
      <path d="m22 2-7 20-4-9-9-4Z" />
      <path d="M22 2 11 13" />
    </svg>
  );
}

