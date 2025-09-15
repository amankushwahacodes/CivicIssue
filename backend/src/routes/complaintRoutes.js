// src/routes/complaintRoutes.js - Route definitions for complaints
const express = require('express');
const ComplaintsController = require('../controllers/complaintsController');

const router = express.Router();

// GET /api/complaints - Get all complaints with optional filters
router.get('/', ComplaintsController.getAllComplaints);

// GET /api/complaints/:id - Get single complaint
router.get('/:id', ComplaintsController.getComplaintById);

// POST /api/complaints - Create new complaint
router.post('/', ComplaintsController.createComplaint);

// PUT /api/complaints/:id - Update complaint
router.put('/:id', ComplaintsController.updateComplaint);

// PATCH /api/complaints/:id/status - Update complaint status
router.patch('/:id/status', ComplaintsController.updateComplaintStatus);

// POST /api/complaints/:id/comments - Add comment to complaint
router.post('/:id/comments', ComplaintsController.addComment);

// DELETE /api/complaints/:id - Delete complaint
router.delete('/:id', ComplaintsController.deleteComplaint);

module.exports = router;