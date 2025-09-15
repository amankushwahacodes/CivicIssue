// services/api/notification.service.js
import { httpClient } from './httpClient';
import { API_ENDPOINTS } from './endpoints';

class NotificationService {
    async getNotifications() {
        return httpClient.get(API_ENDPOINTS.NOTIFICATIONS.LIST);
    }

    async markAsRead(notificationId) {
        return httpClient.patch(API_ENDPOINTS.NOTIFICATIONS.MARK_READ(notificationId));
    }

    async registerDevice(deviceToken, platform) {
        return httpClient.post(API_ENDPOINTS.NOTIFICATIONS.REGISTER_DEVICE, {
            deviceToken,
            platform,
        });
    }

    async updatePreferences(preferences) {
        return httpClient.put(API_ENDPOINTS.NOTIFICATIONS.PREFERENCES, preferences);
    }
}

export const notificationService = new NotificationService();