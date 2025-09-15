// app/(tabs)/profile.tsx
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Alert
} from "react-native";
import { useRouter } from "expo-router";

export default function ProfileScreen() {
    const router = useRouter();

    const handleLogout = () => {
        Alert.alert(
            "Logout",
            "Are you sure you want to logout?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Logout", style: "destructive", onPress: () => {
                        // Add logout logic here
                        console.log("User logged out");
                    }
                }
            ]
        );
    };

    const handleEditProfile = () => {
        // Navigate to edit profile screen
        router.push("/profile/edit" as any);
    };

    const handleSettings = () => {
        // Navigate to settings screen
        router.push("/profile/settings" as any);
    };

    const handleNotifications = () => {
        // Navigate to notifications settings
        router.push("/profile/notifications" as any);
    };

    const handleHelp = () => {
        // Navigate to help screen
        router.push("/profile/help" as any);
    };

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {/* Header Section */}
            <View style={styles.headerSection}>
                <View style={styles.avatarContainer}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>AM</Text>
                    </View>
                    <TouchableOpacity style={styles.editAvatarButton}>
                        <Text style={styles.editAvatarText}>📷</Text>
                    </TouchableOpacity>
                </View>
                <Text style={styles.userName}>Aman</Text>
                <Text style={styles.userEmail}>aman@example.com</Text>
                <View style={styles.roleBadge}>
                    <Text style={styles.roleText}>👤 Citizen</Text>
                </View>
            </View>

            {/* Stats Section */}
            <View style={styles.statsSection}>
                <View style={styles.statItem}>
                    <Text style={styles.statNumber}>12</Text>
                    <Text style={styles.statLabel}>Complaints</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                    <Text style={styles.statNumber}>8</Text>
                    <Text style={styles.statLabel}>Resolved</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                    <Text style={styles.statNumber}>4.2</Text>
                    <Text style={styles.statLabel}>Avg Rating</Text>
                </View>
            </View>

            {/* Quick Actions */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Quick Actions</Text>
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={handleEditProfile}
                >
                    <Text style={styles.actionIcon}>✏️</Text>
                    <View style={styles.actionContent}>
                        <Text style={styles.actionTitle}>Edit Profile</Text>
                        <Text style={styles.actionSubtitle}>Update your personal information</Text>
                    </View>
                    <Text style={styles.actionArrow}>›</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={handleNotifications}
                >
                    <Text style={styles.actionIcon}>🔔</Text>
                    <View style={styles.actionContent}>
                        <Text style={styles.actionTitle}>Notifications</Text>
                        <Text style={styles.actionSubtitle}>Manage your notification preferences</Text>
                    </View>
                    <Text style={styles.actionArrow}>›</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={handleSettings}
                >
                    <Text style={styles.actionIcon}>⚙️</Text>
                    <View style={styles.actionContent}>
                        <Text style={styles.actionTitle}>Settings</Text>
                        <Text style={styles.actionSubtitle}>App preferences and privacy</Text>
                    </View>
                    <Text style={styles.actionArrow}>›</Text>
                </TouchableOpacity>
            </View>

            {/* Admin Section (conditional) */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Administration</Text>
                <TouchableOpacity
                    style={[styles.actionButton, styles.adminButton]}
                    onPress={() => router.push("/admin/dashboard")}
                >
                    <Text style={styles.actionIcon}>🛡️</Text>
                    <View style={styles.actionContent}>
                        <Text style={styles.actionTitle}>Admin Dashboard</Text>
                        <Text style={styles.actionSubtitle}>Access administrative features</Text>
                    </View>
                    <Text style={styles.actionArrow}>›</Text>
                </TouchableOpacity>
            </View>

            {/* Support Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Support</Text>
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={handleHelp}
                >
                    <Text style={styles.actionIcon}>❓</Text>
                    <View style={styles.actionContent}>
                        <Text style={styles.actionTitle}>Help & FAQ</Text>
                        <Text style={styles.actionSubtitle}>Get help and find answers</Text>
                    </View>
                    <Text style={styles.actionArrow}>›</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => Alert.alert("Contact", "Email: support@complaints.app")}
                >
                    <Text style={styles.actionIcon}>📧</Text>
                    <View style={styles.actionContent}>
                        <Text style={styles.actionTitle}>Contact Support</Text>
                        <Text style={styles.actionSubtitle}>Get in touch with our team</Text>
                    </View>
                    <Text style={styles.actionArrow}>›</Text>
                </TouchableOpacity>
            </View>

            {/* Logout Button */}
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <Text style={styles.logoutText}>🚪 Logout</Text>
            </TouchableOpacity>

            {/* App Version */}
            <View style={styles.versionContainer}>
                <Text style={styles.versionText}>Version 1.0.0</Text>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f5f5f5",
    },
    headerSection: {
        backgroundColor: "#fff",
        alignItems: "center",
        paddingVertical: 32,
        paddingHorizontal: 16,
        marginBottom: 16,
    },
    avatarContainer: {
        position: "relative",
        marginBottom: 16,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: "#007aff",
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    avatarText: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#fff",
    },
    editAvatarButton: {
        position: "absolute",
        bottom: -2,
        right: -2,
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: "#fff",
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 2,
    },
    editAvatarText: {
        fontSize: 12,
    },
    userName: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#333",
        marginBottom: 4,
    },
    userEmail: {
        fontSize: 16,
        color: "#666",
        marginBottom: 12,
    },
    roleBadge: {
        backgroundColor: "#f0f8ff",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "#007aff",
    },
    roleText: {
        fontSize: 14,
        color: "#007aff",
        fontWeight: "500",
    },
    statsSection: {
        backgroundColor: "#fff",
        flexDirection: "row",
        paddingVertical: 20,
        marginBottom: 16,
        marginHorizontal: 16,
        borderRadius: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    statItem: {
        flex: 1,
        alignItems: "center",
    },
    statNumber: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#333",
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: "#666",
        fontWeight: "500",
    },
    statDivider: {
        width: 1,
        backgroundColor: "#f0f0f0",
        marginVertical: 8,
    },
    section: {
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#333",
        marginBottom: 12,
        paddingHorizontal: 16,
    },
    actionButton: {
        backgroundColor: "#fff",
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 16,
        paddingHorizontal: 16,
        marginHorizontal: 16,
        marginBottom: 8,
        borderRadius: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    adminButton: {
        borderLeftWidth: 3,
        borderLeftColor: "#ff9500",
    },
    actionIcon: {
        fontSize: 20,
        marginRight: 12,
        width: 24,
        textAlign: "center",
    },
    actionContent: {
        flex: 1,
    },
    actionTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: "#333",
        marginBottom: 2,
    },
    actionSubtitle: {
        fontSize: 13,
        color: "#666",
    },
    actionArrow: {
        fontSize: 18,
        color: "#ccc",
        fontWeight: "300",
    },
    logoutButton: {
        backgroundColor: "#ff3b30",
        marginHorizontal: 16,
        marginVertical: 20,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    logoutText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#fff",
    },
    versionContainer: {
        alignItems: "center",
        paddingVertical: 20,
        paddingBottom: 40,
    },
    versionText: {
        fontSize: 12,
        color: "#999",
    },
});