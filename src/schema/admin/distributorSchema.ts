import { z } from 'zod';

// Distributor Signup Validation Schema
export const distributorSignupSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }), // Name validation
  email: z.string().email({ message: "Invalid email format" }), // Email validation
  password: z.string().min(6, { message: "Password must be at least 6 characters long" }), // Password validation
  phoneNumber: z.string()
    .min(10, { message: "Phone number must be at least 10 characters long" })
    .max(15, { message: "Phone number must be at most 15 characters long" }) // Phone number validation
    .regex(/^\d+$/, { message: "Phone number must only contain digits" }), // Optional: ensure phone number is numeric
  gstNumber: z.string().optional(), // GST Number validation (optional)
  pan: z.string().length(10, { message: "PAN must be exactly 10 characters long" }).optional(), // PAN validation (optional)
  address: z.string().min(1, { message: "Address is required" }), // Address validation
});