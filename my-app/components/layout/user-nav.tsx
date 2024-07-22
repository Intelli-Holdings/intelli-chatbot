"use client";

import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useUser } from "@clerk/nextjs";
import { useClerk } from "@clerk/nextjs";
import Link from "next/link";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface User {
  photoURL: string | null;
  displayName: string | null;
  email: string | null;
}

type SignOut = () => void;

export const UserNav = React.memo(() => {
  const { signOut, openUserProfile } = useClerk();
  const { isLoaded, isSignedIn, user } = useUser();

  const imageUrl = user?.imageUrl ?? "/path/to/placeholder.png";
const params = new URLSearchParams();
params.set("width", "32");
params.set("height", "32");
params.set("fit", "cover");

const optimizedImageUrl = `${imageUrl}?${params.toString()}`;

  if (!isLoaded || !isSignedIn) {
    return null;
  }

  const handleSignOut = () => {
    signOut();
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

  return (
    <div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
            <AvatarImage src={optimizedImageUrl} alt={user.firstName ?? "User"} />
              <AvatarFallback>{user.firstName?.[0] ?? "?"}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">
                {user.emailAddresses[0].emailAddress}
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
          <DropdownMenuItem onSelect={handleSignOut}>
            Log out
            <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
});

UserNav.displayName = "UserNav";
