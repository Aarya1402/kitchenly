import { getRecipe } from "@/app/recipes/actions";
import { RecipeEditor } from "@/components/recipes/recipe-editor";

export default async function EditRecipePage(props: {
  params: Promise<{ id: string }>;
}) {
  const params = await props.params;
  const recipe = await getRecipe(params.id);

  if (!recipe) {
    return <div className="p-6">Recipe not found</div>;
  }

  return <RecipeEditor mode="edit" recipeId={recipe.id} initialData={recipe} />;
}
