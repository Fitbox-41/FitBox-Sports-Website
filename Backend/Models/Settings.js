import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
  deliveryFee: { type: Number, default: 99 },
  // Can add more settings here in the future
}, { timestamps: true });

// We only need one settings document
export default mongoose.model('Settings', settingsSchema);
