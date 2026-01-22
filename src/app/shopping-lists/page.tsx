"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type ShoppingListSummary = {
  id: string;
  title: string;
  createdAt: string;
  total: number;
  completed: number;
};

export default function ShoppingListsPage() {
  const router = useRouter();

  const [lists, setLists] = useState<ShoppingListSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/shopping-lists");
      if (!res.ok) {
        alert("Failed to load shopping lists");
        return;
      }

      const json = await res.json();
      setLists(json.lists || []);
      setLoading(false);
    }

    load();
  }, []);

  if (loading) {
    return <div className="p-6">Loading…</div>;
  }

  return (
    <div className="mx-auto max-w-3xl p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Shopping Lists</h1>

        <Button
          variant="outline"
          onClick={() => router.push("/my-recipes")}
        >
          New from Recipes
        </Button>
      </div>

      {lists.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No shopping lists yet.
        </p>
      )}

      <div className="space-y-4">
        {lists.map((list) => (
          <Card
            key={list.id}
            className="cursor-pointer hover:bg-muted/50"
            onClick={() =>
              router.push(`/shopping-lists/${list.id}`)
            }
          >
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                {list.title}
                <Badge variant="secondary">
                  {list.completed}/{list.total}
                </Badge>
              </CardTitle>
            </CardHeader>

            <CardContent className="text-sm text-muted-foreground">
              Created on{" "}
              {new Date(list.createdAt).toLocaleDateString()}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
