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
app.use(express.static('public'));

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
import orderRoutes from './Routes/orderRoutes.js';

app.use('/api/products', productRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);

// Only listen if not running in Vercel (for local development)
if (!process.env.VERCEL) {
    app.listen(PORT, async () => {
        console.log(`Server is running on port ${PORT}`);
        try {
            await connectDB();
            
            // Dynamically import to keep Vercel/serverless bundle lightweight
            const Product = (await import('./Models/Product.js')).default;
            const allProducts = (await import('../Frontend/src/data/products.js')).default;
            
            // Delete and re-insert to synchronize
            await Product.deleteMany();
            await Product.insertMany(allProducts);
            console.log('🔄 MongoDB successfully auto-synced with products.js!');
        } catch (syncErr) {
            console.error('Failed to auto-sync products.js to MongoDB:', syncErr);
        }
    });
}

// Export the Express API for Vercel Serverless Functions
export default app;
