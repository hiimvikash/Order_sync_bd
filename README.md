# SpeedSales Backend

A backend service for order synchronization and sales management built with **Node.js**, **Express**, and **TypeScript**. This project is designed to streamline sales processes for SMEs by managing orders, products, users, and roles (Admin, Salesperson, Distributor) with efficient role-based access control and secure authentication.

## Features

### User Authentication & Authorization
- **JWT-based Authentication** with secure password hashing (bcrypt).
- Role-based access with three distinct roles: **Admin**, **Salesperson**, and **Distributor**.

### Product Management
- **Category and Variant Support**: Manage products by category and multiple variants.
- **Inventory Tracking**: Track stock levels across products.
- **Image Uploads**: Integrate with **Cloudinary** for product image storage.

### Order Management
- **Order Creation and Tracking**: Manage order lifecycle and update status.
- **Payment Terms**: Support for **COD**, **Credit**, and **Partial Payment** options.
- **Delivery Scheduling**: Set delivery dates and statuses.

### User Management
- **Shopkeeper Management**: Add and manage shops.
- **Salesperson and Distributor Management**: Create, update, and track assigned users.

## Tech Stack

- **Node.js** and **Express.js** for backend server
- **TypeScript** for type-safe code
- **Prisma ORM** for data management
- **PostgreSQL** as the relational database
- **JWT** for authentication
- **Cloudinary** for image storage
- **Multer** for file uploads
- **Zod** for data validation

## Prerequisites

Ensure you have the following installed:
- **Node.js** (v14 or higher)
- **PostgreSQL** database
- **npm** or **yarn** package manager

## Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/partiksingh1/order_sync_backend.git
   cd order_sync_backend
   

2. **Install dependencies:**
      ```bash
     npm install
      

3.  **Set up environment variables: Create a .env file in the root directory with the following values:**


env
     ```bash
     
    DATABASE_URL="postgresql://username:password@localhost:5432/database_name"
    JWT_SECRET="your-jwt-secret"
    CLOUDINARY_CLOUD_NAME="your-cloud-name"
    CLOUDINARY_API_KEY="your-api-key"
    CLOUDINARY_API_SECRET="your-api-secret"


4. Run database migrations:

    ```bash
    npx prisma migrate dev


5. Running the Application

Start the development server with:

    ```bash 
    npm run dev


6. To run the application in production:

    ```bash
    npm run build
    npm start
7. API Endpoints
   
        Authentication
        POST /api/v1/auth/login - User login
        GET /api/v1/auth/validate-token - Validate JWT token
        Admin Routes
        POST /api/v1/admin/signup - Create an admin account
        POST /api/v1/admin/create-category - Create product category
        POST /api/v1/admin/create-product - Add a new product
        GET /api/v1/admin/get-products - List all products
        GET /api/v1/admin/get-orders - List all orders
   
        Salesperson Routes
        POST /api/v1/salesperson/create-order - Create a new order
        GET /api/v1/salesperson/orders - Retrieve salesperson's orders
        Distributor Routes
        GET /api/v1/distributor/orders - Retrieve distributor's orders



License
This project is licensed under the ISC License. See the LICENSE file for details.
