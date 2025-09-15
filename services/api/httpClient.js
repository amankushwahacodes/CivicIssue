
import { API_CONFIG } from './config';

class HttpClient {
    constructor() {
        this.baseURL = API_CONFIG.BASE_URL;
        this.timeout = API_CONFIG.TIMEOUT;
        this.defaultHeaders = {
            'Content-Type': 'application/json',
        };
    }

    // Set auth token for authenticated requests
    setAuthToken(token) {
        if (token) {
            this.defaultHeaders.Authorization = `Bearer ${token}`;
        } else {
            delete this.defaultHeaders.Authorization;
        }
    }

    // Helper method for making requests
    async request(endpoint, options = {}) {
        try {
            const url = `${this.baseURL}${endpoint}`;
            const config = {
                timeout: this.timeout,
                headers: {
                    ...this.defaultHeaders,
                    ...options.headers,
                },
                ...options,
            };

            console.log(`[API] ${config.method || 'GET'} ${url}`);

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), this.timeout);

            const response = await fetch(url, {
                ...config,
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            // Handle different response types
            let data;
            const contentType = response.headers.get('content-type');
            if (contentType?.includes('application/json')) {
                data = await response.json();
            } else {
                data = await response.text();
            }

            if (!response.ok) {
                throw new Error(data?.message || `HTTP ${response.status}: ${response.statusText}`);
            }

            console.log(`[API] ✅ ${config.method || 'GET'} ${url}`);
            return data;

        } catch (error) {
            console.error(`[API] ❌ ${error.message}`);

            if (error.name === 'AbortError') {
                throw new Error('Request timeout');
            }

            // Handle network errors
            if (!error.message.includes('HTTP')) {
                throw new Error('Network error. Please check your connection.');
            }

            throw error;
        }
    }

    // HTTP methods
    get(endpoint, params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const url = queryString ? `${endpoint}?${queryString}` : endpoint;
        return this.request(url, { method: 'GET' });
    }

    post(endpoint, data = {}) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    put(endpoint, data = {}) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    patch(endpoint, data = {}) {
        return this.request(endpoint, {
            method: 'PATCH',
            body: JSON.stringify(data),
        });
    }

    delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }

    // File upload method
    uploadFile(endpoint, file, additionalData = {}) {
        const formData = new FormData();
        formData.append('file', file);

        // Add additional fields
        Object.keys(additionalData).forEach(key => {
            formData.append(key, additionalData[key]);
        });

        return this.request(endpoint, {
            method: 'POST',
            headers: {
                // Remove Content-Type to let browser set boundary for FormData
                ...Object.fromEntries(
                    Object.entries(this.defaultHeaders).filter(([key]) => key !== 'Content-Type')
                ),
            },
            body: formData,
        });
    }
}

// Create singleton instance
export const httpClient = new HttpClient();