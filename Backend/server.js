import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import productRoutes from './Routes/productRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/products', productRoutes);

// Database Connection
mongoose.connect(process.env.MONGO_URI)
.then(() => {
    console.log('Connected to MongoDB Atlas');
    // Only listen if not running in Vercel
    if (!process.env.VERCEL) {
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    }
})
.catch((err) => {
    console.error('Error connecting to MongoDB Atlas:', err.message);
});

// Export the Express API for Vercel Serverless Functions
export default app;
