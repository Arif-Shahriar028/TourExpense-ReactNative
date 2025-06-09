export interface Participant {
  id: string;
  name: string;
  avatar?: string;
  color: string;
}

export interface Expense {
  id: string;
  title: string;
  amount: number;
  paidBy: string; // participant id
  participants: string[]; // participant ids
  category: ExpenseCategory;
  date: string;
  description?: string;
  tourId: string;
}

export interface Tour {
  id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate?: string;
  participants: Participant[];
  expenses: Expense[];
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseShare {
  participantId: string;
  amount: number;
}

export interface ParticipantSummary {
  participant: Participant;
  totalPaid: number;
  totalOwed: number;
  netBalance: number; // positive means they are owed, negative means they owe
}

export interface TourSummary {
  tour: Tour;
  totalExpenses: number;
  participantSummaries: ParticipantSummary[];
  expensesByCategory: ExpenseCategorySummary[];
}

export interface ExpenseCategorySummary {
  category: ExpenseCategory;
  totalAmount: number;
  expenseCount: number;
}

export type ExpenseCategory = 
  | 'Food'
  | 'Transportation'
  | 'Accommodation'
  | 'Entertainment'
  | 'Shopping'
  | 'Activities'
  | 'Miscellaneous';

export interface Settlement {
  from: string; // participant id
  to: string; // participant id
  amount: number;
}

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'Food',
  'Transportation',
  'Accommodation',
  'Entertainment',
  'Shopping',
  'Activities',
  'Miscellaneous',
];

export const CATEGORY_ICONS: Record<ExpenseCategory, string> = {
  Food: '🍽️',
  Transportation: '🚗',
  Accommodation: '🏨',
  Entertainment: '🎭',
  Shopping: '🛍️',
  Activities: '🏃',
  Miscellaneous: '💰',
};

export const CATEGORY_COLORS: Record<ExpenseCategory, string> = {
  Food: '#FF6B6B',
  Transportation: '#4ECDC4',
  Accommodation: '#45B7D1',
  Entertainment: '#96CEB4',
  Shopping: '#FECA57',
  Activities: '#FF9FF3',
  Miscellaneous: '#A0A0A0',
};