// middleware/authMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const verifyRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(' ')[1]; // Assuming Bearer token

    if (!token) {
       res.status(401).json({ message: 'Authorization token is required' });
      return
    }

    try {
      console.log('Token:', token);
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret'); // Use your actual secret
      if (!allowedRoles.includes(decoded.role)) {
         res.status(403).json({ message: 'Access denied: insufficient permissions' });
         return
      }
      next(); // Continue to the next middleware/route handler
    } catch (error) {
      console.error(error);
       res.status(401).json({ message: 'Invalid token' });
       return
    }
  };
};
