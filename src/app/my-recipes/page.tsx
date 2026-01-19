import { MyRecipesGrid } from "../../components/recipes/my-recipes-grid";
import { Recipe } from "@/types/recipe";
// later this will be fetched from API

const MOCK_RECIPES: Recipe[] = [];

export default function MyRecipesPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-6 px-6 py-6">
      <MyRecipesGrid recipes={MOCK_RECIPES} />
    </div>
  );
}
