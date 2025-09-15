// src/models/complaintsModel.js - Data model and in-memory database
const { v4: uuidv4 } = require('uuid');

// In-memory database (replace with actual database in production)
let complaints = [
    {
        id: "101",
        title: "Pothole on Main Road",
        description: "Large pothole causing damage to vehicles near Oak Street intersection",
        status: "Pending",
        priority: "High",
        category: "Roads",
        date: "2024-03-15",
        location: "Main Road & Oak Street",
        lastUpdate: "2024-03-15",
        userId: "user123",
        reporterName: "John Doe",
        reporterEmail: "john@example.com",
        images: [],
        comments: []
    },
    {
        id: "102",
        title: "Street Light Not Working",
        description: "Street light has been out for over a week, creating safety concerns",
        status: "In Progress",
        priority: "Medium",
        category: "Utilities",
        date: "2024-03-14",
        location: "Pine Avenue",
        lastUpdate: "2024-03-18",
        userId: "user123",
        reporterName: "Jane Smith",
        reporterEmail: "jane@example.com",
        images: [],
        comments: [
            {
                id: "comment1",
                text: "We've assigned a technician to this issue",
                author: "City Admin",
                date: "2024-03-18",
                isAdmin: true
            }
        ]
    },
    {
        id: "103",
        title: "Garbage Collection Delay",
        description: "Scheduled pickup missed for three consecutive days",
        status: "Resolved",
        priority: "Low",
        category: "Sanitation",
        date: "2024-03-10",
        location: "Maple Street",
        lastUpdate: "2024-03-20",
        userId: "user456",
        reporterName: "Bob Johnson",
        reporterEmail: "bob@example.com",
        images: [],
        comments: []
    }
];

class ComplaintsModel {
    // Get all complaints
    static getAll() {
        return [...complaints];
    }

    // Get complaint by ID
    static getById(id) {
        return complaints.find(c => c.id === id);
    }

    // Create new complaint
    static create(complaintData) {
        const newComplaint = {
            id: uuidv4(),
            ...complaintData,
            status: 'Pending',
            date: this.getCurrentTimestamp(),
            lastUpdate: this.getCurrentTimestamp(),
            comments: []
        };

        complaints.push(newComplaint);
        return newComplaint;
    }

    // Update complaint
    static update(id, updateData) {
        const index = complaints.findIndex(c => c.id === id);
        if (index === -1) return null;

        complaints[index] = {
            ...complaints[index],
            ...updateData,
            id, // Prevent ID change
            lastUpdate: this.getCurrentTimestamp()
        };

        return complaints[index];
    }

    // Update complaint status
    static updateStatus(id, status) {
        const index = complaints.findIndex(c => c.id === id);
        if (index === -1) return null;

        complaints[index].status = status;
        complaints[index].lastUpdate = this.getCurrentTimestamp();
        return complaints[index];
    }

    // Delete complaint
    static delete(id) {
        const index = complaints.findIndex(c => c.id === id);
        if (index === -1) return null;

        return complaints.splice(index, 1)[0];
    }

    // Add comment to complaint
    static addComment(complaintId, commentData) {
        const complaint = this.getById(complaintId);
        if (!complaint) return null;

        const newComment = {
            id: uuidv4(),
            ...commentData,
            date: this.getCurrentTimestamp()
        };

        complaint.comments.push(newComment);
        complaint.lastUpdate = this.getCurrentTimestamp();
        return newComment;
    }

    // Filter complaints
    static filter(filters) {
        let filtered = [...complaints];

        if (filters.status && filters.status !== 'All') {
            filtered = filtered.filter(c => c.status === filters.status);
        }

        if (filters.priority) {
            filtered = filtered.filter(c => c.priority === filters.priority);
        }

        if (filters.category) {
            filtered = filtered.filter(c => c.category === filters.category);
        }

        if (filters.userId) {
            filtered = filtered.filter(c => c.userId === filters.userId);
        }

        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            filtered = filtered.filter(c =>
                c.title.toLowerCase().includes(searchLower) ||
                c.description.toLowerCase().includes(searchLower) ||
                c.location.toLowerCase().includes(searchLower)
            );
        }

        return filtered;
    }

    // Sort complaints
    static sort(complaintsArray, sortBy = 'date', order = 'desc') {
        return complaintsArray.sort((a, b) => {
            if (sortBy === 'priority') {
                const priorityOrder = { "High": 3, "Medium": 2, "Low": 1 };
                const aValue = priorityOrder[a.priority] || 0;
                const bValue = priorityOrder[b.priority] || 0;
                return order === 'desc' ? bValue - aValue : aValue - bValue;
            } else if (sortBy === 'status') {
                return order === 'desc'
                    ? b.status.localeCompare(a.status)
                    : a.status.localeCompare(b.status);
            } else { // date
                const aDate = new Date(a.date).getTime();
                const bDate = new Date(b.date).getTime();
                return order === 'desc' ? bDate - aDate : aDate - bDate;
            }
        });
    }

    // Get statistics
    static getStats() {
        return {
            total: complaints.length,
            pending: complaints.filter(c => c.status === 'Pending').length,
            inProgress: complaints.filter(c => c.status === 'In Progress').length,
            resolved: complaints.filter(c => c.status === 'Resolved').length,
            highPriority: complaints.filter(c => c.priority === 'High' && c.status !== 'Resolved').length,
            categories: {
                Roads: complaints.filter(c => c.category === 'Roads').length,
                Utilities: complaints.filter(c => c.category === 'Utilities').length,
                Sanitation: complaints.filter(c => c.category === 'Sanitation').length,
                Noise: complaints.filter(c => c.category === 'Noise').length,
                Other: complaints.filter(c => !['Roads', 'Utilities', 'Sanitation', 'Noise'].includes(c.category)).length
            }
        };
    }

    // Helper method to get current timestamp
    static getCurrentTimestamp() {
        return new Date().toISOString().split('T')[0];
    }
}

module.exports = ComplaintsModel;