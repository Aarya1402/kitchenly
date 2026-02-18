import { getShoppingList } from "@/app/shopping-lists/actions";

import ShoppingListDetail from "./shopping-list-detail";

export default async function ShoppingListDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const list = await getShoppingList(id);

  if (!list) {
    return <div className="p-6">Shopping list not found</div>;
  }

  // Transform backend group structure to component state shape
  // The component expects `Record<string, AggregatedItem[]>`
  // getShoppingList returns exactly that in `groups`
  // also `recipes` match
  return (
    <ShoppingListDetail
      listId={id}
      initialTitle={list.title}
      initialGroups={list.groups}
      initialRecipes={list.recipes}
      initialIsShared={
        false /* TODO: fetch isShared from action if needed, or update getShoppingList to return it */
      }
      initialShareToken={null /* TODO: same */}
    />
  );
}
