// src/express.d.ts (or wherever you place your type definitions)
import { User } from '../src/types/User'; // Adjust the path accordingly

declare global {
  namespace Express {
    interface Request {
      user?: User; // This will allow you to access req.user without TypeScript errors
    }
  }
}
