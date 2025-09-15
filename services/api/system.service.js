import { httpClient } from './httpClient';
import { API_ENDPOINTS } from './endpoints';

class SystemService {
    async getHealth() {
        return httpClient.get(API_ENDPOINTS.HEALTH);
    }

    async getVersion() {
        return httpClient.get(API_ENDPOINTS.VERSION);
    }

    async getCategories() {
        return httpClient.get(API_ENDPOINTS.CATEGORIES);
    }

    async getDepartments() {
        return httpClient.get(API_ENDPOINTS.DEPARTMENTS);
    }
}

export const systemService = new SystemService();