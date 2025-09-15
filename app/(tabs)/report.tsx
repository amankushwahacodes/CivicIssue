import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ScrollView,
    KeyboardAvoidingView,
    Platform
} from "react-native";
import { useState } from "react";

export default function ReportScreen() {
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        location: "",
        category: "General",
        priority: "Medium"
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const categories = ["Roads", "Utilities", "Sanitation", "Public Safety", "Noise", "General"];
    const priorities = ["Low", "Medium", "High"];

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.title.trim()) {
            newErrors.title = "Title is required";
        } else if (formData.title.length < 5) {
            newErrors.title = "Title must be at least 5 characters";
        }

        if (!formData.description.trim()) {
            newErrors.description = "Description is required";
        } else if (formData.description.length < 10) {
            newErrors.description = "Description must be at least 10 characters";
        }

        if (!formData.location.trim()) {
            newErrors.location = "Location is required";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setIsSubmitting(true);

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Create complaint object
            const newComplaint = {
                id: Date.now().toString(),
                ...formData,
                status: "Pending",
                date: new Date().toISOString().split('T')[0]
            };

            console.log("New complaint:", newComplaint);

            Alert.alert(
                "Success! 🎉",
                "Your complaint has been submitted successfully. You'll receive updates on its progress.",
                [
                    {
                        text: "View My Complaints",
                        onPress: () => {
                            // Navigate to home tab - adjust route as needed
                            console.log("Navigate to home");
                        }
                    },
                    { text: "Submit Another", style: "default" }
                ]
            );

            // Reset form
            setFormData({
                title: "",
                description: "",
                location: "",
                category: "General",
                priority: "Medium"
            });
            setErrors({});

        } catch (e) {
            console.log(e);
            Alert.alert(
                "Error",
                "Failed to submit complaint. Please try again.",
                [{ text: "OK" }]
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const updateFormData = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: "" }));
        }
    };

    const renderSelector = (
        options: string[],
        selectedValue: string,
        onSelect: (value: string) => void,
        title: string
    ) => (
        <View style={styles.formGroup}>
            <Text style={styles.label}>{title}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.selectorContainer}>
                {options.map((option) => (
                    <TouchableOpacity
                        key={option}
                        style={[
                            styles.selectorButton,
                            selectedValue === option && styles.selectedButton,
                            selectedValue === option && title === "Priority" && styles.prioritySelected
                        ]}
                        onPress={() => onSelect(option)}
                    >
                        <Text style={[
                            styles.selectorText,
                            selectedValue === option && styles.selectedText
                        ]}>
                            {option}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
            <ScrollView
                style={styles.scrollContainer}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                <Text style={styles.header}>Report New Issue</Text>
                <Text style={styles.subtitle}>Help us improve your community by reporting issues</Text>

                {/* Title Field */}
                <View style={styles.formGroup}>
                    <Text style={styles.label}>
                        Issue Title <Text style={styles.required}>*</Text>
                    </Text>
                    <TextInput
                        style={[styles.input, errors.title && styles.inputError]}
                        placeholder="Brief title for your issue (e.g., 'Pothole on Main Street')"
                        value={formData.title}
                        onChangeText={(value) => updateFormData("title", value)}
                        maxLength={100}
                        autoCapitalize="sentences"
                        placeholderTextColor="#999"
                    />
                    {errors.title && <Text style={styles.errorText}>⚠️ {errors.title}</Text>}
                    <Text style={styles.charCount}>{formData.title.length}/100</Text>
                </View>

                {/* Location Field */}
                <View style={styles.formGroup}>
                    <Text style={styles.label}>
                        Location <Text style={styles.required}>*</Text>
                    </Text>
                    <TextInput
                        style={[styles.input, errors.location && styles.inputError]}
                        placeholder="Where is this issue located?"
                        value={formData.location}
                        onChangeText={(value) => updateFormData("location", value)}
                        maxLength={100}
                        autoCapitalize="words"
                        placeholderTextColor="#999"
                    />
                    {errors.location && <Text style={styles.errorText}>⚠️ {errors.location}</Text>}
                </View>

                {/* Category Selector */}
                {renderSelector(categories, formData.category, (value) => updateFormData("category", value), "Category")}

                {/* Priority Selector */}
                {renderSelector(priorities, formData.priority, (value) => updateFormData("priority", value), "Priority")}

                {/* Description Field */}
                <View style={styles.formGroup}>
                    <Text style={styles.label}>
                        Description <Text style={styles.required}>*</Text>
                    </Text>
                    <TextInput
                        style={[styles.textArea, errors.description && styles.inputError]}
                        placeholder="Describe the issue in detail. Include any relevant information that might help us resolve it quickly..."
                        value={formData.description}
                        onChangeText={(value) => updateFormData("description", value)}
                        multiline
                        numberOfLines={5}
                        textAlignVertical="top"
                        maxLength={500}
                        autoCapitalize="sentences"
                        placeholderTextColor="#999"
                    />
                    {errors.description && <Text style={styles.errorText}>⚠️ {errors.description}</Text>}
                    <Text style={styles.charCount}>{formData.description.length}/500</Text>
                </View>

                {/* Submit Button */}
                <TouchableOpacity
                    style={[
                        styles.submitButton,
                        isSubmitting && styles.submitButtonDisabled,
                        !isSubmitting && styles.submitButtonActive
                    ]}
                    onPress={handleSubmit}
                    disabled={isSubmitting}
                    activeOpacity={0.8}
                >
                    <Text style={styles.submitButtonText}>
                        {isSubmitting ? "Submitting..." : "Submit Complaint"}
                    </Text>
                </TouchableOpacity>

                {/* Info Card */}
                <View style={styles.infoCard}>
                    <Text style={styles.infoTitle}>What happens next?</Text>
                    <Text style={styles.infoText}>
                        1. Your complaint will be reviewed within 24 hours{'\n'}
                        2. We&apos;ll assign it to the appropriate department{'\n'}
                        3. You&apos;ll receive updates as we work to resolve it
                    </Text>
                </View>

                <View style={styles.bottomSpace} />
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f5f5f5"
    },
    scrollContainer: {
        flex: 1,
        padding: 16,
    },
    header: {
        fontSize: 28,
        fontWeight: "bold",
        marginBottom: 6,
        color: "#333",
        marginTop: 10
    },
    subtitle: {
        fontSize: 16,
        color: "#666",
        marginBottom: 24,
        lineHeight: 22,
    },
    formGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: "600",
        color: "#333",
        marginBottom: 8,
    },
    required: {
        color: "#ff3b30",
        fontWeight: "bold",
    },
    input: {
        borderWidth: 1,
        borderColor: "#ddd",
        padding: 14,
        borderRadius: 12,
        fontSize: 16,
        backgroundColor: "#fff",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    inputError: {
        borderColor: "#ff3b30",
        borderWidth: 2,
        backgroundColor: "#fff5f5",
    },
    textArea: {
        borderWidth: 1,
        borderColor: "#ddd",
        padding: 14,
        borderRadius: 12,
        fontSize: 16,
        backgroundColor: "#fff",
        minHeight: 120,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    errorText: {
        color: "#ff3b30",
        fontSize: 12,
        marginTop: 6,
        fontWeight: "500",
    },
    charCount: {
        fontSize: 12,
        color: "#999",
        textAlign: "right",
        marginTop: 6,
    },
    selectorContainer: {
        flexDirection: "row",
    },
    selectorButton: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        backgroundColor: "#fff",
        borderRadius: 20,
        marginRight: 10,
        borderWidth: 1,
        borderColor: "#ddd",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    selectedButton: {
        backgroundColor: "#007aff",
        borderColor: "#007aff",
    },
    prioritySelected: {
        backgroundColor: "#ff9500",
        borderColor: "#ff9500",
    },
    selectorText: {
        color: "#666",
        fontSize: 14,
        fontWeight: "500",
    },
    selectedText: {
        color: "#fff",
        fontWeight: "600",
    },
    submitButton: {
        padding: 16,
        borderRadius: 12,
        alignItems: "center",
        marginTop: 10,
        marginBottom: 20,
    },
    submitButtonActive: {
        backgroundColor: "#007aff",
        shadowColor: "#007aff",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    submitButtonDisabled: {
        backgroundColor: "#ccc",
        shadowOpacity: 0,
    },
    submitButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
    infoCard: {
        backgroundColor: "#e3f2fd",
        padding: 16,
        borderRadius: 12,
        borderLeftWidth: 4,
        borderLeftColor: "#007aff",
    },
    infoTitle: {
        fontSize: 14,
        fontWeight: "600",
        color: "#1565c0",
        marginBottom: 8,
    },
    infoText: {
        fontSize: 13,
        color: "#1976d2",
        lineHeight: 18,
    },
    bottomSpace: {
        height: 32,
    },
});