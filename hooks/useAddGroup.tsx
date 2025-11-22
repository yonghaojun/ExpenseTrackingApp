import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useState } from "react";
import { db } from "../config/firebase";
import { useAuth } from "../context/AuthContext";

type AddGroupPayload = {
  name: string;
  memberIds: string[];
};

export const useAddGroup = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const groupCollectionRef = collection(db, "groups");

    const addGroup = async (payload: AddGroupPayload) => {
        setError(null);

        if (!user) {
            setError("User not authenticated");
            throw new Error("User not authenticated");
        }

        setLoading(true);

        try{
            const docRef = await addDoc(groupCollectionRef, {
                name: payload.name,
                createdByUserId: user.uid,
                memberIds: payload.memberIds,
                createdAt: serverTimestamp(),
            });
            return docRef.id;
        } catch (err) {
            setError("Failed to add group");
            console.error(err);
            throw err;
        } finally {
            setLoading(false);
        }

    }

    return { addGroup, loading, error, setError } as const;
}

export default useAddGroup;