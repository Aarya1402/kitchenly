"use client";

import { useUser } from "@clerk/nextjs";
import gsap from "gsap";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useLayoutEffect,useRef, useState } from "react";
import { toast } from "sonner";

import { deleteRecipe, getCuisines, getRecipes } from "@/app/recipes/actions";
import {
  addRecipeToShoppingList,
  getShoppingLists,
} from "@/app/shopping-lists/actions";
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

type InitialData = {
  data: Recipe[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
};

type Props = {
  initialData: InitialData;
};

export function MyRecipesGrid({ initialData }: Props) {
  const router = useRouter();
  const { user } = useUser();

  /* ───────── State ───────── */

  // Grid state
  const [recipes, setRecipes] = useState<Recipe[]>(initialData.data);
  const [page, setPage] = useState(initialData.page);
  const [hasMore, setHasMore] = useState(initialData.hasMore);
  const [loadingMore, setLoadingMore] = useState(false);

  // Search state
  const [query, setQuery] = useState("");
  const [lastSearchedLength, setLastSearchedLength] = useState(0);
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([]);
  const [availableCuisines, setAvailableCuisines] = useState<string[]>([]);

  // Modal / Selection state
  const [open, setOpen] = useState(false);
  const [selectedRecipeModal, setSelectedRecipeModal] = useState<Recipe | null>(
    null
  );
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [servingsUsed, setServingsUsed] = useState<number>(1);
  const [listModalOpen, setListModalOpen] = useState(false);
  const [lists, setLists] = useState<ShoppingList[]>([]);

  const singleSelectedRecipe =
    selectedIds.length === 1
      ? (recipes.find((r) => r.id === selectedIds[0]) ?? null)
      : null;

  const gridRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!gridRef.current) return;

    // Kill any existing tweens to avoid conflicts
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".recipe-card-item",
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.5,
          stagger: 0.05,
          ease: "power2.out",
        }
      );
    }, gridRef);

    return () => ctx.revert();
  }, [recipes]);

  /* ───────── Effects ───────── */

  useEffect(() => {
    // Load available cuisines
    getCuisines().then((data) => setAvailableCuisines(data));
  }, []);

  /* ───────── Data Fetching ───────── */

  const loadRecipes = async (
    searchQuery: string,
    cuisines: string[],
    pageToLoad: number,
    append: boolean
  ) => {
    try {
      const result = await getRecipes({
        page: pageToLoad,
        limit: 12,
        query: searchQuery,
        cuisines: cuisines,
      });

      if (append) {
        setRecipes((prev) => [...prev, ...(result.data as Recipe[])]);
      } else {
        setRecipes(result.data as Recipe[]);
      }

      setHasMore(result.hasMore);
      setPage(result.page);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load recipes");
    }
  };

  /* ───────── Search / Filter Handlers ───────── */

  const handleChange = (value: string) => {
    setQuery(value);

    // If cleared, reset
    if (value.length === 0) {
      setLastSearchedLength(0);
      loadRecipes("", selectedCuisines, 1, false);
      return;
    }

    // Debounce-ish logic from original code
    if (
      value.length >= 3 &&
      value.length % 3 === 0 &&
      value.length !== lastSearchedLength
    ) {
      setLastSearchedLength(value.length);
      loadRecipes(value, selectedCuisines, 1, false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setLastSearchedLength(query.length);
      loadRecipes(query, selectedCuisines, 1, false);
    }
  };

  const handleCuisineChange = (cuisines: string[]) => {
    setSelectedCuisines(cuisines);
    loadRecipes(query.length >= 3 ? query : "", cuisines, 1, false);
  };

  const handleLoadMore = async () => {
    setLoadingMore(true);
    await loadRecipes(query, selectedCuisines, page + 1, true);
    setLoadingMore(false);
  };

  /* ───────── Actions ───────── */

  const handleDelete = async (recipe: Recipe) => {
    const previousRecipes = recipes;
    // Optimistic
    setRecipes((prev) => prev.filter((r) => r.id !== recipe.id));
    toast("Recipe deleted", { description: `"${recipe.title}" removed` });

    try {
      await deleteRecipe(recipe.id);
    } catch {
      setRecipes(previousRecipes);
      toast.error("Failed to delete recipe", {
        description: "Something went wrong. Recipe restored.",
      });
    }

    if (selectedRecipeModal?.id === recipe.id) {
      setOpen(false);
      setSelectedRecipeModal(null);
    }
  };

  const toggleRecipe = (recipeId: string, checked: boolean) => {
    setSelectedIds((prev) =>
      checked ? [...prev, recipeId] : prev.filter((id) => id !== recipeId)
    );
  };

  const handleCreateClick = async () => {
    if (selectedIds.length === 0) return;

    if (selectedIds.length > 1) {
      router.push(`/shopping-lists/new?recipes=${selectedIds.join(",")}`);
      return;
    }

    // single recipe → show list picker (keep axios for now as shopping lists are not migrated)
    try {
      const lists = await getShoppingLists();
      // map to simple type
      setLists(lists.map((l) => ({ id: l.id, title: l.title })));

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
      await addRecipeToShoppingList(
        listId,
        singleSelectedRecipe.id,
        servingsUsed
      );

      toast.success("Recipe added to shopping list");
      setListModalOpen(false);
      setSelectedIds([]);
      router.push(`/shopping-lists/${listId}`);
    } catch (err: unknown) {
      // generic error handling as server actions throw
      if (err instanceof Error && err.message.includes("already added")) {
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
        <h1 className="text-2xl font-semibold">All Recipes</h1>
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
      <div data-tour="recipe-card" ref={gridRef}>
        {recipes.length === 0 ? (
          <div className="text-muted-foreground rounded-lg border border-dashed p-12 text-center text-sm">
            No recipes found.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {recipes.map((recipe) => (
              <div key={recipe.id} className="recipe-card-item opacity-0">
                <SelectableRecipeCard
                  recipe={recipe}
                  currentUserId={user?.id}
                  selected={selectedIds.includes(recipe.id)}
                  onSelect={(checked) => toggleRecipe(recipe.id, checked)}
                  onCardClick={(recipe) => {
                    setSelectedRecipeModal(recipe);
                    setOpen(true);
                  }}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {hasMore && (
        <div className="flex justify-center pt-4">
          <Button onClick={handleLoadMore} disabled={loadingMore}>
            {loadingMore ? "Loading..." : "Load more"}
          </Button>
        </div>
      )}

      {/* Recipe details modal */}
      {selectedRecipeModal && (
        <Activity visible={open} name="recipe-details-modal">
          <RecipeDetailsModal
            recipe={selectedRecipeModal}
            open={open}
            onClose={() => setOpen(false)}
            onDeleted={handleDelete}
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
