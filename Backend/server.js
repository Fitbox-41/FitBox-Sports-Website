import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import productRoutes from './Routes/productRoutes.js';
import authRoutes from './Routes/authRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Serverless-friendly Database Connection
const connectDB = async () => {
    if (mongoose.connection.readyState >= 1) {
        return;
    }
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000 // Time out quickly if it can't connect
        });
        console.log('Connected to MongoDB Atlas');
    } catch (err) {
        console.error('Error connecting to MongoDB Atlas:', err.message);
    }
};

// Middleware to ensure DB is connected before handling API requests
app.use(async (req, res, next) => {
    await connectDB();
    next();
});

// Routes
app.use('/api/products', productRoutes);
app.use('/api/auth', authRoutes);

// Only listen if not running in Vercel (for local development)
if (!process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

// Export the Express API for Vercel Serverless Functions
export default app;
