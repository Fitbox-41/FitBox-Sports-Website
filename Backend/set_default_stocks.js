import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const productSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  stock: { type: Number, default: 100 }
}, { strict: false });

const Product = mongoose.model('Product', productSchema);

const run = async () => {
  try {
    const uri = process.env.MONGO_URI;
    await mongoose.connect(uri);
    console.log("Connected to MongoDB Atlas.");

    const result = await Product.updateMany(
      { stock: { $exists: false } },
      { $set: { stock: 100 } }
    );

    console.log(`Successfully updated database documents! Modified count: ${result.modifiedCount}`);
    process.exit(0);
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  }
};

run();
