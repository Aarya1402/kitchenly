"use client";

import { SignOutButton, useUser } from "@clerk/nextjs";
import gsap from "gsap";
import { LogOut, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useLayoutEffect,useRef } from "react";

import { ThemeToggle } from "@/components/theme-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Navbar() {
  const pathname = usePathname();
  const { user, isLoaded, isSignedIn } = useUser();
  const router = useRouter();
  const isRecipesActive = pathname.startsWith("/recipes");
  const isListsActive = pathname.startsWith("/shopping-lists");
  const isDashboardActive = pathname === "/";

  const navRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const timeline = gsap.timeline();

      timeline
        .from(".nav-logo", {
          x: -20,
          opacity: 0,
          duration: 0.5,
          ease: "power2.out",
        })
        .from(
          ".nav-item",
          {
            y: -10,
            opacity: 0,
            duration: 0.4,
            stagger: 0.1,
            ease: "power2.out",
          },
          "-=0.2"
        );
    }, navRef);

    return () => ctx.revert();
  }, []);

  return (
    <header
      ref={navRef}
      className="bg-background/80 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur-md"
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        {/* Left: App name / logo */}
        <Link
          href="/"
          className="nav-logo text-primary text-xl font-bold tracking-tight transition-opacity hover:opacity-90"
        >
          Kitchenly
        </Link>

        {/* Right */}
        {!isLoaded ? null : isSignedIn ? (
          <div className="flex items-center gap-4">
            <nav className="hidden items-center gap-1 md:flex">
              <Button
                asChild
                variant="ghost"
                className={
                  (isDashboardActive
                    ? "bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary font-semibold"
                    : "text-muted-foreground hover:text-primary hover:bg-primary/5") +
                  " nav-item"
                }
              >
                <Link href="/">Home</Link>
              </Button>
              {/* Recipes */}
              <Button
                asChild
                variant="ghost"
                className={
                  (isRecipesActive
                    ? "bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary font-semibold"
                    : "text-muted-foreground hover:text-primary hover:bg-primary/5") +
                  " nav-item"
                }
              >
                <Link href="/recipes">Recipes</Link>
              </Button>

              {/* Lists */}
              <Button
                asChild
                variant="ghost"
                className={
                  (isListsActive
                    ? "bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary font-semibold"
                    : "text-muted-foreground hover:text-primary hover:bg-primary/5") +
                  " nav-item"
                }
                data-tour="navbar-lists"
              >
                <Link href="/shopping-lists">Lists</Link>
              </Button>
            </nav>

            <div className="nav-item flex items-center gap-2">
              <ThemeToggle />
              {/* User menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="ring-offset-background hover:ring-ring relative h-9 w-9 rounded-full transition-all hover:ring-2 hover:ring-offset-2"
                  >
                    <Avatar className="border-border h-9 w-9 border">
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
                    <Link
                      href="/settings"
                      className="flex cursor-pointer items-center gap-2"
                    >
                      <Settings className="h-4 w-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild>
                    <SignOutButton>
                      <button className="text-destructive focus:text-destructive flex w-full cursor-pointer items-center gap-2">
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
