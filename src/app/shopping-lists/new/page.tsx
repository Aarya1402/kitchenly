import { Suspense } from "react";
import NewShoppingListClient from "@/components/new-shopping-list";
import { PageLoadingFallback } from "@/components/ui/page-loading";

export default function NewShoppingListPage() {
  return (
    <Suspense fallback={<PageLoadingFallback />}>
      <NewShoppingListClient />
    </Suspense>
  );
}
