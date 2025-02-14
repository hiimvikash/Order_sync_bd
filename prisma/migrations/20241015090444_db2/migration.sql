/*
  Warnings:

  - Added the required column `password` to the `Distributor` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Admin" ADD COLUMN     "role" TEXT NOT NULL DEFAULT 'ADMIN';

-- AlterTable
ALTER TABLE "Distributor" ADD COLUMN     "imageUrl" TEXT,
ADD COLUMN     "password" TEXT NOT NULL,
ADD COLUMN     "role" TEXT NOT NULL DEFAULT 'DISTRIBUTOR';

-- AlterTable
ALTER TABLE "Salesperson" ADD COLUMN     "role" TEXT NOT NULL DEFAULT 'SALESPERSON';
