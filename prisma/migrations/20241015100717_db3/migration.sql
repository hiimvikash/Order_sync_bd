/*
  Warnings:

  - A unique constraint covering the columns `[phoneNumber]` on the table `Salesperson` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[employeeId]` on the table `Salesperson` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `address` to the `Salesperson` table without a default value. This is not possible if the table is not empty.
  - Added the required column `employeeId` to the `Salesperson` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Salesperson` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pan` to the `Salesperson` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phoneNumber` to the `Salesperson` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Salesperson" ADD COLUMN     "address" TEXT NOT NULL,
ADD COLUMN     "employeeId" TEXT NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "pan" TEXT NOT NULL,
ADD COLUMN     "phoneNumber" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Salesperson_phoneNumber_key" ON "Salesperson"("phoneNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Salesperson_employeeId_key" ON "Salesperson"("employeeId");
