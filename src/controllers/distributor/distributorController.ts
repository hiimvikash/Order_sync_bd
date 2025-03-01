import { Request, Response } from 'express';
import { prisma } from '../../config/db';
import jwt from 'jsonwebtoken'; // Ensure you have jwt package installed
import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import * as stream from 'stream';
import { emailQueue, getOrderById } from '../../queue';


const upload = multer({ storage: multer.memoryStorage() }).single('file');

// Configure cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dcrkqaq20',
  api_key: process.env.CLOUDINARY_API_KEY || '945669894999448',
  api_secret: process.env.CLOUDINARY_API_SECRET || '0Zn8LRb9E6PCNzvAWMZe0_JgFVU',
});


// Controller to get Distributor Orders
export const getDistributorOrders = async (req: Request, res: Response): Promise<void> => {
  const token = req.headers.authorization?.split(' ')[1]; // Assuming Bearer token

  if (!token) {
    res.status(401).json({ message: 'Authorization token is required' });
    return;
  }

  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
    const distributorId = decoded.id;

    if (!distributorId) {
      res.status(400).json({ message: 'Invalid distributor ID from token' });
      return;
    }

    // Pagination parameters (optional, you can uncomment if needed)
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const [orders, totalOrders] = await Promise.all([
      prisma.order.findMany({
        where: { distributorId },
        // skip,
        // take: limit,
        select: {
          id: true,
          deliveryDate: true,
          totalAmount: true,
          status: true,
          paymentTerm: true,
          shopkeeper: {
            select: { name: true, contactNumber: true },
          },
          items: {
            select: {
              quantity: true,
              product: {
                select: {
                  id: true, // Include productId
                  name: true,
                  retailerPrice: true,
                },
              },
              variantId: true, // Include variantId
            },
          },
          partialPayment: {
            select: {
              initialAmount: true,
              remainingAmount: true,
              dueDate: true,
              paymentStatus: true,
            },
          },
        },
      }),
      prisma.order.count({
        where: { distributorId },
      }),
    ]);

    const responseOrders = orders.map(order => ({
      id: order.id,
      deliveryDate: order.deliveryDate,
      totalAmount: order.totalAmount,
      paymentTerm: order.paymentTerm,
      status: order.status,
      shopkeeper: {
        name: order.shopkeeper?.name,
        contactNumber: order.shopkeeper?.contactNumber,
      },
      items: order.items.map(item => ({
        productId: item.product?.id, // Include productId
        variantId: item.variantId,   // Include variantId
        productName: item.product?.name,
        quantity: item.quantity,
        price: item.product?.retailerPrice,
      })),
      partialPayment: order.partialPayment
        ? {
            initialAmount: order.partialPayment.initialAmount,
            remainingAmount: order.partialPayment.remainingAmount,
            dueDate: order.partialPayment.dueDate,
            paymentStatus: order.partialPayment.paymentStatus,
          }
        : null,
    }));

    res.status(200).json({
      message: 'Orders retrieved successfully',
      currentPage: page,
      totalPages: Math.ceil(totalOrders / limit),
      totalOrders,
      orders: responseOrders,
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

let previousOrder:any;
export const updateOrderDetails = async (req: Request, res: Response): Promise<void> => {
  const token = req.headers.authorization?.split(' ')[1]; // Assuming Bearer token

  if (!token) {
    res.status(401).json({ message: 'Authorization token is required' });
    return;
  }

  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
    const distributorId = decoded.id;

    if (!distributorId) {
      res.status(400).json({ message: 'Invalid distributor ID from token' });
      return;
    }

    const { orderId } = req.params;
    const { items, status, deliveryDate } = req.body; // Get items and status from request body

    const order = await prisma.order.findUnique({ where: { id: parseInt(orderId) } });
    previousOrder = await getOrderById(Number(orderId));

    if (!order) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }

    if (order.distributorId !== distributorId) {
      res.status(403).json({ message: 'You are not authorized to update this order' });
      return;
    }

    let totalAmount = order.totalAmount; // Start with the current total amount

    // Update status if provided
    if (status) {
      await prisma.order.update({
        where: { id: parseInt(orderId) },
        data: { status }, // Update the status
      });
    }
    if(deliveryDate){
      await prisma.order.update(
        {
          where : {id : parseInt(orderId)},
          data : {
            deliveryDate : new Date(deliveryDate)
          }
        }
      )
    }

    // If items are provided, update the order item quantities
    if (items && Array.isArray(items)) {
      for (const item of items) {
        const { productId, variantId, quantity } = item;

        if (!productId) {
          res.status(400).json({ message: 'productId and quantity are required for each item' });
          return;
        }

        const orderItem = await prisma.orderItem.findFirst({
          where: {
            orderId: parseInt(orderId),
            productId,
            variantId: variantId || undefined, // Handles both cases
          },
        });

        if (!orderItem) {
          res.status(404).json({ message: `Order item with productId ${productId} not found in this order` });
          return;
        }

        // Fetch product details including price
        const product = await prisma.product.findUnique({
          where: { id: productId },
          include: { variants: true }, // Include variants if necessary
        });

        if (!product) {
          res.status(404).json({ message: `Product with ID ${productId} not found` });
          return;
        }

        // Check for the variant
        const variant = product.variants.find(v => v.id === variantId);

        if (variant) {
          // Update the order item with the new quantity
          await prisma.orderItem.update({
            where: { id: orderItem.id },
            data: {
              quantity,
            },
          });

          // Update total amount using variant price
          totalAmount += (variant.price * quantity) - (orderItem.quantity * (variant.price || product.retailerPrice)); // Adjust total amount
        } else {
          // Update the order item without a variant
          await prisma.orderItem.update({
            where: { id: orderItem.id },
            data: {
              quantity,
            },
          });

          // Update total amount using base product price
          totalAmount += (product.retailerPrice * quantity) - (orderItem.quantity * product.retailerPrice); // Adjust total amount
        }
      }
      // Update the total amount for the order if it has changed
      await prisma.order.update({
        where: { id: parseInt(orderId) },
        data: { totalAmount }, // Update the total amount
      });
      
      // Clean any old pending jobs before adding a new one
      await emailQueue.add("emailQueue",{orderId : parseInt(orderId), isOrderUpdateMail : true}, {
        attempts: 1,
        backoff: {
          type: 'exponential',
          delay: 3000
        }
      })
    }


    res.status(200).json({ message: 'Order updated successfully', totalAmount });
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};


// Controller to update partial payment by order ID
export const updatePartialPayment = async (req: Request, res: Response): Promise<void> => {
  const token = req.headers.authorization?.split(' ')[1]; // Assuming Bearer token

  if (!token) {
    res.status(401).json({ message: 'Authorization token is required' });
    return;
  }

  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
    const distributorId = decoded.id;

    if (!distributorId) {
      res.status(400).json({ message: 'Invalid distributor ID from token' });
      return;
    }

    const { orderId } = req.params;
    const { initialAmount, remainingAmount, dueDate, paymentStatus } = req.body;

    if (!initialAmount && !remainingAmount && !dueDate && !paymentStatus) {
      res.status(400).json({ message: 'At least one of initialAmount, remainingAmount, dueDate, or paymentStatus must be provided' });
      return;
    }

    const order = await prisma.order.findUnique({ where: { id: parseInt(orderId) } });

    if (!order) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }

    if (order.distributorId !== distributorId) {
      res.status(403).json({ message: 'You are not authorized to update this order' });
      return;
    }

    const updatedPartialPayment = await prisma.partialPayment.upsert({
      where: { orderId: parseInt(orderId) },
      update: {
        initialAmount: initialAmount || undefined,
        remainingAmount: remainingAmount || undefined,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        paymentStatus: paymentStatus || undefined,
      },
      create: {
        orderId: parseInt(orderId),
        initialAmount: initialAmount || 0,
        remainingAmount: remainingAmount || 0,
        dueDate: dueDate ? new Date(dueDate) : new Date(),
        paymentStatus: paymentStatus || 'pending',
      },
    });

    res.status(200).json({
      message: 'Partial payment updated successfully',
      partialPayment: {
        initialAmount: updatedPartialPayment.initialAmount,
        remainingAmount: updatedPartialPayment.remainingAmount,
        dueDate: updatedPartialPayment.dueDate,
        paymentStatus: updatedPartialPayment.paymentStatus,
      },
    });
  } catch (error) {
    console.error('Error updating partial payment:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const updateConfirmationPhotoUrl = async (req: Request, res: Response): Promise<void> => {
  upload(req, res, async (err) => {
    if (err) {
      res.status(400).json({ message: 'Error uploading image', error: err.message });
      return;
    }

    console.log('Uploaded File:', req.file);  // Log for debugging purposes

    if (!req.file) {
      res.status(400).json({ message: 'Image file is required' });
      return;
    }

    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      res.status(401).json({ message: 'Authorization token is required' });
      return;
    }

    try {
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
      const distributorId = decoded.id;

      if (!distributorId) {
        res.status(400).json({ message: 'Invalid distributor ID from token' });
        return;
      }

      const { orderId } = req.params;

      // Ensure file exists before uploading
      if (!req.file) {
        res.status(400).json({ message: 'File is missing in the request' });
        return;
      }

      // Cloudinary upload using a stream
      const uploadResponse = cloudinary.uploader.upload_stream(
        { folder: 'order-confirmation-photos' },
        async (error, result) => {
          if (error) {
            res.status(400).json({ message: 'Error uploading to Cloudinary', error: error.message });
            return;
          }

          // Check if result is defined before proceeding
          if (!result) {
            res.status(400).json({ message: 'Cloudinary upload failed' });
            return;
          }

          // Proceed with database update
          const order = await prisma.order.findUnique({ where: { id: parseInt(orderId) } });

          if (!order) {
            res.status(404).json({ message: 'Order not found' });
            return;
          }

          if (order.distributorId !== distributorId) {
            res.status(403).json({ message: 'You are not authorized to update this order' });
            return;
          }

          // Update confirmationPhotoUrl in the database
          const updatedOrder = await prisma.order.update({
            where: { id: parseInt(orderId) },
            data: { confirmationPhotoUrl: result.secure_url },
          });

          res.status(200).json({
            message: 'Confirmation photo updated successfully',
            order: {
              id: updatedOrder.id,
              confirmationPhotoUrl: updatedOrder.confirmationPhotoUrl,
            },
          });
        }
      );

      // Convert the buffer to a readable stream and pipe it to Cloudinary
      const bufferStream = new stream.PassThrough();
      bufferStream.end(req.file.buffer);  // End the stream with the file buffer
      bufferStream.pipe(uploadResponse);

    } catch (error) {
      console.error('Error updating confirmation photo URL:', error);
      res.status(500).json({ message: 'Internal Server Error', error: error });
    }
  });
};


export {previousOrder};