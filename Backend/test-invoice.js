import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Order from './Models/Order.js';
import { generateInvoice } from './Utils/invoiceGenerator.js';

dotenv.config();

async function test() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to Mongo");
  const order = await Order.findOne({}).sort({ createdAt: -1 });
  if (!order) return console.log("No order found");
  
  console.log("Found order:", order._id);
  try {
    const res = await generateInvoice(order);
    console.log("Invoice generated successfully:", res);
  } catch (err) {
    console.error("Failed to generate invoice:");
    console.error(err);
  }
  process.exit(0);
}

test();
