"use client";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { RecipeCard } from "@/components/recipes/recipe-card";
import type { Recipe } from "@/types/recipe";

type Props = {
  recipes: Recipe[];
  onCardClick: (recipe: Recipe) => void;
};

export function RecipeCarousel({ recipes, onCardClick }: Props) {
  if (recipes.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-10 text-center text-sm text-muted-foreground">
        No recipes found.
      </div>
    );
  }

  return (
    <Carousel opts={{ align: "start" }} className="w-full">
      <CarouselContent>
        {recipes.map((recipe) => (
          <CarouselItem
            key={recipe.id}
            className="basis-[85%] sm:basis-1/2 md:basis-1/3 lg:basis-1/4"
          >
            <RecipeCard
              recipe={recipe}
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
