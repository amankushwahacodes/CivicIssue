export const API_ENDPOINTS = {
    // Authentication
    AUTH: {
        LOGIN: '/auth/login',
        REGISTER: '/auth/register',
        REFRESH: '/auth/refresh',
        LOGOUT: '/auth/logout',
        FORGOT_PASSWORD: '/auth/forgot-password',
        RESET_PASSWORD: '/auth/reset-password',
        VERIFY_EMAIL: '/auth/verify-email',
    },

    // Complaints
    COMPLAINTS: {
        LIST: '/complaints',
        CREATE: '/complaints',
        GET_BY_ID: (id) => `/complaints/${id}`,
        UPDATE: (id) => `/complaints/${id}`,
        DELETE: (id) => `/complaints/${id}`,
        UPDATE_STATUS: (id) => `/complaints/${id}/status`,
        ADD_COMMENT: (id) => `/complaints/${id}/comments`,
        UPLOAD_MEDIA: (id) => `/complaints/${id}/media`,
        MY_COMPLAINTS: '/complaints/my',
    },

    // Users
    USERS: {
        PROFILE: '/users/profile',
        UPDATE_PROFILE: '/users/profile',
        CHANGE_PASSWORD: '/users/change-password',
        UPLOAD_AVATAR: '/users/avatar',
    },

    // Categories & Departments
    CATEGORIES: '/categories',
    DEPARTMENTS: '/departments',

    // Notifications
    NOTIFICATIONS: {
        LIST: '/notifications',
        MARK_READ: (id) => `/notifications/${id}/read`,
        REGISTER_DEVICE: '/notifications/register-device',
        PREFERENCES: '/notifications/preferences',
    },

    // Admin
    ADMIN: {
        DASHBOARD: '/admin/dashboard',
        STATS: '/admin/stats',
        USERS: '/admin/users',
        COMPLAINTS: '/admin/complaints',
        ASSIGN_COMPLAINT: (id) => `/admin/complaints/${id}/assign`,
    },

    // System
    HEALTH: '/health',
    VERSION: '/version',
};