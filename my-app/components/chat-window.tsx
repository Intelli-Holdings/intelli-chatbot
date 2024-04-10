"use client";
import { AvatarImage, AvatarFallback, Avatar } from "@/components/ui/avatar";
import { useFormState, useFormStatus } from 'react-dom';
import { createReservation, handleCreateReservation } from '@/lib/post';
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useChat } from "ai/react";
import { Input } from "@/components/ui/input";
import { toast } from 'sonner';
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";


import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Icons } from "@/components/icons";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tooltip } from "@/components/ui/tooltip";

type RoomType = "standard" | "executive" | "apartment";

interface ReservationFormData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  adults: number;
  children: number;
  roomType: RoomType;
  checkIn: string;
  checkOut: string;
  amount: number; 
  specialRequests: string;
}

const roomRates = {
  standard: 195,
  executive: 220,
  apartment: 350,
};

const downPaymentPercentage = 0.25; // 25% down payment

const calculateTotalAmount = (roomType: RoomType, days: number) => {
  const roomRate = roomRates[roomType];
  const totalRoomCost = roomRate * days;
  const downPayment = totalRoomCost * downPaymentPercentage;
  const totalAmount = totalRoomCost + downPayment;
  return totalAmount;
};


export function ChatWindow() {
  const { messages, input, handleInputChange, handleSubmit } = useChat();
  const [reservationOpen, setReservationOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // A
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<ReservationFormData>({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    adults: 0,
    children: 0,
    roomType: "standard",
    checkIn: "",
    checkOut: "",
    amount: 0,
    specialRequests: "",
  });

  const calculateDays = (checkIn: string, checkOut: string): number => {
    const oneDay = 24 * 60 * 60 * 1000; // Hours * Minutes * Seconds * Milliseconds
    const firstDate = new Date(checkIn);
    const secondDate = new Date(checkOut);
  
    return Math.round(Math.abs((firstDate.getTime() - secondDate.getTime()) / oneDay));
  };

  const closeReservationModal = () => {
    setReservationOpen(false);
  };
  const openReservationModal = () => {
    setReservationOpen(true);
  };


  const handleReservationInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { type, value, name } = e.target;
  
    const updatedFormData = {
      ...formData,
      [name]: type === "number" ? parseInt(value, 10) || 0 : value,
    };
  
    if (name === "checkIn" || name === "checkOut") {
      const days = calculateDays(updatedFormData.checkIn, updatedFormData.checkOut);
      const totalAmount = calculateTotalAmount(formData.roomType, days);
      updatedFormData.amount = totalAmount;
    }
  
    setFormData(updatedFormData);
  };
  
  const handleRoomTypeChange = (value: RoomType) => {
    setFormData((prevFormData) => {
      const days = calculateDays(prevFormData.checkIn, prevFormData.checkOut);
      const totalAmount = calculateTotalAmount(value, days);
      return {
        ...prevFormData,
        roomType: value,
        amount: totalAmount,
      };
    });
  };

  const [state, formAction] = useFormState(handleCreateReservation, { success: false });
  const { pending } = useFormStatus();

  const handleSubmitReservation = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (formData.firstName && formData.lastName && formData.email && formData.phoneNumber && formData.adults && formData.children && formData.checkIn && formData.checkOut && formData.amount && formData.specialRequests && formData.roomType){
      const formData = new FormData(e.currentTarget);
      formAction(formData);
      try {
          setIsLoading(true); // Set isLoading to true before submitting the form

          const { success } = await createReservation(formData);

          if (success) {
              setHasSubmitted(true);
              toast.success('Success, you have made a reservation');
          } else {
              toast.error('Failed to make a reservation');
          }
      } catch (error) {
          console.error('Error making a reservation:', error);
          setError('An error occurred while making a reservation');
      } finally {
          setIsLoading(false); // Set isLoading to false after form submission is complete
      }
  } else {
      setError('Please fill in all required fields');
      showTooltip();
  }
  };

  const showTooltip = () => {
    return (
        <Tooltip>
            <span>Please fill in required fields</span>
        </Tooltip>
    );
};

  if (hasSubmitted) {
    return (
        <div>
            <span>Thanks for making a reservation! We will be in touch shortly.</span>
        </div>
    );
} else if (error) {
    return (
        <div>
            <span>{toast.error('Ooops, an error occurred while making your reservation')}</span>
        </div>
    );
}

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
          <div>
          <Card className="shadow-lg border-none">
              <CardContent>
                <CardHeader>
                  <CardTitle>Welcome to Elli</CardTitle>
                  <CardDescription>
                    Elli is an AI-powered assistant that can be trained to answer inquiries about your hotel, make reservations, and provide information about your hotel. Elli is available 24/7.
                  </CardDescription>
                </CardHeader>
                    <div className="max-w-xs px-4 py-2 text-sm text-gray-700 rounded-lg bg-[E5EEFF] text-gray p-3 rounded-lg">
                      Hi👋, I am Elli your front desk assistant.
                    </div>
            </CardContent>
            </Card>
          </div>
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

      <form onSubmit={handleSubmitReservation} action={formAction}>
        {/* Reservation form */}
      </form>
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
                <Card className="w-[500px] mx-auto shadow-sm">
                  <CardHeader>
                    <CardTitle>Make a Reservation</CardTitle>
                    <CardDescription>
                      Fill in this form to book our services.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmitReservation} action={formAction}>
                      <div className="grid grid-cols-2 gap-2 md:grid-cols-2">
                        <div>
                          <Label htmlFor="firstName">First Name</Label>
                          <Input
                            id="firstName"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleReservationInputChange}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="lastName">Last Name</Label>
                          <Input
                            id="lastName"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleReservationInputChange}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleReservationInputChange}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="phoneNumber">Phone Number</Label>
                          <Input
                            id="phoneNumber"
                            name="phoneNumber"
                            type="tel"
                            value={formData.phoneNumber}
                            onChange={handleReservationInputChange}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="adults">Adults</Label>
                          <Input
                            id="adults"
                            name="adults"
                            type="number"
                            value={formData.adults}
                            onChange={handleReservationInputChange}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="children">Children</Label>
                          <Input
                            id="children"
                            name="children"
                            type="number"
                            value={formData.children}
                            onChange={handleReservationInputChange}
                            required
                          />
                        </div>
                        <div>
  <Label htmlFor="roomType">Room Type</Label>
  <Select
  name="roomType"
  // @ts-ignore
  type="string"
    value={formData.roomType} onValueChange={handleRoomTypeChange}
  >
    <SelectTrigger>
      <SelectValue placeholder="Select a room type" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="standard">Standard</SelectItem>
      <SelectItem value="executive">Executive</SelectItem>
      <SelectItem value="apartment">Apartment</SelectItem>
    </SelectContent>
  </Select>
