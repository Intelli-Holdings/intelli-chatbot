import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import { AvatarImage, AvatarFallback, Avatar } from "@/components/ui/avatar";
import { Sheet } from "@/components/ui/sheet";

export function ReservationsSheet() {
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
    <div className="flex flex-col h-full max-w-md mx-auto bg-white rounded-lg shadow-lg">    
      <div className="flex items-center justify-between p-4 bg-[#007FFF] text-white rounded-t-lg">
          
          
        </div>
      <div className="flex flex-col items-start justify-between flex-1 p-4">
        <ScrollArea className="h-[calc(40vh-100px)]">
          {/* Messages display */}
        </ScrollArea>
      </div>
      <form onSubmit={handleSubmitReservation}>
        {/* Reservation form */}
      </form>
      <div className="flex items-center justify-between px-4 py-2 bg-gray-100 rounded-b-lg">
        <Button
          className="text-blue-600 bg-transparent hover:bg-gray-200"
          onClick={openReservationModal}
        >
          <InboxIcon />
          Messages
        </Button>
        <div className="">
          <Button className="w-full shadow-sm" variant="outline" onClick={openReservationModal}>
            Make a Reservation
          </Button>
        </div>
      </div>
      {/* Reservation Modal */}
      {reservationOpen && (
        <div className="fixed top-0 left-0 w-full h-full bg-gray-800 bg-opacity-70 flex justify-center items-center">
          <div className="bg-white p-4 rounded-lg max-w-md overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Make a Reservation</h2>
            <form onSubmit={handleSubmitReservation}>
              {/* Reservation form fields */}
              <Input type="text" placeholder="Name" className="mb-2" />
              <Input type="email" placeholder="Email" className="mb-2" />
              <Input type="tel" placeholder="Phone Number" className="mb-2" />
              {/* Add more fields as needed */}
              <Button type="submit" className="bg-blue-600 text-white rounded-md py-2 px-4 mt-4">
                Book Now
              </Button>
            </form>
            <button
              onClick={closeReservationModal}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <DotsHorizontalIcon />
            </button>
          </div>
        </div>
      )}
    </div>
    
  );
}


function InboxIcon(props: any) {
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
        <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
        <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
      </svg>
    )
  }