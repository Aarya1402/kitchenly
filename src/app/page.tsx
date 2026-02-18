"use client";

import { useUser } from "@clerk/nextjs";
import dynamic from "next/dynamic";
import { Suspense, useEffect, useState } from "react";
import { toast } from "sonner";

import { deleteRecipe, getCuisines, getRecipes } from "@/app/recipes/actions";
import { DashboardHero } from "@/components/dashboard/dashboard-hero";
import { RecipeCarousel } from "@/components/dashboard/recipe-carousel";
import { RecipeSearchWithFilters } from "@/components/dashboard/recipe-search";
import { Activity } from "@/components/ui/activity";
import { PageLoadingFallback } from "@/components/ui/page-loading";
import { RecipeCarouselSkeleton } from "@/components/ui/page-skeletons";
import type { Recipe } from "@/types/recipe";

const RecipeDetailsModal = dynamic(
  () =>
    import("@/components/recipes/recipe-details-modal").then((m) => ({
      default: m.RecipeDetailsModal,
    })),
  { ssr: false }
);

export default function DashboardPage() {
  const { user } = useUser();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [lastSearchedLength, setLastSearchedLength] = useState(0);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [open, setOpen] = useState(false);
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([]);
  const [availableCuisines, setAvailableCuisines] = useState<string[]>([]);

  const fetchRecipes = async (search?: string, cuisines?: string[]) => {
    try {
      setLoading(true);

      const isSearch = Boolean(
        (search && search.length > 0) || (cuisines && cuisines.length > 0)
      );

      const result = await getRecipes({
        page: 1,
        limit: isSearch ? 12 : 8,
        query: search,
        cuisines: cuisines,
      });

      setRecipes(result.data as Recipe[]);
    } catch {
      toast.error("Failed to load recipes");
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableCuisines = async () => {
    try {
      const data = await getCuisines();
      setAvailableCuisines(data);
    } catch (e) {
      console.error("Failed to load cuisines", e);
    }
  };

  useEffect(() => {
    fetchRecipes();
    fetchAvailableCuisines();
  }, []);

  const handleChange = (value: string) => {
    setQuery(value);

    if (value.length === 0) {
      setLastSearchedLength(0);
      fetchRecipes(undefined, selectedCuisines);
      return;
    }

    if (
      value.length >= 3 &&
      value.length % 3 === 0 &&
      value.length !== lastSearchedLength
    ) {
      setLastSearchedLength(value.length);
      fetchRecipes(value, selectedCuisines);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setLastSearchedLength(query.length);
      fetchRecipes(query, selectedCuisines);
    }
  };

  const handleCuisineChange = (cuisines: string[]) => {
    setSelectedCuisines(cuisines);
    // re-fetch using current search query + new cuisines
    fetchRecipes(query.length >= 3 ? query : undefined, cuisines);
  };

  const handleDelete = async (recipe: Recipe) => {
    // Optimistic update
    setRecipes((prev) => prev.filter((r) => r.id !== recipe.id));
    setOpen(false);
    setSelectedRecipe(null);
    toast("Recipe deleted", { description: `"${recipe.title}" removed` });

    try {
      await deleteRecipe(recipe.id);
    } catch {
      // Revert if failed (requires refetching or complex state management, here we just notify)
      toast.error("Failed to delete recipe. Please try again.");
      fetchRecipes(query, selectedCuisines); // simplest revert
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-10 p-6">
      <DashboardHero />

      <div className="flex justify-center">
        <RecipeSearchWithFilters
          value={query}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          cuisines={selectedCuisines}
          availableCuisines={availableCuisines}
          onCuisineChange={handleCuisineChange}
        />
      </div>
      <div className="space-y-4">
        <h4 className="text-lg font-semibold">
          <div data-tour="dashboard-recent-recipes">Recent Recipes</div>
        </h4>

        {loading ? (
          <RecipeCarouselSkeleton />
        ) : recipes && recipes.length > 0 ? (
          <RecipeCarousel
            recipes={recipes}
            currentUserId={user?.id}
            onCardClick={(recipe) => {
              setSelectedRecipe(recipe);
              setOpen(true);
            }}
          />
        ) : (
          <div className="text-muted-foreground text-center text-sm">
            No recipes yet. Add one to get started.
          </div>
        )}
      </div>

      {selectedRecipe && (
        <Activity visible={open} name="recipe-details-modal">
          <Suspense fallback={<PageLoadingFallback />}>
            <RecipeDetailsModal
              recipe={selectedRecipe}
              open={open}
              onClose={() => setOpen(false)}
              onDeleted={handleDelete}
              currentUserId={user?.id}
            />
          </Suspense>
        </Activity>
      )}
    </div>
  );
}
