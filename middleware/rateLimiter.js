const rateLimit = require('express-rate-limit');

exports.otpLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5,
    message: 'Too many OTP requests, please try again after 15 minutes'
});

// Renamed for more general use
exports.generalLimiter = rateLimit({ // <-- FIXED
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: 'Too many requests, please try again after 15 minutes'
});