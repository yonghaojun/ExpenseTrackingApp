export interface ExpenseSplit {
    userId: string;
    amountOwed: number;
    paidStatus: 'paid' | 'pending' | string;
}

export interface Expense {
    description: string;
    amount: number;
    currency: string; // e.g. 'MYR'
    category: string;
    receiptImageUrl?: string | null;
    groupId?: string | null;
    splits?: ExpenseSplit[];
}

export interface Group {
    name: string;
    createdByUserId: string;
    memberIds: string[];
}