"use client";

import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { ShareExportModal } from "@/components/export-modal";
import { SearchAndFilterBar } from "@/components/search-and-filter";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { ShoppingListDetailSkeleton } from "@/components/ui/page-skeletons";
import { Progress } from "@/components/ui/progress";
import { CATEGORIES } from "@/constants/categories";
import { AggregatedItem as Item } from "@/types/aggregatedItems";
import { RecipeInList } from "@/types/recipeInList";
/* ───────── Page ───────── */

export default function ShoppingListPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [groups, setGroups] = useState<Record<string, Item[]>>({});
  const [recipes, setRecipes] = useState<RecipeInList[]>([]);
  const [loading, setLoading] = useState(true);
  const [isShared, setIsShared] = useState(false);
  const [shareToken, setShareToken] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [draftTitle, setDraftTitle] = useState("");
  const [draftGroups, setDraftGroups] = useState<Record<string, Item[]>>({});
  const [draftRecipes, setDraftRecipes] = useState<RecipeInList[]>([]);
  const items = Object.values(groups).flat();
  const total = items.length;
  const completed = items.filter((i) => i.isChecked).length;
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);
  const [openShare, setOpenShare] = useState(false);
  const [search, setSearch] = useState("");
  const [categories, setCategories] = useState<string[]>([]);

  const [filteredGroups, setFilteredGroups] =
    useState<Record<string, Item[]>>(groups);
  const activeGroups = editMode
    ? draftGroups
    : search || categories.length > 0
      ? filteredGroups
      : groups;

  const hasNoResults =
    !editMode &&
    (search || categories.length > 0) &&
    Object.values(activeGroups).every((items) => items.length === 0);
  const lastSearchRef = useRef<string>("");
  /* ───────── Fetch list ───────── */

  useEffect(() => {
    async function load() {
      try {
        const res = await axios.get(`/api/shopping-lists/${id}`);
        const json = res.data;

        setTitle(json.title);
        setGroups(json.groups);
        setRecipes(json.recipes);
        setIsShared(json.isShared);
        setShareToken(json.shareToken);

        // prepare edit drafts
        setDraftTitle(json.title);
        setDraftGroups(structuredClone(json.groups));
        setDraftRecipes(structuredClone(json.recipes));

        setLoading(false);
      } catch {
        alert("Failed to load shopping list");
        router.back();
      }
    }

    if (id) load();
  }, [id, router]);
  const fetchFilteredResults = async (
    searchValue: string,
    selectedCategories: string[]
  ) => {
    const res = await axios.get(`/api/shopping-lists/${id}/search`, {
      params: {
        q: searchValue || undefined,
        categories:
          selectedCategories.length > 0
            ? selectedCategories.join(",")
            : undefined,
      },
    });

    setFilteredGroups(res.data.groups);
  };

  /* ───────── Toggle isChecked (shopping mode) ───────── */

  async function toggleItem(ingredientKey: string, isChecked: boolean) {
    await axios.put(`/api/shopping-lists/${id}/toggle-item`, {
      ingredientKey,
      isChecked,
    });
  }

  if (loading) {
    return <ShoppingListDetailSkeleton />;
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      {/* ───────── Header Row ───────── */}
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-xl font-semibold">
          {editMode ? (
            <Input
              value={draftTitle}
              onChange={(e) => setDraftTitle(e.target.value)}
              className="max-w-sm"
            />
          ) : (
            title
          )}
        </h1>

        <Button variant="outline" onClick={() => setOpenShare(true)}>
          Share / Export
        </Button>
      </div>
      {/* ───────── Search + Filter ───────── */}
      {!editMode && (
        <SearchAndFilterBar
          value={search}
          onChange={(value) => {
            setSearch(value);

            if (editMode) return;

            // 🧹 Reset when cleared
            if (value.length === 0) {
              lastSearchRef.current = "";
              fetchFilteredResults("", categories);
              return;
            }

            // 🔍 Call API every 3rd character
            if (value.length % 3 === 0 && value !== lastSearchRef.current) {
              lastSearchRef.current = value;
              fetchFilteredResults(value, categories);
            }
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && search.trim()) {
              lastSearchRef.current = search;
              fetchFilteredResults(search, categories);
            }
          }}
          selectedCategories={categories}
          availableCategories={CATEGORIES}
          onCategoryChange={(cats) => {
            setCategories(cats);

            // 🗂 Always fetch when categories change
            if (!editMode) {
              fetchFilteredResults(search, cats);
            }
          }}
        />
      )}

      {!editMode && (
        <div className="space-y-2">
          <div className="text-muted-foreground flex items-center justify-between text-sm">
            <span>
              {completed} of {total} items completed
            </span>
            <span>{percent}%</span>
          </div>

          <Progress value={percent} />
        </div>
      )}
      {/* ───────── Recipes + Servings (EDIT MODE ONLY) ───────── */}
      {editMode && (
        <div className="space-y-3 rounded-md border p-4">
          <h2 className="font-medium">Recipes</h2>

          {draftRecipes.map((r, index) => (
            <div
              key={r.recipeId}
              className="flex items-center justify-between gap-4"
            >
              <span className="font-medium">{r.title}</span>

              <div className="flex items-center gap-2">
                <span className="text-muted-foreground text-sm">Servings</span>

                <Input
                  type="number"
                  min={1}
                  value={r.servingsUsed}
                  onChange={(e) => {
                    const value = Math.max(1, Number(e.target.value));

                    setDraftRecipes((prev) => {
                      const next = [...prev];
                      next[index] = {
                        ...next[index],
                        servingsUsed: value,
                      };
                      return next;
                    });
                  }}
                  className="w-20"
                />

                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    await axios.put(`/api/shopping-lists/${id}/regenerate`, {
                      recipeId: r.recipeId,
                      servingsUsed: r.servingsUsed,
                    });

                    // reload list after regeneration
                    const res = await axios.get(`/api/shopping-lists/${id}`);
                    setDraftGroups(res.data.groups);
                  }}
                >
                  Regenerate
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
      {hasNoResults && (
        <div className="rounded-md border border-dashed p-6 text-center">
          <p className="text-sm font-medium">No results found</p>
          <p className="text-muted-foreground mt-1 text-sm">
            Try adjusting your search or filter.
          </p>
        </div>
      )}

      {/* ───────── Ingredients ───────── */}
      {Object.entries(activeGroups).map(([category, items]) => (
        <div key={category}>
          <h2 className="mb-2 font-medium">{category}</h2>

          <div className="space-y-2">
            {items.map((item, index) => (
              <div key={item.ingredientKey} className="flex items-center gap-2">
                {!editMode && (
                  <Checkbox
                    checked={item.isChecked}
                    onCheckedChange={(v) => {
                      const next = Boolean(v);

                      setGroups((prev) => {
                        const copy = structuredClone(prev);
                        const target = copy[category].find(
                          (i) => i.ingredientKey === item.ingredientKey
                        );
                        if (target) target.isChecked = next;
                        return copy;
                      });

                      toggleItem(item.ingredientKey, next);
                    }}
                    data-tour="list-item-checkbox"
                  />
                )}

                {editMode ? (
                  <>
                    <Input
                      type="number"
                      min={0}
                      value={item.quantity.toFixed(2)}
                      onChange={(e) => {
                        const next = structuredClone(draftGroups);
                        next[category][index].quantity = Number(e.target.value);
                        setDraftGroups(next);
                      }}
                      className="w-24"
                    />
                    <span>{item.unit}</span>
                    <Input
                      value={item.name}
                      onChange={(e) => {
                        const next = structuredClone(draftGroups);
                        next[category][index].name = e.target.value;
                        setDraftGroups(next);
                      }}
                      className="flex-1"
                    />
                  </>
                ) : (
                  <span
                    className={`flex-1 ${
                      item.isChecked ? "text-muted-foreground line-through" : ""
                    }`}
                  >
                    {item.quantity.toFixed(2)} {item.unit} {item.name}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
      {/* ───────── Footer ───────── */}
      {editMode ? (
        <div className="flex justify-between pt-6">
          <Button
            variant="outline"
            onClick={() => {
              setEditMode(false);
              setDraftGroups(groups);
              setDraftTitle(title);
              setDraftRecipes(recipes);
            }}
          >
            Cancel
          </Button>

          <Button
            onClick={async () => {
              try {
                await axios.put(`/api/shopping-lists/${id}/save`, {
                  title: draftTitle,
                  manualItems: [], // you can wire this later
                });

                setTitle(draftTitle);
                setGroups(draftGroups);
                setRecipes(draftRecipes);
                setEditMode(false);
              } catch {
                alert("Failed to save");
              }
            }}
          >
            Save
          </Button>
        </div>
      ) : (
        <Button variant="outline" onClick={() => setEditMode(true)}>
          Edit List
        </Button>
      )}
      <ShareExportModal
        open={openShare}
        onClose={() => setOpenShare(false)}
        listId={id}
        isShared={isShared}
        shareToken={shareToken}
      />
    </div>
  );
}
