import React from "react";
import { useRouter } from "expo-router";
import { SignUpScreen } from "../../components/auth/AuthScreens"; // Note: SignupScreen, not SignUpScreen

export default function SignUp() { // Changed from Login to SignUp
    const router = useRouter();

    const navigation = {
        navigate: (screen: string) => {
            if (screen === "Login") { // Handle Login navigation
                router.push("/auth/LoginScreen");
            }
        },
        replace: (screen: string) => {
            if (screen === "MainTabs") {
                router.replace("/(tabs)");
            }
        }
    };

    return <SignUpScreen navigation={navigation} />; // SignupScreen component
}