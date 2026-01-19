import { DashboardHero } from "@/components/dashboard-hero";

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-9xl space-y-10 px-6 py-6">
      {/* Search bar (top) */}
      {/* <DashboardSearch /> */}

      {/* Hero */}
      <DashboardHero />

      {/* Carousel */}
      {/* <RecipeCarousel /> */}
    </div>
  );
}
