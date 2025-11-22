import { useLocalSearchParams, useRouter } from 'expo-router';
import { collection, doc, onSnapshot, orderBy, query, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { Avatar, Button, Surface, Text } from 'react-native-paper';
import { db } from '../../../config/firebase';

export default function GroupDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [group, setGroup] = useState<any | null>(null);
  const [expenses, setExpenses] = useState<any[]>([]);

  useEffect(() => {
    if (!id) return;
    const docRef = doc(db, 'groups', String(id));
    const unsub = onSnapshot(docRef, (snap: any) => {
      if (!snap.exists()) {
        setGroup(null);
        return;
      }
      setGroup({ id: snap.id, ...(snap.data() as any) });
    }, (err) => {
      console.warn('Failed to load group:', err);
    });

    return () => unsub();
  }, [id]);

  useEffect(() => {
    if (!id) return;
    const q = query(collection(db, 'expenses'), where('groupId', '==', String(id)), orderBy('createdAt', 'desc')) as any;
    const unsub = onSnapshot(q, (snap: any) => {
      const arr = snap.docs.map((d: { id: any; data: () => any; }) => ({ id: d.id, ...(d.data() as any) }));
      setExpenses(arr);
    }, (err) => {
      console.warn('Failed to load expenses for group:', err);
    });

    return () => unsub();
  }, [id]);

  if (!group) {
    return (
      <View style={styles.container}>
        <Text>Loading group…</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Surface style={styles.header}>
        <View style={styles.headerRow}>
          <Avatar.Text size={48} label={group.name?.slice(0,2).toUpperCase() || 'G'} />
          <View style={{ marginLeft: 12, flex: 1 }}>
            <Text variant="titleLarge">{group.name}</Text>
            <Text variant="bodySmall" style={{ color: '#666' }}>{group.memberIds?.length || 0} members</Text>
          </View>
          <Button mode="outlined" onPress={() => router.push(`/group/${id}/add-member` as any)}>Add Member</Button>
        </View>
      </Surface>

      <View style={{ padding: 12, width: '100%' }}>
        <Button mode="contained" buttonColor="#4B9089" onPress={() => { /* settle up placeholder */ }}>Settle Up</Button>
      </View>

      <Surface style={styles.listSurface}>
        <Text variant="titleMedium" style={{ margin: 12 }}>Activity</Text>
        {expenses.length === 0 ? (
          <View style={{ padding: 12 }}>
            <Text>No expenses yet.</Text>
          </View>
        ) : (
          <FlatList
            data={expenses}
            keyExtractor={(i) => i.id}
            renderItem={({ item }) => (
              <View style={styles.expenseRow}>
                <View>
                  <Text>{item.description || 'Expense'}</Text>
                  <Text variant="bodySmall" style={{ color: '#666' }}>{item.creatorUserId}</Text>
                </View>
                <Text style={{ fontWeight: '700' }}>{item.currency || ''} {item.amount}</Text>
              </View>
            )}
          />
        )}
      </Surface>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', alignItems: 'center' },
  header: { width: '90%', marginTop: 100, padding: 12, borderRadius: 12 },
  headerRow: { flexDirection: 'row', alignItems: 'center' },
  listSurface: { width: '100%', marginTop: 12, paddingBottom: 24, backgroundColor: '#fff' },
  expenseRow: { flexDirection: 'row', justifyContent: 'space-between', padding: 12, borderBottomWidth: 1, borderBottomColor: '#eee' }
});
