
import { Suspense } from "react";
import NewShoppingListClient from "@/components/new-shopping-list";

export default function NewShoppingListPage() {
  return (
    <Suspense fallback={<div className="p-6">Loading…</div>}>
      <NewShoppingListClient />
    </Suspense>
  );
}
