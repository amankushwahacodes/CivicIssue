
import { httpClient } from './httpClient';
import { API_ENDPOINTS } from './endpoints';

class ComplaintService {
    async getComplaints(filters = {}) {
        // Clean up filters - remove empty values
        const cleanFilters = Object.fromEntries(
            Object.entries(filters).filter(([_, value]) =>
                value !== undefined && value !== null && value !== ''
            )
        );

        return httpClient.get(API_ENDPOINTS.COMPLAINTS.LIST, cleanFilters);
    }

    async getMyComplaints() {
        return httpClient.get(API_ENDPOINTS.COMPLAINTS.MY_COMPLAINTS);
    }

    async getComplaint(id) {
        return httpClient.get(API_ENDPOINTS.COMPLAINTS.GET_BY_ID(id));
    }

    async createComplaint(complaintData) {
        return httpClient.post(API_ENDPOINTS.COMPLAINTS.CREATE, complaintData);
    }

    async updateComplaint(id, updateData) {
        return httpClient.put(API_ENDPOINTS.COMPLAINTS.UPDATE(id), updateData);
    }

    async updateComplaintStatus(id, status, comment = '') {
        return httpClient.patch(API_ENDPOINTS.COMPLAINTS.UPDATE_STATUS(id), {
            status,
            comment,
        });
    }

    async deleteComplaint(id) {
        return httpClient.delete(API_ENDPOINTS.COMPLAINTS.DELETE(id));
    }

    async addComment(id, comment) {
        return httpClient.post(API_ENDPOINTS.COMPLAINTS.ADD_COMMENT(id), {
            comment,
        });
    }

    async uploadMedia(id, file, description = '') {
        return httpClient.uploadFile(
            API_ENDPOINTS.COMPLAINTS.UPLOAD_MEDIA(id),
            file,
            { description }
        );
    }
}

export const complaintService = new ComplaintService();