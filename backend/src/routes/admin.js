const express = require('express');
const Issue = require('../models/Issue');
const { authMiddleware, isAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

// list with filters + pagination
router.get('/issues', authMiddleware, isAdmin, async (req, res, next) => {
    try {
        const { status, category, priority, ward, page = 1, limit = 20, q } = req.query;
        const filter = {};
        if (status) filter.status = status;
        if (category) filter.category = category;
        if (priority) filter.priority = priority;
        if (ward) filter['location.ward'] = ward;
        if (q) filter.$text = { $search: q };

        const issues = await Issue.find(filter)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .populate('createdBy assignedTo', 'name email');

        const total = await Issue.countDocuments(filter);
        res.json({ issues, total, page: parseInt(page) });
    } catch (err) { next(err); }
});

// assign to staff + timeline entry
router.put('/issues/:id/assign', authMiddleware,isAdmin, async (req, res, next) => {
    try {
        const { assignTo } = req.body; // staff user id
        const issue = await Issue.findById(req.params.id);
        if (!issue) return res.status(404).json({ message: 'Issue not found' });
        issue.assignedTo = assignTo;
        issue.status = 'acknowledged';
        issue.timeline.push({ status: 'acknowledged', by: req.user._id, note: 'Assigned to staff', at: new Date() });
        await issue.save();
        // TODO: notify citizen and assigned staff
        res.json(issue);
    } catch (err) { next(err); }
});

// update status
router.put('/issues/:id/status', authMiddleware,isAdmin, async (req, res, next) => {
    try {
        const { status, note } = req.body;
        const issue = await Issue.findById(req.params.id);
        if (!issue) return res.status(404).json({ message: 'Issue not found' });
        issue.status = status;
        issue.timeline.push({ status, by: req.user._id, note, at: new Date() });
        if (status === 'resolved') issue.resolvedAt = new Date();
        await issue.save();
        // TODO: notify citizen
        res.json(issue);
    } catch (err) { next(err); }
});

// basic stats (MVP)
router.get('/stats', authMiddleware,isAdmin, async (req, res, next) => {
    try {
        const total = await Issue.countDocuments();
        const byStatus = await Issue.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]);
        const byCategory = await Issue.aggregate([{ $group: { _id: "$category", count: { $sum: 1 } } }]);
        res.json({ total, byStatus, byCategory });
    } catch (err) { next(err); }
});

module.exports = router;
