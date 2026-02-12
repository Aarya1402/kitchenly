import Image from "next/image";

import { Card } from "@/components/ui/card";

export function DashboardHero() {
  return (
    <Card className="group animate-in fade-in slide-in-from-bottom-4 relative w-full overflow-hidden rounded-3xl border-none p-0 duration-700">
      {/* Image */}
      <Image
        src="/images/dashboard-hero.jpg"
        alt="Spices and ingredients"
        width={1600}
        height={900}
        priority
        className="h-[300px] w-full object-cover transition-transform duration-700 group-hover:scale-105 md:h-[450px]"
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/30" />

      {/* Quote/Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
        <h1 className="max-w-4xl text-3xl leading-tight font-bold tracking-tighter text-white drop-shadow-md md:text-5xl lg:text-6xl">
          less clutter.{" "}
          <span className="text-primary-foreground">better cooking.</span>
        </h1>

        <p className="mt-4 max-w-2xl text-base font-medium text-white/90 drop-shadow-sm md:text-lg lg:text-xl">
          A simpler way to manage recipes, plan meals, and shop for ingredients
        </p>
      </div>
    </Card>
  );
}
