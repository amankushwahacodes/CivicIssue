// src/utils/validation.js - Validation utilities
const validateComplaint = (data) => {
    const { title, description, category, location } = data;

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
        return 'Title is required and must be a non-empty string';
    }

    if (!description || typeof description !== 'string' || description.trim().length === 0) {
        return 'Description is required and must be a non-empty string';
    }

    if (!category || typeof category !== 'string' || category.trim().length === 0) {
        return 'Category is required and must be a non-empty string';
    }

    if (!location || typeof location !== 'string' || location.trim().length === 0) {
        return 'Location is required and must be a non-empty string';
    }

    const validCategories = ['Roads', 'Utilities', 'Sanitation', 'Noise', 'Other'];
    if (!validCategories.includes(category)) {
        return `Category must be one of: ${validCategories.join(', ')}`;
    }

    const validPriorities = ['High', 'Medium', 'Low'];
    if (data.priority && !validPriorities.includes(data.priority)) {
        return `Priority must be one of: ${validPriorities.join(', ')}`;
    }

    if (data.reporterEmail && !isValidEmail(data.reporterEmail)) {
        return 'Invalid email format';
    }

    return null; // No validation errors
};

const validateComment = (data) => {
    const { text, author } = data;

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
        return 'Comment text is required and must be a non-empty string';
    }

    if (!author || typeof author !== 'string' || author.trim().length === 0) {
        return 'Author is required and must be a non-empty string';
    }

    return null; // No validation errors
};

const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

module.exports = {
    validateComplaint,
    validateComment,
    isValidEmail
};