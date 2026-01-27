/*
  Warnings:

  - You are about to drop the `ShoppingItem` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ShoppingItem" DROP CONSTRAINT "ShoppingItem_shoppingListId_fkey";

-- DropTable
DROP TABLE "ShoppingItem";

-- CreateTable
CREATE TABLE "RecipeInList" (
    "id" TEXT NOT NULL,
    "shoppingListId" TEXT NOT NULL,
    "recipeId" TEXT NOT NULL,
    "recipeTitle" TEXT NOT NULL,
    "baseServings" INTEGER NOT NULL,
    "servingsUsed" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RecipeInList_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ListIngredient" (
    "id" TEXT NOT NULL,
    "recipeInListId" TEXT NOT NULL,
    "ingredientKey" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ListIngredient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ManualItem" (
    "id" TEXT NOT NULL,
    "shoppingListId" TEXT NOT NULL,
    "ingredientKey" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "checked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ManualItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RecipeInList_recipeId_idx" ON "RecipeInList"("recipeId");

-- CreateIndex
CREATE UNIQUE INDEX "RecipeInList_shoppingListId_recipeId_key" ON "RecipeInList"("shoppingListId", "recipeId");

-- CreateIndex
CREATE INDEX "ListIngredient_ingredientKey_idx" ON "ListIngredient"("ingredientKey");

-- AddForeignKey
ALTER TABLE "RecipeInList" ADD CONSTRAINT "RecipeInList_shoppingListId_fkey" FOREIGN KEY ("shoppingListId") REFERENCES "ShoppingList"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecipeInList" ADD CONSTRAINT "RecipeInList_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ListIngredient" ADD CONSTRAINT "ListIngredient_recipeInListId_fkey" FOREIGN KEY ("recipeInListId") REFERENCES "RecipeInList"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ManualItem" ADD CONSTRAINT "ManualItem_shoppingListId_fkey" FOREIGN KEY ("shoppingListId") REFERENCES "ShoppingList"("id") ON DELETE CASCADE ON UPDATE CASCADE;
