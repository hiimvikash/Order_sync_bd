/*
  Warnings:

  - Added the required column `unitPrice` to the `ProductInventory` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ProductInventory" ADD COLUMN     "unitPrice" DOUBLE PRECISION NOT NULL;
