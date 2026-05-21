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
    cart: [
      {
        id: { type: String, required: true },
        title: { type: String },
        price: { type: Number },
        image: { type: String },
        quantity: { type: Number, default: 1 },
        selectedVariant: { type: String }
      }
    ],
    wishlist: [
      {
        id: { type: String, required: true },
        title: { type: String },
        price: { type: Number },
        image: { type: String }
      }
    ],
    orders: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order'
      }
    ]
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model('User', userSchema);
export default User;
