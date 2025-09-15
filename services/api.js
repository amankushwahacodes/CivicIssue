// services/api.js - API service for complaints management
const BASE_URL = 'http://localhost:3000/api'; // Change this to your server URL
// For Android emulator, use: 'http://10.0.2.2:3000/api'
// For iOS simulator, use: 'http://localhost:3000/api'
// For real device, use your computer's IP: 'http://192.168.x.x:3000/api'

class ApiService {
    // Helper method for making requests
    async makeRequest(endpoint, options = {}) {
        try {
            const url = `${BASE_URL}${endpoint}`;
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers,
                },
                ...options,
            };

            console.log(`Making ${config.method || 'GET'} request to:`, url);

            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || `HTTP error! status: ${response.status}`);
            }

            return data;
        } catch (error) {
            console.error('API Request failed:', error);
            throw error;
        }
    }

    // Get all complaints with optional filters
    async getComplaints(filters = {}) {
        const queryParams = new URLSearchParams();

        // Add filter parameters
        Object.keys(filters).forEach(key => {
            if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
                queryParams.append(key, filters[key]);
            }
        });

        const queryString = queryParams.toString();
        const endpoint = `/complaints${queryString ? `?${queryString}` : ''}`;

        return this.makeRequest(endpoint);
    }

    // Get single complaint by ID
    async getComplaint(id) {
        return this.makeRequest(`/complaints/${id}`);
    }

    // Create new complaint
    async createComplaint(complaintData) {
        return this.makeRequest('/complaints', {
            method: 'POST',
            body: JSON.stringify(complaintData),
        });
    }

    // Update complaint
    async updateComplaint(id, updateData) {
        return this.makeRequest(`/complaints/${id}`, {
            method: 'PUT',
            body: JSON.stringify(updateData),
        });
    }

    // Update complaint status only
    async updateComplaintStatus(id, status) {
        return this.makeRequest(`/complaints/${id}/status`, {
            method: 'PATCH',
            body: JSON.stringify({ status }),
        });
    }

    // Add comment to complaint
    async addComment(id, commentData) {
        return this.makeRequest(`/complaints/${id}/comments`, {
            method: 'POST',
            body: JSON.stringify(commentData),
        });
    }

    // Delete complaint
    async deleteComplaint(id) {
        return this.makeRequest(`/complaints/${id}`, {
            method: 'DELETE',
        });
    }

    // Get system statistics
    async getStats() {
        return this.makeRequest('/stats');
    }

    // Health check
    async checkHealth() {
        return this.makeRequest('/health');
    }
}

// Create singleton instance
const apiService = new ApiService();

export default apiService;

// Export specific methods for easier imports
export const {
    getComplaints,
    getComplaint,
    createComplaint,
    updateComplaint,
    updateComplaintStatus,
    addComment,
    deleteComplaint,
    getStats,
    checkHealth
} = apiService;