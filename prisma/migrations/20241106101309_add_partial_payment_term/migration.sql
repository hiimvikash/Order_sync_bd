-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID');

-- AlterEnum
ALTER TYPE "PaymentTerm" ADD VALUE 'PARTIAL';

-- CreateTable
CREATE TABLE "PartialPayment" (
    "id" SERIAL NOT NULL,
    "orderId" INTEGER NOT NULL,
    "initialAmount" DOUBLE PRECISION NOT NULL,
    "remainingAmount" DOUBLE PRECISION NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PartialPayment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PartialPayment_orderId_key" ON "PartialPayment"("orderId");

-- AddForeignKey
ALTER TABLE "PartialPayment" ADD CONSTRAINT "PartialPayment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
