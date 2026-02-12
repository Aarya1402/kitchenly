"use client";

import { useUser } from "@clerk/nextjs";
import axios from "axios";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { RecipeSearchWithFilters } from "@/components/dashboard/recipe-search";
import { Activity } from "@/components/ui/activity";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { Recipe } from "@/types/recipe";

import { RecipeDetailsModal } from "./recipe-details-modal";
import { SelectableRecipeCard } from "./selectable-recipe-card";

type ShoppingList = {
  id: string;
  title: string;
};

type Props = {
  recipes: Recipe[];
  onDelete: (recipe: Recipe) => Promise<void>;
  setRecipes: React.Dispatch<React.SetStateAction<Recipe[]>>;
  setIsSearch: React.Dispatch<React.SetStateAction<boolean>>;
};

export function MyRecipesGrid({
  recipes,
  onDelete,
  setRecipes,
  setIsSearch,
}: Props) {
  const router = useRouter();
  const { user } = useUser();

  const [open, setOpen] = useState(false);
  const [selectedRecipeModal, setSelectedRecipeModal] = useState<Recipe | null>(
    null
  );

  const [query, setQuery] = useState("");
  const [lastSearchedLength, setLastSearchedLength] = useState(0);
  const [servingsUsed, setServingsUsed] = useState<number>(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([]);
  const [availableCuisines, setAvailableCuisines] = useState<string[]>([]);

  /* ───────── Shopping list modal state ───────── */

  const [listModalOpen, setListModalOpen] = useState(false);
  const [lists, setLists] = useState<ShoppingList[]>([]);
  const singleSelectedRecipe =
    selectedIds.length === 1
      ? (recipes.find((r) => r.id === selectedIds[0]) ?? null)
      : null;

  useEffect(() => {
    fetchAvailableCuisines();
  }, []);
  /* ───────── Search ───────── */

  const fetchRecipes = async (search?: string, cuisines?: string[]) => {
    try {
      const isSearch: boolean =
        !!(search && search.length > 0) || !!(cuisines && cuisines.length > 0);
      setIsSearch(isSearch);
      const url = isSearch ? "/api/recipes/search" : "/api/recipes";

      const params: { limit: number; q?: string; cuisine?: string } = {
        limit: isSearch ? 12 : 8,
      };

      // 🔍 search param (only for search route)
      if (isSearch) {
        params.q = search;
      }

      // 🎛️ cuisine filter (comma-separated)
      if (cuisines && cuisines.length > 0) {
        params.cuisine = cuisines.join(",");
      }

      const res = await axios.get(url, { params });
      setRecipes(res.data?.data ?? []);
    } finally {
      //
    }
  };

  const fetchAvailableCuisines = async () => {
    try {
      const res = await axios.get("/api/recipes/cuisines");
      setAvailableCuisines(res.data?.cuisines ?? []);
    } catch (e) {
      console.error("Failed to load cuisines", e);
    }
  };
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

  /* ───────── Selection ───────── */

  const toggleRecipe = (recipeId: string, checked: boolean) => {
    setSelectedIds((prev) =>
      checked ? [...prev, recipeId] : prev.filter((id) => id !== recipeId)
    );
  };

  /* ───────── Actions ───────── */

  const handleCreateClick = async () => {
    if (selectedIds.length === 0) return;

    // multiple recipes → existing flow
    if (selectedIds.length > 1) {
      router.push(`/shopping-lists/new?recipes=${selectedIds.join(",")}`);
      return;
    }

    // single recipe → show list picker
    try {
      const res = await axios.get("/api/shopping-lists");
      setLists(res.data.lists ?? []);
      if (singleSelectedRecipe) {
        setServingsUsed(singleSelectedRecipe.servings);
      }

      setListModalOpen(true);
    } catch {
      toast.error("Failed to load shopping lists");
    }
  };

  const addToExistingList = async (listId: string) => {
    if (!singleSelectedRecipe) return;

    try {
      await axios.put(`/api/shopping-lists/${listId}`, {
        recipeId: singleSelectedRecipe.id,
        servingsUsed,
      });

      toast.success("Recipe added to shopping list");
      setListModalOpen(false);
      setSelectedIds([]);
      router.push(`/shopping-lists/${listId}`);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { status?: number } };
      if (axiosErr.response?.status === 409) {
        toast.error("Recipe already added to this list");
      } else {
        toast.error("Failed to add recipe");
      }
    }
  };

  /* ───────── Render ───────── */

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">My Recipes</h1>

        <Button
          onClick={() => router.push("/recipes/new")}
          data-tour="add-recipe-button"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Recipe
        </Button>
      </div>

      {/* Search */}
      <RecipeSearchWithFilters
        value={query}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        cuisines={selectedCuisines}
        availableCuisines={availableCuisines}
        onCuisineChange={handleCuisineChange}
      />
      {/* Grid */}
      <div data-tour="recipe-card">
        {recipes.length === 0 ? (
          <div className="text-muted-foreground rounded-lg border border-dashed p-12 text-center text-sm">
            You haven’t added any recipes yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {recipes.map((recipe) => (
              <SelectableRecipeCard
                key={recipe.id}
                recipe={recipe}
                currentUserId={user?.id}
                selected={selectedIds.includes(recipe.id)}
                onSelect={(checked) => toggleRecipe(recipe.id, checked)}
                onCardClick={(recipe) => {
                  setSelectedRecipeModal(recipe);
                  setOpen(true);
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Recipe details modal */}
      {selectedRecipeModal && (
        <Activity visible={open} name="recipe-details-modal">
          <RecipeDetailsModal
            recipe={selectedRecipeModal}
            open={open}
            onClose={() => setOpen(false)}
            onDeleted={async (recipe) => {
              await onDelete(recipe);
              setOpen(false);
              setSelectedRecipeModal(null);
            }}
            currentUserId={user?.id}
          />
        </Activity>
      )}

      {/* Bottom bar */}
      {selectedIds.length > 0 && (
        <div className="bg-background fixed right-0 bottom-0 left-0 z-50 border-t p-4">
          <div className="mx-auto flex max-w-3xl items-center justify-between">
            <span className="text-sm">
              {selectedIds.length} recipe
              {selectedIds.length > 1 ? "s" : ""} selected
            </span>

            <Button onClick={handleCreateClick}>Create Shopping List</Button>
          </div>
        </div>
      )}

      {/* Existing list picker */}

      <Dialog open={listModalOpen} onOpenChange={setListModalOpen}>
        <Activity visible={listModalOpen} name="list-picker-modal">
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add to existing list</DialogTitle>
            </DialogHeader>
            {singleSelectedRecipe && (
              <div className="space-y-2">
                <div className="text-sm font-medium">
                  {singleSelectedRecipe.title}
                </div>

                <div className="flex items-center gap-3">
                  <label className="text-muted-foreground text-sm">
                    Servings
                  </label>

                  <Input
                    type="number"
                    min={1}
                    value={servingsUsed}
                    onChange={(e) =>
                      setServingsUsed(Math.max(1, Number(e.target.value)))
                    }
                    className="w-24"
                  />

                  <span className="text-muted-foreground text-xs">
                    (original: {singleSelectedRecipe.servings})
                  </span>
                </div>
              </div>
            )}

            <div className="space-y-2">
              {lists.map((list) => (
                <Button
                  key={list.id}
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => addToExistingList(list.id)}
                >
                  {list.title}
                </Button>
              ))}

              <Button
                className="w-full"
                onClick={() =>
                  router.push(
                    `/shopping-lists/new?recipes=${selectedIds.join(",")}`
                  )
                }
              >
                + Create new list
              </Button>
            </div>
          </DialogContent>
        </Activity>
      </Dialog>
    </section>
  );
}
