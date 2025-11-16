const express = require('express');
const { searchVoter } = require('../controllers/searchController');

const router = express.Router();

router.get('/voter', searchVoter);

module.exports = router;