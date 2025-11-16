const express = require('express');
const { signup, login } = require('../controllers/authController');
const { generalLimiter } = require('../middleware/rateLimiter'); // <-- FIXED

const router = express.Router();

router.post('/signup', generalLimiter, signup); // <-- FIXED
router.post('/login', generalLimiter, login); // <-- FIXED

module.exports = router;