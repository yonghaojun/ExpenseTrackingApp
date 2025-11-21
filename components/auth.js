import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, signOut } from "firebase/auth";
import { useState } from "react";
import { Image, StyleSheet, TouchableOpacity, View } from "react-native";
import { Button, Text, TextInput } from "react-native-paper";
import { auth, googleProvider } from "../config/firebase";

export const Auth = () => {

    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [error, setError] = useState(null);

    const getFriendlyError = (e) => {
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
            const userCredential = await createUserWithEmailAndPassword( auth, email, password );
        } catch (e){
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

    const signInWithGoogle = async () => {
        setError(null);
        setGoogleLoading(true);
        try {
            const userCredential = await signInWithPopup(auth, googleProvider);
        } catch (e) {
            const code = e?.code || '';
            const message = (e?.message || '').toString().toLowerCase();
            // Ignore user-cancelled popup errors
            if (
                code === 'auth/popup-closed-by-user' ||
                code === 'auth/cancelled-popup-request' ||
                message.includes('popup') && message.includes('closed')
            ) {
                // do not show an error for cancelled popup
            } else {
                setError(getFriendlyError(e));
            }
        } finally {
            setGoogleLoading(false);
        }
    };

    const logout = async () => {
        setError(null);
        setLoading(true);
        try {
            await signOut(auth);
        } catch (e){
            setError(e.code || e.message)
        } finally {
            setLoading(false)
        }
        
    };

    return (
        <View style={styles.content}>

            <Text style={styles.title} variant="headlineMedium">
                {isSignUp ? "Create Account": "Welcome!"}</Text>

                        <TextInput
                                label="Email"
                                autoCapitalize="none"
                                keyboardType="email-address"
                                placeholder="example@gmail.com"
                                value={email}
                                onChangeText={(text) => setEmail(text)}
                                mode="outlined"
                                style={styles.input}
                        />

                         <TextInput
                                label="Password"
                                autoCapitalize="none"
                                secureTextEntry={!showPassword}
                                value={password}
                                onChangeText={(text) => setPassword(text)}
                                mode="outlined"
                                style={styles.input}
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
                                        style={styles.input}
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
                                    disabled={loading || (isSignUp && (!email || !password || !confirmPassword))}>
                            {isSignUp ? "Sign Up" : "Sign In"}
                        </Button>

                        <Button 
                        mode="text" 
                        onPress={handleSwitchMode} disabled={loading}>
                            {isSignUp ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
                        </Button>

                        <TouchableOpacity
                            style={[styles.googleButton, loading && styles.disabledButton]}
                            onPress={() => { if (!loading) signInWithGoogle(); }}
                            activeOpacity={0.8}
                            disabled={loading}
                        >
                            <Image
                                source={{ uri: 'https://developers.google.com/identity/images/g-logo.png' }}
                                style={styles.googleLogo}
                                resizeMode="contain"
                            />
                            <Text style={styles.googleButtonText}>Continue with Google</Text>
                        </TouchableOpacity>

                        <Button mode="text" onPress={logout} disabled={loading}>
                            Log Out
                        </Button>
        </View>
    )

}
const styles = StyleSheet.create({
        
    content: {
        flex : 1,
        padding: 16,
        justifyContent: 'center',},

     title: {
        textAlign: "center",
        marginBottom: 24,
        fontWeight: "bold"
    },

    input: {
        marginBottom: 16,},

    button: {
        marginTop: 8,},

    googleButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 28,
        borderWidth: 1,
        borderColor: '#d1d1d1',
        backgroundColor: '#fff',
        marginTop: 8,
        alignSelf: 'stretch',
        width: '100%',
    },

    googleLogo: {
        width: 22,
        height: 22,
        marginRight: 12,
        marginLeft: 4,
        alignSelf: "flex-start",
        alignItems: "flex-start"
    },

    googleButtonText: {
        color: '#202124',
        fontSize: 16,
        fontWeight: '500',
        alignSelf: "center"
    },

    disabledButton: {
        opacity: 0.6,
    },

})