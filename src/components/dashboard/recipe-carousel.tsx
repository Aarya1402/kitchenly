"use client";

import { RecipeCard } from "@/components/recipes/recipe-card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import type { Recipe } from "@/types/recipe";

type Props = {
  recipes: Recipe[];
  currentUserId?: string | null;
  onCardClick: (recipe: Recipe) => void;
};

export function RecipeCarousel({ recipes, currentUserId, onCardClick }: Props) {
  if (recipes.length === 0) {
    return (
      <div className="text-muted-foreground rounded-lg border border-dashed p-10 text-center text-sm">
        No recipes found.
      </div>
    );
  }

  return (
    <Carousel
      opts={{ align: "start" }}
      className="w-full"
      data-tour="dashboard-recent-recipes"
    >
      <CarouselContent>
        {recipes.map((recipe) => (
          <CarouselItem
            key={recipe.id}
            className="basis-[85%] sm:basis-1/2 md:basis-1/3 lg:basis-1/4"
          >
            <RecipeCard
              recipe={recipe}
              currentUserId={currentUserId}
              onClick={() => onCardClick(recipe)}
            />
          </CarouselItem>
        ))}
      </CarouselContent>

      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  );
}
