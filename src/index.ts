import express, { Express, Request, Response } from 'express';
import cors from 'cors'; // Import the CORS package
import adminRouter from './route/adminRoute';
import authRoute from './route/authRoute';
import salespersonRoute from './route/SalespersonRoute';
import distributorRoute from './route/distributorsRoute';
import https from 'https'; 

const app: Express = express();
const port: number = 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Use CORS middleware
app.use(cors()); // Enable CORS for all routes

app.use("/api/v1/auth", authRoute);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/salesperson", salespersonRoute);
app.use("/api/v1/distributor", distributorRoute);
const keepAlive = () => {
    https.get('https://speedsales.onrender.com/api/v1', (res) => {
        console.log(`Keep-alive pinged: ${res.statusCode}`);
    }).on('error', (err) => {
        console.error(`Error pinging: ${err.message}`);
    });
};
setInterval(keepAlive, 10 * 60 * 1000);

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});

export default app;
