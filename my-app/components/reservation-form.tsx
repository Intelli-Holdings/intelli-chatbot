import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
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

interface ReservationFormData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  adults: number;
  children: number;
  roomType: string;
  checkIn: string;
  checkOut: string;
}

export const ReservationForm = () => {
    const [reservationOpen, setReservationOpen] = useState(false);
  const [formData, setFormData] = useState<ReservationFormData>({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    adults: 0,
    children: 0,
    roomType: "",
    checkIn: "",
    checkOut: "",
  });

  const openReservationModal = () => {
    setReservationOpen(true);
  };

  const closeReservationModal = () => {
    setReservationOpen(false);
  };


  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: type === "number" ? parseInt(value, 10) || 0 : value,
    }));
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmitReservation = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(
        "https://intelli-python-backend.onrender.com/dashboard/reservations/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      if (response.ok) {
        console.log("Reservation successfully sent!");
      } else {
        console.error("Failed to send reservation:", response.statusText);
      }
    } catch (error) {
      console.error("An error occurred:", error);
    }
  };

  return (
    <Card className="w-[414px] mx-auto shadow-sm">
      <CardHeader>Reservation Form</CardHeader>
      <CardContent>
        <form onSubmit={handleSubmitReservation}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
              <Select>
                <SelectTrigger id="roomtypes">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent position="popper">
                  <SelectItem value="next">Standard</SelectItem>
                  <SelectItem value="sveltekit">Deluxe</SelectItem>
                  <SelectItem value="astro">Executive</SelectItem>
                  <SelectItem value="nuxt">Presidential Suite</SelectItem>
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
        <Button variant="outline" onClick={closeReservationModal}>Close</Button>
        <Button>Proceed</Button>
      </CardFooter>
    </Card>
  );
};
