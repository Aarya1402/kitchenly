"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";

type Item = {
  id: string;
  name: string;
  quantity: string;
  category: string;
  checked: boolean;
};

export default function ShoppingListPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [groups, setGroups] = useState<Record<string, Item[]>>({});
  const [loading, setLoading] = useState(true);

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
      setLoading(false);
    }

    if (id) load();
  }, [id, router]);

  /* ───────── Toggle item ───────── */

  const toggleItem = async (category: string, index: number) => {
    const item = groups[category][index];
    const nextChecked = !item.checked;

    // optimistic UI
    setGroups((prev) => {
      const next = { ...prev };
      next[category] = [...next[category]];
      next[category][index] = {
        ...item,
        checked: nextChecked,
      };
      return next;
    });

    const res = await fetch(`/api/shopping-lists/${id}/items/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ checked: nextChecked }),
    });

    if (!res.ok) {
      // rollback
      setGroups((prev) => {
        const next = { ...prev };
        next[category] = [...next[category]];
        next[category][index] = {
          ...item,
          checked: item.checked,
        };
        return next;
      });
    }
  };

  if (loading) {
    return <div className="p-6">Loading…</div>;
  }

  return (
    <div className="mx-auto max-w-2xl p-6 space-y-6">
      <h1 className="text-xl font-semibold">{title}</h1>

      {Object.entries(groups).map(([category, items]) => (
        <div key={category}>
          <h2 className="mb-2 font-medium">{category}</h2>

          <div className="space-y-2">
            {items.map((item, index) => (
              <label key={item.id} className="flex items-center gap-3">
                <Checkbox
                  checked={item.checked}
                  onCheckedChange={() => toggleItem(category, index)}
                />

                <span
                  className={`flex-1 ${
                    item.checked ? "line-through text-muted-foreground" : ""
                  }`}
                >
                  {item.quantity} {item.name}
                </span>
              </label>
            ))}
          </div>
        </div>
      ))}

      <Button
        variant="outline"
        onClick={() => router.replace("/shopping-lists")}
      >
        Back
      </Button>
    </div>
  );
}
