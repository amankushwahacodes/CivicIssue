import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
} from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import API from "../../services/api";



// Login Screen Component
export function LoginScreen({ navigation }: { navigation: any }) {
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.email.trim()) {
            newErrors.email = "Email is required";
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = "Please enter a valid email";
        }

        if (!formData.password) {
            newErrors.password = "Password is required";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleLogin = async () => {
        if (!validateForm()) return;

        setIsLoading(true);
        try {
            const response = await API.post("/auth/login", {
                email: formData.email.toLowerCase().trim(),
                password: formData.password,
            });

            const { token, user } = response.data;

            // Store auth data and wait for completion
            await AsyncStorage.setItem("authToken", token);
            await AsyncStorage.setItem("userData", JSON.stringify(user));

            // Set API default headers (this is redundant with interceptor but doesn't hurt)
            API.defaults.headers.common['Authorization'] = `Bearer ${token}`;

            console.log('Login successful, token stored:', token.substring(0, 20) + '...');

            Alert.alert("Success! 🎉", "Welcome back!", [
                {
                    text: "Continue",
                    onPress: () => {
                        navigation.replace("MainTabs");
                    }
                }
            ]);

        } catch (error: any) {
            console.error("Login error:", error);
            const errorMessage = error.response?.data?.message || "Login failed. Please try again.";
            Alert.alert("Login Failed", errorMessage);
        } finally {
            setIsLoading(false);
        }
    };
    const updateFormData = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: "" }));
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                style={styles.keyboardContainer}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
            >
                <ScrollView
                    style={styles.scrollContainer}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={styles.headerSection}>
                        <Text style={styles.title}>Welcome Back</Text>
                        <Text style={styles.subtitle}>Sign in to continue reporting issues</Text>
                    </View>

                    <View style={styles.formSection}>
                        {/* Email Field */}
                        <View style={styles.formGroup}>
                            <Text style={styles.label}>
                                Email <Text style={styles.required}>*</Text>
                            </Text>
                            <TextInput
                                style={[styles.input, errors.email && styles.inputError]}
                                placeholder="Enter your email address"
                                value={formData.email}
                                onChangeText={(value) => updateFormData("email", value)}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoComplete="email"
                                placeholderTextColor="#999"
                            />
                            {errors.email && <Text style={styles.errorText}>⚠️ {errors.email}</Text>}
                        </View>

                        {/* Password Field */}
                        <View style={styles.formGroup}>
                            <Text style={styles.label}>
                                Password <Text style={styles.required}>*</Text>
                            </Text>
                            <View style={styles.passwordContainer}>
                                <TextInput
                                    style={[styles.passwordInput, errors.password && styles.inputError]}
                                    placeholder="Enter your password"
                                    value={formData.password}
                                    onChangeText={(value) => updateFormData("password", value)}
                                    secureTextEntry={!showPassword}
                                    autoCapitalize="none"
                                    placeholderTextColor="#999"
                                />
                                <TouchableOpacity
                                    style={styles.eyeButton}
                                    onPress={() => setShowPassword(!showPassword)}
                                >
                                    <Text style={styles.eyeIcon}>{showPassword ? "🙈" : "👁️"}</Text>
                                </TouchableOpacity>
                            </View>
                            {errors.password && <Text style={styles.errorText}>⚠️ {errors.password}</Text>}
                        </View>

                        {/* Login Button */}
                        <TouchableOpacity
                            style={[
                                styles.submitButton,
                                isLoading ? styles.submitButtonDisabled : styles.submitButtonActive
                            ]}
                            onPress={handleLogin}
                            disabled={isLoading}
                        >
                            <Text style={styles.submitButtonText}>
                                {isLoading ? "Signing In..." : "Sign In"}
                            </Text>
                        </TouchableOpacity>

                        {/* Sign Up Link */}
                        <View style={styles.linkSection}>
                            <Text style={styles.linkText}>Don&apos;t have an account? </Text>
                            <TouchableOpacity onPress={() => navigation.navigate("Signup")}>
                                <Text style={styles.linkButton}>Sign Up</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

