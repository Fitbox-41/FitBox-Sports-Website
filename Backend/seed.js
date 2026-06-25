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

    // Fetch all existing products
    const existingProducts = await Product.find({}, { id: 1 });
    const existingIds = new Set(existingProducts.map(p => p.id));

    // Filter out products that already exist
    const newProducts = allProducts.filter(p => !existingIds.has(p.id));

    if (newProducts.length > 0) {
      // Insert only new products
      await Product.insertMany(newProducts);
      console.log(`Database seeded successfully with ${newProducts.length} NEW products from products.js`);
    } else {
      console.log('No new products found in products.js. Existing data was left untouched.');
    }

    process.exit();
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
