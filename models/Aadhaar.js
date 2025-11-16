const mongoose = require('mongoose');

const aadhaarSchema = new mongoose.Schema({
    aadhaar: {
        type: String,
        required: true,
        unique: true,
        match: /^[0-9]{12}$/
    },
    fullName: {
        type: String,
        required: true
    },
    dob: {
        type: Date,
        required: true
    },
    gender: {
        type: String,
        required: true,
        enum: ['Male', 'Female', 'Other']
    },
    email: {
        type: String,
        required: true
    },
    mobile: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Aadhaar', aadhaarSchema);
