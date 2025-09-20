const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { isAdmin, authMiddleware } = require("../middleware/authMiddleware");


const router = express.Router();

// REGISTER
// REGISTER
router.post("/signup", async (req, res) => {
    try {
        const { name, email, password, phone, ward } = req.body; // Add phone and ward

        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: "User already exists" });

        const user = new User({
            name,
            email,
            password,
            ...(phone && { phone }), // Add phone if provided
            ...(ward && { ward })    // Add ward if provided
        });
        await user.save();

        // Generate token and return user data (like login does)
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.status(201).json({
            token,
            user: {
                _id: user._id, // Change from id to _id to match your schema
                name: user.name,
                email: user.email,
                phone: user.phone,
                ward: user.ward,
                role: user.role
            }
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// LOGIN
// LOGIN
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "Invalid credentials" });

        const isMatch = await user.comparePassword(password);
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.json({
            token,
            user: {
                _id: user._id, // Change from id to _id
                name: user.name,
                email: user.email,
                phone: user.phone,
                ward: user.ward,
                role: user.role
            }
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET current logged-in user
router.get("/me", require("../middleware/authMiddleware").authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password"); // don’t send password
        if (!user) return res.status(404).json({ message: "User not found" });
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


// UPDATE profile
router.put("/me", require("../middleware/authMiddleware").authMiddleware, async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        if (name) user.name = name;
        if (email) user.email = email;
        if (password) user.password = password; // will re-hash via pre('save')

        await user.save();
        res.json({ message: "Profile updated successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});



// GET all users (Admin only)
router.get("/all", authMiddleware, isAdmin, async (req, res) => {
    try {
        const users = await User.find().select("-password");
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


module.exports = router;
