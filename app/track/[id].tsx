import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    Dimensions
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";

const { width } = Dimensions.get('window');

export default function TrackScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const [isExpanded, setIsExpanded] = useState(false);

    // Mock data - replace with real data from API
    const complaintData = {
        id: id || "101",
        title: "Pothole on Main Road",
        description: "Large pothole causing damage to vehicles near Oak Street intersection. The pothole has been growing larger over the past few weeks and is now causing significant traffic issues.",
        status: "In Progress",
        priority: "High",
        category: "Roads",
        location: "Main Road & Oak Street",
        reportedDate: "2024-03-15",
        lastUpdate: "2024-03-18",
        assignedDepartment: "Municipal Works Department",
        estimatedCompletion: "2024-03-25",
        assignedOfficer: "John Smith",
        officerContact: "+1 234-567-8900",
        photos: ["photo1.jpg", "photo2.jpg"],
        updates: [
            {
                date: "2024-03-18",
                time: "2:30 PM",
                status: "In Progress",
                message: "Work crew assigned. Materials ordered and will arrive tomorrow.",
                updatedBy: "John Smith"
            },
            {
                date: "2024-03-16",
                time: "10:15 AM",
                status: "Under Review",
                message: "Complaint reviewed and approved for repair. Scheduling work crew.",
                updatedBy: "Sarah Johnson"
            },
            {
                date: "2024-03-15",
                time: "9:00 AM",
                status: "Submitted",
                message: "Complaint submitted successfully. Initial review in progress.",
                updatedBy: "System"
            }
        ]
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "Submitted": return "#ff9500";
            case "Under Review": return "#007aff";
            case "In Progress": return "#007aff";
            case "Resolved": return "#34c759";
            case "Rejected": return "#ff3b30";
            default: return "#666";
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case "High": return "#ff3b30";
            case "Medium": return "#ff9500";
            case "Low": return "#34c759";
            default: return "#666";
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getProgressPercentage = () => {
        switch (complaintData.status) {
            case "Submitted": return 25;
            case "Under Review": return 50;
            case "In Progress": return 75;
            case "Resolved": return 100;
            default: return 0;
        }
    };

    const handleContactOfficer = () => {
        Alert.alert(
            "Contact Officer",
            `Call ${complaintData.assignedOfficer} at ${complaintData.officerContact}?`,
            [
                { text: "Cancel", style: "cancel" },
                { text: "Call", onPress: () => console.log("Calling officer...") }
            ]
        );
    };

    const handleAddUpdate = () => {
        Alert.alert("Add Update", "This feature allows you to add additional information or photos to your complaint.");
    };

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {/* Header Section */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <Text style={styles.backButtonText}>← Back</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Complaint Details</Text>
                <Text style={styles.complaintId}>#{complaintData.id}</Text>
            </View>

            {/* Status Card */}
            <View style={styles.statusCard}>
                <View style={styles.statusHeader}>
                    <View style={styles.statusBadge}>
                        <Text style={[styles.statusText, { color: getStatusColor(complaintData.status) }]}>
                            {complaintData.status}
                        </Text>
                    </View>
                    <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(complaintData.priority) }]}>
                        <Text style={styles.priorityText}>{complaintData.priority}</Text>
                    </View>
                </View>

                {/* Progress Bar */}
                <View style={styles.progressContainer}>
                    <Text style={styles.progressLabel}>Progress: {getProgressPercentage()}%</Text>
                    <View style={styles.progressBar}>
                        <View
                            style={[
                                styles.progressFill,
                                {
                                    width: `${getProgressPercentage()}%`,
                                    backgroundColor: getStatusColor(complaintData.status)
                                }
                            ]}
                        />
                    </View>
                </View>

                {/* Status Timeline */}
                <View style={styles.timelineContainer}>
                    <View style={styles.timelineItem}>
                        <View style={[styles.timelineDot, { backgroundColor: "#34c759" }]} />
                        <Text style={styles.timelineText}>Submitted</Text>
                    </View>
                    <View style={styles.timelineLine} />
                    <View style={styles.timelineItem}>
                        <View style={[styles.timelineDot, { backgroundColor: getProgressPercentage() >= 50 ? "#007aff" : "#ddd" }]} />
                        <Text style={styles.timelineText}>Under Review</Text>
                    </View>
                    <View style={styles.timelineLine} />
                    <View style={styles.timelineItem}>
                        <View style={[styles.timelineDot, { backgroundColor: getProgressPercentage() >= 75 ? "#007aff" : "#ddd" }]} />
                        <Text style={styles.timelineText}>In Progress</Text>
                    </View>
                    <View style={styles.timelineLine} />
                    <View style={styles.timelineItem}>
                        <View style={[styles.timelineDot, { backgroundColor: getProgressPercentage() >= 100 ? "#34c759" : "#ddd" }]} />
                        <Text style={styles.timelineText}>Resolved</Text>
                    </View>
                </View>
            </View>

            {/* Complaint Details */}
            <View style={styles.detailsCard}>
                <Text style={styles.cardTitle}>{complaintData.title}</Text>
                <Text style={styles.cardDescription}>
                    {isExpanded ? complaintData.description : `${complaintData.description.substring(0, 120)}...`}
                </Text>
                <TouchableOpacity onPress={() => setIsExpanded(!isExpanded)}>
                    <Text style={styles.expandButton}>
                        {isExpanded ? "Show Less" : "Read More"}
                    </Text>
                </TouchableOpacity>

                <View style={styles.detailsGrid}>
                    <View style={styles.detailItem}>
                        <Text style={styles.detailLabel}>📍 Location</Text>
                        <Text style={styles.detailValue}>{complaintData.location}</Text>
                    </View>
                    <View style={styles.detailItem}>
                        <Text style={styles.detailLabel}>📂 Category</Text>
                        <Text style={styles.detailValue}>{complaintData.category}</Text>
                    </View>
                    <View style={styles.detailItem}>
                        <Text style={styles.detailLabel}>📅 Reported</Text>
                        <Text style={styles.detailValue}>{formatDate(complaintData.reportedDate)}</Text>
                    </View>
                    <View style={styles.detailItem}>
                        <Text style={styles.detailLabel}>⏰ Est. Completion</Text>
                        <Text style={styles.detailValue}>{formatDate(complaintData.estimatedCompletion)}</Text>
                    </View>
                </View>
            </View>

            {/* Assigned Officer */}
            <View style={styles.officerCard}>
                <Text style={styles.cardTitle}>Assigned Officer</Text>
                <View style={styles.officerInfo}>
                    <View style={styles.officerAvatar}>
                        <Text style={styles.officerAvatarText}>JS</Text>
                    </View>
                    <View style={styles.officerDetails}>
                        <Text style={styles.officerName}>{complaintData.assignedOfficer}</Text>
                        <Text style={styles.officerDepartment}>{complaintData.assignedDepartment}</Text>
                        <Text style={styles.officerContact}>{complaintData.officerContact}</Text>
                    </View>
                    <TouchableOpacity
                        style={styles.contactButton}
                        onPress={handleContactOfficer}
                    >
                        <Text style={styles.contactButtonText}>📞 Call</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Recent Updates */}
            <View style={styles.updatesCard}>
                <Text style={styles.cardTitle}>Recent Updates</Text>
                {complaintData.updates.map((update, index) => (
                    <View key={index} style={styles.updateItem}>
                        <View style={styles.updateHeader}>
                            <Text style={styles.updateDate}>{update.date} • {update.time}</Text>
                            <View style={[styles.updateStatusBadge, { backgroundColor: getStatusColor(update.status) }]}>
                                <Text style={styles.updateStatusText}>{update.status}</Text>
                            </View>
                        </View>
                        <Text style={styles.updateMessage}>{update.message}</Text>
                        <Text style={styles.updateBy}>Updated by {update.updatedBy}</Text>
                    </View>
                ))}
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={handleAddUpdate}
                >
                    <Text style={styles.actionButtonText}>📝 Add Update</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.actionButton, styles.shareButton]}
                    onPress={() => Alert.alert("Share", "Share complaint details with others")}
                >
                    <Text style={[styles.actionButtonText, styles.shareButtonText]}>📤 Share</Text>
                </TouchableOpacity>
            </View>

            {/* Bottom Spacing */}
            <View style={styles.bottomSpacing} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f5f5f5",
    },
    header: {
        backgroundColor: "#fff",
        paddingTop: 50,
        paddingBottom: 20,
        paddingHorizontal: 16,
        alignItems: "center",
    },
    backButton: {
        alignSelf: "flex-start",
        marginBottom: 10,
    },
    backButtonText: {
        fontSize: 16,
        color: "#007aff",
        fontWeight: "500",
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#333",
        marginBottom: 4,
    },
    complaintId: {
        fontSize: 14,
        color: "#666",
        fontWeight: "500",
    },
    statusCard: {
        backgroundColor: "#fff",
        margin: 16,
        borderRadius: 16,
        padding: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    statusHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
    },
    statusBadge: {
        backgroundColor: "#f0f8ff",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 14,
        fontWeight: "600",
    },
    priorityBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    priorityText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#fff",
    },
    progressContainer: {
        marginBottom: 20,
    },
    progressLabel: {
        fontSize: 14,
        fontWeight: "500",
        color: "#333",
        marginBottom: 8,
    },
    progressBar: {
        height: 8,
        backgroundColor: "#f0f0f0",
        borderRadius: 4,
        overflow: "hidden",
    },
    progressFill: {
        height: "100%",
        borderRadius: 4,
    },
    timelineContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    timelineItem: {
        alignItems: "center",
        flex: 1,
    },
    timelineDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginBottom: 8,
    },
    timelineText: {
        fontSize: 10,
        color: "#666",
        fontWeight: "500",
        textAlign: "center",
    },
    timelineLine: {
        flex: 1,
        height: 2,
        backgroundColor: "#f0f0f0",
        marginHorizontal: 4,
    },
    detailsCard: {
        backgroundColor: "#fff",
        marginHorizontal: 16,
        marginBottom: 16,
        borderRadius: 16,
        padding: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#333",
        marginBottom: 12,
    },
    cardDescription: {
        fontSize: 16,
        color: "#666",
        lineHeight: 22,
        marginBottom: 8,
    },
    expandButton: {
        fontSize: 14,
        color: "#007aff",
        fontWeight: "500",
        marginBottom: 16,
    },
    detailsGrid: {
        gap: 16,
    },
    detailItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: "#f0f0f0",
    },
    detailLabel: {
        fontSize: 14,
        color: "#666",
        fontWeight: "500",
        flex: 1,
    },
    detailValue: {
        fontSize: 14,
        color: "#333",
        fontWeight: "600",
        flex: 2,
        textAlign: "right",
    },
    officerCard: {
        backgroundColor: "#fff",
        marginHorizontal: 16,
        marginBottom: 16,
        borderRadius: 16,
        padding: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    officerInfo: {
        flexDirection: "row",
        alignItems: "center",
    },
    officerAvatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: "#007aff",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
    },
    officerAvatarText: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#fff",
    },
    officerDetails: {
        flex: 1,
    },
    officerName: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#333",
        marginBottom: 2,
    },
    officerDepartment: {
        fontSize: 13,
        color: "#666",
        marginBottom: 2,
    },
    officerContact: {
        fontSize: 13,
        color: "#007aff",
        fontWeight: "500",
    },
    contactButton: {
        backgroundColor: "#007aff",
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    contactButtonText: {
        fontSize: 14,
        color: "#fff",
        fontWeight: "600",
    },
    updatesCard: {
        backgroundColor: "#fff",
        marginHorizontal: 16,
        marginBottom: 16,
        borderRadius: 16,
        padding: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    updateItem: {
        marginBottom: 16,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#f0f0f0",
    },
    updateHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
    },
    updateDate: {
        fontSize: 12,
        color: "#999",
        fontWeight: "500",
    },
    updateStatusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 8,
    },
    updateStatusText: {
        fontSize: 10,
        color: "#fff",
        fontWeight: "600",
        textTransform: "uppercase",
    },
    updateMessage: {
        fontSize: 14,
        color: "#333",
        lineHeight: 20,
        marginBottom: 4,
    },
    updateBy: {
        fontSize: 12,
        color: "#666",
        fontStyle: "italic",
    },
    actionButtons: {
        flexDirection: "row",
        paddingHorizontal: 16,
        gap: 12,
    },
    actionButton: {
        flex: 1,
        backgroundColor: "#007aff",
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: "center",
    },
    actionButtonText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#fff",
    },
    shareButton: {
        backgroundColor: "#fff",
        borderWidth: 2,
        borderColor: "#007aff",
    },
    shareButtonText: {
        color: "#007aff",
    },
    bottomSpacing: {
        height: 40,
    },
});