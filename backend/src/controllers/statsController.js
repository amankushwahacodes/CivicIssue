// src/controllers/statsController.js - Statistics controller
const ComplaintsModel = require('../models/complaintsModel');

class StatsController {
    // Get system statistics
    static async getStats(req, res) {
        try {
            const stats = ComplaintsModel.getStats();

            res.json({
                success: true,
                data: stats
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error fetching statistics',
                error: error.message
            });
        }
    }
}

module.exports = StatsController;