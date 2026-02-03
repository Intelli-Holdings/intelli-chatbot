"use client";
import { cn } from "@/lib/utils";
import { MobileSidebar } from "./mobile-sidebar";
import { UserNav } from "./user-nav";
import Link from "next/link";
import Image from "next/image";
import { useUser } from "@clerk/nextjs";


interface User {
  email: string;
  role: string | null;
  is_email_verified: boolean;
  company_name: string;
  username: string;
}

export default function Header() {
  const { user } = useUser();
  const userName = user ? user.username : '';
  const companyName = user ? user.publicMetadata?.company_name : '';

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
        <Link href="/dashboard" className="flex items-center gap-2">
        <h2 className="text-lg font-semibold">Intelli</h2>
          <Image alt="Intelli Concierge" className="h-16" src="/Intelli.svg" height={25} width={25} />
        </Link>
        <div>
          <h1 className="text-xl font-semibold">{getGreeting()} {userName}</h1>
        </div>
        
        <div className={cn("block lg:!hidden")}>
          <MobileSidebar />
        </div>
        
        <div className="flex items-center gap-2">
          <UserNav />       
        </div>
      </nav>
    </div>
  );
}

UserNav.displayName = 'Header';