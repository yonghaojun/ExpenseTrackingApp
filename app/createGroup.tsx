import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Text, TextInput } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import { useAddGroup } from '../hooks/useAddGroup';

export default function CreateGroupScreen() {
	const { user } = useAuth();
	const router = useRouter();
	const [name, setName] = useState('');
	const { addGroup, loading, error, setError } = useAddGroup();

	const handleCreate = async () => {
		setError(null);
		if (!name || name.trim().length === 0) {
			setError?.('Please enter a group name');
			return;
		}
		if (!user) {
			setError?.('You must be signed in to create a group');
			return;
		}

		try {
			const newId = await addGroup({ name: name.trim(), memberIds: [user.uid] });
			// navigate to new group's detail page
			router.replace(`/group/${newId}` as any);
		} catch (err: any) {
			setError?.(err?.message || 'Failed to create group');
		}
	};

	return (
		<View style={styles.container}>
            <View style={{width: "90%", alignSelf: "center"  }}>
			<Text variant="titleLarge" style={styles.title}>Create Group</Text>
			<TextInput
				label="Group name"
				value={name}
				onChangeText={setName}
				mode="outlined"
                activeOutlineColor="#4B9089"
                outlineColor="#d1e9e5"
				style={styles.input}
			/>
			{error ? <Text style={{ color: 'red', marginTop: 8 }}>{error}</Text> : null}
			<Button mode="contained" onPress={handleCreate} loading={loading} style={styles.button} buttonColor="#4B9089">
				Create
			</Button>
            </View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, padding: 16, backgroundColor: '#fff'},
	title: { fontWeight: '700', marginBottom: 12, color: '#3e7771ff', fontSize: 25, marginTop: 20 },
	input: { marginBottom: 12 },
	button: { marginTop: 8 },
});