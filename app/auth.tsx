import { KeyboardAvoidingView, Platform, StyleSheet, View } from "react-native";
import { Auth } from "../components/auth";

export default function AuthScreen() {
    return (
    <KeyboardAvoidingView 
    behavior={Platform.OS === "ios" ? "padding": "height"}
    style={styles.container}>
        <View>
            <Auth></Auth>
        </View>
    </KeyboardAvoidingView>)


}

const styles = StyleSheet.create({
    container: {
        flex : 1,
        backgroundColor: '#f5f5f5',
        justifyContent: 'center',
    },
        
})