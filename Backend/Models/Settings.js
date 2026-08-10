import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
  deliveryFee: { type: Number, default: 99 },
  freeDeliveryThreshold: { type: Number, default: 999 },
  saleRibbonText: { 
    type: String, 
    default: 'SUMMER SALE IS LIVE! GET UP TO 50% OFF ON ALL GYM EQUIPMENT • USE CODE: FIT50 • LIMITED TIME OFFER • FREE DELIVERY ON ORDERS ABOVE ₹999 • ' 
  },
  saleRibbonColor: { type: String, default: '#e53935' },
  saleRibbonTextColor: { type: String, default: '#ffffff' },

  // FitBox Points economy — configurable from the admin portal so the rate can
  // be tuned without a website deploy or a mobile app release. Everything that
  // prices points (checkout clamp, cart preview, wallet, the T&C copy, the app,
  // and the admin liability figure) reads these instead of a hardcoded number.
  // Changing pointValueInr re-prices every existing balance.
  pointValueInr: { type: Number, default: 0.1, min: 0.01, max: 100 },
  redeemCapPercent: { type: Number, default: 10, min: 0, max: 100 },

  // What winning a weekly territory season is worth, in rupees. Places 2–20 are
  // derived from this by rank and area held, so this one number sets the whole
  // prize table (and roughly 4.7x it is the most a season can cost).
  seasonTopRewardInr: { type: Number, default: 200, min: 0, max: 100000 },
}, { timestamps: true });

// We only need one settings document
export default mongoose.model('Settings', settingsSchema);
