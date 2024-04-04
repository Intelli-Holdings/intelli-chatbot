"use client"
import React from 'react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel } from '@/components/ui/dropdown-menu';
import { MoreVerticalIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFetchReservations } from '@/lib/fetch'; // Import custom hook for fetching reservations

interface Reservation {
  id: number;
  first_name: string;
  last_name: string;
  customer_email: string;
  customer_phone: string;
  number_of_adult_guests: number;
  number_of_child_guests: number;
  room_type: string;
  check_in_date: string;
  check_out_date: string;
  amount_paid: string;
  status: string;
}

const ReservationsTable = () => {
  const { reservations, isLoading, error } = useFetchReservations(); // Fetch reservations using custom hook

  if (isLoading) return <p>Loading...</p>; // Display loading indicator while fetching data
  if (error) return <p>Error: {error.message}</p>; // Display error message if fetching fails

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Customer Name</TableHead>
          <TableHead>Phone</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Amount Paid</TableHead>
          <TableHead>Room Type</TableHead>
          <TableHead>Checkin Date</TableHead>
          <TableHead>Checkout Date</TableHead>
          <TableHead>
            <span className="sr-only">Actions</span>
          </TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {reservations && reservations.map((reservation: Reservation) => (
          <TableRow key={reservation.id}>
            <TableCell>{`${reservation.first_name} ${reservation.last_name}`}</TableCell>
            <TableCell>{reservation.customer_phone}</TableCell>
            <TableCell>{reservation.customer_email}</TableCell>
            <TableCell>
              <Badge variant={reservation.status === 'accepted' ? 'secondary' : reservation.status === 'rejected' ? 'destructive' : 'default'}>
                {reservation.status}
              </Badge>
            </TableCell>
            <TableCell>{reservation.amount_paid}</TableCell>
            <TableCell>{reservation.room_type}</TableCell>
            <TableCell>{reservation.check_in_date}</TableCell>
            <TableCell>{reservation.check_out_date}</TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button aria-haspopup="true" size="icon" variant="default">
                    <MoreVerticalIcon className="h-3.5 w-3.5" />
                    <span className="sr-only">Toggle menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuItem>Accept</DropdownMenuItem>
                  <DropdownMenuItem>Reject</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default ReservationsTable;
