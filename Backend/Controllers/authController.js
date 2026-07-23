import User from '../Models/User.js';
import OTP from '../Models/OTP.js';
import sendEmail from '../Utils/sendEmail.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const generateToken = (id) => {
  if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET is not defined');
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

const getEmailTemplate = (otp, title = 'Your Verification Code', message = 'Hello! Please use the 6-digit code below to securely verify your identity and access your account.') => `
<div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 10px rgba(0,0,0,0.05); overflow: hidden; border: 1px solid #eaeaea;">
  <div style="background-color: #1a1a2e; padding: 30px 20px; text-align: center;">
    <h1 style="color: #ff6b35; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: 1px;">FitBox Sports</h1>
  </div>
  <div style="padding: 40px 30px;">
    <h2 style="color: #1a1a2e; font-size: 22px; margin-top: 0; margin-bottom: 20px;">${title}</h2>
    <p style="color: #555555; font-size: 16px; line-height: 1.5; margin-bottom: 30px;">
      ${message}
    </p>
    <div style="text-align: center; margin: 30px 0;">
      <span style="display: inline-block; padding: 15px 30px; background-color: #f8f9fa; border: 2px dashed #ff6b35; border-radius: 8px; font-size: 32px; font-weight: 800; color: #ff6b35; letter-spacing: 4px;">
        ${otp}
      </span>
    </div>
    <p style="color: #777777; font-size: 14px; text-align: center; margin-bottom: 0;">
      This code will expire in <strong>5 minutes</strong>. If you did not request this, please ignore this email.
    </p>
  </div>
  <div style="background-color: #fcfcfc; border-top: 1px solid #eaeaea; padding: 20px; text-align: center;">
    <p style="color: #999999; font-size: 12px; margin: 0;">
      &copy; ${new Date().getFullYear()} FitBox Sports. All rights reserved.
    </p>
  </div>
</div>
`;

export const preRegister = async (req, res) => {
  try {
    const { email } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const otp = generateOTP();
    await OTP.findOneAndDelete({ email }); // Remove old OTP
    await OTP.create({ email, otp });

    const html = getEmailTemplate(otp);
    const sent = await sendEmail({ email, subject: 'FitBox Verification Code', html });

    if (sent) {
      res.status(200).json({ message: 'OTP sent to email' });
    } else {
      res.status(500).json({ message: 'Error sending email' });
    }
  } catch (error) {
    console.error('Error in preRegister:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, otp } = req.body;

    if (!otp) return res.status(400).json({ message: 'OTP is required' });
    const otpRecord = await OTP.findOne({ email, otp });
    if (!otpRecord) return res.status(400).json({ message: 'Invalid or expired OTP' });

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    if (user) {
      await OTP.findOneAndDelete({ email });
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        cart: user.cart,
        wishlist: user.wishlist,
        phone: user.phone,
        addresses: user.addresses,
        orders: user.orders,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error('Error in register:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

export const preLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && user.password && (await bcrypt.compare(password, user.password))) {
      const otp = generateOTP();
      await OTP.findOneAndDelete({ email });
      await OTP.create({ email, otp });

      const html = getEmailTemplate(otp);
      const sent = await sendEmail({ email, subject: 'FitBox Login Code', html });

      if (sent) {
        res.status(200).json({ message: 'OTP sent to email' });
      } else {
        res.status(500).json({ message: 'Error sending email' });
      }
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('Error in preLogin:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email });

    // Account created via Google sign-in has no local password. Guard this so
    // bcrypt.compare(password, undefined) can't throw a 500, and tell the user
    // how to proceed instead.
    if (user && !user.password) {
      return res.status(401).json({
        message:
          'This account uses Google sign-in. Tap "Continue with Google", or use "Forgot password" to set a password.',
      });
    }

    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        cart: user.cart,
        wishlist: user.wishlist,
        phone: user.phone,
        addresses: user.addresses,
        orders: user.orders,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('Error in login:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

export const requestPasswordResetOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const otp = generateOTP();
    await OTP.findOneAndDelete({ email });
    await OTP.create({ email, otp });

    const html = getEmailTemplate(otp, 'Password Reset', 'You requested a password reset. Please use the 6-digit code below to reset your password.');
    const sent = await sendEmail({ email, subject: 'FitBox Password Reset Code', html });

    if (sent) {
      res.status(200).json({ message: 'Password reset OTP sent to email' });
    } else {
      res.status(500).json({ message: 'Error sending email' });
    }
  } catch (error) {
    console.error('Error in requestPasswordResetOtp:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

export const verifyResetOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!otp) return res.status(400).json({ message: 'OTP is required' });

    const otpRecord = await OTP.findOne({ email, otp });
    if (!otpRecord) return res.status(400).json({ message: 'Invalid or expired OTP' });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    await OTP.findOneAndDelete({ email });

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      cart: user.cart,
      wishlist: user.wishlist,
      phone: user.phone,
      addresses: user.addresses,
      orders: user.orders,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error('Error in verifyResetOtp:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

export const updatePassword = async (req, res) => {
  try {
    const { password } = req.body;
    if (!password || password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error in updatePassword:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Auth user with Google
// @route   POST /api/auth/google
// @access  Public
export const googleLogin = async (req, res) => {
  try {
    const { name, email } = req.body;

    // Check if user already exists
    let user = await User.findOne({ email });

    if (!user) {
      // Create new user for Google login
      user = await User.create({
        name,
        email,
        authProvider: 'google',
        // password is not required and omitted
      });
    }

    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        cart: user.cart,
        wishlist: user.wishlist,
        phone: user.phone,
        addresses: user.addresses,
        orders: user.orders,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error('Error in google login:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};


// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        cart: user.cart,
        wishlist: user.wishlist,
        phone: user.phone,
        addresses: user.addresses,
        orders: user.orders,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Error in profile:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.phone = req.body.phone !== undefined ? req.body.phone : user.phone;
      
      if (req.body.addresses) {
        user.addresses = req.body.addresses;
        user.markModified('addresses');
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        addresses: updatedUser.addresses,
        cart: updatedUser.cart,
        wishlist: updatedUser.wishlist,
        orders: updatedUser.orders,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Error in update profile:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Delete user account and all data
// @route   DELETE /api/auth/profile
// @access  Private
export const deleteAccount = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      await User.deleteOne({ _id: user._id });
      res.json({ message: 'User account removed successfully' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Error deleting account:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Sync cart and wishlist
// @route   PUT /api/auth/sync
// @access  Private
export const syncData = async (req, res) => {
  try {
    const { cart, wishlist } = req.body;
    const user = await User.findById(req.user._id);

    if (user) {
      if (cart !== undefined) {
        user.cart = cart;
        user.markModified('cart');
      }
      if (wishlist !== undefined) {
        user.wishlist = wishlist;
        user.markModified('wishlist');
      }
      
      const updatedUser = await user.save();
      res.json({
        cart: updatedUser.cart,
        wishlist: updatedUser.wishlist,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Error syncing data:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};
