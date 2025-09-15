// src/middleware/errorHandlers.js - Error handling middleware

// Global error handler
const errorHandler = (err, req, res, next) => {
    console.error(err.stack);

    // Default error
    let error = {
        success: false,
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    };

    // Mongoose bad ObjectId
    if (err.name === 'CastError') {
        error.message = 'Invalid ID format';
        error.statusCode = 400;
    }

    // Mongoose duplicate key
    if (err.code === 11000) {
        error.message = 'Duplicate field value entered';
        error.statusCode = 400;
    }

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map(val => val.message).join(', ');
        error.message = messages;
        error.statusCode = 400;
    }

    res.status(error.statusCode || 500).json(error);
};

// 404 handler
const notFoundHandler = (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
};

module.exports = {
    errorHandler,
    notFoundHandler
};