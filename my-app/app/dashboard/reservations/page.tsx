"use client";
import Link from "next/link";
import ReservationsTable from "@/app/dashboard/reservations/ReservationsTable";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Input } from "@/components/ui/input";
import { Search } from "@/components/search";
import Image from "next/image";
import {
  ChevronLeft,
  ChevronRight,
  Copy,
  CreditCard,
  MoreHorizontalIcon,
  MoreVerticalIcon,
  File,
  ListFilter,
  X,
  Check,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";

import React, { useEffect, useState } from "react";

interface Reservation {
  id: number;
  check_in_date: string;
  check_out_date: string;
  first_name: string;
  last_name: string;
  customer_email: string;
  amount_paid: string;
  customer_phone: string;
  number_of_adult_guests: number;
  number_of_child_guests: number;
  room_type: string;
  status: string;
  specia_requests: string | null;
}

export default function Page () {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('')

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const response = await fetch(
          "https://intelli-python-backend.onrender.com/dashboard/reservations/"
        );
        const data = await response.json();
        setReservations(data);
      } catch (error) {
        console.error("Error fetching reservations:", error);
      }
    };

    fetchReservations();
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleFilterChange = (status: string) => {
    setFilterStatus(status);
  };

  const handleStatusChange = async (id: number, newStatus: 'accepted' | 'rejected') => {
    try {
      const response = await fetch(`https://intelli-python-backend.onrender.com/dashboard/reservations/${id}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });
  
      if (response.ok) {
        const updatedReservations = reservations.map((reservation) =>
          reservation.id === id ? { ...reservation, status: newStatus } : reservation
        );
        setReservations(updatedReservations);
      } else {
        console.error('Error updating reservation status:', response.status);
      }
    } catch (error) {
      console.error('Error updating reservation status:', error);
    }
  };

  const filteredReservations = Array.isArray(reservations)
  ? reservations.filter((reservation) => {
      const fullName = `${reservation.first_name} ${reservation.last_name}`.toLowerCase();
      const searchQueryLower = searchQuery.toLowerCase();

      if (filterStatus && reservation.status !== filterStatus) {
        return false;
      }
      return (
        fullName.includes(searchQueryLower) ||
        reservation.customer_email.toLowerCase().includes(searchQueryLower) ||
        reservation.customer_phone.includes(searchQueryLower)
      );
    })
  : [];

  return (
    <div className="grid min-h-screen w-full">
       <div className="flex flex-col">
       <div className="border-b">
          <div className="flex h-16 items-center px-4">
            <Breadcrumb className="hidden md:flex">
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink>
                    <Link href="/dashboard">Dashboard</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href="dashboard/reservations">Reservations</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Recent Orders</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </div>
        <div className="grid gap-4 p-4 md:gap-8 md:p-6">
        <Card>
        <CardHeader>
              <CardTitle>Reservations</CardTitle>
              <CardDescription>
                Manage your reservations and sales in one place.
              </CardDescription>
              <div className="ml-auto flex items-center gap-2">
              <div className="relative ml-auto flex-1 md:grow-0">
          <Input
            type="search"
            placeholder="Search..."
            className="w-full p-4 rounded-lg pl-8 md:w-[200px] lg:w-[320px] shadow-md"
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>
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
            <DropdownMenuItem onSelect={() => handleFilterChange('pending')}>
              Pending
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => handleFilterChange('rejected')}>
              Rejected
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => handleFilterChange('confirmed')}>
              Confirmed
            </DropdownMenuItem>
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
            </CardHeader>
            <CardContent className="shadow-sm rounded-border-lg">
            <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Customer Name</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Room Type</TableHead>
            <TableHead>Check-in Date</TableHead>
            <TableHead>Check-out Date</TableHead>
            <TableHead>Action</TableHead>       
          </TableRow>
        </TableHeader>``
        <TableBody>
  {filteredReservations.map((reservation) => (
    <TableRow key={reservation.id}>
      <TableCell className="hidden sm:table-cell">{reservation.id}</TableCell>
      <TableCell className="font-medium">{`${reservation.first_name} ${reservation.last_name}`}</TableCell>
      <TableCell className="font-medium">{reservation.customer_phone}</TableCell>
      <TableCell className="font-medium">{reservation.customer_email}</TableCell>
      <TableCell>
        <Badge
          variant={
            reservation.status === 'pending'
              ? 'default'
              : reservation.status === 'rejected'
              ? 'destructive'
              : reservation.status === 'confirmed'
              ? 'secondary'
              : 'outline' // Added 'outline' as a valid variant option
          }
        >
          {reservation.status}
        </Badge>
      </TableCell>
      <TableCell>${reservation.amount_paid}</TableCell>
      <TableCell className="font-medium">{reservation.room_type}</TableCell>
      <TableCell className="hidden md:table-cell">
        {new Date(reservation.check_in_date).toLocaleString()}
      </TableCell>
      <TableCell className="hidden md:table-cell">
        {new Date(reservation.check_out_date).toLocaleString()}
      </TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button aria-haspopup="true" size="sm" variant="secondary">
              <MoreVerticalIcon className="h-3.5 w-3.5 " />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onSelect={() => handleStatusChange(reservation.id, 'accepted')}
              disabled={reservation.status !== 'pending'}
            >
              <Check className="h-5 w-5 p-1" />
              Accept
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() => handleStatusChange(reservation.id, 'rejected')}
              disabled={reservation.status !== 'pending'}
            >
              <X className="h-5 w-5 p-1" />
              Reject
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  ))}
</TableBody>
      </Table>
            </CardContent>
            <CardFooter>
              <div className="text-xs text-muted-foreground">
                Showing 1 to 10 of 100 entries
              </div>
            </CardFooter>
        </Card>
        

        </div>

      </div>
    </div>
  );
};

