-- CreateTable
CREATE TABLE "ShoppingItemState" (
    "id" TEXT NOT NULL,
    "shoppingListId" TEXT NOT NULL,
    "ingredientKey" TEXT NOT NULL,
    "checked" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ShoppingItemState_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ShoppingItemState_shoppingListId_idx" ON "ShoppingItemState"("shoppingListId");

-- CreateIndex
CREATE UNIQUE INDEX "ShoppingItemState_shoppingListId_ingredientKey_key" ON "ShoppingItemState"("shoppingListId", "ingredientKey");

-- AddForeignKey
ALTER TABLE "ShoppingItemState" ADD CONSTRAINT "ShoppingItemState_shoppingListId_fkey" FOREIGN KEY ("shoppingListId") REFERENCES "ShoppingList"("id") ON DELETE CASCADE ON UPDATE CASCADE;
