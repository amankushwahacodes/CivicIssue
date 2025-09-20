import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Alert,
    ActivityIndicator
} from "react-native";
import { useRouter } from "expo-router";
import { useState, useEffect } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import API from "../../services/api";

interface UserData {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    ward?: string;
    role: "user" | "staff" | "admin";
}

interface UserStats {
    total: number;
    pending: number;
    inProgress: number;
    resolved: number;
}

export default function ProfileScreen() {
    const router = useRouter();
    const [userData, setUserData] = useState<UserData | null>(null);
    const [userStats, setUserStats] = useState<UserStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadUserData();
        loadUserStats();
    }, []);

    const loadUserData = async () => {
        try {
            const storedUserData = await AsyncStorage.getItem('userData');
            if (storedUserData) {
                setUserData(JSON.parse(storedUserData));
            }
        } catch (error) {
            console.error('Error loading user data:', error);
        }
    };

    const loadUserStats = async () => {
        try {
            // Change this line:
            const response = await API.get('/issues/stats/user');
            setUserStats(response.data);
        } catch (error) {
            console.error('Error loading user stats:', error);
            setUserStats({ total: 0, pending: 0, inProgress: 0, resolved: 0 });
        } finally {
            setLoading(false);
        }
    };
    const handleLogout = async () => {
        Alert.alert(
            "Sign Out",
            "Are you sure you want to sign out?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Sign Out",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await AsyncStorage.removeItem("authToken");
                            await AsyncStorage.removeItem("userData");
                            delete API.defaults.headers.common['Authorization'];
                            router.replace("/auth/LoginScreen");
                        } catch (error) {
                            console.error("Logout error:", error);
                            Alert.alert("Error", "Failed to sign out. Please try again.");
                        }
                    }
                }
            ]
        );
    };

    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    const getRoleDisplay = (role: string) => {
        switch (role) {
            case 'admin': return '👑 Administrator';
            case 'staff': return '🛡️ Staff Member';
            case 'user': return '👤 Citizen';
            default: return '👤 User';
        }
    };

    const getRoleBadgeStyle = (role: string) => {
        switch (role) {
            case 'admin': return { backgroundColor: '#fff5f5', borderColor: '#ff3b30' };
            case 'staff': return { backgroundColor: '#fff8f0', borderColor: '#ff9500' };
            default: return { backgroundColor: '#f0f8ff', borderColor: '#007aff' };
        }
    };

    const getRoleTextStyle = (role: string) => {
        switch (role) {
            case 'admin': return { color: '#ff3b30' };
            case 'staff': return { color: '#ff9500' };
            default: return { color: '#007aff' };
        }
    };

    if (loading || !userData) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007aff" />
                <Text style={styles.loadingText}>Loading profile...</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {/* Header Section */}
            <View style={styles.headerSection}>
                <View style={styles.avatarContainer}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>{getInitials(userData.name)}</Text>
                    </View>
                    <TouchableOpacity style={styles.editAvatarButton}>
                        <Text style={styles.editAvatarText}>📷</Text>
                    </TouchableOpacity>
                </View>
                <Text style={styles.userName}>{userData.name}</Text>
                <Text style={styles.userEmail}>{userData.email}</Text>
                {userData.phone && (
                    <Text style={styles.userPhone}>{userData.phone}</Text>
                )}
                {userData.ward && (
                    <Text style={styles.userWard}>Ward: {userData.ward}</Text>
                )}
                <View style={[styles.roleBadge, getRoleBadgeStyle(userData.role)]}>
                    <Text style={[styles.roleText, getRoleTextStyle(userData.role)]}>
                        {getRoleDisplay(userData.role)}
                    </Text>
                </View>
            </View>

            {/* Stats Section */}
            {userStats && (
                <View style={styles.statsSection}>
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>{userStats.total}</Text>
                        <Text style={styles.statLabel}>Total Issues</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>{userStats.resolved}</Text>
                        <Text style={styles.statLabel}>Resolved</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>{userStats.pending + userStats.inProgress}</Text>
                        <Text style={styles.statLabel}>Active</Text>
                    </View>
                </View>
            )}

            {/* Quick Actions */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Account</Text>

                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => Alert.alert("Edit Profile", "Profile editing feature coming soon!")}
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
                    onPress={() => router.push("/(tabs)/" as any)}
                >
                    <Text style={styles.actionIcon}>📋</Text>
                    <View style={styles.actionContent}>
                        <Text style={styles.actionTitle}>My Issues</Text>
                        <Text style={styles.actionSubtitle}>View all your reported issues</Text>
                    </View>
                    <Text style={styles.actionArrow}>›</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => Alert.alert("Notifications", "Notification settings coming soon!")}
                >
                    <Text style={styles.actionIcon}>🔔</Text>
                    <View style={styles.actionContent}>
                        <Text style={styles.actionTitle}>Notifications</Text>
                        <Text style={styles.actionSubtitle}>Manage your notification preferences</Text>
                    </View>
                    <Text style={styles.actionArrow}>›</Text>
                </TouchableOpacity>
            </View>

            {/* Admin Section - Only show for admin/staff */}
            {(userData.role === 'admin' || userData.role === 'staff') && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Administration</Text>
                    <TouchableOpacity
                        style={[styles.actionButton, styles.adminButton]}
                        onPress={() => router.push("/admin/dashboard" as any)}
                    >
                        <Text style={styles.actionIcon}>🛡️</Text>
                        <View style={styles.actionContent}>
                            <Text style={styles.actionTitle}>
                                {userData.role === 'admin' ? 'Admin Dashboard' : 'Staff Dashboard'}
                            </Text>
                            <Text style={styles.actionSubtitle}>
                                Access {userData.role === 'admin' ? 'administrative' : 'staff'} features
                            </Text>
                        </View>
                        <Text style={styles.actionArrow}>›</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* Settings Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Settings</Text>

                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => Alert.alert("Privacy", "Privacy settings coming soon!")}
                >
                    <Text style={styles.actionIcon}>🔒</Text>
                    <View style={styles.actionContent}>
                        <Text style={styles.actionTitle}>Privacy & Security</Text>
                        <Text style={styles.actionSubtitle}>Manage your privacy settings</Text>
                    </View>
                    <Text style={styles.actionArrow}>›</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => Alert.alert("Settings", "App settings coming soon!")}
                >
                    <Text style={styles.actionIcon}>⚙️</Text>
                    <View style={styles.actionContent}>
                        <Text style={styles.actionTitle}>App Settings</Text>
                        <Text style={styles.actionSubtitle}>Customize your app experience</Text>
                    </View>
                    <Text style={styles.actionArrow}>›</Text>
                </TouchableOpacity>
            </View>

            {/* Support Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Support</Text>

                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => Alert.alert("Help", "Help & FAQ coming soon!")}
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
                    onPress={() => Alert.alert("Contact Support", "Email: support@civicapp.com\nPhone: +91-XXXXXXXXXX")}
                >
                    <Text style={styles.actionIcon}>📧</Text>
                    <View style={styles.actionContent}>
                        <Text style={styles.actionTitle}>Contact Support</Text>
                        <Text style={styles.actionSubtitle}>Get in touch with our team</Text>
                    </View>
                    <Text style={styles.actionArrow}>›</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => Alert.alert("About", "Civic Issues Reporter v1.0.0\n\nA platform for reporting and tracking community issues.")}
                >
                    <Text style={styles.actionIcon}>ℹ️</Text>
                    <View style={styles.actionContent}>
                        <Text style={styles.actionTitle}>About App</Text>
                        <Text style={styles.actionSubtitle}>App information and version</Text>
                    </View>
                    <Text style={styles.actionArrow}>›</Text>
                </TouchableOpacity>
            </View>

            {/* Logout Button */}
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <Text style={styles.logoutText}>🚪 Sign Out</Text>
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
        marginBottom: 4,
    },
    userPhone: {
        fontSize: 14,
        color: "#666",
        marginBottom: 4,
    },
    userWard: {
        fontSize: 14,
        color: "#666",
        marginBottom: 12,
    },
    roleBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        borderWidth: 1,
    },
    roleText: {
        fontSize: 14,
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