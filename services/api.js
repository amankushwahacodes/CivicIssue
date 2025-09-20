import axios from "axios";

import AsyncStorage from '@react-native-async-storage/async-storage';
// Replace with your machine's LAN IPv4 and correct backend port
const API = axios.create({
    baseURL: "http://10.87.147.96:3000/api",
});

// Add token interceptor
API.interceptors.request.use(
    async (req) => {
        try {
            const token = await AsyncStorage.getItem('authToken');
            if (token) {
                req.headers.Authorization = `Bearer ${token}`;
            }
        } catch (error) {
            console.error('Error getting token from AsyncStorage:', error);
        }
        return req;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// ===== AUTH ROUTES =====
export const registerUser = (data) => API.post("/auth/signup", data);
export const loginUser = (data) => API.post("/auth/login", data);

// ===== ISSUE ROUTES =====
export const getIssues = () => API.get("/issues");
export const createIssue = (data) => API.post("/issues", data);

export default API;
