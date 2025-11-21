import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, StyleSheet, View } from "react-native";
import { Button, Text, TextInput } from "react-native-paper";
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth, db } from "../config/firebase";

export default function AuthScreen() {

    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const getFriendlyError = (e: any) => {
        const code = e?.code || e?.message || String(e);
        switch (code) {
            case 'auth/user-not-found':
                return 'No account found for this email.';
            case 'auth/wrong-password':
                return 'Incorrect password. Please try again.';
            case 'auth/invalid-email':
                return 'The email address is not valid.';
            case 'auth/email-already-in-use':
                return 'This email is already in use. Try signing in.';
            case 'auth/weak-password':
                return 'Password is too weak. Use at least 6 characters.';
            case 'auth/invalid-credential':
                return 'Invalid credentials. Try again.';
            default:
                // fallback to the message or code
                return typeof e === 'string' ? e : (e?.message || code);
        }
    };

    const handleSwitchMode = () => {
        // Clear any existing error messages when switching modes
        setError(null);
        setIsSignUp((prev) => !prev)
    };

    console.log(auth?.currentUser?.email)

    const signUp = async () => {
        setError(null);
        // basic validation: ensure fields are filled (button should already be disabled in this case)
        if (!email || !password || !confirmPassword) {
            setError('Please fill in email, password and confirm password');
            return;
        }
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        setLoading(true);
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            // Create initial user document in Firestore with the same UID as Auth
            try {
                const uid = userCredential.user.uid;
                await setDoc(doc(db, "users", uid), {
                    username: "",
                    email: userCredential.user.email || email,
                    avatarUrl: null,
                    defaultCurrency: "MYR",
                    createdAt: serverTimestamp(),
                });
            } catch (docErr) {
                console.warn("Failed to create user document:", docErr);
            }
        } catch (e) {
            setError(getFriendlyError(e));
        } finally {
            setLoading(false)
        }
    };

    const signIn = async () => {
        setError(null);
        // Prompt user to fill fields if empty, but don't disable the button
        if (!email || !password) {
            setError('Please enter both email and password');
            return;
        }
        setLoading(true);
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
        } catch (e) {
            setError(getFriendlyError(e));
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior="padding"
            style={{ flex: 1 }}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        >
            <SafeAreaView style={styles.container}>
                <View style={styles.content}>
                    <Text style={styles.title} variant="headlineMedium">
                        {isSignUp ? "Create Account" : "Welcome!"}
                    </Text>

                    <TextInput
                        label="Email"
                        autoCapitalize="none"
                        placeholder="example@gmail.com"
                        value={email}
                        onChangeText={(text) => setEmail(text)}
                        mode="outlined"
                        activeOutlineColor="#4B9089"
                        outlineColor="#d1e9e5"
                    />

                    <TextInput
                        label="Password"
                        autoCapitalize="none"
                        secureTextEntry={!showPassword}
                        value={password}
                        onChangeText={(text) => setPassword(text)}
                        mode="outlined"
                        activeOutlineColor="#4B9089"
                        outlineColor="#d1e9e5"
                        right={
                            <TextInput.Icon
                                icon={showPassword ? 'eye' : 'eye-off'}
                                onPress={() => setShowPassword(prev => !prev)}
                            />
                        }
                    />

                    {isSignUp && (
                        <TextInput
                            label="Confirm Password"
                            autoCapitalize="none"
                            secureTextEntry={!showConfirmPassword}
                            value={confirmPassword}
                            onChangeText={(text) => setConfirmPassword(text)}
                            mode="outlined"
                            activeOutlineColor="#4B9089"
                            outlineColor="#d1e9e5"
                            right={
                                <TextInput.Icon
                                    icon={showConfirmPassword ? 'eye' : 'eye-off'}
                                    onPress={() => setShowConfirmPassword(prev => !prev)}
                                />
                            }
                        />
                    )}

                    {isSignUp && confirmPassword.length > 0 && password !== confirmPassword && (
                        <Text style={{ color: 'red', marginTop: 8 }}>Passwords do not match</Text>
                    )}

                    {error && (
                        <Text style={{ color: 'red', marginTop: 12 }}>{error}</Text>
                    )}

                    <Button
                        mode="contained"
                        style={styles.button}
                        onPress={isSignUp ? signUp : signIn}
                        disabled={loading || (isSignUp && (!email || !password || !confirmPassword))}
                        buttonColor="#4B9089"
                        textColor="#fff"
                    >
                        {isSignUp ? "Sign Up" : "Sign In"}
                    </Button>

                    <Button
                        mode="text"
                        onPress={handleSwitchMode} disabled={loading}
                        textColor="#4B9089"
                    >
                        {isSignUp ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
                    </Button>
                </View>
            </SafeAreaView>
        </KeyboardAvoidingView>
    )


}

const styles = StyleSheet.create({
    container: {
        flex : 1,
        backgroundColor: '#f5f5f5',
        justifyContent: 'center',
        marginHorizontal: 16,
    },

    content: {
        flex: 1,
        justifyContent: 'center',
    },

    title: {
        textAlign: "center",
        fontWeight: "bold",
        marginBottom: 24,
        fontSize: 32,
        color: "#3e7771ff",
    },

    button: {
        marginTop: 16,
    }
        
})