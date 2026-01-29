/*
  Warnings:

  - You are about to drop the column `isisChecked` on the `ManualItem` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ManualItem" DROP COLUMN "isisChecked",
ADD COLUMN     "isChecked" BOOLEAN NOT NULL DEFAULT false;
