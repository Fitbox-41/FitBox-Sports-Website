import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    password: {
      type: String,
      required: false, // Made optional for Google users
    },
    authProvider: {
      type: String,
      default: 'local' // Can be 'local' or 'google'
    },
    cart: {
      type: Array,
      default: []
    },
    wishlist: {
      type: Array,
      default: []
    },
    phone: {
      type: String,
      default: ''
    },
    addresses: {
      type: Array,
      default: []
    },
    orders: {
      type: Array,
      default: []
    },
    // Shared FitBox points balance — kept on the user doc so it's visible right
    // in the users collection. History lives in the wallet_transactions ledger.
    walletBalance: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model('User', userSchema);
export default User;
