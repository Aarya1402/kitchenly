"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { RecipeCard } from "./recipe-card";
import { RecipeDetailsModal } from "./recipe-details-modal";
import { useRouter } from "next/navigation";
type Recipe = {
  id: string;
  title: string;
  description?: string | null;
  imageUrl?: string | null;
  servings: number;
  dietaryTags: string[];
  ingredients: { name: string; quantity: string }[];
  steps: { stepNo: number; content: string }[];
};

type Props = {
  recipes: Recipe[];
};

export function MyRecipesGrid({ recipes }: Props) {
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
    const router= useRouter();
  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">My Recipes</h1>

        <Button onClick={() => router.push("/my-recipes/new")}>
          <Plus className="mr-2 h-4 w-4" />
          Add Recipe
        </Button>
      </div>

      {/* Grid */}
      {recipes.length === 0 ? (
        <div className="rounded-lg border border-dashed p-12 text-center text-sm text-muted-foreground">
          You haven’t added any recipes yet.
          <br />
          Click <span className="font-medium">Add Recipe</span> to get started.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {recipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              onClick={() => setSelectedRecipe(recipe)}
            />
          ))}
        </div>
      )}

      {/* Details Modal */}
      <RecipeDetailsModal
        open={!!selectedRecipe}
        recipe={selectedRecipe}
        onOpenChange={() => setSelectedRecipe(null)}
      />
    </section>
  );
}
