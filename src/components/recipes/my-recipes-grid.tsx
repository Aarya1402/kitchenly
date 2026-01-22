"use client";

import { useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { RecipeCard } from "./recipe-card";
import { RecipeDetailsModal } from "./recipe-details-modal";
import { useRouter } from "next/navigation";
import { RecipeSearch } from "@/components/dashboard/recipe-search";

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
  loadRecipes: (page: number) => void;
  onDelete: (recipe: Recipe) => Promise<void>;
  setRecipes: React.Dispatch<React.SetStateAction<Recipe[]>>;
};

export function MyRecipesGrid({
  recipes,
  loadRecipes,
  onDelete,
  setRecipes,
}: Props) {
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [open, setOpen] = useState(false);

  const [query, setQuery] = useState("");
  const [lastSearchedLength, setLastSearchedLength] = useState(0);

  const router = useRouter();

  // 🔹 Search API
  const searchRecipes = async (q: string) => {
    const res = await axios.get("/api/recipes/search", {
      params: { q, limit: 12 },
    });
    setRecipes(res.data?.data ?? []);
  };

  // 🔹 Handle typing (every 3rd character)
  const handleChange = (value: string) => {
    setQuery(value);

    if (value.length === 0) {
      setLastSearchedLength(0);
      loadRecipes(1); // reset to normal list
      return;
    }

    if (
      value.length >= 3 &&
      value.length % 3 === 0 &&
      value.length !== lastSearchedLength
    ) {
      setLastSearchedLength(value.length);
      searchRecipes(value);
    }
  };

  // 🔹 Handle Enter
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setLastSearchedLength(query.length);
      searchRecipes(query);
    }
  };

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

      {/* Search */}
    
        <RecipeSearch
          value={query}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
        />
      
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
              onClick={() => {
                setSelectedRecipe(recipe);
                setOpen(true);
              }}
            />
          ))}
        </div>
      )}

      {/* Details Modal */}
      {selectedRecipe && (
        <RecipeDetailsModal
          recipe={selectedRecipe}
          open={open}
          onClose={() => {
            setOpen(false);
            setSelectedRecipe(null);
          }}
          onDeleted={async (recipe) => {
            await onDelete(recipe);
            setOpen(false);
            setSelectedRecipe(null);
          }}
        />
      )}
    </section>
  );
}
