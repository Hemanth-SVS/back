const User = require('../models/User');
const OTP = require('../models/OTP');
const { generateToken } = require('../utils/helpers');
const sanitize = require('../utils/sanitize');
const logger = require('../utils/logger');

exports.signup = async (req, res) => {
  try {
    let { email, password, mobile } = req.body;
    
    if (!email || !password || !mobile) {
      return res.status(400).json({
        success: false,
        message: 'Email, password and mobile are required'
      });
    }

    // Sanitize inputs
    email = sanitize.email(email);
    mobile = sanitize.mobile(mobile);
    
    if (!email || !mobile) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email or mobile number format'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    // --- FIXED: Check for verified OTP first ---
    const verifiedOTP = await OTP.findOne({ mobile, verified: true });

    if (!verifiedOTP) {
        return res.status(400).json({
            success: false,
            message: 'Mobile number not verified. Please verify OTP first.'
        });
    }
    // -------------------------------------------
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // CREATE USER - NOT APPLICATION!
    const user = await User.create({ email, password, mobile });

    // --- FIXED: Clean up used OTP ---
    await OTP.deleteMany({ mobile });
    // --------------------------------
    
    const token = generateToken(user._id);
    
    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
      data: {
        userId: user._id,
        email: user.email
      }
    });
    
    logger.info(`New user registered: ${email}`);
  } catch (error) {
    logger.error('Signup error', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.login = async (req, res) => {
  try {
    let { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(401).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Sanitize email
    email = sanitize.email(email);
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }
    
    // Fetch user AND their password
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const token = generateToken(user._id);
    
    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      data: {
        userId: user._id,
        email: user.email
      }
    });
    
    logger.info(`User logged in: ${email}`);
  } catch (error) {
    logger.error('Login error', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};