-- CreateTable
CREATE TABLE "NewInventory" (
    "id" SERIAL NOT NULL,
    "productId" INTEGER NOT NULL,
    "productName" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "reserve1" TEXT NOT NULL,
    "reserve2" TEXT NOT NULL,
    "reserve3" TEXT NOT NULL,

    CONSTRAINT "NewInventory_pkey" PRIMARY KEY ("productId")
);
