// routes/distributorRoutes.ts
import { Router } from 'express';
import { getDistributorOrders, updateConfirmationPhotoUrl, updateOrderDetails, updatePartialPayment } from '../controllers/distributor/distributorController';
import { verifyRole } from '../middleware/authMiddleware'; // Import the middleware
import { getShopkeeperBalance, getShopkeeperBalanceHandler, getShopkeepersWithBalances, getShopkeepersWithBalancesHandler } from '../controllers/distributor/balanceController';

const distributorRoute = Router();

// Only allow users with the "DISTRIBUTOR" role to access these routes
distributorRoute.get("/get-orders", verifyRole(['DISTRIBUTOR']), getDistributorOrders);
distributorRoute.put("/orders/:orderId", verifyRole(['DISTRIBUTOR']), updateOrderDetails);
distributorRoute.put("/orders/:orderId/partial-payment", verifyRole(['DISTRIBUTOR']), updatePartialPayment);
distributorRoute.put("/orders/:orderId/confirmation-photo", verifyRole(['DISTRIBUTOR']), updateConfirmationPhotoUrl);

// Add the routes for retrieving balances
distributorRoute.get("/shopkeeper/:shopkeeperId/balance", verifyRole(['DISTRIBUTOR']), getShopkeeperBalanceHandler);  // Route to get individual shopkeeper balance
distributorRoute.get("/shopkeepers/balances", verifyRole(['DISTRIBUTOR']), getShopkeepersWithBalancesHandler); // Route to get all shopkeepers with balances
export default distributorRoute;
