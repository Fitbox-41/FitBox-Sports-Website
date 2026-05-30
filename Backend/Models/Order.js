import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name: String,
    quantity: Number,
    price: Number,
    selectedVariant: String,
    selectedSize: String,
    imgSrc: String
  }],
  totalAmount: { type: Number, required: true },
  shippingAddress: {
    name: String, phone: String, street: String, city: String, state: String, zip: String, country: String
  },
  paymentStatus: { type: String, enum: ['Pending Payment', 'Paid', 'Failed'], default: 'Pending Payment' },
  shipmentStatus: { type: String, enum: ['Pending', 'Created', 'Shipped', 'Delivered', 'Cancelled'], default: 'Pending' },
  awb: String,
  courier: { type: String, default: 'Delhivery' },
  trackingUrl: String,
  invoiceNumber: String,
  invoiceUrl: String,
  paymentId: String,
  paidAt: Date
}, { timestamps: true });

// TTL Index: Automatically delete documents after 1800 seconds (30 mins)
// ONLY if paymentStatus is 'Pending Payment'.
orderSchema.index(
  { createdAt: 1 }, 
  { expireAfterSeconds: 1800, partialFilterExpression: { paymentStatus: 'Pending Payment' } }
);

import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Helper function to delete Cloudinary invoice
const deleteCloudinaryInvoice = async (doc) => {
  if (doc && doc.invoiceUrl) {
    try {
      const publicId = `fitbox_invoices/Invoice-${doc._id}`;
      // Since it was uploaded with resource_type: "image"
      await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
      console.log(`Automatically deleted invoice from Cloudinary: ${publicId}`);
    } catch (err) {
      console.error("Failed to automatically delete invoice from Cloudinary", err);
    }
  }
};

orderSchema.post('findOneAndDelete', deleteCloudinaryInvoice);
orderSchema.post('deleteOne', { document: true, query: false }, deleteCloudinaryInvoice);

export default mongoose.model('Order', orderSchema);
