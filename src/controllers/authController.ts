import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import { prisma } from '../config/db'; // Adjust the import based on your project structure

// Define your Zod schema for login validation
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6), // Adjust the password requirements as needed
});

export const login = async (req: Request, res: Response): Promise<void> => {
  // Validate request body using Zod
  const validation = loginSchema.safeParse(req.body);

  if (!validation.success) {
    const errorMessages = validation.error.errors.map(e => e.message);
    res.status(400).json({ message: errorMessages });
    return;
  }

  const { email, password } = validation.data;

  try {
    // Check for user in Admin, Salesperson, and Distributor tables
    let user: any = await prisma.admin.findUnique({ where: { email } }) ||
                    await prisma.salesperson.findUnique({ where: { email } }) ||
                    await prisma.distributor.findUnique({ where: { email } });

    if (!user) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    // Compare the password using bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    // Generate a JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role:user.role },
      "your_jwt_secret",
    );

    // Return the user info (excluding the password) and the token
    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        role:user.role,
      },
    });
  } catch (error) {
    console.log(error);
    
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const validateToken = async (req: Request, res: Response): Promise<void> => {
    const token = req.headers.authorization?.split(' ')[1];
  
    if (!token) {
      res.status(401).json({ error: 'Token is required' });
      return;
    }
  
    try {
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET || "your_jwt_secret");
      
      // Check if user exists in the database
      const user = await prisma.admin.findUnique({ where: { id: decoded.id } }) ||
                   await prisma.salesperson.findUnique({ where: { id: decoded.id } }) ||
                   await prisma.distributor.findUnique({ where: { id: decoded.id } });
  
      if (!user) {
        res.status(401).json({ error: 'User not found' });
        return;
      }
  
      res.status(200).json({ user });
    } catch (error) {
      console.error('Token validation error:', error);
      res.status(401).json({ error: 'Invalid token' });
    }
  };