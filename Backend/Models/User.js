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
    }
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model('User', userSchema);
export default User;
