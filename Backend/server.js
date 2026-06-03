import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import productRoutes from './Routes/productRoutes.js';
import authRoutes from './Routes/authRoutes.js';
import contactRoutes from './Routes/contactRoutes.js';

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
app.use('/api/contact', contactRoutes);

// Add developer entry point to sync products manually
app.post('/api/developer/sync-products', async (req, res) => {
    try {
        await connectDB();
        const Product = (await import('./Models/Product.js')).default;
        const allProducts = (await import('../Frontend/src/data/products.js')).default;
        
        // Safely upsert products to avoid overwriting admin statuses
        for (const p of allProducts) {
            const existingProduct = await Product.findOne({ id: p.id });
            
            // If it exists, preserve its current admin statuses
            if (existingProduct) {
                p.isOutOfStock = existingProduct.isOutOfStock;
                p.isNew = existingProduct.isNew;
            }
            
            await Product.findOneAndUpdate(
                { id: p.id },
                { $set: p },
                { upsert: true, new: true }
            );
        }
        
        res.status(200).json({ success: true, message: 'MongoDB safely synced with products.js!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Failed to sync', error: error.message });
    }
});

// Only listen if not running in Vercel (for local development)
if (!process.env.VERCEL) {
    app.listen(PORT, async () => {
        console.log(`Server is running on port ${PORT}`);
        await connectDB();
    });
}

// Export the Express API for Vercel Serverless Functions
export default app;
