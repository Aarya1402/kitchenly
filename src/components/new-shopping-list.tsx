"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import {
  createShoppingList,
  previewShoppingList,
} from "@/app/shopping-lists/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ShoppingListNewSkeleton } from "@/components/ui/page-skeletons";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CATEGORIES } from "@/constants/categories";
import { AggregatedItem as PreviewItem } from "@/types/aggregatedItems";

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
  const recipesParam = searchParams.get("recipes") ?? "";
  const recipeIds = searchParams.get("recipes")?.split(",") ?? [];

  const [title, setTitle] = useState("Shopping List");
  const [groups, setGroups] = useState<Record<string, PreviewItem[]>>({});
  const [recipes, setRecipes] = useState<RecipePreview[]>([]);
  /* ───────── Load preview ───────── */

  const [loading, setLoading] = useState(() => {
    return recipeIds.length > 0;
  });

  useEffect(() => {
    async function loadPreview() {
      try {
        const res = await previewShoppingList(recipeIds);

        setGroups(res.groups || {});
        setRecipes(res.recipes || []);
        setLoading(false);
      } catch {
        toast.error("Failed to load preview");
        router.back();
      }
    }

    loadPreview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recipesParam, router]);

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
    try {
      const res = await createShoppingList({
        title,
        recipes,
        manualItems: [],
      });

      router.push(`/shopping-lists/${res.id}`);
    } catch {
      toast.error("Failed to save shopping list");
    }
  };

  if (loading) {
    return <ShoppingListNewSkeleton />;
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
