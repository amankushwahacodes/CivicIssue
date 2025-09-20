import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    Dimensions,
    ActivityIndicator
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState, useEffect } from "react";
import API from "../../services/api";

const { width } = Dimensions.get('window');

interface Issue {
    _id: string;
    title: string;
    description: string;
    category: "Roads" | "Lighting" | "Sanitation" | "Traffic" | "Water" | "Other";
    priority: "low" | "normal" | "high" | "critical";
    location: {
        address: string;
        ward?: string;
        coordinates?: [number, number];
    };
    photos: string[];
    status: "Pending" | "In Progress" | "Resolved";
    createdBy: string;
    assignedTo?: string;
    timeline: Array<{
        status: "open" | "acknowledged" | "in_progress" | "resolved" | "closed";
        by: string;
        note?: string;
        at: Date;
    }>;
    resolvedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

export default function TrackScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const [isExpanded, setIsExpanded] = useState(false);
    const [issueData, setIssueData] = useState<Issue | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (id) {
            fetchIssueData();
        }
    }, [id]);

    const fetchIssueData = async () => {
        try {
            setLoading(true);
            const response = await API.get(`/issues/${id}`);
            setIssueData(response.data);
        } catch (err: any) {
            console.error("Error fetching issue:", err);
            setError(err.response?.data?.message || "Failed to load issue details");
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "Pending": return "#ff9500";
            case "In Progress": return "#007aff";
            case "Resolved": return "#34c759";
            default: return "#666";
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case "critical": return "#ff3b30";
            case "high": return "#ff6b35";
            case "normal": return "#ff9500";
            case "low": return "#34c759";
            default: return "#666";
        }
    };

    const getPriorityLabel = (priority: string) => {
        return priority.charAt(0).toUpperCase() + priority.slice(1);
    };

    const formatDate = (dateString: string | Date) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatDateTime = (dateString: string | Date) => {
        const date = new Date(dateString);
        return {
            date: date.toLocaleDateString('en-US'),
            time: date.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
            })
        };
    };

    const getProgressPercentage = () => {
        if (!issueData) return 0;
        switch (issueData.status) {
            case "Pending": return 25;
            case "In Progress": return 75;
            case "Resolved": return 100;
            default: return 0;
        }
    };

    const handleContactSupport = () => {
        Alert.alert(
            "Contact Support",
            "Would you like to contact support regarding this issue?",
            [
                { text: "Cancel", style: "cancel" },
                { text: "Contact", onPress: () => console.log("Contacting support...") }
            ]
        );
    };

    const handleAddUpdate = () => {
        Alert.alert("Add Update", "This feature will allow you to add additional information to your issue.");
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007aff" />
                <Text style={styles.loadingText}>Loading issue details...</Text>
            </View>
        );
    }

    if (error || !issueData) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error || "Issue not found"}</Text>
                <TouchableOpacity
                    style={styles.retryButton}
                    onPress={fetchIssueData}
                >
                    <Text style={styles.retryButtonText}>Try Again</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <Text style={styles.backButtonText}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

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
                <Text style={styles.headerTitle}>Issue Details</Text>
                <Text style={styles.complaintId}>#{issueData._id.slice(-8)}</Text>
            </View>

            {/* Status Card */}
            <View style={styles.statusCard}>
                <View style={styles.statusHeader}>
                    <View style={styles.statusBadge}>
                        <Text style={[styles.statusText, { color: getStatusColor(issueData.status) }]}>
                            {issueData.status}
                        </Text>
                    </View>
                    <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(issueData.priority) }]}>
                        <Text style={styles.priorityText}>{getPriorityLabel(issueData.priority)}</Text>
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
                                    backgroundColor: getStatusColor(issueData.status)
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

            {/* Issue Details */}
            <View style={styles.detailsCard}>
                <Text style={styles.cardTitle}>{issueData.title}</Text>
                <Text style={styles.cardDescription}>
                    {isExpanded ? issueData.description :
                        issueData.description.length > 120 ?
                            `${issueData.description.substring(0, 120)}...` :
                            issueData.description
                    }
                </Text>
                {issueData.description.length > 120 && (
                    <TouchableOpacity onPress={() => setIsExpanded(!isExpanded)}>
                        <Text style={styles.expandButton}>
                            {isExpanded ? "Show Less" : "Read More"}
                        </Text>
                    </TouchableOpacity>
                )}

                <View style={styles.detailsGrid}>
                    <View style={styles.detailItem}>
                        <Text style={styles.detailLabel}>📍 Location</Text>
                        <Text style={styles.detailValue}>{issueData.location.address}</Text>
                    </View>
                    {issueData.location.ward && (
                        <View style={styles.detailItem}>
                            <Text style={styles.detailLabel}>🏘️ Ward</Text>
                            <Text style={styles.detailValue}>{issueData.location.ward}</Text>
                        </View>
                    )}
                    <View style={styles.detailItem}>
                        <Text style={styles.detailLabel}>📂 Category</Text>
                        <Text style={styles.detailValue}>{issueData.category}</Text>
                    </View>
                    <View style={styles.detailItem}>
                        <Text style={styles.detailLabel}>📅 Reported</Text>
                        <Text style={styles.detailValue}>{formatDate(issueData.createdAt)}</Text>
                    </View>
                    <View style={styles.detailItem}>
                        <Text style={styles.detailLabel}>🔄 Last Updated</Text>
                        <Text style={styles.detailValue}>{formatDate(issueData.updatedAt)}</Text>
                    </View>
                    {issueData.resolvedAt && (
                        <View style={styles.detailItem}>
                            <Text style={styles.detailLabel}>✅ Resolved</Text>
                            <Text style={styles.detailValue}>{formatDate(issueData.resolvedAt)}</Text>
                        </View>
                    )}
                </View>
            </View>

            {/* Timeline Updates */}
            {issueData.timeline && issueData.timeline.length > 0 && (
                <View style={styles.updatesCard}>
                    <Text style={styles.cardTitle}>Timeline Updates</Text>
                    {issueData.timeline.map((update, index) => {
                        const dateTime = formatDateTime(update.at);
                        return (
                            <View key={index} style={styles.updateItem}>
                                <View style={styles.updateHeader}>
                                    <Text style={styles.updateDate}>{dateTime.date} • {dateTime.time}</Text>
                                    <View style={[styles.updateStatusBadge, { backgroundColor: getStatusColor(issueData.status) }]}>
                                        <Text style={styles.updateStatusText}>{update.status.replace('_', ' ')}</Text>
                                    </View>
                                </View>
                                {update.note && (
                                    <Text style={styles.updateMessage}>{update.note}</Text>
                                )}
                                <Text style={styles.updateBy}>Updated by System</Text>
                            </View>
                        );
                    })}
                </View>
            )}

            {/* Photos Section */}
            {issueData.photos && issueData.photos.length > 0 && (
                <View style={styles.photosCard}>
                    <Text style={styles.cardTitle}>Photos ({issueData.photos.length})</Text>
                    <Text style={styles.photosNote}>Photos functionality will be implemented soon.</Text>
                </View>
            )}

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
                    onPress={handleContactSupport}
                >
                    <Text style={[styles.actionButtonText, styles.shareButtonText]}>📞 Support</Text>
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
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f5f5f5",
    },
    loadingText: {
        fontSize: 16,
        color: "#666",
        marginTop: 16,
    },
    errorContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f5f5f5",
        paddingHorizontal: 32,
    },
    errorText: {
        fontSize: 16,
        color: "#666",
        textAlign: "center",
        marginBottom: 24,
    },
    retryButton: {
        backgroundColor: "#007aff",
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
        marginBottom: 12,
    },
    retryButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
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
    photosCard: {
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
    photosNote: {
        fontSize: 14,
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