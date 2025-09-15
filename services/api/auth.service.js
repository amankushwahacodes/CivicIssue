
// services/api/auth.service.js
import { httpClient } from './httpClient';
import { API_ENDPOINTS } from './endpoints';

class AuthService {
    async login(email, password) {
        const response = await httpClient.post(API_ENDPOINTS.AUTH.LOGIN, {
            email,
            password,
        });

        // Store token in httpClient for future requests
        if (response.token) {
            httpClient.setAuthToken(response.token);
        }

        return response;
    }

    async register(userData) {
        return httpClient.post(API_ENDPOINTS.AUTH.REGISTER, userData);
    }

    async refreshToken() {
        return httpClient.post(API_ENDPOINTS.AUTH.REFRESH);
    }

    async logout() {
        const response = await httpClient.post(API_ENDPOINTS.AUTH.LOGOUT);
        httpClient.setAuthToken(null);
        return response;
    }

    async forgotPassword(email) {
        return httpClient.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, { email });
    }

    async resetPassword(token, newPassword) {
        return httpClient.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, {
            token,
            password: newPassword,
        });
    }

    async verifyEmail(token) {
        return httpClient.post(API_ENDPOINTS.AUTH.VERIFY_EMAIL, { token });
    }
}

export const authService = new AuthService();