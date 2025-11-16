const OTP = require('../models/OTP');
const { generateOTP } = require('../utils/helpers');
const sanitize = require('../utils/sanitize');
const logger = require('../utils/logger');

exports.sendOTP = async (req, res) => {
    try {
        let { mobile } = req.body;

        if (!mobile) {
            return res.status(400).json({
                success: false,
                message: 'Mobile number is required'
            });
        }

        // Sanitize mobile
        mobile = sanitize.mobile(mobile);
        if (!mobile) {
            return res.status(400).json({
                success: false,
                message: 'Valid 10-digit mobile number required'
            });
        }

        // Delete old OTPs for this mobile
        await OTP.deleteMany({ mobile });

        // Generate new OTP
        const otp = generateOTP();
        const expiryMinutes = parseInt(process.env.OTP_EXPIRY_MINUTES) || 5;
        const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);

        // Save OTP
        await OTP.create({ mobile, otp, expiresAt });

        // In demo mode, return OTP in response
        const response = {
            success: true,
            message: 'OTP sent successfully'
        };

        if (process.env.DEMO_MODE === 'true') {
            response.otp = otp;
            response.note = 'OTP visible because DEMO_MODE is enabled';
        }

        res.status(200).json(response);
        
        logger.info(`OTP sent to mobile: ${mobile.substring(0, 4)}****`);
    } catch (error) {
        logger.error('sendOTP error', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.verifyOTP = async (req, res) => {
    try {
        let { mobile, otp } = req.body;

        if (!mobile || !otp) {
            return res.status(400).json({
                success: false,
                message: 'Mobile and OTP are required'
            });
        }

        // Sanitize mobile
        mobile = sanitize.mobile(mobile);
        if (!mobile) {
            return res.status(400).json({
                success: false,
                message: 'Valid 10-digit mobile number required'
            });
        }

        // Sanitize OTP (6 digits)
        otp = otp.replace(/\D/g, '');
        if (!/^[0-9]{6}$/.test(otp)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid OTP format'
            });
        }

        // Find OTP
        const otpRecord = await OTP.findOne({ mobile, otp }).sort({ createdAt: -1 });

        if (!otpRecord) {
            return res.status(400).json({
                success: false,
                message: 'Invalid OTP'
            });
        }

        // Check expiry
        if (new Date() > otpRecord.expiresAt) {
            await OTP.deleteOne({ _id: otpRecord._id });
            return res.status(400).json({
                success: false,
                message: 'OTP has expired'
            });
        }

        // Mark as verified
        otpRecord.verified = true;
        await otpRecord.save();

        res.status(200).json({
            success: true,
            message: 'OTP verified successfully'
        });
        
        logger.info(`OTP verified for mobile: ${mobile.substring(0, 4)}****`);
    } catch (error) {
        logger.error('verifyOTP error', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};