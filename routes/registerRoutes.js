const express = require('express');
const {
  fetchAadhaar,
  submitApplication,
  getStatus
} = require('../controllers/registerController');
const { protect } = require('../middleware/authMiddleware'); // <-- FIXED

const router = express.Router();

// All registration routes are now protected
router.post('/fetch-aadhaar', protect, fetchAadhaar); // <-- FIXED
router.post('/submit', protect, submitApplication); // <-- FIXED
router.get('/status', protect, getStatus); // <-- FIXED

module.exports = router;