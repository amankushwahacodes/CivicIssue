// src/config/config.js - Configuration settings
require('dotenv').config();

const config = {
    server: {
        port: process.env.PORT || 3000,
        nodeEnv: process.env.NODE_ENV || 'development'
    },

    cors: {
        origin: process.env.CORS_ORIGIN || '*',
        credentials: true
    },

    database: {
        // Add database configuration when implementing actual database
        // mongodb: {
        //   uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/complaints',
        //   options: {
        //     useNewUrlParser: true,
        //     useUnifiedTopology: true
        //   }
        // }
    },

    constants: {
        validStatuses: ['Pending', 'In Progress', 'Resolved'],
        validPriorities: ['High', 'Medium', 'Low'],
        validCategories: ['Roads', 'Utilities', 'Sanitation', 'Noise', 'Other'],
        defaultPriority: 'Medium',
        defaultStatus: 'Pending'
    }
};

module.exports = config;