"use client";

import { useEffect, useState } from "react";
import type { Recipe } from "@/types/recipe";
import { MyRecipesGrid } from "@/components/recipes/my-recipes-grid";
import { Button } from "@/components/ui/button";

export default function MyRecipesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const loadRecipes = async (pageToLoad: number) => {
    setLoading(true);

    const res = await fetch(
      `/api/recipes?page=${pageToLoad}&limit=9`
    );
    const json = await res.json();

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

  return (
    <div className="mx-auto max-w-6xl p-6 space-y-6">
      {/* <h1 className="text-2xl font-semibold">My Recipes</h1> */}

      <MyRecipesGrid recipes={recipes} />

      {hasMore && (
        <div className="flex justify-center">
          <Button
            onClick={() => loadRecipes(page + 1)}
            disabled={loading}
          >
            {loading ? "Loading..." : "Load more"}
          </Button>
        </div>
      )}
    </div>
  );
}
