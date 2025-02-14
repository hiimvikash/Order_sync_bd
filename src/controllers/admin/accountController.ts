import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import {prisma} from "../../config/db"
import { distributorSignupSchema } from '../../schema/admin/distributorSchema';
import { salespersonSignupSchema } from '../../schema/admin/salespersonAuthSchema';

const saltRounds = 10;
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

// Signup Function for Salesperson
export const createSalesperson = async (req: Request, res: Response): Promise<void> => {
  // Validate request body using Zod
  const validation = salespersonSignupSchema.safeParse(req.body);
  
  if (!validation.success) {
    const errorMessages = validation.error.errors.map(e => e.message);
     res.status(400).json({ message: errorMessages });
     return
  }

  const { email, password, name, phoneNumber, employeeId, pan, address } = validation.data; // Safe access to validated data

  try {
    const existingSalesperson = await prisma.salesperson.findUnique({ where: { email } });
    if (existingSalesperson) {
     res.status(400).json({ message: 'Email is already registered' });
     return
    }
    const existingSalespersonPhone = await prisma.salesperson.findUnique({ where: { phoneNumber } });
    if (existingSalespersonPhone) {
      res.status(400).json({ message: 'Phone number is already registered' });
      return;
    }

    const existingSalespersonEmployeeId = await prisma.salesperson.findUnique({ where: { employeeId } });
    if (existingSalespersonEmployeeId) {
      res.status(400).json({ message: 'Employee ID is already registered' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newSalesperson = await prisma.salesperson.create({
      data: {
        email,
        password: hashedPassword,
        name,
        phoneNumber,
        employeeId,
        pan,
        address,
      },
    });

    res.status(201).json({
      message: 'Salesperson created successfully',
      salesperson: {
        id: newSalesperson.id,
        email: newSalesperson.email,
        name: newSalesperson.name,
        phoneNumber: newSalesperson.phoneNumber,
        employeeId: newSalesperson.employeeId,
        role: newSalesperson.role,
      },
    });
    return
  } catch (error) {
   res.status(500).json({ message: 'Internal Server Error' });
   return
  }
};

export const createDistributor = async (req: Request, res: Response): Promise<void> => {
  // Validate request body using Zod
  const validation = distributorSignupSchema.safeParse(req.body);
  
  if (!validation.success) {
    const errorMessages = validation.error.errors.map(e => e.message);
    res.status(400).json({ message: errorMessages });
    return
  }

  const { name, email, password, phoneNumber, gstNumber, pan, address } = validation.data; // Safe access to validated data

  try {
    const existingDistributor = await prisma.distributor.findUnique({ where: { email } });
    if (existingDistributor) {
      res.status(400).json({ message: 'Email is already registered' });
      return
    }
    const existingDistributorPhone = await prisma.distributor.findUnique({ where: { phoneNumber } });
    if (existingDistributorPhone) {
      res.status(400).json({ message: 'Phone number is already registered' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newDistributor = await prisma.distributor.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phoneNumber,
        gstNumber,
        pan,
        address,
      },
    });

    res.status(201).json({
      message: 'Distributor created successfully',
      distributor: {
        id: newDistributor.id,
        name: newDistributor.name,
        email: newDistributor.email,
        phoneNumber: newDistributor.phoneNumber,
        role: newDistributor.role,
      },
    });
    return
  } catch (error) {
    console.error(error); // Log the error for debugging
    res.status(500).json({ message: 'Internal Server Error' });
    return
  }
};