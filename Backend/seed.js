import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './Models/Product.js';
// Import products data from frontend
import allProducts from '../Frontend/src/data/products.js';

dotenv.config();

const seedDatabase = async () => {
  try {
    if (!process.env.MONGO_URI || process.env.MONGO_URI === 'your_mongodb_connection_string_here') {
       console.error("Please add your MongoDB connection string to .env file before seeding.");
       process.exit(1);
    }
    
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Delete existing products
    await Product.deleteMany();
    console.log('Existing products removed');

    // Insert new products
    await Product.insertMany(allProducts);
    console.log('Database seeded successfully with products from products.js');

    process.exit();
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
