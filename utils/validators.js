const validator = require('validator');

exports.validateRegistration = (data) => {
    const errors = [];

    // Aadhaar validation
    if (!data.aadhaar || !/^[0-9]{12}$/.test(data.aadhaar)) {
        errors.push('Aadhaar must be exactly 12 digits');
    }

    // Mobile validation
    if (!data.mobile || !/^[0-9]{10}$/.test(data.mobile)) {
        errors.push('Mobile number must be exactly 10 digits');
    }

    // Email validation
    if (!data.email || !validator.isEmail(data.email)) {
        errors.push('Invalid email format');
    }

    // Age validation
    if (data.dob) {
        const age = new Date().getFullYear() - new Date(data.dob).getFullYear();
        if (age < 18) {
            errors.push('Age must be 18 or above');
        }
    } else {
        errors.push('Date of birth is required');
    }

    // Name validation
    if (!data.fullName || data.fullName.trim().length < 2) {
        errors.push('Full name is required');
    }

    if (!data.fatherName || data.fatherName.trim().length < 2) {
        errors.push('Father name is required');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};
