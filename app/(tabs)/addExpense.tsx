import { useLocalSearchParams, useRouter } from "expo-router";
import { doc, getDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { ActionSheetIOS, Dimensions, Modal, Platform, Pressable, StyleSheet, TouchableOpacity, View } from "react-native";
import { Button, Text, TextInput } from "react-native-paper";
import { SafeAreaView } from 'react-native-safe-area-context';
import { db } from "../../config/firebase";
import { useAuth } from "../../context/AuthContext";
import { useAddExpense } from "../../hooks/useAddExpense";

export default function AddExpenseScreen() {
    const router = useRouter();
    const [mode, setMode] = useState<"self" | "group">("self");
    const [amount, setAmount] = useState("");
    const [currency, setCurrency] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("");
    const [androidCategoryModalVisible, setAndroidCategoryModalVisible] = useState(false);


    // Ensure amount input only allows numbers and up to 2 decimal places
    const handleAmountChange = (text: string) => {
        if (!text) {
            setAmount('');
            return;
        }

        // Remove any character that's not a digit or dot
        let cleaned = text.replace(/[^0-9.]/g, '');

        // Remove any extra dots (keep only the first)
        cleaned = cleaned.replace(/\.(?=.*\.)/g, '');

        // If there's a decimal part, limit to 2 digits
        if (cleaned.indexOf('.') >= 0) {
            const [intPart, fracPart] = cleaned.split('.');
            cleaned = intPart + '.' + (fracPart || '').slice(0, 2);
        }

        // If user types a leading dot, prefix with 0
        if (cleaned === '.') cleaned = '0.';

        setAmount(cleaned);
    };

    const categories = [
        'Food and Beverages',
        'Transport',
        'Groceries',
        'Utilities',
        'Entertainment',
        'Health',
        'Shopping',
        'Others'
    ];

    const { user } = useAuth();
    const { addExpense, loading, error } = useAddExpense();
    const [localError, setLocalError] = useState<string | null>(null);

    const handleSave = async () => {
        setLocalError(null);
        if (!description || description.trim().length === 0) {
            setLocalError('Please enter a description');
            return;
        }
        const amt = Number(amount);
        if (Number.isNaN(amt)) {
            setLocalError('Please enter a valid amount');
            return;
        }

        try {
            await addExpense({
                description: description.trim(),
                amount: amt,
                category: category || 'Others',
                currency,
                receiptImageUrl: null,
                groupId: null,
                splits: [],
            });

            // reset form
            setDescription('');
            setAmount('');
            setCategory('');

            router.back();
        } catch (e: any) {
            const msg = e?.message || error || 'Failed to save expense';
            setLocalError(msg);
        }
    };

    useEffect(() => {
        // Load user's default currency from Firestore when signed in
        if (!user) return;
        const load = async () => {
            try {
                const userDoc = await getDoc(doc(db, 'users', user.uid));
                if (userDoc.exists()) {
                    const data = userDoc.data() as any;
                    if (data?.defaultCurrency) {
                        setCurrency(String(data.defaultCurrency));
                    }
                }
            } catch (err) {
                console.warn('Failed to load user default currency', err);
            }
        };
        load();
    }, [user]);

    // Listen for optional currency selection returned via search params
    const params = useLocalSearchParams();
    useEffect(() => {
        // params is a generic object — check for currency
        const c = (params as any)?.currency;
        if (c) setCurrency(String(c));
    }, [params]);

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
                        placeholder="Amount*"
                        value={amount}
                        onChangeText={handleAmountChange}
                        keyboardType="numeric"
                        style={styles.amountInput}
                        activeOutlineColor="#4B9089"
                        outlineColor="#d1e9e5"
                    />
                    <TouchableOpacity style={styles.currencyButton} onPress={() => { router.push('/currency' as any); }}>
                        <Text style={styles.currencyText}>{currency}</Text>
                    </TouchableOpacity>
                </View>

                <TextInput
                    mode="outlined"
                    placeholder="Description*"
                    value={description}
                    onChangeText={setDescription}
                    style={styles.input}
                    activeOutlineColor="#4B9089"
                    outlineColor="#d1e9e5"
                    multiline
                    contentStyle={styles.textArea}
                />


                <TouchableOpacity style={styles.rowInput} onPress={() => {
                    if (Platform.OS === 'ios') {
                        ActionSheetIOS.showActionSheetWithOptions({
                            options: [...categories, 'Cancel'],
                            cancelButtonIndex: categories.length,
                        }, (buttonIndex) => {
                            if (buttonIndex != null && buttonIndex < categories.length) {
                                setCategory(categories[buttonIndex]);
                            }
                        });
                    } else {
                        setAndroidCategoryModalVisible(true);
                    }
                }}>
                    <TextInput
                        mode="outlined"
                        placeholder={category || "Category*"}
                        value={category}
                        editable={false}
                        onPress={() => {
                            if (Platform.OS === 'ios') {
                                ActionSheetIOS.showActionSheetWithOptions({
                                    options: [...categories, 'Cancel'],
                                    cancelButtonIndex: categories.length,
                                }, (buttonIndex) => {
                                    if (buttonIndex != null && buttonIndex < categories.length) {
                                        setCategory(categories[buttonIndex]);
                                    }
                                });
                            } else {
                                setAndroidCategoryModalVisible(true);
                            }
                        }} 
                        style={styles.fullWidth}
                        activeOutlineColor="#4B9089"
                        outlineColor="#d1e9e5"
                    />
                </TouchableOpacity>

                <Modal
                    visible={androidCategoryModalVisible}
                    animationType="slide"
                    transparent={true}
                    onRequestClose={() => setAndroidCategoryModalVisible(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            {categories.map((c) => (
                                <Pressable key={c} onPress={() => { setCategory(c); setAndroidCategoryModalVisible(false); }} style={styles.modalItem}>
                                    <Text>{c}</Text>
                                </Pressable>
                            ))}
                            <Pressable onPress={() => setAndroidCategoryModalVisible(false)} style={[styles.modalItem, styles.modalCancel]}>
                                <Text style={{ color: '#ff3b30' }}>Cancel</Text>
                            </Pressable>
                        </View>
                    </View>
                </Modal>

                    <TouchableOpacity style={styles.scanBox} onPress={() => {}}>
                        <Text style={[styles.scanText, { color: '#4B9089' }]}>Scan Receipt</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.saveContainer}>
                {localError ? <Text style={{ color: 'red', marginBottom: 8 }}>{localError}</Text> : null}
                <Button mode="contained" onPress={handleSave} loading={loading} disabled={loading} style={styles.saveButton} buttonColor="#4B9089" textColor="#fff">
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
    amountInput: { flex: 1, marginRight: 8, fontSize: 14 },
    currencyButton: {
        backgroundColor: "#e6f3f0",
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 8,
    },
    currencyText: { fontWeight: "600",  },
    input: { marginBottom: 12, fontSize: 14 },
    rowInput: { marginBottom: 12 },
    fullWidth: { width: "100%", fontSize: 14 },
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
    textArea: {
        fontSize: 14,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#fff',
        padding: 16,
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
    },
    modalItem: {
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        alignItems: 'center',
    },
    modalCancel: {
        marginTop: 8,
    },
});