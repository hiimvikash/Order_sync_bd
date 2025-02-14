import { z } from 'zod';

// Salesperson Signup Validation Schema
export const salespersonSignupSchema = z.object({
  email: z.string().email({ message: "Invalid email format" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters long" }),
  name: z.string().min(1, { message: "Name is required" }), // Add name validation
  phoneNumber: z.string().min(10, { message: "Phone number must be at least 10 characters long" }) // Add phone number validation
    .max(15, { message: "Phone number must be at most 15 characters long" }), // Optional: limit max length
  employeeId: z.string().min(1, { message: "Employee ID is required" }), // Add employee ID validation
  pan: z.string(), // Assuming PAN is a 10 character string
  address: z.string(),
});

// Salesperson Login Validation Schema
export const salespersonLoginSchema = z.object({
  email: z.string().email({ message: "Invalid email format" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters long" }),
});