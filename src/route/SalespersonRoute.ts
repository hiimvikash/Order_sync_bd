// routes/salespersonRoutes.ts
import { Router } from 'express';
import { createOrder, createShopkeeper, getAllCategory, getAllProducts, getSalespersonOrders,getShopkeepersBySalesperson } from '../controllers/salesperson/salespersonController';
import { verifyRole } from '../middleware/authMiddleware'; // Import the middleware
import { getAllDistributors } from '../controllers/admin/adminController';

const salespersonRoute = Router();

//Only allow users with the "SALESPERSON" role to access these routes
salespersonRoute.post("/create-shop", verifyRole(['SALESPERSON']), createShopkeeper);
salespersonRoute.post("/create-order", verifyRole(['SALESPERSON']), createOrder);
salespersonRoute.get("/orders/:salespersonId", verifyRole(['SALESPERSON']), getSalespersonOrders);
salespersonRoute.get("/get-products", verifyRole(['SALESPERSON']), getAllProducts);
salespersonRoute.get("/get-category", verifyRole(['SALESPERSON']), getAllCategory);
salespersonRoute.get("/:salespersonId/shops", verifyRole(['SALESPERSON']), getShopkeepersBySalesperson);
salespersonRoute.get("/get-distributors",getAllDistributors);


export default salespersonRoute;
