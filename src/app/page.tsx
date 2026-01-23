"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import type { Recipe } from "@/types/recipe";
import { DashboardHero } from "@/components/dashboard/dashboard-hero";
import { RecipeSearch } from "@/components/dashboard/recipe-search";
import { RecipeCarousel } from "@/components/dashboard/recipe-carousel";
import { RecipeDetailsModal } from "@/components/recipes/recipe-details-modal";

export default function DashboardPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [lastSearchedLength, setLastSearchedLength] = useState(0);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [open, setOpen] = useState(false);

  const fetchRecipes = async (search?: string) => {
    try {
      setLoading(true);

      const url = search ? "/api/recipes/search" : "/api/recipes";

      const params = search ? { q: search, limit: 12 } : { limit: 5 };

      const res = await axios.get(url, { params });
      setRecipes(res.data?.data ?? []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecipes();
  }, []);

  const handleChange = (value: string) => {
    setQuery(value);

    if (value.length === 0) {
      setLastSearchedLength(0);
      fetchRecipes();
      return;
    }

    if (
      value.length >= 3 &&
      value.length % 3 === 0 &&
      value.length !== lastSearchedLength
    ) {
      setLastSearchedLength(value.length);
      fetchRecipes(value);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setLastSearchedLength(query.length);
      fetchRecipes(query);
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-10 p-6">
      <DashboardHero />

      <div className="flex justify-center">
        <RecipeSearch
          value={query}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
        />
      </div>

      {loading ? (
        <div className="text-center text-sm text-muted-foreground">
          Loading recipes…
        </div>
      ) : (
        <RecipeCarousel
          recipes={recipes}
          onCardClick={(recipe) => {
            setSelectedRecipe(recipe);
            setOpen(true);
          }}
        />
      )}

      {selectedRecipe && (
        <RecipeDetailsModal
          recipe={selectedRecipe}
          open={open}
          onClose={() => {
            setOpen(false);
            setSelectedRecipe(null);
          }}
          onDeleted={() => {
            setOpen(false);
            setSelectedRecipe(null);
          }}
        />
      )}
    </div>
  );
}
