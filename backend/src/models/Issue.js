const mongoose = require("mongoose");

const issueSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Issue title is required"],
            trim: true,
        },
        description: {
            type: String,
            required: [true, "Description is required"],
        },
        category: {
            type: String,
            enum: ["Roads", "Lighting", "Sanitation", "Traffic", "Water", "Other"],
            default: "Other",
        },
        priority: {
            type: String,
            enum: ["low", "normal", "high", "critical"],
            default: "normal",
        },
        location: {
            address: { type: String, required: true },
            ward: { type: String },
            coordinates: {
                type: [Number], // [lng, lat]
                index: "2dsphere",
            },
        },
        photos: {
            type: [String], // array of URLs
            default: [],
        },
        status: {
            type: String,
            enum: ["Pending", "In Progress", "Resolved"],
            default: "Pending",
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        assignedTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
        timeline: [
            {
                status: {
                    type: String,
                    enum: ["Pending", "In Progress", "Resolved"],
                },
                by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
                note: { type: String },
                at: { type: Date, default: Date.now },
            },
        ],
        resolvedAt: { type: Date },
    },
    { timestamps: true }
);

// Text search on title & description
issueSchema.index({ title: "text", description: "text" });

module.exports = mongoose.model("Issue", issueSchema);