</div>
                        <div>
                          <Label htmlFor="checkIn">Check-in Date</Label>
                          <Input
                            id="checkIn"
                            name="checkIn"
                            type="date"
                            value={formData.checkIn}
                            onChange={handleReservationInputChange}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="checkOut">Check-out Date</Label>
                          <Input
                            id="checkOut"
                            name="checkOut"
                            type="date"
                            value={formData.checkOut}
                            onChange={handleReservationInputChange}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="amount">Amount</Label>
                          <Input
                            id="amount"
                            name="amount"
                            value={formData.amount.toLocaleString("en-GH", {
                              style: "currency",
                              currency: "GHS",
                            })}
                            readOnly
                          />
                        </div>
                        <div>
                          <Label htmlFor="specialRequests">Any Special Requests</Label>
                          <Input
                            id="specialRequests"
                            name="specialRequests"
                            type="string"
                            value={formData.specialRequests}
                            onChange={handleReservationInputChange}
                            
                          />
                        </div>
                      </div>
                      <CardFooter className="pt-5 justify-center w-full">
                        <Button type="submit" disabled={pending}>
                          {pending ? "Submitting..." : "Submit Reservation"}
                        </Button>
                      </CardFooter>
                    </form>
                    <p aria-live="polite" className="sr-only">
                      {state?.success
                        ? "Reservation submitted successfully!"
                        : ""}
                    </p>
                    <Button
                      className=""
                      variant="outline"
                      onClick={closeReservationModal}
                    >
                      Close
                    </Button>
                  </CardContent>
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