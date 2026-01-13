"use client";


import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

export default function Home() {

const { user, isSignedIn } = useUser();

  return (
    <div className="p-6">
      hey
    </div>
  );
}
