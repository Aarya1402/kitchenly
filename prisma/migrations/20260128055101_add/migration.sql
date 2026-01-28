/*
  Warnings:

  - You are about to drop the column `isisChecked` on the `ShoppingItemState` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ShoppingItemState" DROP COLUMN "isisChecked",
ADD COLUMN     "isChecked" BOOLEAN NOT NULL DEFAULT false;
