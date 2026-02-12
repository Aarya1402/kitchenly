"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { MyRecipesGrid } from "@/components/recipes/my-recipes-grid";
import { Button } from "@/components/ui/button";
import { MyRecipesSkeleton } from "@/components/ui/page-skeletons";
import type { Recipe } from "@/types/recipe";

export default function MyRecipesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [issearch, setIsSearch] = useState(false);
  const loadRecipes = async (pageToLoad: number) => {
    const response = await axios.get(
      `/api/recipes?page=${pageToLoad}&limit=12`
    );
    const json = response.data;

    setRecipes((prev) =>
      pageToLoad === 1 ? json.data : [...prev, ...json.data]
    );

    setHasMore(json.hasMore);
    setPage(json.page);
    setLoading(false);
  };

  useEffect(() => {
    // eslint-disable-next-line
    loadRecipes(1);
  }, []);

  // ✅ OPTIMISTIC DELETE WITH ROLLBACK
  const optimisticDelete = async (recipe: Recipe) => {
    const previousRecipes = recipes;

    // Optimistic UI update
    setRecipes((prev) => prev.filter((r) => r.id !== recipe.id));

    toast("Recipe deleted", {
      description: `"${recipe.title}" removed`,
    });

    try {
      await axios.delete(`/api/recipes/${recipe.id}`);
    } catch {
      // Rollback
      setRecipes(previousRecipes);

      toast.error("Failed to delete recipe", {
        description: "Something went wrong. Recipe restored.",
      });
    }
  };

  if (loading) {
    return <MyRecipesSkeleton />;
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <MyRecipesGrid
        recipes={recipes}
        onDelete={optimisticDelete}
        setRecipes={setRecipes}
        setIsSearch={setIsSearch}
      />
      {!issearch && hasMore && (
        <div className="flex justify-center">
          <Button
            onClick={() => {
              setLoading(true);
              loadRecipes(page + 1);
            }}
            disabled={loading}
          >
            {loading ? "Loading..." : "Load more"}
          </Button>
        </div>
      )}
    </div>
  );
}
