"use client";
import { useState } from "react";
import { toast } from "react-toastify";
import { Textarea } from "@/components/ui/textarea";
import { createReservation, handleCreateReservation } from "@/lib/post";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

export const ReservationForm = () => {
  const [reservationOpen, setReservationOpen] = useState(false);

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

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const updatedFormData = {
      ...formData,
      [name]: type === "number" ? parseInt(value, 10) || 0 : value,
    };
  
    if (name === "checkIn" || name === "checkOut" || name === "roomType") {
      const days = calculateDays(updatedFormData.checkIn, updatedFormData.checkOut);
      const totalAmount = calculateTotalAmount(updatedFormData.roomType, days);
      updatedFormData.amount = totalAmount;
    }
  
    setFormData(updatedFormData);
  };

  const handleSubmitReservation = async (e: React.FormEvent) => {
    e.preventDefault();
  
    try {
      
      const response = await fetch(
        'https://intelli-python-backend.onrender.com/reservations',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        }
      );
      
      console.log('Backend response:', response);
  
      if (response.ok) {
        toast.success('Reservation successfully sent!'); // Show a success toast
        // You can add additional logic here, such as navigating to the checkout page
      } else {
        toast.error('Failed to send reservation'); // Show an error toast
      }
    } catch (error) {
      console.error('Error sending reservation:', error);}
      console.log('Sending reservation data:', formData);
  };

  return (
    <Card className="w-[500px] mx-auto shadow-sm">
      <CardHeader>
        <CardTitle>Make a Reservation</CardTitle>
        <CardDescription>
          Fill in this form to book our services.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmitReservation}>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-2">
            <div>
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
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
                onChange={handleInputChange}
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
                onChange={handleInputChange}
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
                onChange={handleInputChange}
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
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="roomType">Room Type</Label>
              <Select
                value={formData.roomType}
                onValueChange={(value) =>
                  setFormData((prevFormData) => ({
                    ...prevFormData,
                    roomType: value as RoomType,
                  }))
                }
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
                onChange={handleInputChange}
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
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                name="amount"
                value={formData.amount.toFixed(2)} // Display the amount with two decimal places
                readOnly // Make the input read-only
              />
            </div>
            <div>
              <Label htmlFor="amount">Any Special Requests</Label>
              <Textarea
                            id="specialRequests"
                            name="specialRequests"
                            value={formData.specialRequests}
                            onChange={handleInputChange}
                          />
            </div>
          </div>
          <CardFooter className="pt-5 justify-center w-full">
            <Button type="submit" onClick={handleSubmitReservation}>Submit Reservation</Button>
            
          </CardFooter>
        </form>
        <Button
              className=""
              variant="outline"
              onClick={closeReservationModal}
            >
              Close
            </Button>
      </CardContent>
    </Card>
  );
};
