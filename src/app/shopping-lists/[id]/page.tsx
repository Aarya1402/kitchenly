"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/* ───────── Types ───────── */

type Item = {
  ingredientKey: string;
  name: string;
  quantity: number;
  unit: string;
  category: string;
  checked: boolean;
};

type RecipeInList = {
  recipeId: string;
  title: string;
  servingsUsed: number;
};

/* ───────── Page ───────── */

export default function ShoppingListPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [groups, setGroups] = useState<Record<string, Item[]>>({});
  const [recipes, setRecipes] = useState<RecipeInList[]>([]);
  const [loading, setLoading] = useState(true);

  const [editMode, setEditMode] = useState(false);
  const [draftTitle, setDraftTitle] = useState("");
  const [draftGroups, setDraftGroups] = useState<Record<string, Item[]>>({});
  const [draftRecipes, setDraftRecipes] = useState<RecipeInList[]>([]);

  const activeGroups = editMode ? draftGroups : groups;

  /* ───────── Fetch list ───────── */

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/shopping-lists/${id}`);
      if (!res.ok) {
        alert("Failed to load shopping list");
        router.back();
        return;
      }

      const json = await res.json();

      setTitle(json.title);
      setGroups(json.groups);
      setRecipes(json.recipes);

      // prepare edit drafts
      setDraftTitle(json.title);
      setDraftGroups(structuredClone(json.groups));
      setDraftRecipes(structuredClone(json.recipes));

      setLoading(false);
    }

    if (id) load();
  }, [id, router]);

  /* ───────── Toggle checked (shopping mode) ───────── */

  async function toggleItem(ingredientKey: string, checked: boolean) {
    await fetch(`/api/shopping-lists/${id}/toggle-item`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ingredientKey, checked }),
    });
  }

  if (loading) {
    return <div className="p-6">Loading…</div>;
  }

  return (
    <div className="mx-auto max-w-2xl p-6 space-y-6">
      {/* ───────── Title ───────── */}
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
                <span className="text-sm text-muted-foreground">Servings</span>

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
                    await fetch(`/api/shopping-lists/${id}/regenerate`, {
                      method: "PUT",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify({
                        recipeId: r.recipeId,
                        servingsUsed: r.servingsUsed,
                      }),
                    });

                    // reload list after regeneration
                    const res = await fetch(`/api/shopping-lists/${id}`);
                    const json = await res.json();
                    setDraftGroups(json.groups);
                  }}
                >
                  Regenerate
                </Button>
              </div>
            </div>
          ))}
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
                    checked={item.checked}
                    onCheckedChange={(v) => {
                      const next = Boolean(v);

                      setGroups((prev) => {
                        const copy = structuredClone(prev);
                        const target = copy[category].find(
                          (i) => i.ingredientKey === item.ingredientKey,
                        );
                        if (target) target.checked = next;
                        return copy;
                      });

                      toggleItem(item.ingredientKey, next);
                    }}
                  />
                )}

                {editMode ? (
                  <>
                    <Input
                      type="number"
                      min={0}
                      value={item.quantity}
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
                      item.checked ? "line-through text-muted-foreground" : ""
                    }`}
                  >
                    {item.quantity} {item.unit} {item.name}
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
              const res = await fetch(`/api/shopping-lists/${id}/save`, {
                method: "PUT",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  title: draftTitle,
                  manualItems: [], // you can wire this later
                }),
              });

              if (!res.ok) {
                alert("Failed to save");
                return;
              }

              setTitle(draftTitle);
              setGroups(draftGroups);
              setRecipes(draftRecipes);
              setEditMode(false);
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
    </div>
  );
}
