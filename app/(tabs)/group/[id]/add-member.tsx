import { useLocalSearchParams, useRouter } from 'expo-router';
import { arrayUnion, collection, doc, onSnapshot, query, updateDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import { ActivityIndicator, Button, Checkbox, Text } from 'react-native-paper';
import { db } from '../../../../config/firebase';
import { useAuth } from '../../../../context/AuthContext';

export default function AddMemberScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // load all users (basic example) excluding current user
    const q = query(collection(db, 'users'));
    const unsub = onSnapshot(q, (snap: any) => {
      const arr = snap.docs.map((d: any) => ({ id: d.id, ...(d.data() as any) }));
      const filtered = arr.filter((u: any) => u.id !== user?.uid);
      setUsers(filtered);
    }, (err: any) => {
      console.warn('Failed to load users:', err);
      setUsers([]);
    });
    return () => unsub();
  }, [user]);

  const toggle = (uid: string) => {
    setSelected(prev => prev.includes(uid) ? prev.filter(x => x !== uid) : [...prev, uid]);
  };

  const handleAdd = async () => {
    if (!id || selected.length === 0) return router.back();
    setLoading(true);
    try {
      const groupRef = doc(db, 'groups', String(id));
      // add each selected id using arrayUnion
      await updateDoc(groupRef, { memberIds: arrayUnion(...selected) } as any);
      router.back();
    } catch (err) {
      console.warn('Failed to add members:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text variant="titleLarge" style={{ marginBottom: 12 }}>Add Members</Text>

      {users.length === 0 ? (
        <ActivityIndicator animating={true} />
      ) : (
        <FlatList
          data={users}
          keyExtractor={(i) => i.id}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => toggle(item.id)} style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text>{item.username || item.email || item.id}</Text>
                <Text variant="bodySmall" style={{ color: '#666' }}>{item.email}</Text>
              </View>
              <Checkbox status={selected.includes(item.id) ? 'checked' : 'unchecked'} onPress={() => toggle(item.id)} />
            </TouchableOpacity>
          )}
        />
      )}

      <View style={{ width: '100%', padding: 12 }}>
        <Button mode="contained" onPress={handleAdd} loading={loading} buttonColor="#4B9089">Add Selected</Button>
        <Button mode="text" onPress={() => router.back()} style={{ marginTop: 8 }}>Cancel</Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#eee' },
});
