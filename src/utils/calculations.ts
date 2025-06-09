import { Tour, ParticipantSummary, TourSummary, ExpenseCategorySummary, Settlement, EXPENSE_CATEGORIES } from '../types';

export const calculateTourSummary = (tour: Tour): TourSummary => {
  const totalExpenses = tour.expenses.reduce((sum, expense) => sum + expense.amount, 0);
  
  // Initialize participant summaries
  const participantSummaries: ParticipantSummary[] = tour.participants.map(participant => ({
    participant,
    totalPaid: 0,
    totalOwed: 0,
    netBalance: 0,
  }));

  // Calculate what each participant paid
  tour.expenses.forEach(expense => {
    const payer = participantSummaries.find(ps => ps.participant.id === expense.paidBy);
    if (payer) {
      payer.totalPaid += expense.amount;
    }
  });

  // Calculate what each participant owes
  tour.expenses.forEach(expense => {
    const sharePerPerson = expense.amount / expense.participants.length;
    expense.participants.forEach(participantId => {
      const participant = participantSummaries.find(ps => ps.participant.id === participantId);
      if (participant) {
        participant.totalOwed += sharePerPerson;
      }
    });
  });

  // Calculate net balance (positive means they are owed money, negative means they owe money)
  participantSummaries.forEach(ps => {
    ps.netBalance = ps.totalPaid - ps.totalOwed;
  });

  // Calculate expenses by category
  const expensesByCategory: ExpenseCategorySummary[] = EXPENSE_CATEGORIES.map(category => {
    const categoryExpenses = tour.expenses.filter(expense => expense.category === category);
    return {
      category,
      totalAmount: categoryExpenses.reduce((sum, expense) => sum + expense.amount, 0),
      expenseCount: categoryExpenses.length,
    };
  }).filter(summary => summary.expenseCount > 0);

  return {
    tour,
    totalExpenses,
    participantSummaries,
    expensesByCategory,
  };
};

export const calculateSettlements = (participantSummaries: ParticipantSummary[]): Settlement[] => {
  const settlements: Settlement[] = [];
  
  // Create arrays of creditors (people who are owed money) and debtors (people who owe money)
  const creditors = participantSummaries
    .filter(ps => ps.netBalance > 0)
    .map(ps => ({ id: ps.participant.id, amount: ps.netBalance }))
    .sort((a, b) => b.amount - a.amount);
    
  const debtors = participantSummaries
    .filter(ps => ps.netBalance < 0)
    .map(ps => ({ id: ps.participant.id, amount: Math.abs(ps.netBalance) }))
    .sort((a, b) => b.amount - a.amount);

  let i = 0, j = 0;
  
  while (i < creditors.length && j < debtors.length) {
    const creditor = creditors[i];
    const debtor = debtors[j];
    
    const settlementAmount = Math.min(creditor.amount, debtor.amount);
    
    if (settlementAmount > 0.01) { // Avoid tiny settlements due to floating point precision
      settlements.push({
        from: debtor.id,
        to: creditor.id,
        amount: Math.round(settlementAmount * 100) / 100, // Round to 2 decimal places
      });
    }
    
    creditor.amount -= settlementAmount;
    debtor.amount -= settlementAmount;
    
    if (creditor.amount < 0.01) i++;
    if (debtor.amount < 0.01) j++;
  }
  
  return settlements;
};

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const formatCurrency = (amount: number): string => {
  return `₹${amount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

export const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  });
};

export const generateParticipantColor = (): string => {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
    '#FECA57', '#FF9FF3', '#54A0FF', '#5F27CD',
    '#00D2D3', '#FF9F43', '#EE5A24', '#0FB9B1',
    '#D63031', '#6C5CE7', '#A29BFE', '#FD79A8'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};