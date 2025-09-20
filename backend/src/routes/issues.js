const express = require('express');
const multer = require('multer');
const Issue = require('../models/Issue');
const { authMiddleware } = require('../middleware/authMiddleware');
const { isAdmin } = require("../middleware/authMiddleware");


const router = express.Router();

// multer disk storage (MVP)
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });


// get all issues (public)
router.get('/', async (req, res, next) => {
    try {
        const issues = await Issue.find().sort({ createdAt: -1 });
        res.json(issues);
    } catch (err) {
        next(err);
    }
});

// Replace the /my-stats route with this one
router.get('/stats/user', authMiddleware, async (req, res) => {
    try {
        const userId = req.user._id;
        const issues = await Issue.find({ createdBy: userId });

        const stats = {
            total: issues.length,
            pending: issues.filter(i => i.status === 'Pending').length,
            inProgress: issues.filter(i => i.status === 'In Progress').length,
            resolved: issues.filter(i => i.status === 'Resolved').length
        };

        res.json(stats);
    } catch (error) {
        console.error('Error fetching user stats:', error);
        res.status(500).json({ message: error.message });
    }
});
    

// get issues created by logged user
router.get('/me', authMiddleware, async (req, res, next) => {
    try {
        const issues = await Issue.find({ createdBy: req.user._id }).sort({ createdAt: -1 });
        res.json(issues);
    } catch (err) { next(err); }
});

// create issue (citizen)
router.post('/', authMiddleware, async (req, res, next) => {
    console.log('=== BACKEND DETAILED DEBUG ===');
    console.log('req.body:', req.body);
    console.log('req.body.location:', req.body.location);
    console.log('req.body.location.address:', req.body.location?.address);
    console.log('req.user:', req.user);
    console.log('req.user._id:', req.user?._id);
    console.log('Content-Type header:', req.headers['content-type']);

    try {
        const { title, description, category, priority, location } = req.body;

        console.log('Destructured location:', location);
        console.log('Location type:', typeof location);

        let parsedLocation = location;
        if (typeof location === 'string') {
            try {
                parsedLocation = JSON.parse(location);
            } catch (e) {
                console.error('Invalid location JSON:', location);
            }
        }


        const issue = await Issue.create({
            title,
            description,
            category,
            priority,
            location : parsedLocation,
            photos: [],
            createdBy: req.user._id
        });

        res.status(201).json(issue);
    } catch (err) {
        console.error('Validation error details:', err.message);
        console.error('Error name:', err.name);
        res.status(500).json({ message: err.message });
    }
});





// GET single issue by ID
router.get('/:id', async (req, res, next) => {
    try {
        const issue = await Issue.findById(req.params.id)
            .populate('createdBy', 'name email')
            .populate('assignedTo', 'name email');

        if (!issue) return res.status(404).json({ message: 'Issue not found' });

        res.json(issue);
    } catch (err) {
        next(err);
    }
});




// In your issues routes


// update issue status or assign
// UPDATE issue (Admin only)
router.put('/:id', authMiddleware, isAdmin, async (req, res, next) => {
    try {
        const { status, assignedTo, note } = req.body;

        const issue = await Issue.findById(req.params.id);
        if (!issue) return res.status(404).json({ message: 'Issue not found' });

        if (status) issue.status = status;
        if (assignedTo) issue.assignedTo = assignedTo;

        if (note) {
            issue.timeline.push({
                status: issue.status,
                by: req.user.id,
                note,
                at: new Date()
            });
        }

        await issue.save();
        res.json(issue);
    } catch (err) {
        next(err);
    }
});

// DELETE issue (Admin only)
router.delete('/:id', authMiddleware, isAdmin, async (req, res, next) => {
    try {
        const issue = await Issue.findByIdAndDelete(req.params.id);
        if (!issue) return res.status(404).json({ message: 'Issue not found' });

        res.json({ message: 'Issue deleted successfully' });
    } catch (err) {
        next(err);
    }
});


// FILTER issues (by category, status, priority, ward)
router.get('/search/filter', async (req, res, next) => {
    try {
        const { category, status, priority, ward } = req.query;

        const query = {};
        if (category) query.category = category;
        if (status) query.status = status;
        if (priority) query.priority = priority;
        if (ward) query['location.ward'] = ward;

        const issues = await Issue.find(query).sort({ createdAt: -1 });
        res.json(issues);
    } catch (err) {
        next(err);
    }
});




module.exports = router;
