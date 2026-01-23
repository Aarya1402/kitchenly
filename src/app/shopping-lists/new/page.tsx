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
import { X } from "lucide-react";
import { CATEGORIES } from "@/constants/categories";

type Item = {
  name: string;
  quantity: string;
  category: string;
  checked: false;
};

export default function NewShoppingListPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const recipeIds = searchParams.get("recipes")?.split(",") ?? [];
  const [title, setTitle] = useState("Shopping List");
  const [groups, setGroups] = useState<Record<string, Item[]>>({});
  const [loading, setLoading] = useState(true);

  /* ───────── Fetch preview ───────── */

  useEffect(() => {
    async function loadPreview() {
      const res = await fetch("/api/shopping-lists/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipeIds }),
      });

      const json = await res.json();
      setGroups(json.groups || {});
      setLoading(false);
    }

    if (recipeIds.length > 0) {
      loadPreview();
    }
  }, [recipeIds]);

  /* ───────── Mutations ───────── */

  const updateItem = (
    category: string,
    index: number,
    updates: Partial<Item>,
  ) => {
    setGroups((prev) => {
      const next = { ...prev };
      next[category] = [...next[category]];
      next[category][index] = {
        ...next[category][index],
        ...updates,
      };
      return next;
    });
  };

  const removeItem = (category: string, index: number) => {
    setGroups((prev) => {
      const next = { ...prev };
      next[category] = next[category].filter((_, i) => i !== index);
      if (next[category].length === 0) {
        delete next[category];
      }
      return next;
    });
  };

  const moveCategory = (from: string, to: string, index: number) => {
    setGroups((prev) => {
      const next = { ...prev };
      const item = next[from][index];

      next[from] = next[from].filter((_, i) => i !== index);
      if (next[from].length === 0) delete next[from];

      next[to] = [...(next[to] || []), { ...item, category: to }];
      return next;
    });
  };

  if (loading) {
    return <div className="p-6">Loading…</div>;
  }

  const onClick = async () => {
    const items = Object.values(groups).flat();

    const res = await fetch("/api/shopping-lists", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: title,
        items,
      }),
    });

    if (!res.ok) {
      alert("Failed to save shopping list");
      return;
    }

    const json = await res.json();
    router.push(`/shopping-lists/${json.id}`);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <h1 className="text-xl font-semibold">Shopping List Preview</h1>
      <Input
        placeholder="Shopping list name"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="max-w-md"
      />
      {Object.entries(groups).map(([category, items]) => (
        <Card key={category}>
          <CardHeader>
            <CardTitle>{category}</CardTitle>
          </CardHeader>

          <CardContent className="space-y-3">
            {items.map((item, index) => (
              <div
                key={`${item.name}-${index}`}
                className="flex items-center gap-2"
              >
                <Input
                  value={item.quantity}
                  onChange={(e) =>
                    updateItem(category, index, {
                      quantity: e.target.value,
                    })
                  }
                  className="w-28"
                />

                <span className="flex-1 text-sm">{item.name}</span>

                <Select
                  value={item.category}
                  onValueChange={(v) => moveCategory(category, v, index)}
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

                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => removeItem(category, index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}

      {/* Footer */}
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={() => router.back()}>
          Back
        </Button>

        <Button onClick={onClick}>Save Shopping List</Button>
      </div>
    </div>
  );
}
