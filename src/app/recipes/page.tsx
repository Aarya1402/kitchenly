import { MyRecipesGrid } from "@/components/recipes/my-recipes-grid";

import { getRecipes } from "./actions";

export default async function MyRecipesPage() {
  const initialData = await getRecipes({ page: 1, limit: 12 });

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <MyRecipesGrid initialData={initialData} />
    </div>
  );
}
