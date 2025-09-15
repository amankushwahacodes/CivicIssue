// src/app.js - Main application entry point
const express = require('express');
const cors = require('cors');
const complaintRoutes = require('./routes/complaintRoutes');
const statsRoutes = require('./routes/statsRoutes');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandlers');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/complaints', complaintRoutes);
app.use('/api/stats', statsRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString()
    });
});

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`🚀 Complaints API Server running on port ${PORT}`);
    console.log(`📋 Health check: http://localhost:${PORT}/api/health`);
    console.log(`📊 API endpoints available at: http://localhost:${PORT}/api/`);
});

module.exports = app;