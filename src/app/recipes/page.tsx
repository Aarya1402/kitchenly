"use client";

import { useEffect, useState } from "react";
import type { Recipe } from "@/types/recipe";
import { MyRecipesGrid } from "@/components/recipes/my-recipes-grid";
import { MyRecipesSkeleton } from "@/components/ui/page-skeletons";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import axios from "axios";

export default function MyRecipesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [issearch, setIsSearch] = useState(false);
  const loadRecipes = async (pageToLoad: number) => {
    setLoading(true);

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
    } catch (error) {
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
        loadRecipes={loadRecipes}
        onDelete={optimisticDelete}
        setRecipes={setRecipes}
        setIsSearch={setIsSearch}
      />
      {!issearch && hasMore && (
        <div className="flex justify-center">
          <Button onClick={() => loadRecipes(page + 1)} disabled={loading}>
            {loading ? "Loading..." : "Load more"}
          </Button>
        </div>
      )}
    </div>
  );
}
