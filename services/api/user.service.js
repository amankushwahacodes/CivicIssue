import { httpClient } from './httpClient';
import { API_ENDPOINTS } from './endpoints';

class UserService {
    async getProfile() {
        return httpClient.get(API_ENDPOINTS.USERS.PROFILE);
    }

    async updateProfile(profileData) {
        return httpClient.put(API_ENDPOINTS.USERS.UPDATE_PROFILE, profileData);
    }

    async changePassword(currentPassword, newPassword) {
        return httpClient.post(API_ENDPOINTS.USERS.CHANGE_PASSWORD, {
            currentPassword,
            newPassword,
        });
    }

    async uploadAvatar(imageFile) {
        return httpClient.uploadFile(API_ENDPOINTS.USERS.UPLOAD_AVATAR, imageFile);
    }
}

export const userService = new UserService();