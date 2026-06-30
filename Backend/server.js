import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import productRoutes from './Routes/productRoutes.js';
import adminRoutes from './Routes/adminRoutes.js';
import authRoutes from './Routes/authRoutes.js';
import contactRoutes from './Routes/contactRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
const corsOptions = {
    origin: (_origin, callback) => callback(null, true),
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
    credentials: true,
};

app.use(cors(corsOptions));
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization,Accept,Origin,X-Requested-With');
    res.header('Access-Control-Allow-Credentials', 'true');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(204);
    }
    next();
});

app.get('/favicon.ico', (req, res) => res.sendStatus(204));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use('/admin/public', express.static(path.join(process.cwd(), 'admin', 'public')));

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
app.use('/api/admin', adminRoutes);
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
            
            // If it exists, preserve its current admin statuses & pricing
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

// Function to safely sync products.js to MongoDB automatically
const autoSyncProductsToDB = async () => {
    try {
        console.log('Starting automatic product sync...');
        const Product = (await import('./Models/Product.js')).default;
        const allProducts = (await import('../Frontend/src/data/products.js')).default;
        
        for (const p of allProducts) {
            const existingProduct = await Product.findOne({ id: p.id });
            
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
        console.log('Automatic product sync completed!');
    } catch (error) {
        console.error('Failed automatic product sync:', error);
    }
};

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization,Accept,Origin,X-Requested-With');
    res.header('Access-Control-Allow-Credentials', 'true');
    if (!res.headersSent) {
        res.status(err.status || 500).json({ message: err.message || 'Server Error' });
    }
});

// Only listen if not running in Vercel (for local development)
if (!process.env.VERCEL) {
    app.listen(PORT, async () => {
        console.log(`Server is running on port ${PORT}`);
        await connectDB();
        await autoSyncProductsToDB();
    });
}

// Export the Express API for Vercel Serverless Functions
export default app;
