const express = require('express');
const router = express.Router();
const companyLocations = require('../data/company');

// Get company locations
router.get('/locations', (req, res) => {
  res.json(companyLocations);
});

module.exports = router;
