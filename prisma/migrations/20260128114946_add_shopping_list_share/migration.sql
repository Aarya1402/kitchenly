/*
  Warnings:

  - A unique constraint covering the columns `[shareToken]` on the table `ShoppingList` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "ShoppingList" ADD COLUMN     "isShared" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "shareToken" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "ShoppingList_shareToken_key" ON "ShoppingList"("shareToken");
