// In app/auth/login.tsx
import React from "react";
import { useRouter } from "expo-router";
import { LoginScreen } from "../../components/auth/AuthScreens";

export default function Login() {
    const router = useRouter();

    // Create a navigation object that matches what LoginScreen expects
    const navigation = {
        navigate: (screen: string) => {
            if (screen === "Signup") router.push("/auth/SignUpScreen");
        },
        replace: (screen: string) => {
            if (screen === "MainTabs") router.replace("/(tabs)");
        }
    };

    return <LoginScreen navigation={navigation} />;
}