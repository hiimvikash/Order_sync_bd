import { prisma } from "./config/db";
import { sendMail } from "./mailer";
import { Queue, Worker } from "bullmq";
import Redis from "ioredis"

import { previousOrder } from "./controllers/distributor/distributorController";

// const pOrder:any = previousOrder;

const connection = new Redis(process.env.REDIS_URI || "", 
  {
    maxRetriesPerRequest: null,
    retryStrategy: (times) => {
      console.log(`Redis reconnect attempt #${times}`);
      return Math.min(times * 200, 5000); // Retry with backoff
    },
    reconnectOnError: (err) => {
      console.error("Redis error, reconnecting...", err);
      return true;
    }
  },
)

connection.ping()
  .then(() => console.log("Redis connected successfully"))
  .catch((err) => console.error("Redis connection failed", err));


export const emailQueue = new Queue("emailQueue", {connection});

const worker = new Worker(
  "emailQueue",
  async (job) => {
    try {
      const orderId = job.data.orderId;
      console.log(`Sending mail for OrderId: ${orderId}`);
      console.log("update email", job.data.isOrderUpdateMail);
      await sendOrderMail(orderId, job.data.isOrderUpdateMail);
      console.log(`✅ Mail sent for OrderId: ${orderId}`);
    } catch (error) {
      console.error(`❌ Error processing job ${job.id} for OrderId ${job.data.orderId}:`, error);
      throw error;
    }
  },
  { connection}
);

worker.on("failed", (job, err) => {
  console.error(`❌ Job ${job?.id} failed after retries:`, err);
});























  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
const sendOrderMail= async (orderId: number, isOrderUpdateMail:boolean) => {
  try {
    const orderDetails = await getOrderById(orderId);
    if (!orderDetails) {
      console.error("Order not found");
      return;
    }
    let mailhtml;
    let subject = 'Order Confirmation';
    if(isOrderUpdateMail){
      mailhtml = generateOrderUpdateHTML(orderDetails);
      subject = `Order Updates for Order ID : ${orderDetails.orderId}` 
    } 
    else mailhtml = generateOrderCreationHTML(orderDetails);

    // Send the email
    await sendMail([orderDetails.salesperson.email, orderDetails.distributor.email, orderDetails.shopkeeper.email ?? ""].filter(email => email), subject, mailhtml);
    
  } catch (error) {
    console.log(error)
    
  }
}


export const getOrderById = async (orderId: number) => {
    try {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        select: {
          id: true,
          orderDate: true,
          deliveryDate: true,
          shopkeeperId: true,
          distributorId: true,
          salespersonId: true,
          totalAmount: true,
          shopkeeper: { select: { name: true, email: true } },
          distributor: { select: { name: true, email: true } },
          salesperson: { select: { name: true, email: true } },
          items: {
            select: {
              quantity: true,
              product: {
                select: {
                  name: true,
                  skuId: true,
                  retailerPrice: true,
                },
              },
            },
          },
        },
      });
  
      if (!order) {
        return null;
      }
  
      // Transform order items to include totalPrice (unitPrice * quantity)
      const formattedItems = order.items.map(item => ({
        productName: item.product.name,
        skuId: item.product.skuId,
        quantityOrdered: item.quantity,
        unitPrice: item.product.retailerPrice,
        totalPrice: item.product.retailerPrice * item.quantity,
      }));
  
      // Construct response object
      const orderResponse = {
        orderId: order.id,
        orderDate: order.orderDate,
        deliveryDate: order.deliveryDate,
        shopkeeper: {
          id: order.shopkeeperId,
          name: order.shopkeeper.name,
          email: order.shopkeeper.email,
        },
        distributor: {
          id: order.distributorId,
          name: order.distributor.name,
          email: order.distributor.email,
        },
        salesperson: {
          id: order.salespersonId,
          name: order.salesperson.name,
          email: order.salesperson.email,
        },
        totalAmount: order.totalAmount,
        orderItems: formattedItems,
      };
  
      return orderResponse;
    } catch (error) {
      console.error("Error fetching order:", error);
      return null;
    }
};


