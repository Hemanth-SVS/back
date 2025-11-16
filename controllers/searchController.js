const Application = require('../models/Application');

exports.searchVoter = async (req, res) => {
    try {
        const { voterId, name } = req.query;

        let query = { status: 'Approved' };

        if (voterId) {
            query.voterId = voterId;
        } else if (name) {
            query.fullName = new RegExp(name, 'i');
        } else {
            return res.status(400).json({
                success: false,
                message: 'Voter ID or name is required for search'
            });
        }

        const voters = await Application.find(query).select('voterId fullName fatherName dob gender address state district');

        if (voters.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No voter found matching the criteria'
            });
        }

        res.status(200).json({
            success: true,
            found: true,
            count: voters.length,
            data: voters.map(v => ({
                voterId: v.voterId,
                fullName: v.fullName,
                fatherName: v.fatherName,
                age: new Date().getFullYear() - new Date(v.dob).getFullYear(),
                gender: v.gender,
                address: v.address
            }))
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
