import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import { rateLimit } from 'express-rate-limit';
import productRoutes from './Routes/productRoutes.js';
import adminRoutes from './Routes/adminRoutes.js';
import authRoutes from './Routes/authRoutes.js';
import contactRoutes from './Routes/contactRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Strict CORS Configuration
const allowedOrigins = [
    process.env.FRONTEND_URL,
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:3000',
    // FitBox Flutter app — web build (Firebase Hosting) needs to call the auth API.
    'https://fitboxsports-8d1c0.web.app',
    'https://fitboxsports-8d1c0.firebaseapp.com'
].filter(Boolean);

// Automatically add www. version of FRONTEND_URL if present
if (process.env.FRONTEND_URL) {
    const url = process.env.FRONTEND_URL;
    if (url.includes('://') && !url.includes('://www.')) {
        allowedOrigins.push(url.replace('://', '://www.'));
    }
}

const corsOptions = {
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (
            !process.env.FRONTEND_URL ||
            allowedOrigins.indexOf(origin) !== -1 ||
            process.env.NODE_ENV !== 'production'
        ) {
            callback(null, true);
        } else {
            callback(null, false);
        }
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
    credentials: true,
};

// Security Middlewares
app.use(helmet());
app.use((req, res, next) => {
    // Redefine req.query as writable in Express 5
    if (req.query) {
        const parsedQuery = req.query;
        Object.defineProperty(req, 'query', {
            value: parsedQuery,
            writable: true,
            configurable: true,
            enumerable: true
        });
    }
    next();
});
app.use(mongoSanitize());
app.use(cors(corsOptions));

// Rate Limiting
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many requests, please try again after 15 minutes.' }
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // Limit each IP to 20 auth attempts per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many authentication attempts, please try again after 15 minutes.' }
});

app.use('/api', globalLimiter);
app.use('/api/auth', authLimiter);

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
import walletRoutes from './Routes/walletRoutes.js';

app.use('/api/products', productRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/wallet', walletRoutes);

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

                // Merge variants: keep DB prices/sizes but always refresh images from products.js
                if (existingProduct.variants && existingProduct.variants.length > 0) {
                    p.variants = existingProduct.variants.map((dbVariant, idx) => {
                        const localVariant = p.variants?.[idx] || {};
                        return {
                            ...dbVariant.toObject ? dbVariant.toObject() : dbVariant,
                            images: (localVariant.images && localVariant.images.length > 0)
                                ? localVariant.images
                                : dbVariant.images || [],
                            color: dbVariant.color || localVariant.color || '',
                        };
                    });
                }
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
                // Preserve fields that may have been manually edited in the DB
                p.isOutOfStock = existingProduct.isOutOfStock;
                p.isNew = existingProduct.isNew;
                
                // Preserve variants (prices) if they exist in the DB
                // This prevents the sync from overwriting manually set prices
                // Merge variants: keep DB prices/sizes but always refresh images from products.js
                // (images live in the local filesystem, so products.js is the source of truth for them)
                if (existingProduct.variants && existingProduct.variants.length > 0) {
                    p.variants = existingProduct.variants.map((dbVariant, idx) => {
                        const localVariant = p.variants?.[idx] || {};
                        return {
                            ...dbVariant.toObject ? dbVariant.toObject() : dbVariant,
                            // Always take images from products.js – they are filesystem paths
                            images: (localVariant.images && localVariant.images.length > 0)
                                ? localVariant.images
                                : dbVariant.images || [],
                            // Also refresh color label from local in case it was blank
                            color: dbVariant.color || localVariant.color || '',
                        };
                    });
                }
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
