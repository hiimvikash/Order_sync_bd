/*
  Warnings:

  - You are about to alter the column `unitPrice` on the `ProductInventory` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.

*/
-- AlterTable
ALTER TABLE "ProductInventory" ALTER COLUMN "unitPrice" SET DATA TYPE INTEGER;
