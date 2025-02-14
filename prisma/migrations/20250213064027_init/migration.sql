/*
  Warnings:

  - The primary key for the `DistributorOrder` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "DistributorOrder" DROP CONSTRAINT "DistributorOrder_pkey",
ADD CONSTRAINT "DistributorOrder_pkey" PRIMARY KEY ("distributorId", "dispatchDate");
