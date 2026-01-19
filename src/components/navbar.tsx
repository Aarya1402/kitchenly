"use client";

import Link from "next/link";
import { useUser, SignInButton, SignOutButton } from "@clerk/nextjs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, Settings } from "lucide-react";

export function Navbar() {
  const { user, isLoaded, isSignedIn } = useUser();

  return (
    <header className="border-b">
       <div className="mx-2 flex h-16 max-w-8xl items-center justify-between px-1">
        {/* Left: App name / logo */}
        <Link href="/dashboard" className="text-lg font-semibold">
          Kitchenly
        </Link>

        {/* Right: Auth actions */}
        {!isLoaded ? null : isSignedIn ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 rounded-full p-0">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.imageUrl} alt={user.fullName ?? ""} />
                  <AvatarFallback>
                    {user.firstName?.charAt(0) ?? "U"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem asChild>
                <Link href="/settings" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Settings
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem asChild>
                <SignOutButton>
                  <button className="flex w-full items-center gap-2">
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </SignOutButton>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <SignInButton mode="modal">
            <Button>Login</Button>
          </SignInButton>
        )}
      </div>
    </header>
  );
}
