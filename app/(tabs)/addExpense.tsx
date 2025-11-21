import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Dimensions, StyleSheet, TouchableOpacity, View } from "react-native";
import { Button, Text, TextInput } from "react-native-paper";
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AddExpenseScreen() {
    const router = useRouter();
    const [mode, setMode] = useState<"self" | "group">("self");
    const [amount, setAmount] = useState("");
    const [currency, setCurrency] = useState("MYR");
    const [description, setDescription] = useState("");
    // no local date state — we'll use serverTimestamp() when saving
    const [category, setCategory] = useState("");

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.topSemiWrap} pointerEvents="none">
                <View style={styles.topSemiCircle} />
            </View>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Add Expense</Text>
            </View>

            <View style={styles.card}>
                <View style={styles.segmentContainer}>
                <TouchableOpacity
                    style={[styles.segment, mode === "self" && styles.segmentActive]}
                    onPress={() => setMode("self")}
                >
                    <Text style={mode === "self" ? styles.segmentTextActive : styles.segmentText}>Self</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.segment, mode === "group" && styles.segmentActive]}
                    onPress={() => setMode("group")}
                >
                    <Text style={mode === "group" ? styles.segmentTextActive : styles.segmentText}>Group</Text>
                </TouchableOpacity>
                </View>

                <View style={styles.form}>
                <View style={styles.amountRow}>
                    <TextInput
                        mode="outlined"
                        placeholder="0"
                        value={amount}
                        onChangeText={setAmount}
                        keyboardType="numeric"
                        style={styles.amountInput}
                        activeOutlineColor="#4B9089"
                        outlineColor="#d1e9e5"
                    />
                    <TouchableOpacity style={styles.currencyButton} onPress={() => {}}>
                        <Text style={styles.currencyText}>{currency}</Text>
                    </TouchableOpacity>
                </View>

                <TextInput
                    mode="outlined"
                    placeholder="Enter Description Here*"
                    value={description}
                    onChangeText={setDescription}
                    style={styles.input}
                    activeOutlineColor="#4B9089"
                    outlineColor="#d1e9e5"
                />


                <TouchableOpacity style={styles.rowInput} onPress={() => {}}>
                    <TextInput
                        mode="outlined"
                        placeholder={category || "Category"}
                        value={category}
                        editable={false}
                        right={<TextInput.Icon icon="menu-down" onPress={() => {}} />}
                        style={styles.fullWidth}
                        activeOutlineColor="#4B9089"
                        outlineColor="#d1e9e5"
                    />
                </TouchableOpacity>

                    <TouchableOpacity style={styles.scanBox} onPress={() => {}}>
                        <Text style={[styles.scanText, { color: '#4B9089' }]}>Scan Receipt</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.saveContainer}>
                <Button mode="contained" onPress={() => {}} style={styles.saveButton} buttonColor="#4B9089" textColor="#fff">
                    Save
                </Button>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#fff" },
    header: {
        height: 64,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 8,
        borderBottomWidth: 0,
        marginTop: 40,
    },
    headerTitle: { 
        fontSize: 30, 
        fontWeight: "bold",
        color: "#fff", 
    },

    segmentContainer: {
        flexDirection: "row",
        alignSelf: "center",
        marginTop: 12,
        backgroundColor: "#f0f0f0",
        borderRadius: 24,
        padding: 4,
    },
    segment: {
        paddingVertical: 8,
        paddingHorizontal: 24,
        borderRadius: 20,
    },
    segmentActive: { backgroundColor: "#fff", elevation: 2 },
    segmentText: { color: "#444" },
    segmentTextActive: { color: "#000", fontWeight: "600" },
    form: { padding: 16, marginTop: 8 },
    amountRow: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
    amountInput: { flex: 1, marginRight: 8 },
    currencyButton: {
        backgroundColor: "#e6f3f0",
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 8,
    },
    currencyText: { fontWeight: "600" },
    input: { marginBottom: 12 },
    rowInput: { marginBottom: 12 },
    fullWidth: { width: "100%" },
    scanBox: {
        borderWidth: 1,
        borderStyle: "dashed",
        borderColor: "#ccc",
        padding: 16,
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 8,
    },
    scanText: { color: "#666" },
    saveContainer: { alignItems: 'center', marginTop: 16 },
    saveButton: { 
        marginHorizontal: 20,
        width: '80%',
        backgroundColor: '#4B9089',
     },
    card: {
        width: '85%',
        margin: 25,
        padding: 12,
        borderRadius: 25,
        backgroundColor: '#fff',
        // iOS shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        // Android shadow
        elevation: 4,
    },

    topSemiWrap: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        height: 160,
        alignItems: 'center',
        overflow: 'visible',
        zIndex: -1,
    },

    topSemiCircle: {
        position: 'absolute',
        bottom: -110,
        width: Dimensions.get('window').width * 1.6,
        height: Dimensions.get('window').width * 1.6,
        borderRadius: (Dimensions.get('window').width * 1.0) / 2,
        backgroundColor: '#4B9089',
        transform: [{ translateY: 0 }],
    },
});