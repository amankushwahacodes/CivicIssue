// src/controllers/complaintsController.js - Business logic for complaints
const ComplaintsModel = require('../models/complaintsModel');
const { validateComplaint, validateComment } = require('../utils/validation');

class ComplaintsController {
    // Get all complaints with filters and sorting
    static async getAllComplaints(req, res) {
        try {
            const { status, priority, category, userId, search, sortBy = 'date', order = 'desc' } = req.query;

            // Apply filters
            const filters = { status, priority, category, userId, search };
            let filteredComplaints = ComplaintsModel.filter(filters);

            // Sort complaints
            filteredComplaints = ComplaintsModel.sort(filteredComplaints, sortBy, order);

            // Get statistics
            const stats = ComplaintsModel.getStats();

            res.json({
                success: true,
                data: filteredComplaints,
                stats,
                total: filteredComplaints.length
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error fetching complaints',
                error: error.message
            });
        }
    }

    // Get single complaint by ID
    static async getComplaintById(req, res) {
        try {
            const { id } = req.params;
            const complaint = ComplaintsModel.getById(id);

            if (!complaint) {
                return res.status(404).json({
                    success: false,
                    message: 'Complaint not found'
                });
            }

            res.json({
                success: true,
                data: complaint
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error fetching complaint',
                error: error.message
            });
        }
    }

    // Create new complaint
    static async createComplaint(req, res) {
        try {
            const {
                title,
                description,
                category,
                location,
                priority = 'Medium',
                userId,
                reporterName,
                reporterEmail,
                images = []
            } = req.body;

            // Validation
            const validationError = validateComplaint(req.body);
            if (validationError) {
                return res.status(400).json({
                    success: false,
                    message: validationError
                });
            }

            const complaintData = {
                title,
                description,
                category,
                location,
                priority,
                userId: userId || 'anonymous',
                reporterName: reporterName || 'Anonymous',
                reporterEmail: reporterEmail || '',
                images
            };

            const newComplaint = ComplaintsModel.create(complaintData);

            res.status(201).json({
                success: true,
                message: 'Complaint created successfully',
                data: newComplaint
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error creating complaint',
                error: error.message
            });
        }
    }

    // Update complaint
    static async updateComplaint(req, res) {
        try {
            const { id } = req.params;
            const updatedComplaint = ComplaintsModel.update(id, req.body);

            if (!updatedComplaint) {
                return res.status(404).json({
                    success: false,
                    message: 'Complaint not found'
                });
            }

            res.json({
                success: true,
                message: 'Complaint updated successfully',
                data: updatedComplaint
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error updating complaint',
                error: error.message
            });
        }
    }

    // Update complaint status
    static async updateComplaintStatus(req, res) {
        try {
            const { id } = req.params;
            const { status } = req.body;

            if (!['Pending', 'In Progress', 'Resolved'].includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid status. Must be: Pending, In Progress, or Resolved'
                });
            }

            const updatedComplaint = ComplaintsModel.updateStatus(id, status);

            if (!updatedComplaint) {
                return res.status(404).json({
                    success: false,
                    message: 'Complaint not found'
                });
            }

            res.json({
                success: true,
                message: 'Status updated successfully',
                data: updatedComplaint
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error updating status',
                error: error.message
            });
        }
    }

    // Add comment to complaint
    static async addComment(req, res) {
        try {
            const { id } = req.params;
            const { text, author, isAdmin = false } = req.body;

            // Validation
            const validationError = validateComment(req.body);
            if (validationError) {
                return res.status(400).json({
                    success: false,
                    message: validationError
                });
            }

            const newComment = ComplaintsModel.addComment(id, { text, author, isAdmin });

            if (!newComment) {
                return res.status(404).json({
                    success: false,
                    message: 'Complaint not found'
                });
            }

            res.status(201).json({
                success: true,
                message: 'Comment added successfully',
                data: newComment
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error adding comment',
                error: error.message
            });
        }
    }

    // Delete complaint
    static async deleteComplaint(req, res) {
        try {
            const { id } = req.params;
            const deletedComplaint = ComplaintsModel.delete(id);

            if (!deletedComplaint) {
                return res.status(404).json({
                    success: false,
                    message: 'Complaint not found'
                });
            }

            res.json({
                success: true,
                message: 'Complaint deleted successfully',
                data: deletedComplaint
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error deleting complaint',
                error: error.message
            });
        }
    }
}

module.exports = ComplaintsController;