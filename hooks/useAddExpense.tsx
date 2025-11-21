import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useState } from "react";
import { db } from "../config/firebase";
import { useAuth } from "../context/AuthContext";

export type ExpenseSplit = {
    userId: string;
    amountOwed: number;
    paidStatus: "paid" | "pending" | string;
};

export type AddExpenseInput = {
    description: string;
    amount: number;
    currency: string; // e.g. 'MYR'
    category: string;
    date?: Date; // optional, if omitted we'll set to now
    receiptImageUrl?: string | null;
    groupId?: string | null;
    splits?: ExpenseSplit[]; // optional splits array
};

export default function useAddExpense() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const expenseCollectionRef = collection(db, "expenses");

    const addExpense = async (payload: AddExpenseInput) => {
        setError(null);

        if (!user) {
            setError("User not authenticated");
            throw new Error("User not authenticated");
        }

        const { description, amount, category, currency, date, receiptImageUrl, groupId, splits } = payload;

        // Basic validation
        if (!description || !amount || !category || !currency) {
            setError("Missing required fields: description, amount, category, currency");
            throw new Error("Missing required fields");
        }

        // Optional: validate splits sum equals amount when provided
        if (splits && splits.length > 0) {
            const totalSplit = splits.reduce((s, item) => s + Number(item.amountOwed || 0), 0);
            // allow small rounding error
            if (Math.abs(totalSplit - amount) > 0.01) {
                setError("Splits do not add up to total amount");
                throw new Error("Splits do not add up to total amount");
            }
        }

        setLoading(true);
        try {
            const docRef = await addDoc(expenseCollectionRef, {
                description,
                amount,
                currency,
                category,
                date: date ? date.toISOString() : new Date().toISOString(),
                creatorUserId: user.uid,
                receiptImageUrl: receiptImageUrl || null,
                groupId: groupId || null,
                splits: splits || [],
                createdAt: serverTimestamp(),
            });

            return { id: docRef.id };
        } catch (e: any) {
            const message = e?.message || "Failed to add expense";
            setError(message);
            throw e;
        } finally {
            setLoading(false);
        }
    };

    return { addExpense, loading, error, setError } as const;
}