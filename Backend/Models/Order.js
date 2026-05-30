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

export default mongoose.model('Order', orderSchema);
