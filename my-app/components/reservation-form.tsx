import { useState } from "react";
import { PaystackButton } from "react-paystack";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
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
}

const roomRates = {
  standard: 195,
  executive: 220,
  apartment: 350,
};

const downPaymentPercentage = 0.25; // 25% down payment

export const ReservationForm = () => {
  const [amount, setAmount] = useState(0);
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
  });


  const calculateAmount = () => {
    const { roomType, checkIn, checkOut } = formData;

    if (!roomType || !checkIn || !checkOut) {
      return 0;
    }

    const startDate = new Date(checkIn);
    const endDate = new Date(checkOut);
    const nights =
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);

    const roomPrice = roomRates[roomType];
    const totalAmount = nights * roomPrice;
    const downPayment = totalAmount * downPaymentPercentage;

    return downPayment;
  };

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
        "https://intelli-python-backend.onrender.com/reservations/",
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
        // You can add additional logic here, such as navigating to the checkout page
      } else {
        console.error("Failed to send reservation:", response.statusText);
      }
    } catch (error) {
      console.error("An error occurred:", error);
    }
  };
  const publicKey = "PAYSTACK_PUBLIC_KEY"

  const [email, setEmail] = useState("")

  const [name, setName] = useState("")

  const [phone, setPhone] = useState("")

  return (
    <Card className="w-[414px] mx-auto shadow-sm">
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
              <div className="form-group">
                <label htmlFor="amount">Amount</label>
                <Input
                  id="amount"
                  name="amount"
                
                  
                />
              </div>
            </div>
          
          <CardFooter className="pt-5 justify-between">
          <Button type="submit">Submit Reservation</Button>
        <Button className="" variant="outline" onClick={closeReservationModal}>
          Close
        </Button>
      </CardFooter>
        </form>
      </CardContent>
    </Card>
  );
};
