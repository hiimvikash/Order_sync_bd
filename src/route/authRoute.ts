import { Router} from 'express';
import { login, validateToken } from '../controllers/authController';
const authRoute = Router();

authRoute.post("/login", login);
authRoute.get("/validate-token", validateToken); 

export default authRoute;