const express = require('express');
const { sendOTP, verifyOTP } = require('../controllers/otpController');
const { otpLimiter, generalLimiter } = require('../middleware/rateLimiter'); // <-- FIXED

const router = express.Router();

router.post('/send', otpLimiter, sendOTP);
router.post('/verify', generalLimiter, verifyOTP); // <-- FIXED

module.exports = router;