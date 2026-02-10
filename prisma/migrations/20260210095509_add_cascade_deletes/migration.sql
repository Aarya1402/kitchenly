-- DropForeignKey
ALTER TABLE "RecipeInList" DROP CONSTRAINT "RecipeInList_recipeId_fkey";

-- AddForeignKey
ALTER TABLE "RecipeInList" ADD CONSTRAINT "RecipeInList_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe"("id") ON DELETE CASCADE ON UPDATE CASCADE;
