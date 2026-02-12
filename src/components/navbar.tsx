"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
import { ThemeToggle } from "@/components/theme-toggle";

export function Navbar() {
  const pathname = usePathname();
  const { user, isLoaded, isSignedIn } = useUser();
  const router = useRouter();
  const isRecipesActive = pathname.startsWith("/recipes");
  const isListsActive = pathname.startsWith("/shopping-lists");
  const isDashboardActive = pathname === "/";

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        {/* Left: App name / logo */}
        <Link href="/" className="text-xl font-bold tracking-tight text-primary hover:opacity-90 transition-opacity">
          Kitchenly
        </Link>

        {/* Right */}
        {!isLoaded ? null : isSignedIn ? (
          <div className="flex items-center gap-4">
            <nav className="hidden md:flex items-center gap-1">
              <Button
                asChild
                variant="ghost"
                className={
                  isDashboardActive
                    ? "font-semibold bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary"
                    : "text-muted-foreground hover:text-primary hover:bg-primary/5"
                }
              >
                <Link href="/">Home</Link>
              </Button>
              {/* Recipes */}
              <Button
                asChild
                variant="ghost"
                className={
                  isRecipesActive
                    ? "font-semibold bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary"
                    : "text-muted-foreground hover:text-primary hover:bg-primary/5"
                }
              >
                <Link href="/recipes">Recipes</Link>
              </Button>

              {/* Lists */}
              <Button
                asChild
                variant="ghost"
                className={
                  isListsActive
                    ? "font-semibold bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary"
                    : "text-muted-foreground hover:text-primary hover:bg-primary/5"
                }
                data-tour="navbar-lists"
              >
                <Link href="/shopping-lists">Lists</Link>
              </Button>
            </nav>
            
            <div className="flex items-center gap-2">
              <ThemeToggle />
              {/* User menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full ring-offset-background hover:ring-2 hover:ring-ring hover:ring-offset-2 transition-all">
                    <Avatar className="h-9 w-9 border border-border">
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

                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="flex items-center gap-2 cursor-pointer">
                      <Settings className="h-4 w-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild>
                    <SignOutButton>
                      <button className="flex w-full items-center gap-2 cursor-pointer text-destructive focus:text-destructive">
                        <LogOut className="h-4 w-4" />
                        Logout
                      </button>
                    </SignOutButton>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        ) : (
          <Button onClick={() => router.push("/sign-in")}>Login</Button>
        )}
      </div>
    </header>
  );
}
