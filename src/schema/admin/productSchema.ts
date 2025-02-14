import { z } from 'zod';

export const productVariantSchema = z.object({
  variantName: z.string().min(1, 'Variant name is required'),
  variantValue: z.string().min(1, 'Variant value is required'),
  price: z.number().positive('Price must be greater than zero'),
  stockQuantity: z.number().int().nonnegative('Stock quantity must be a non-negative integer'),
});

export const productSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  distributorPrice: z.number().positive('Distributor price must be greater than zero'),
  retailerPrice: z.number().positive('Retailer price must be greater than zero'),
  mrp: z.number().positive('MRP must be greater than zero'),
  categoryId: z.number().int().nonnegative('Category ID must be a non-negative integer'),
  inventoryCount: z.number().int().nonnegative('Inventory count must be a non-negative integer'),
  imageUrl: z.string().url().optional(),
  variants: z.array(productVariantSchema).min(1, 'At least one variant is required').optional(), // Ensure at least one variant
});


// Category schema
export const categorySchema = z.object({
  name: z.string().min(1, 'Category name is required'), // Category name
});
