import mongoose from 'mongoose';

const otpSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
    },
    otp: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 300, // Document expires 5 minutes (300 seconds) after creation
    },
  }
);

const OTP = mongoose.model('OTP', otpSchema);
export default OTP;
