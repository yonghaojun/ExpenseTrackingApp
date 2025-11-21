import { signOut } from "firebase/auth";
import { useState } from "react";
import { View } from "react-native";
import { Button, Text } from "react-native-paper";
import { auth } from "../../config/firebase";

export default function ProfileScreen() {

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const logout = async () => {
        setError(null);
        setLoading(true);
        try {
            await signOut(auth);
        } catch (err) {
          console.error(err)
        }
        
    };

    return (
        <View
        style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",}}
        >
            <Text>Profile Screen</Text>
            <Button onPress={logout}> Log Out </Button>
        </View>
    )
}