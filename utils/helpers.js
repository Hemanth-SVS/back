exports.generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

exports.generateApplicationId = () => {
    const year = new Date().getFullYear();
    const random = Math.floor(1000 + Math.random() * 9000);
    return `APP${year}X${random}`;
};

exports.generateVoterId = () => {
    const random = Math.floor(100000 + Math.random() * 900000);
    return `VOT${random}`;
};

exports.generateToken = (id) => {
    const jwt = require('jsonwebtoken');
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE
    });
};
