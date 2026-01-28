/*
  Warnings:

  - You are about to drop the column `checked` on the `ManualItem` table. All the data in the column will be lost.
  - You are about to drop the column `checked` on the `ShoppingItemState` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ManualItem" DROP COLUMN "checked",
ADD COLUMN     "isisChecked" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "ShoppingItemState" DROP COLUMN "checked",
ADD COLUMN     "isisChecked" BOOLEAN NOT NULL DEFAULT false;
