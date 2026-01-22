import Image from "next/image";
import { Card } from "@/components/ui/card";

export function DashboardHero() {
  return (
    <Card className="relative overflow-hidden rounded-2xl color-black border-none p-0 width-full">
      {/* Image */}

      <Image
        src="/images/dashboard-hero.jpg"
        alt="Spices and ingredients"
        width={1600}
        height={900}
        priority
        className="h-[260px] w-full object-cover md:h-[400px]"
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/60" />

      {/* Quote */}
      <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
        <h1
          className="max-w-3xl text-2xl font-semibold leading-snug tracking-tight text-white md:text-4xl"
          
        >
          less clutter. better cooking.
        </h1>

        <p
          className="mt-3 text-sm text-white/80 md:text-base"
        >
          A simpler way to manage recipes, plan meals, and shop for ingredients
        </p>
      </div>
    </Card>
  );
}