// Signup Screen Component
export function SignUpScreen({ navigation }: { navigation: any }) {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        phone: "",
        ward: "",
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) {
            newErrors.name = "Name is required";
        } else if (formData.name.trim().length < 2) {
            newErrors.name = "Name must be at least 2 characters";
        }

        if (!formData.email.trim()) {
            newErrors.email = "Email is required";
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = "Please enter a valid email";
        }

        if (!formData.password) {
            newErrors.password = "Password is required";
        } else if (formData.password.length < 6) {
            newErrors.password = "Password must be at least 6 characters";
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = "Please confirm your password";
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match";
        }

        if (formData.phone && !/^\d{10,15}$/.test(formData.phone.replace(/\s/g, ""))) {
            newErrors.phone = "Please enter a valid phone number";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSignup = async () => {
        if (!validateForm()) return;

        setIsLoading(true);
        try {
            const signupData = {
                name: formData.name.trim(),
                email: formData.email.toLowerCase().trim(),
                password: formData.password,
                ...(formData.phone && { phone: formData.phone.trim() }),
                ...(formData.ward && { ward: formData.ward.trim() }),
                role: "user", // Default role
            };

            const response = await API.post("/auth/signup", signupData);

            Alert.alert(
                "Account Created! 🎉",
                "Your account has been created successfully. Please sign in to continue.",
                [
                    {
                        text: "Sign In",
                        onPress: () => navigation.navigate("Login")
                    }
                ]
            );

        } catch (error: any) {
            console.error("Signup error:", error);
            const errorMessage = error.response?.data?.message || "Signup failed. Please try again.";
            Alert.alert("Signup Failed", errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const updateFormData = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: "" }));
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                style={styles.keyboardContainer}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
            >
                <ScrollView
                    style={styles.scrollContainer}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={styles.headerSection}>
                        <Text style={styles.title}>Create Account</Text>
                        <Text style={styles.subtitle}>Join us to report and track community issues</Text>
                    </View>

                    <View style={styles.formSection}>
                        {/* Name Field */}
                        <View style={styles.formGroup}>
                            <Text style={styles.label}>
                                Full Name <Text style={styles.required}>*</Text>
                            </Text>
                            <TextInput
                                style={[styles.input, errors.name && styles.inputError]}
                                placeholder="Enter your full name"
                                value={formData.name}
                                onChangeText={(value) => updateFormData("name", value)}
                                autoCapitalize="words"
                                placeholderTextColor="#999"
                            />
                            {errors.name && <Text style={styles.errorText}>⚠️ {errors.name}</Text>}
                        </View>

                        {/* Email Field */}
                        <View style={styles.formGroup}>
                            <Text style={styles.label}>
                                Email <Text style={styles.required}>*</Text>
                            </Text>
                            <TextInput
                                style={[styles.input, errors.email && styles.inputError]}
                                placeholder="Enter your email address"
                                value={formData.email}
                                onChangeText={(value) => updateFormData("email", value)}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoComplete="email"
                                placeholderTextColor="#999"
                            />
                            {errors.email && <Text style={styles.errorText}>⚠️ {errors.email}</Text>}
                        </View>

                        {/* Phone Field */}
                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Phone (Optional)</Text>
                            <TextInput
                                style={[styles.input, errors.phone && styles.inputError]}
                                placeholder="Enter your phone number"
                                value={formData.phone}
                                onChangeText={(value) => updateFormData("phone", value)}
                                keyboardType="phone-pad"
                                placeholderTextColor="#999"
                            />
                            {errors.phone && <Text style={styles.errorText}>⚠️ {errors.phone}</Text>}
                        </View>

                        {/* Ward Field */}
                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Ward (Optional)</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter your ward (if known)"
                                value={formData.ward}
                                onChangeText={(value) => updateFormData("ward", value)}
                                autoCapitalize="words"
                                placeholderTextColor="#999"
                            />
                        </View>

                        {/* Password Field */}
                        <View style={styles.formGroup}>
                            <Text style={styles.label}>
                                Password <Text style={styles.required}>*</Text>
                            </Text>
                            <View style={styles.passwordContainer}>
                                <TextInput
                                    style={[styles.passwordInput, errors.password && styles.inputError]}
                                    placeholder="Create a password (min. 6 characters)"
                                    value={formData.password}
                                    onChangeText={(value) => updateFormData("password", value)}
                                    secureTextEntry={!showPassword}
                                    autoCapitalize="none"
                                    placeholderTextColor="#999"
                                />
                                <TouchableOpacity
                                    style={styles.eyeButton}
                                    onPress={() => setShowPassword(!showPassword)}
                                >
                                    <Text style={styles.eyeIcon}>{showPassword ? "🙈" : "👁️"}</Text>
                                </TouchableOpacity>
                            </View>
                            {errors.password && <Text style={styles.errorText}>⚠️ {errors.password}</Text>}
                        </View>

                        {/* Confirm Password Field */}
                        <View style={styles.formGroup}>
                            <Text style={styles.label}>
                                Confirm Password <Text style={styles.required}>*</Text>
                            </Text>
                            <View style={styles.passwordContainer}>
                                <TextInput
                                    style={[styles.passwordInput, errors.confirmPassword && styles.inputError]}
                                    placeholder="Confirm your password"
                                    value={formData.confirmPassword}
                                    onChangeText={(value) => updateFormData("confirmPassword", value)}
                                    secureTextEntry={!showConfirmPassword}
                                    autoCapitalize="none"
                                    placeholderTextColor="#999"
                                />
                                <TouchableOpacity
                                    style={styles.eyeButton}
                                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    <Text style={styles.eyeIcon}>{showConfirmPassword ? "🙈" : "👁️"}</Text>
                                </TouchableOpacity>
                            </View>
                            {errors.confirmPassword && <Text style={styles.errorText}>⚠️ {errors.confirmPassword}</Text>}
                        </View>

                        {/* Sign Up Button */}
                        <TouchableOpacity
                            style={[
                                styles.submitButton,
                                isLoading ? styles.submitButtonDisabled : styles.submitButtonActive
                            ]}
                            onPress={handleSignup}
                            disabled={isLoading}
                        >
                            <Text style={styles.submitButtonText}>
                                {isLoading ? "Creating Account..." : "Create Account"}
                            </Text>
                        </TouchableOpacity>

                        {/* Sign In Link */}
                        <View style={styles.linkSection}>
                            <Text style={styles.linkText}>Already have an account? </Text>
                            <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                                <Text style={styles.linkButton}>Sign In</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.bottomSpace} />
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

