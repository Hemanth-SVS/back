/**
 * Input sanitization utilities
 */
const validator = require('validator');

const sanitize = {
  email: (email) => {
    if (!email) return null;
    const cleaned = email.toLowerCase().trim();
    return validator.isEmail(cleaned) ? cleaned : null;
  },

  mobile: (mobile) => {
    if (!mobile) return null;
    const cleaned = mobile.replace(/\D/g, ''); // Remove non-digits
    return /^[0-9]{10}$/.test(cleaned) ? cleaned : null;
  },

  aadhaar: (aadhaar) => {
    if (!aadhaar) return null;
    const cleaned = aadhaar.replace(/\D/g, ''); // Remove non-digits
    return /^[0-9]{12}$/.test(cleaned) ? cleaned : null;
  },

  text: (text, maxLength = 500) => {
    if (!text) return null;
    const cleaned = validator.escape(text.trim());
    return cleaned.length > maxLength ? cleaned.substring(0, maxLength) : cleaned;
  },

  name: (name) => {
    if (!name) return null;
    // Allow letters, spaces, and common name characters
    const cleaned = name.trim().replace(/[^a-zA-Z\s\-'\.]/g, '');
    return cleaned.length >= 2 ? cleaned : null;
  }
};

module.exports = sanitize;

