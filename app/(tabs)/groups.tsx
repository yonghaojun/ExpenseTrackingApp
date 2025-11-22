import { useRouter } from 'expo-router';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { Dimensions, FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Button, Surface, Text } from 'react-native-paper';
import { db } from '../../config/firebase';
import { useAuth } from '../../context/AuthContext';

export default function GroupsScreen() {
    const router = useRouter();
    const { user } = useAuth();
    const [groups, setGroups] = useState<any[]>([]);

    useEffect(() => {
        if (!user) {
            setGroups([]);
            return;
        }

        const q = query(collection(db, 'groups'), where('memberIds', 'array-contains', user.uid));
        const unsub = onSnapshot(q, (snap) => {
            const arr = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
            setGroups(arr);
        }, (err) => {
            console.warn('Failed to listen groups:', err);
            setGroups([]);
        });

        return () => unsub();
    }, [user]);

    // compute net balance
    const net = groups.reduce((acc, g) => acc + (g.balance || 0), 0);
    const owed = groups.filter(g => (g.balance || 0) > 0).reduce((a, g) => a + (g.balance || 0), 0);
    const owe = Math.abs(groups.filter(g => (g.balance || 0) < 0).reduce((a, g) => a + (g.balance || 0), 0));

    const renderGroup = ({ item }: { item: any }) => (
        <TouchableOpacity onPress={() => router.push(`/group/${item.id}` as any)}>
            <Surface style={styles.groupCard} key={item.id}>
                <View style={styles.groupRow}>
                    <View style={{ flex: 1 }}>
                        <Text variant="titleMedium" style={styles.groupName}>{item.name}</Text>
                        <Text variant="bodySmall" style={{ color: '#777' }}>{item.settled ? 'Settled' : 'Active'}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                        <Text style={[styles.balanceText, { color: (item.balance || 0) >= 0 ? '#2E7D32' : '#F95B51' }]}>
                            {(item.balance || 0) >= 0 ? `You are owed\n${item.currency || ''} ${Math.abs(item.balance || 0)}` : `You owe\n${item.currency || ''} ${Math.abs(item.balance || 0)}`}
                        </Text>
                    </View>
                </View>
            </Surface>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>

            <View style={styles.topSemiWrap} pointerEvents="none">
                <View style={styles.topSemiCircle} />
            </View>

            <Surface style={styles.headerCard} elevation={0}>
                <Text variant="titleLarge" style={styles.headerTitle}>Group Expense</Text>

                <View style={styles.netRow}>
                    <View style={styles.netColumnLeft}>
                        <Text style={styles.netLabel}>Overall, you are owed</Text>
                        <Text style={styles.netAmountPositive}>{`25 €`}</Text>

                        <Text style={styles.netLabel}>You still owe</Text>
                        <Text style={styles.netAmountNegative}>{`RM 50`}</Text>
                    </View>

                    <View style={styles.netColumnRightBlock} />
                </View>
                <Text style={styles.settleHintAbs}>Better Settle Up Quick!</Text>
            </Surface>

            <View style={styles.createButtonContainer}>
                <Button 
                mode='contained'
                style={styles.createButton}
                onPress={() => router.push('../../createGroup')}
                >+ Create Group</Button>
            </View>

            <Surface style={styles.listSurface} elevation={0}>
                <FlatList
                    data={groups}
                    keyExtractor={(i) => i.id}
                    renderItem={renderGroup}
                    contentContainerStyle={{ padding: 12 }}
                    ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
                />
            </Surface>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'flex-start',
    },

    topSemiWrap: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        height: 160,
        alignItems: 'center',
        overflow: 'visible',
        zIndex: 0,
    },

    topSemiCircle: {
        position: 'absolute',
        bottom: -30,
        width: Dimensions.get('window').width * 1.6,
        height: Dimensions.get('window').width * 1.6,
        borderRadius: (Dimensions.get('window').width * 0.8) / 2,
        backgroundColor: '#4B9089',
        transform: [{ translateY: 0 }],
    },

    headerCard: {
        margin: 16,
        padding: 20,
        paddingTop: 28,
        borderRadius: 14,
        backgroundColor: '#ECF3F3',
        zIndex: 1,
        position: 'relative',
        marginTop: 80,
        width: "90%",

    },
    
    headerTitle: { 
        fontWeight: 'bold', 
        marginBottom: 8, 
        color: '#216f60', 
        textAlign: 'center', 
        fontSize: 30
    },

    netRow: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        marginTop: 6, 
        alignItems: 'center' 
    },

    netColumnLeft: { 
        flex: 1 
    },

    netColumnRightBlock: { 
        flex: 1, 
        alignItems: 'flex-end' 
    },

    netLabel: { 
        color: '#0A664E', 
        fontSize: 12, 
        marginTop: 6 
    },

    netAmountPositive: { 
        color: '#2E7D32', 
        fontSize: 30, 
        fontWeight: '800' 
    },

    netAmountNegative: { 
        color: '#F95B51', 
        fontSize: 30, 
        fontWeight: '800' 
    },
    
    settleHint: { 
        color: '#0A664E', 
        fontSize: 12, 
        marginTop: 6 
    },

    settleHintAbs: { 
        position: 'absolute', 
        right: 16, 
        bottom: 12, 
        color: '#0A664E', 
        fontSize: 12 
    },

    createButtonContainer: { 
        flexDirection: 'row', 
        alignSelf: 'center', 
        width: '90%', 
        justifyContent: 'flex-end' 
    },

    createButton: { 
        backgroundColor: '#4B9089',  
    },

    headerActions: { marginTop: 12, flexDirection: 'row', justifyContent: 'center' },

    groupCard: { padding: 12, borderRadius: 12, elevation: 0, backgroundColor: '#fff',},

    groupRow: { flexDirection: 'row', alignItems: 'center' },
    groupName: { fontWeight: '600' },
    balanceText: { textAlign: 'right', fontWeight: '600' },
    listSurface: { width: '100%', borderRadius: 12, backgroundColor: '#fff', paddingVertical: 8, marginTop: 8 },
});