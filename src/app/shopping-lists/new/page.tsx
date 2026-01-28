"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { CATEGORIES } from "@/constants/categories";

/* ───────── Types ───────── */

type PreviewItem = {
  ingredientKey: string;
  name: string;
  quantity: number;
  unit: string;
  category: string;
};

type RecipePreview = {
  recipeId: string;
  title: string;
  baseServings: number;
  servingsUsed: number;
};

/* ───────── Page ───────── */

export default function NewShoppingListPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const recipeIds = searchParams.get("recipes")?.split(",") ?? [];

  const [title, setTitle] = useState("Shopping List");
  const [groups, setGroups] = useState<Record<string, PreviewItem[]>>({});
  const [recipes, setRecipes] = useState<RecipePreview[]>([]);
  const [loading, setLoading] = useState(true);

  /* ───────── Load preview ───────── */

  useEffect(() => {
    async function loadPreview() {
      const res = await fetch("/api/shopping-lists/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipeIds }),
      });

      if (!res.ok) {
        alert("Failed to load preview");
        router.back();
        return;
      }

      const json = await res.json();

      setGroups(json.groups || {});
      setRecipes(json.recipes || []);
      setLoading(false);
    }

    if (recipeIds.length > 0) {
      loadPreview();
    }
  }, [recipeIds, router]);

  /* ───────── Category reassignment (UI only) ───────── */

  const moveCategory = (from: string, to: string, index: number) => {
    setGroups((prev) => {
      const next = structuredClone(prev);
      const item = next[from][index];

      next[from].splice(index, 1);
      if (next[from].length === 0) delete next[from];

      next[to] = [...(next[to] || []), { ...item, category: to }];
      return next;
    });
  };

  /* ───────── Save list ───────── */

  const saveList = async () => {
    const res = await fetch("/api/shopping-lists", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        recipes, 
        manualItems: [], 
      }),
    });

    if (!res.ok) {
      alert("Failed to save shopping list");
      return;
    }

    const json = await res.json();
    router.push(`/shopping-lists/${json.id}`);
  };

  if (loading) {
    return <div className="p-6">Loading…</div>;
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <h1 className="text-xl font-semibold">Shopping List Preview</h1>

      <Input
        placeholder="Shopping list name"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="max-w-md"
      />

      {/* ───────── Recipes summary ───────── */}
      <Card>
        <CardHeader>
          <CardTitle>Recipes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {recipes.map((r) => (
            <div key={r.recipeId} className="flex justify-between text-sm">
              <span>{r.title}</span>
              <span className="text-muted-foreground">
                Servings: {r.servingsUsed}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* ───────── Ingredients preview ───────── */}
      {Object.entries(groups).map(([category, items]) => (
        <Card key={category}>
          <CardHeader>
            <CardTitle>{category}</CardTitle>
          </CardHeader>

          <CardContent className="space-y-3">
            {items.map((item) => (
              <div key={item.ingredientKey} className="flex items-center gap-2">
                <span className="w-28 text-sm">
                  {item.quantity} {item.unit}
                </span>

                <span className="flex-1 text-sm">{item.name}</span>

                <Select
                  value={item.category}
                  onValueChange={(v) =>
                    moveCategory(category, v, items.indexOf(item))
                  }
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}

      {/* ───────── Footer ───────── */}
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={() => router.back()}>
          Back
        </Button>

        <Button onClick={saveList}>Save Shopping List</Button>
      </div>
    </div>
  );
}
