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

    // Upsert all products to ensure schema updates are applied
    const bulkOps = allProducts.map(p => ({
      updateOne: {
        filter: { id: p.id },
        update: { $set: p },
        upsert: true
      }
    }));

    if (bulkOps.length > 0) {
      const result = await Product.bulkWrite(bulkOps);
      console.log(`Database seeded successfully! Upserted ${result.upsertedCount} new, modified ${result.modifiedCount} existing products.`);
    } else {
      console.log('No products found in products.js to seed.');
    }

    process.exit();
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
