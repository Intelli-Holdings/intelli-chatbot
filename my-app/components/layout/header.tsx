"use client";
import ThemeToggle from "@/components/layout/ThemeToggle/theme-toggle";
import { cn } from "@/lib/utils";
import { MobileSidebar } from "./mobile-sidebar";
import { UserNav } from "./user-nav";
import Link from "next/link";
import useAuth from '@/lib/auth/useAuth'; // Update the import path
import Image from "next/image";
import { useUser } from "@clerk/nextjs";

interface User {
  photoURL: string | null;
  displayName: string | null;
  email: string | null;
  firstName: string | null; // Add the firstName property
  companyName: string | null; // Add the companyName property 
}

export default function Header() {

  const { isLoaded, isSignedIn, user } = useUser();

  if (!isLoaded || !isSignedIn) {
    return null;
  }

  const getGreeting = () => {
    const currentHour = new Date().getHours();
    if (currentHour < 12) {
      return 'Good morning';
    } else if (currentHour < 18) {
      return 'Good afternoon';
    } else {
      return 'Good evening';
    }
  };

  return (
    <div className="fixed top-0 left-0 right-0 supports-backdrop-blur:bg-background/60 border-b bg-background/95 backdrop-blur z-20">
      <nav className="h-14 flex items-center justify-between px-4">
        <Image alt="Intelli Concierge" className="h-16" src="/Intelli.svg" height={25} width={25} />
        <div>
          <h1 className="text-xl font-semibold">{getGreeting()} <span style={{ color: '#007fff' }}>{user.firstName}</span></h1>
        </div>
        <div className={cn("block lg:!hidden")}>
          <MobileSidebar />
        </div>
        <div className="flex items-center gap-2">
          <UserNav />
          <ThemeToggle />
        </div>
      </nav>
    </div>
  );
}

UserNav.displayName = 'Header';