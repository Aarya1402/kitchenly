import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { redirect } from "next/navigation";

import { getShoppingLists } from "@/app/shopping-lists/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function ShoppingListsPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  const lists = await getShoppingLists();

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Shopping Lists</h1>
        <div data-tour="add-list-button">
          <Link href="/recipes">
            <Button variant="outline">New from Recipes</Button>
          </Link>
        </div>
      </div>

      {lists.length === 0 && (
        <p className="text-muted-foreground text-sm">No shopping lists yet.</p>
      )}

      <div className="space-y-4">
        {lists.map((list) => (
          <Link
            key={list.id}
            href={`/shopping-lists/${list.id}`}
            className="block"
          >
            <Card
              className="hover:bg-muted/50 cursor-pointer transition-colors"
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
          </Link>
        ))}
      </div>
    </div>
  );
}
