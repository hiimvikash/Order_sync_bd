import { prisma } from "./config/db";
import { sendMail } from "./mailer";
import { Queue, Worker } from "bullmq";
import Redis from "ioredis"

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


new Worker(
    "emailQueue",
    async (job) => {
      const orderId = job.data.orderId;
      console.log(`Sending mail for OrderId : ${orderId}`);
      await sendOrderMail(orderId);
      console.log(`Mail sent for OrderId : ${orderId}`);
    },
    { connection }
  );






















  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  const sendOrderMail= async (orderId: number) => {
    try {
      const orderDetails = await getOrderById(orderId);
      if (!orderDetails) {
        console.error("Order not found");
        return;
      }
      const mailhtml = generateOrderHTML(orderDetails);
      // Send the email
  
      await sendMail([orderDetails.salesperson.email, orderDetails.distributor.email, orderDetails.shopkeeper.email ?? ""].filter(email => email), 'Order Confirmation', mailhtml);
      
    } catch (error) {
      
    }
  }


const getOrderById = async (orderId: number) => {
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


function generateOrderHTML(order:any) {
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
        <h2>Order Confirmation</h2>
        <p><strong>Order ID:</strong> ${order.orderId}</p>
        <p><strong>Shopkeeper:</strong> <span class="highlight">${order.shopkeeper.name}</span> (${order.shopkeeper.email})</p>
        <p><strong>Salesperson:</strong> ${order.salesperson.name} (${order.salesperson.email})</p>
        <p><strong>Distributor:</strong> ${order.distributor.name} (${order.distributor.email})</p>
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


