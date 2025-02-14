/*
  Warnings:

  - The primary key for the `ProductInventory` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "ProductInventory" DROP CONSTRAINT "ProductInventory_pkey",
ADD CONSTRAINT "ProductInventory_pkey" PRIMARY KEY ("productId", "createdAt");