function generateOrderCreationHTML(order:any) {
  return `
    <html>
    <head>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 20px;
          padding: 20px;
          background-color: #f9f9f9;
        }
        .container {
          max-width: 600px;
          margin: auto;
          background: #fff;
          padding: 20px;
          border-radius: 10px;
          box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
        }
        h2 {
          color: #333;
          text-align: center;
        }
        .highlight {
          font-weight: bold;
          color: #d9534f;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
        }
        th, td {
          border: 1px solid #ddd;
          padding: 10px;
          text-align: left;
        }
        th {
          background-color: #f4f4f4;
        }
        .total {
          font-weight: bold;
          color: #d9534f;
        }
        .footer {
          text-align: center;
          margin-top: 20px;
          font-size: 14px;
          color: #777;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h2>Order Acknowledgment</h2>
        <p><strong>Order ID:</strong> ${order.orderId}</p>
        <p><strong>Expected Delivery Date:</strong> ${new Date(order.deliveryDate).toDateString()}</p>
        
        <table>
          <tr>
            <th>Product Name</th>
            <th>Quantity Ordered</th>
            <th>Amount</th>
          </tr>
          ${order.orderItems.map((item:any) => `
            <tr>
              <td>${item.productName}</td>
              <td>${item.quantityOrdered}</td>
              <td>₹${(item.unitPrice * item.quantityOrdered).toFixed(2)}</td>
            </tr>
          `).join('')}
          <tr>
            <td colspan="2" class="total">Total Amount</td>
            <td class="total">₹${order.totalAmount.toFixed(2)}</td>
          </tr>
        </table>
        
        <p class="footer">Thanks & Regards,<br>Needibay's Team</p>
      </div>
    </body>
    </html>
  `;
}

function generateOrderUpdateHTML(order: any) {
  return `
    <html>
    <head>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 20px;
          padding: 20px;
          background-color: #f9f9f9;
        }
        .container {
          max-width: 600px;
          margin: auto;
          background: #fff;
          padding: 20px;
          border-radius: 10px;
          box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
        }
        h2 {
          color: #333;
          text-align: center;
        }
        .highlight {
          font-weight: bold;
          color: #d9534f;
        }
        .message {
          background: #eef8ff;
          padding: 15px;
          border-radius: 8px;
          margin-bottom: 20px;
          font-size: 16px;
          line-height: 1.5;
          color: #333;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
        }
        th, td {
          border: 1px solid #ddd;
          padding: 10px;
          text-align: left;
        }
        th {
          background-color: #f4f4f4;
        }
        .total {
          font-weight: bold;
          color: #d9534f;
        }
        .revised {
          font-weight: bold;
          color: #d9534f;
        }
        .footer {
          text-align: center;
          margin-top: 20px;
          font-size: 14px;
          color: #777;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h2>Order Update Notification</h2>

        <div class="message">
          Dear <span class="highlight">${order.shopkeeper.name}</span>,  
          <br><br>
          We hope you're doing well. We would like to inform you that there has been an update regarding your 
          <strong>Order ID: ${order.orderId}</strong> from the distributor.  
          Please find the latest details below.
        </div>

        <p><strong>Order ID:</strong> ${order.orderId}</p>
        
        <table>
          <tr>
            <th>Product Name</th>
            <th>Quantity</th>
            <th>Revised Quantity</th>
            <th>Amount</th>
          </tr>
          ${order.orderItems.map((item: any) => {
            const previousItem = previousOrder.orderItems.find((prevItem: any) => prevItem.productName === item.productName);
            const previousQuantity = previousItem ? previousItem.quantityOrdered : "N/A";
            const isRevised = previousQuantity !== "N/A" && item.quantityOrdered !== previousQuantity;
            return `
              <tr>
                <td>${item.productName}</td>
                <td>${previousQuantity}</td>
                <td class="${isRevised ? 'revised' : ''}">${item.quantityOrdered}</td>
                <td>₹${(item.unitPrice * item.quantityOrdered).toFixed(2)}</td>
              </tr>
            `;
          }).join('')}
          <tr>
            <td colspan="3" class="total">Total Amount</td>
            <td class="total">₹${order.totalAmount.toFixed(2)}</td>
          </tr>
        </table>
        <p><strong>Expected Delivery Date:</strong> ${new Date(order.deliveryDate).toDateString()}</p>

        
        <p class="footer">
          Thank you for your continued trust in us.<br>
          If you have any questions or need further assistance, please feel free to reach out.<br><br>
          Best Regards,<br>Needibay's Team
        </p>
      </div>
    </body>
    </html>
  `;
}



