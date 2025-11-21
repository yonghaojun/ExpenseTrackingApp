export interface ExpenseSplit {
  userId: string;
  amountOwed: number;
  paidStatus: 'paid' | 'pending' | string;
}

export interface AddExpenseInput {
  description: string;
  amount: number;
  currency: string; // e.g. 'MYR'
  category: string;
  date?: Date; // prefer Date in code; convert when writing to Firestore
  receiptImageUrl?: string | null;
  groupId?: string | null;
  splits?: ExpenseSplit[];
}