"use client";
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { logout } from '@/lib/auth'; // Import the logout function
import { useRouter } from 'next/navigation'; // Import the useRouter hook
import useAuth from '@/lib/auth/useAuth'; // Import the useAuth hook

interface User {
  email: string;
  role: string | null;
  is_email_verified: boolean;
  company_name: string;
  username: string;
}

export const UserNav = React.memo(() => {
  const { user } = useAuth();
  const router = useRouter(); // Initialize the useRouter hook

  const handleLogout = () => {
    logout(); // Call the logout function
    router.push('/'); // Redirect to the desired page (e.g., the login page)
  };

  if (!user) {
    return (
      <div>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage
              src="/path/to/placeholder.png"
              alt="Placeholder Avatar"
            />
            <AvatarFallback>?</AvatarFallback>
          </Avatar>
        </Button>
      </div>
    );
  }

  // Destructure user object to prevent TypeScript errors
  const { username, email, company_name } = user;

  return (
    <div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
            
              <AvatarFallback>{username?.[0] ?? '?'}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">
                {username}
              </p>
              <p className="text-xs leading-none text-muted-foreground">
                {email}
              </p>
              <p className="text-xs leading-none text-muted-foreground"></p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem onSelect={() => openUserProfile()}>
              Profile
              <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
            </DropdownMenuItem>
            {/**
             * <DropdownMenuItem>
              Billing
              <DropdownMenuShortcut>⌘B</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem>
              Settings
              <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem>New Team</DropdownMenuItem>
             * 
             * 
             * */}
            
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout}>
            Log out
            <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
});

// Set display name for React DevTools
UserNav.displayName = 'UserNav';



