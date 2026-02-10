"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

/** Dashboard: hero + search + carousel of recipe cards */
export function DashboardSkeleton() {
  return (
    <div className="mx-auto max-w-7xl space-y-10 p-6">
      {/* Hero */}
      <Card className="relative overflow-hidden rounded-2xl border-none p-0">
        <Skeleton className="h-[260px] w-full md:h-[400px]" />
      </Card>

      {/* Search bar */}
      <div className="flex justify-center">
        <div className="flex w-full max-w-2xl items-center gap-2">
          <Skeleton className="h-10 flex-1 rounded-md" />
          <Skeleton className="h-10 w-24 rounded-md" />
        </div>
      </div>

      {/* Recent Recipes section */}
      <div className="space-y-4">
        <Skeleton className="h-6 w-32" />
        <div className="flex gap-4 overflow-hidden">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="h-[360px] w-full min-w-[280px] shrink-0 overflow-hidden">
              <Skeleton className="aspect-[16/9] w-full" />
              <CardContent className="space-y-2 pt-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-20" />
                <div className="flex gap-1 pt-2">
                  <Skeleton className="h-5 w-12 rounded-full" />
                  <Skeleton className="h-5 w-14 rounded-full" />
                  <Skeleton className="h-5 w-10 rounded-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

/** My Recipes: header + search + grid of recipe cards */
export function MyRecipesSkeleton() {
  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-10 w-28" />
      </div>
      <div className="flex w-full items-center gap-2">
        <Skeleton className="h-10 flex-1 rounded-md" />
        <Skeleton className="h-10 w-24 rounded-md" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <Card key={i} className="h-[360px] overflow-hidden">
            <Skeleton className="aspect-[16/9] w-full" />
            <CardContent className="space-y-2 pt-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-16" />
              <div className="flex gap-1 pt-2">
                <Skeleton className="h-5 w-12 rounded-full" />
                <Skeleton className="h-5 w-14 rounded-full" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="flex justify-center">
        <Skeleton className="h-10 w-24 rounded-md" />
      </div>
    </div>
  );
}

/** My Recipes new/edit: form layout */
export function MyRecipesFormSkeleton() {
  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <Skeleton className="h-8 w-48" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-full rounded-md" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-24 w-full rounded-md" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-10 w-24 rounded-md" />
      </div>
      <div className="flex gap-2 pt-4">
        <Skeleton className="h-10 w-24 rounded-md" />
        <Skeleton className="h-10 w-20 rounded-md" />
      </div>
    </div>
  );
}

/** Shopping Lists: header + list of cards */
export function ShoppingListsSkeleton() {
  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-7 w-36" />
        <Skeleton className="h-10 w-36" />
      </div>
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="overflow-hidden">
            <CardHeader>
              <Skeleton className="h-5 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

/** Shopping list detail: title + progress + items */
export function ShoppingListDetailSkeleton() {
  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <Skeleton className="h-7 w-56" />
      <Skeleton className="h-10 w-32" />
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-4 w-8" />
        </div>
        <Skeleton className="h-2 w-full rounded-full" />
      </div>
      {[1, 2, 3].map((cat) => (
        <div key={cat}>
          <Skeleton className="mb-2 h-4 w-24" />
          <div className="space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-2">
                <Skeleton className="h-4 w-4 rounded" />
                <Skeleton className="h-4 flex-1" />
              </div>
            ))}
          </div>
        </div>
      ))}
      <Skeleton className="h-10 w-24" />
    </div>
  );
}

/** New shopping list (from recipes): form with categories */
export function ShoppingListNewSkeleton() {
  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-10 w-28" />
      </div>
      <Skeleton className="h-10 w-full rounded-md" />
      <div className="space-y-4">
        {[1, 2, 3].map((cat) => (
          <Card key={cat}>
            <CardHeader>
              <Skeleton className="h-5 w-28" />
            </CardHeader>
            <CardContent className="space-y-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-8 w-full" />
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-10 w-20 rounded-md" />
        <Skeleton className="h-10 w-24 rounded-md" />
      </div>
    </div>
  );
}

/** Shared shopping list view */
export function ShareListSkeleton() {
  return <ShoppingListDetailSkeleton />;
}

/** Settings: card with form fields */
export function SettingsSkeleton() {
  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <Skeleton className="h-8 w-24" />
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-36" />
            <div className="flex flex-wrap gap-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-8 w-20 rounded-md" />
              ))}
            </div>
          </div>
          <Skeleton className="h-10 w-20 rounded-md" />
        </CardContent>
      </Card>
    </div>
  );
}

/** In-page: carousel of recipe cards (e.g. dashboard "Recent Recipes") */
export function RecipeCarouselSkeleton() {
  return (
    <div className="flex gap-4 overflow-hidden">
      {[1, 2, 3, 4].map((i) => (
        <Card key={i} className="h-[360px] w-full min-w-[280px] shrink-0 overflow-hidden">
          <Skeleton className="aspect-[16/9] w-full" />
          <CardContent className="space-y-2 pt-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-20" />
            <div className="flex gap-1 pt-2">
              <Skeleton className="h-5 w-12 rounded-full" />
              <Skeleton className="h-5 w-14 rounded-full" />
              <Skeleton className="h-5 w-10 rounded-full" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/** In-page: grid of recipe cards (e.g. recipes while loading) */
export function RecipeGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
        <Card key={i} className="h-[360px] overflow-hidden">
          <Skeleton className="aspect-[16/9] w-full" />
          <CardContent className="space-y-2 pt-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-16" />
            <div className="flex gap-1 pt-2">
              <Skeleton className="h-5 w-12 rounded-full" />
              <Skeleton className="h-5 w-14 rounded-full" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/** Auth (sign-in / sign-up): centered card */
export function AuthSkeleton() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="w-full max-w-md overflow-hidden">
        <Skeleton className="h-12 w-full" />
        <CardContent className="space-y-4 p-6">
          <Skeleton className="mx-auto h-10 w-48" />
          <Skeleton className="h-10 w-full rounded-md" />
          <Skeleton className="h-10 w-full rounded-md" />
          <Skeleton className="h-10 w-full rounded-md" />
          <Skeleton className="mx-auto h-10 w-32 rounded-md" />
        </CardContent>
      </Card>
    </div>
  );
}
