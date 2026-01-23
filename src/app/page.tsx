"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

export default function Home() {
  const { isSignedIn, isLoaded } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.push("/dashboard");
    }
  }, [isLoaded, isSignedIn, router]);

  // Optional: loading or fallback UI
  if (!isLoaded) {
    return null;
  }

  return (
    <div>
      <h1>Welcome</h1>
      <Button>Get Started</Button>
    </div>
  );
}
