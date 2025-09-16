const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: String,
    category: String,
    priority: { type: String, enum: ['low', 'normal', 'high', 'critical'], default: 'normal' },
    location: {
        address: String,
        ward: String,
        coordinates: { type: [Number], index: '2dsphere' } // [lng, lat]
    },
    photos: [String], // URLs
    status: { type: String, enum: ['open', 'acknowledged', 'in_progress', 'resolved', 'closed'], default: 'open' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    timeline: [{
        status: String, by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, note: String, at: Date   
    }],
    resolvedAt: Date
}, { timestamps: true });

issueSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Issue', issueSchema);
