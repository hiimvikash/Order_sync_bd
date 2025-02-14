// import { prisma } from "../config/db";
import { v4 as uuidv4 } from 'uuid';

// Helper function to generate SKU with 'sku' prefix and auto-increment logic
// export const generateSkuId = async (): Promise<string> => {
//     const lastProduct = await prisma.product.findFirst({
//       orderBy: { id: 'desc' }, // Get the product with the highest ID
//       select: { id: true }
//     });
  
//     const nextId = lastProduct ? lastProduct.id + 1 : 1; // Increment from the last ID or start from 1
//     return `sku${nextId}`; // Concatenate the prefix with the incremented value
//   };

  export const generateSkuId = (): string => {
    return `SKU-${uuidv4().slice(0, 8)}`; // Generates a random SKU like SKU-1a2b3c4d
  };
  