// Logout utility function
export const handleLogout = async (navigation: any) => {
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
                        // Clear stored data
                        await AsyncStorage.removeItem("authToken");
                        await AsyncStorage.removeItem("userData");

                        // Clear API headers
                        delete API.defaults.headers.common['Authorization'];

                        // Navigate to auth screens
                        navigation.replace("Login");
                    } catch (error) {
                        console.error("Logout error:", error);
                        Alert.alert("Error", "Failed to sign out. Please try again.");
                    }
                }
            }
        ]
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f5f5f5",
    },
    keyboardContainer: {
        flex: 1,
    },
    scrollContainer: {
        flex: 1,
        padding: 16,
    },
    headerSection: {
        alignItems: "center",
        marginTop: 40,
        marginBottom: 40,
    },
    title: {
        fontSize: 32,
        fontWeight: "bold",
        color: "#333",
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: "#666",
        textAlign: "center",
        lineHeight: 22,
        paddingHorizontal: 20,
    },
    formSection: {
        flex: 1,
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
    passwordContainer: {
        position: "relative",
    },
    passwordInput: {
        borderWidth: 1,
        borderColor: "#ddd",
        padding: 14,
        paddingRight: 50,
        borderRadius: 12,
        fontSize: 16,
        backgroundColor: "#fff",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    eyeButton: {
        position: "absolute",
        right: 15,
        top: 15,
        padding: 5,
    },
    eyeIcon: {
        fontSize: 18,
    },
    errorText: {
        color: "#ff3b30",
        fontSize: 12,
        marginTop: 6,
        fontWeight: "500",
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
    linkSection: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        marginTop: 20,
    },
    linkText: {
        fontSize: 14,
        color: "#666",
    },
    linkButton: {
        fontSize: 14,
        color: "#007aff",
        fontWeight: "600",
    },
    bottomSpace: {
        height: 32,
    },
});