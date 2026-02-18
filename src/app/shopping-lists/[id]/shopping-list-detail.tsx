"use client";

import gsap from "gsap";
import { Flip } from "gsap/Flip";
import { useRouter } from "next/navigation";
import { useLayoutEffect,useRef, useState } from "react";
import { toast } from "sonner";

gsap.registerPlugin(Flip);

import {
  regenerateShoppingList,
  searchShoppingList,
  toggleItem,
  updateShoppingList,
} from "@/app/shopping-lists/actions";
import { ShareExportModal } from "@/components/export-modal";
import { SearchAndFilterBar } from "@/components/search-and-filter";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { CATEGORIES } from "@/constants/categories";
import { AggregatedItem as Item } from "@/types/aggregatedItems";
import { RecipeInList } from "@/types/recipeInList";

type Props = {
  listId: string;
  initialTitle: string;
  initialGroups: Record<string, Item[]>;
  initialRecipes: RecipeInList[];
  initialIsShared: boolean;
  initialShareToken: string | null;
};

export default function ShoppingListDetail({
  listId,
  initialTitle,
  initialGroups,
  initialRecipes,
  initialIsShared,
  initialShareToken,
}: Props) {
  const router = useRouter();

  const [title, setTitle] = useState(initialTitle);
  const [groups, setGroups] = useState(initialGroups);
  const [recipes, setRecipes] = useState(initialRecipes);

  // We can track isShared/shareToken if needed, but ShareExportModal handles logic mostly
  const [isShared] = useState(initialIsShared);
  const [shareToken] = useState(initialShareToken);
  const [draftTitle, setDraftTitle] = useState(initialTitle);
  const [editMode, setEditMode] = useState(false);
  const [draftGroups, setDraftGroups] =
    useState<Record<string, Item[]>>(initialGroups);
  const [draftRecipes, setDraftRecipes] =
    useState<RecipeInList[]>(initialRecipes);
  const [openShare, setOpenShare] = useState(false);
  const [search, setSearch] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [filteredGroups, setFilteredGroups] =
    useState<Record<string, Item[]>>(initialGroups);

  const activeGroups = editMode
    ? draftGroups
    : search || categories.length > 0
      ? filteredGroups
      : groups;

  const items = Object.values(groups).flat();
  const total = items.length;
  const completed = items.filter((i) => i.isChecked).length;
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);
  const hasNoResults =
    !editMode &&
    (search || categories.length > 0) &&
    Object.values(activeGroups).every((items) => items.length === 0);

  const lastSearchRef = useRef<string>("");
  const [prevInitialTitle, setPrevInitialTitle] = useState(initialTitle);
  const [prevInitialGroups, setPrevInitialGroups] = useState(initialGroups);
  const [prevInitialRecipes, setPrevInitialRecipes] = useState(initialRecipes);

  const containerRef = useRef<HTMLDivElement>(null);
  const pendingFlipState = useRef<Flip.FlipState | null>(null);

  useLayoutEffect(() => {
    if (pendingFlipState.current && containerRef.current) {
      Flip.from(pendingFlipState.current, {
        targets: ".shopping-item",
        duration: 0.4,
        ease: "power1.inOut",
        scale: true,
        onEnter: (elements) => {
          return gsap.fromTo(
            elements,
            { opacity: 0, scale: 0 },
            { opacity: 1, scale: 1, duration: 0.3 }
          );
        },
        onLeave: (elements) => {
          return gsap.to(elements, { opacity: 0, scale: 0, duration: 0.3 });
        },
      });
      pendingFlipState.current = null;
    }
  }, [groups]);

  useLayoutEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline();

      tl.from(".progress-container", {
        scaleY: 0,
        opacity: 0,
        duration: 0.5,
        ease: "back.out(1.7)",
      })
        .from(
          ".shopping-list-group",
          {
            y: 20,
            opacity: 0,
            duration: 0.4,
            stagger: 0.1,
            ease: "power2.out",
          },
          "-=0.3"
        )
        .from(
          ".shopping-item",
          {
            x: -10,
            opacity: 0,
            duration: 0.3,
            stagger: 0.02,
            ease: "power1.out",
          },
          "-=0.2"
        );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  if (
    initialTitle !== prevInitialTitle ||
    initialGroups !== prevInitialGroups ||
    initialRecipes !== prevInitialRecipes
  ) {
    setTitle(initialTitle);
    setGroups(initialGroups);
    setRecipes(initialRecipes);
    setDraftTitle(initialTitle);
    setDraftGroups(initialGroups);
    setDraftRecipes(initialRecipes);

    setPrevInitialTitle(initialTitle);
    setPrevInitialGroups(initialGroups);
    setPrevInitialRecipes(initialRecipes);
  }

  /* ───────── Fetch Filtered Results ───────── */
  const fetchFilteredResults = async (
    searchValue: string,
    selectedCategories: string[]
  ) => {
    try {
      const res = await searchShoppingList(
        listId,
        searchValue || undefined,
        selectedCategories.length > 0 ? selectedCategories.join(",") : undefined
      );
      setFilteredGroups(res.groups);
    } catch {
      toast.error("Failed to search");
    }
  };

  /* ───────── Toggle isChecked ───────── */
  async function handleToggleItem(ingredientKey: string, isChecked: boolean) {
    // Capture state for Flip animation
    const state = Flip.getState(".shopping-item");

    // Optimistic update
    setGroups((prev) => {
      const copy = structuredClone(prev);
      for (const cat in copy) {
        const target = copy[cat].find((i) => i.ingredientKey === ingredientKey);
        if (target) {
          target.isChecked = isChecked;
          break; // found it
        }
      }
      return copy;
    });

    // Schedule Flip animation to run after render
    // Use requestAnimationFrame to ensure DOM issues are settled, or rely on a useEffect watching groups.
    // We'll use a specific useEffect for Flip below.
    pendingFlipState.current = state;

    try {
      await toggleItem(listId, ingredientKey, isChecked);
    } catch {
      toast.error("Failed to update item");
      // revert if needed
    }
  }

  return (
    <div ref={containerRef} className="mx-auto max-w-2xl space-y-6 p-6">
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

            // 🔍 Debounce/Throttle logic could be improved, keeping existing "every 3rd char" logic for now
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
            if (!editMode) {
              fetchFilteredResults(search, cats);
            }
          }}
        />
      )}

      {!editMode && (
        <div className="progress-container space-y-2">
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
                    try {
                      await regenerateShoppingList(
                        listId,
                        r.recipeId,
                        r.servingsUsed
                      );
                      toast.success("Recalculated servings");
                      // In a real app we might refetch the preview logic or reload the page
                      // Since regenerateShoppingList revalidates path, a refresh would show new data
                      // But we are in client state. We should probably just refresh the page or fetch fresh data using server action
                      // For simplicity, let's refresh:
                      router.refresh();
                    } catch {
                      toast.error("Failed to regenerate");
                    }
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
        <div key={category} className="shopping-list-group">
          <h2 className="mb-2 font-medium">{category}</h2>

          <div className="space-y-2">
            {items.map((item, index) => (
              <div
                key={item.ingredientKey}
                data-flip-id={item.ingredientKey}
                className="shopping-item flex items-center gap-2"
              >
                {!editMode && (
                  <Checkbox
                    checked={item.isChecked}
                    onCheckedChange={(v) =>
                      handleToggleItem(item.ingredientKey, Boolean(v))
                    }
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
                    className={`flex-1 transition-all duration-300 ${
                      item.isChecked
                        ? "text-muted-foreground line-through opacity-50"
                        : "opacity-100"
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
                // In a real app we would map draftGroups back to manualItems structure if needed
                // But our current UPDATE implementation handles manualItems.
                // However, 'groups' contains aggregated items (recipes + manual).
                // Reconstructing manualItems from 'groups' is tricky because it mixes recipe ingredients.
                // For this MVP refactoring, let's assume valid simple title updates or handle manual items if explicit.
                // The original code passed `manualItems: []` hardcoded in `save` call:
                /*
                    await axios.put(`/api/shopping-lists/${id}/save`, {
                      title: draftTitle,
                      manualItems: [], // you can wire this later
                    });
                  */
                // So we will stick to that behavior for now.

                await updateShoppingList(listId, {
                  title: draftTitle,
                  manualItems: [], // Preserving original placeholder behavior
                });

                setTitle(draftTitle);
                setGroups(draftGroups);
                setRecipes(draftRecipes);
                setEditMode(false);
                toast.success("Saved");
              } catch {
                toast.error("Failed to save");
              }
            }}
          >
            Save
          </Button>
        </div>
      ) : (
        <Button
          variant="outline"
          onClick={() => {
            // Prepare drafts
            setDraftTitle(title);
            setDraftGroups(structuredClone(groups));
            setDraftRecipes(structuredClone(recipes));
            setEditMode(true);
          }}
        >
          Edit List
        </Button>
      )}

      <ShareExportModal
        open={openShare}
        onClose={() => setOpenShare(false)}
        listId={listId}
        isShared={isShared}
        shareToken={shareToken}
      />
    </div>
  );
}
