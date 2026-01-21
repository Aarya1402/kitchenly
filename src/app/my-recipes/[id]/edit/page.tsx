import { prisma } from "@/lib/db";
import { RecipeEditor } from "@/components/recipes/recipe-editor";

export default async function EditRecipePage(
context: { params: Promise<{ id: string }> }) {
    const { id } = await context.params;
  const recipe = await prisma.recipe.findUnique({
    where: { id: id },
    include: {
      ingredients: true,
      steps: true,
    },
  });

  if (!recipe) {
    return <div>Recipe not found</div>;
  }

  return (
    <RecipeEditor
      mode="edit"
      recipeId={recipe.id}
      initialData={recipe}
    />
  );
}
