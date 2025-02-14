import { z } from 'zod';

// Define the Zod schema for the Shopkeeper model
export const shopkeeperSchema = z.object({
  name: z.string().min(1, { message: "Name is required." }),
  ownerName: z.string().min(1, { message: "Owner name is required." }),
  contactNumber: z.string().min(1, { message: "Contact number is required." }).regex(/^\d{10}$/, "Contact number must be 10 digits."),
  email: z.string().email().optional(),
  gpsLocation: z.string().optional(),
  imageUrl: z.string().optional(),
  videoUrl: z.string().optional(),
  preferredDeliverySlot: z.string().optional(),
  salespersonId: z.number().optional() // Nullable if no salesperson is assigned
});
