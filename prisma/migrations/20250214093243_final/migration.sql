-- CreateTable
CREATE TABLE "ProductInventory" (
    "id" SERIAL NOT NULL,
    "productId" INTEGER NOT NULL,
    "productName" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "reserve1" TEXT NOT NULL DEFAULT 'USE ME LATER',
    "reserve2" TEXT NOT NULL DEFAULT 'USE ME LATER',
    "reserve3" TEXT NOT NULL DEFAULT 'USE ME LATER',

    CONSTRAINT "ProductInventory_pkey" PRIMARY KEY ("productId","createdAt")
);

-- CreateTable
CREATE TABLE "DistributorOrder" (
    "id" SERIAL NOT NULL,
    "distributorId" INTEGER NOT NULL,
    "distributorName" TEXT NOT NULL,
    "productId" INTEGER NOT NULL,
    "productName" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "dispatchDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DistributorOrder_pkey" PRIMARY KEY ("distributorId","dispatchDate")
);
