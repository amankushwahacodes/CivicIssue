export const API_CONFIG = {
    BASE_URL: __DEV__
        ? 'http://localhost:3000/api' // Development
        : 'https://your-production-api.com/api', // Production

    TIMEOUT: 10000, // 10 seconds

    // Different URLs for different environments
    DEVELOPMENT: {
        ANDROID_EMULATOR: 'http://10.0.2.2:3000/api',
        IOS_SIMULATOR: 'http://localhost:3000/api',
        PHYSICAL_DEVICE: 'http://192.168.1.100:3000/api', // Replace with your IP
    }
};