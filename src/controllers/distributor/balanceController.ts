import { prisma } from "../../config/db";
import jwt from "jsonwebtoken";
import { Request, Response } from "express";

export async function getShopkeeperBalance(
  distributorId: number,
  shopkeeperId: number
): Promise<number> {
  try {
    const result = await prisma.partialPayment.aggregate({
      _sum: {
        remainingAmount: true, // Total unpaid balance
      },
      where: {
        order: {
          distributorId,
          shopkeeperId,
          status: "PENDING", // Only include pending or active orders
        },
        paymentStatus: "PENDING", // Only include unpaid balances
      },
    });

    // Return the sum of unpaid balance, defaulting to 0 if no result
    return result._sum.remainingAmount || 0;
  } catch (error) {
    console.error(
      `Error getting balance for shopkeeper ${shopkeeperId}:`,
      error
    );
    throw new Error(
      "Could not retrieve shopkeeper balance. Please try again later."
    );
  }
}

export async function getShopkeepersWithBalances(distributorId: number) {
  try {
    // Fetch shopkeepers with their orders and partial payments, filtering for the distributor's pending orders
    const shopkeepers = await prisma.shopkeeper.findMany({
      where: {
        orders: {
          some: {
            distributorId,
          },
        },
      },
      include: {
        orders: {
          where: {
            distributorId,
          },
          include: {
            partialPayment: true, // Include partial payments for each order
          },
        },
      },
    });

    // Calculate the total balance for each shopkeeper
    const shopkeeperBalances = shopkeepers.map((shopkeeper) => {
      const totalBalance = shopkeeper.orders.reduce((sum, order) => {
        const payment = order.partialPayment;
        return sum + (payment?.remainingAmount || 0); // Add remaining amount for unpaid orders
      }, 0);

      return {
        id: shopkeeper.id,
        name: shopkeeper.name,
        totalBalance, // Total remaining balance for the shopkeeper
      };
    });

    return shopkeeperBalances; // Return the calculated balances
  } catch (error) {
    console.error(
      `Error retrieving shopkeepers for distributor ${distributorId}:`,
      error
    );
    throw new Error(
      "Could not retrieve shopkeepers with balances. Please try again later."
    );
  }
}

export const getShopkeeperBalanceHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  const token = req.headers.authorization?.split(" ")[1]; // Assuming Bearer token

  if (!token) {
    res.status(401).json({ message: "Authorization token is required" });
    return;
  }

  try {
    const decoded: any = jwt.verify(
      token,
      process.env.JWT_SECRET || "your_jwt_secret"
    );
    const distributorId = decoded.id;

    if (!distributorId) {
      res.status(400).json({ message: "Invalid distributor ID from token" });
      return;
    }

    const { shopkeeperId } = req.params; // Assuming shopkeeperId is passed as a parameter
    const balance = await getShopkeeperBalance(
      distributorId,
      parseInt(shopkeeperId)
    );

    res.status(200).json({
      message: "Shopkeeper balance retrieved successfully",
      balance,
    });
  } catch (error) {
    console.error("Error fetching balance:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getShopkeepersWithBalancesHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  const token = req.headers.authorization?.split(" ")[1]; // Assuming Bearer token

  if (!token) {
    res.status(401).json({ message: "Authorization token is required" });
    return;
  }

  try {
    const decoded: any = jwt.verify(
      token,
      process.env.JWT_SECRET || "your_jwt_secret"
    );
    const distributorId = decoded.id;

    if (!distributorId) {
      res.status(400).json({ message: "Invalid distributor ID from token" });
      return;
    }

    const shopkeepers = await getShopkeepersWithBalances(distributorId);

    res.status(200).json({
      message: "Shopkeepers with balances retrieved successfully",
      shopkeepers: shopkeepers,
    });
  } catch (error) {
    console.error("Error fetching shopkeepers:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
