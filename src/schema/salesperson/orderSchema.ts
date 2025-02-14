import { z } from 'zod';

// Define the schema for partialPayment
const partialPaymentSchema = z.object({
  initialAmount: z.number().min(0),
  remainingAmount: z.number().min(0),
  dueDate: z.string(),  // To be transformed to Date later
}).optional();  // Make it optional

const orderItemSchema = z.object({
  productId: z.number(),
  variantId: z.number().optional(),
  quantity: z.number().min(1),
});

export const orderSchema = z.object({
  shopkeeperId: z.number(),
  distributorId: z.number(),
  salespersonId: z.number(),
  deliveryDate: z.string(),
  deliverySlot: z.string(),
  paymentTerm: z.enum(["COD", "CREDIT", "PARTIAL"]),  // Include "PARTIAL" if needed
  orderNote: z.string().optional(),
  items: z.array(orderItemSchema),
  partialPayment: partialPaymentSchema,  // Include partialPayment in the schema
});
