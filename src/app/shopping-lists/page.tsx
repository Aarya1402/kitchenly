"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingListsSkeleton } from "@/components/ui/page-skeletons";
import axios from "axios";
import { ShoppingListSummary } from "@/types/shoppingListSummary";

export default function ShoppingListsPage() {
  const router = useRouter();

  const [lists, setLists] = useState<ShoppingListSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await axios.get("/api/shopping-lists");

        setLists(res.data.lists || []);
      } catch (error) {
        alert("Failed to load shopping lists");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  if (loading) {
    return <ShoppingListsSkeleton />;
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Shopping Lists</h1>
        <div data-tour="add-list-button">
          <Button variant="outline" onClick={() => router.push("/recipes")}>
            New from Recipes
          </Button>
        </div>
      </div>

      {lists.length === 0 && (
        <p className="text-muted-foreground text-sm">No shopping lists yet.</p>
      )}

      <div className="space-y-4">
        {lists.map((list) => (
          <Card
            key={list.id}
            className="hover:bg-muted/50 cursor-pointer"
            onClick={() => router.push(`/shopping-lists/${list.id}`)}
            data-tour="list-card"
            data-list-id={list.id}
          >
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {list.title}
              </CardTitle>
            </CardHeader>

            <CardContent className="text-muted-foreground text-sm">
              Created on {new Date(list.createdAt).toLocaleDateString()}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
