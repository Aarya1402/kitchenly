"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
  const pathname = usePathname();
  const { user, isLoaded, isSignedIn } = useUser();

  const isRecipesActive = pathname.startsWith("/my-recipes");
  const isListsActive = pathname.startsWith("/shopping-lists");
  const isDashboardActive = pathname === "/dashboard";

  return (
    <header className="border-b">
      <div className="mx-2 flex h-16 max-w-8xl items-center justify-between px-1">
        {/* Left: App name / logo */}
        <Link href="/dashboard" className="text-lg font-semibold">
          Kitchenly
        </Link>

        {/* Right */}
        {!isLoaded ? null : isSignedIn ? (
          <div className="flex items-center gap-2">
              <Button
              asChild
              variant="ghost"
              className={isDashboardActive? "font-bold bg-accent text-accent-foreground dark:bg-accent/50" : ""}
            >
              <Link href="/dashboard">Home</Link>
            </Button>
            {/* Recipes */}
            <Button
              asChild
              variant="ghost"
              className={isRecipesActive ? "font-bold bg-accent text-accent-foreground dark:bg-accent/50" : ""}
            >
              <Link href="/my-recipes">Recipes</Link>
            </Button>

            {/* Lists */}
            <Button
              asChild
              variant="ghost"
              className={isListsActive ? "font-bold bg-accent text-accent-foreground dark:bg-accent/50" : ""}
            >
              <Link href="/shopping-lists">Lists</Link>
            </Button>

            {/* User menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-8 w-8 rounded-full p-0"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={user.imageUrl}
                      alt={user.fullName ?? ""}
                    />
                    <AvatarFallback>
                      {user.firstName?.charAt(0) ?? "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem asChild>
                  <Link
                    href="/settings"
                    className="flex items-center gap-2"
                  >
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
          </div>
        ) : (
          <SignInButton mode="modal">
            <Button>Login</Button>
          </SignInButton>
        )}
      </div>
    </header>
  );
}
