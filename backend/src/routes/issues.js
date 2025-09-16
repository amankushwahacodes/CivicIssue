const express = require('express');
const multer = require('multer');
const Issue = require('../models/Issue');
const { authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

// multer disk storage (MVP)
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// create issue (citizen)
router.post('/', authMiddleware, upload.array('photos', 5), async (req, res, next) => {
    try {
        const { title, description, category, priority, address, ward, lat, lng } = req.body;
        const photos = (req.files || []).map(f => `${process.env.BASE_URL || 'http://localhost:5000'}/uploads/${f.filename}`);
        const issue = await Issue.create({
            title,
            description,
            category,
            priority,
            location: { address, ward, coordinates: [parseFloat(lng || 0), parseFloat(lat || 0)] },
            photos,
            createdBy: req.user._id
        });
        // TODO: notify routing/department logic here (later)
        res.status(201).json(issue);
    } catch (err) { next(err); }
});

// get issues created by logged user
router.get('/me', authMiddleware, async (req, res, next) => {
    try {
        const issues = await Issue.find({ createdBy: req.user._id }).sort({ createdAt: -1 });
        res.json(issues);
    } catch (err) { next(err); }
});

module.exports = router;
