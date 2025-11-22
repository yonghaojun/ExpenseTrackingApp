import { useRouter } from "expo-router";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Button, Text, TextInput } from "react-native-paper";
import { db } from "../config/firebase";
import { useAuth } from "../context/AuthContext";

export default function CompleteProfileScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If there's no user, send back to auth
    if (!user) {
      router.replace('/auth');
      return;
    }

    // Pre-fill username if document exists
    const load = async () => {
      try {
        const userDocRef = doc(db, 'users', user.uid);
        const snap = await getDoc(userDocRef);
        if (snap.exists()) {
          const data = snap.data() as any;
          if (data?.username) setUsername(String(data.username));
        }
      } catch (err) {
        console.warn('Failed to load user doc', err);
      }
    };

    load();
  }, [user]);

  const save = async () => {
    setError(null);
    if (!user) return;
    if (!username || username.trim().length === 0) {
      setError('Please enter a username');
      return;
    }

    setLoading(true);
    try {
      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, {
        username: username.trim(),
        email: user.email || null,
        avatarUrl: null,
        defaultCurrency: 'MYR',
        createdAt: serverTimestamp(),
      }, { merge: true });

      // Navigate to home
      router.replace('/');
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Failed to save username');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>One more step</Text>

      <Text style={styles.helper}>Please choose a display name for your account.</Text>

      <TextInput
        label="Username"
        value={username}
        onChangeText={setUsername}
        mode="outlined"
        activeOutlineColor="#4B9089"
        outlineColor="#d1e9e5"
        style={styles.input}
      />

      {error && <Text style={{ color: 'red', marginBottom: 8 }}>{error}</Text>}

      <Button mode="contained" onPress={save} loading={loading} buttonColor="#4B9089" textColor="#fff">
        Save
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  title: { textAlign: 'center', marginBottom: 12, fontSize: 35, color: "#4B9089" },
  helper: { textAlign: 'center', color: '#666', marginBottom: 20 },
  input: { marginBottom: 16 },
});
