import { View, Text, FlatList, StyleSheet, TouchableOpacity } from "react-native";

const complaints = [
    { id: "101", title: "Pothole on Main Road", status: "Pending", department: "Roads" },
    { id: "102", title: "Street Light Not Working", status: "In Progress", department: "Electricity" },
    { id: "103", title: "Garbage Collection Delay", status: "Resolved", department: "Sanitation" },
];

export default function DashboardScreen() {
    const handleUpdateStatus = (id: string) => {
        alert(`Update status for Complaint ${id}`);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Admin Dashboard</Text>
            <FlatList
                data={complaints}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View style={styles.card}>
                        <Text style={styles.title}>{item.title}</Text>
                        <Text>Status: {item.status}</Text>
                        <Text>Department: {item.department}</Text>
                        <TouchableOpacity
                            style={styles.button}
                            onPress={() => handleUpdateStatus(item.id)}
                        >
                            <Text style={styles.buttonText}>Update</Text>
                        </TouchableOpacity>
                    </View>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16, backgroundColor: "#fff" },
    header: { fontSize: 20, fontWeight: "bold", marginBottom: 12 },
    card: {
        backgroundColor: "#f2f2f2",
        padding: 14,
        marginBottom: 10,
        borderRadius: 8,
    },
    title: { fontSize: 16, fontWeight: "600" },
    button: {
        marginTop: 8,
        backgroundColor: "#007AFF",
        padding: 8,
        borderRadius: 6,
        alignSelf: "flex-start",
    },
    buttonText: { color: "#fff", fontWeight: "600" },
});
