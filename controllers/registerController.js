const Application = require('../models/Application');
const Aadhaar = require('../models/Aadhaar');
const { validateRegistration } = require('../utils/validators');
const { generateApplicationId, generateVoterId } = require('../utils/helpers');
const sanitize = require('../utils/sanitize');
const logger = require('../utils/logger');

exports.fetchAadhaar = async (req, res) => {
  try {
    let { aadhaar } = req.body;

    if (!aadhaar) {
      return res.status(400).json({
        success: false,
        message: 'Aadhaar number is required'
      });
    }

    // Sanitize Aadhaar
    aadhaar = sanitize.aadhaar(aadhaar);
    if (!aadhaar) {
      return res.status(400).json({
        success: false,
        message: 'Valid 12-digit Aadhaar number required'
      });
    }

    const aadhaarData = await Aadhaar.findOne({ aadhaar });

    if (!aadhaarData) {
      return res.status(200).json({
        success: true,
        data: null,
        message: 'Aadhaar not found, please enter details manually'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        fullName: aadhaarData.fullName,
        dob: aadhaarData.dob,
        gender: aadhaarData.gender,
        email: aadhaarData.email,
        mobile: aadhaarData.mobile,
        address: aadhaarData.address
      }
    });
    
    logger.info(`Aadhaar lookup: ${aadhaar}`);
  } catch (error) {
    logger.error('fetchAadhaar error', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.submitApplication = async (req, res) => {
  try {
    let formData = req.body;
    const userId = req.user._id;

    // Sanitize form data
    formData = {
      ...formData,
      aadhaar: sanitize.aadhaar(formData.aadhaar),
      mobile: sanitize.mobile(formData.mobile),
      email: sanitize.email(formData.email),
      fullName: sanitize.name(formData.fullName),
      fatherName: sanitize.name(formData.fatherName),
      address: sanitize.text(formData.address, 500),
      state: sanitize.text(formData.state, 100),
      district: sanitize.text(formData.district, 100)
    };

    const validation = validateRegistration(formData);

    const existingApp = await Application.findOne({
      aadhaar: formData.aadhaar,
      status: 'Approved'
    });

    if (existingApp) {
      validation.errors.push('Aadhaar already registered with an approved application');
      validation.isValid = false;
    }

    // --- FIXED: Auto-approval logic removed ---
    if (!validation.isValid) {
        // Immediately reject if validation fails
        const application = await Application.create({
            ...formData,
            applicationId: generateApplicationId(),
            userId,
            status: 'Rejected',
            voterId: null,
            remarks: validation.errors.join(', ')
        });

        return res.status(400).json({
            success: false,
            message: 'Registration rejected due to validation errors',
            data: {
                applicationId: application.applicationId,
                status: application.status,
                remarks: application.remarks,
                errors: validation.errors
            }
        });
    }

    // If validation is valid, auto-approve and generate voter ID
    const voterId = generateVoterId();
    const application = await Application.create({
        ...formData,
        applicationId: generateApplicationId(),
        userId,
        status: 'Approved',
        voterId: voterId,
        remarks: 'Application approved automatically. Voter ID generated.'
    });

    res.status(200).json({
        success: true,
        message: `Application submitted and approved successfully! Your Voter ID is: ${voterId}`,
        data: {
            applicationId: application.applicationId,
            status: application.status,
            voterId: voterId
        }
    });
    
    logger.info(`Application submitted: ${application.applicationId} by user ${userId}`);
  } catch (error) {
    logger.error('submitApplication error', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getStatus = async (req, res) => {
  try {
    const { applicationId } = req.query;

    if (!applicationId) {
      return res.status(400).json({
        success: false,
        message: 'Application ID is required'
      });
    }

    // --- FIXED: User can only get THEIR OWN application ---
    const application = await Application.findOne({ 
        applicationId, 
        userId: req.user._id 
    });
    // ----------------------------------------------------

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found or you are not authorized to view it'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        applicationId: application.applicationId,
        status: application.status,
        voterId: application.voterId,
        submittedDate: application.createdAt,
        remarks: application.remarks
      }
    });
  } catch (error) {
    logger.error('getStatus error', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};