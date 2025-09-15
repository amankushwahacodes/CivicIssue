// src/routes/statsRoutes.js - Statistics routes
const express = require('express');
const StatsController = require('../controllers/statsController');

const router = express.Router();

// GET /api/stats - Get system statistics
router.get('/', StatsController.getStats);

module.exports = router;