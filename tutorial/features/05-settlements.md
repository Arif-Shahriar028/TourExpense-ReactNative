# Settlement Calculations

This guide explains the smart settlement algorithm that minimizes the number of transactions needed to settle all debts between tour participants.

## Overview

The settlement system solves a common problem in group expenses: **minimizing the number of payments** required to settle all debts fairly. Instead of everyone paying everyone else individually, the algorithm finds the optimal set of transactions.

## The Problem

Without optimization, settling expenses can be complex:

### Example Scenario
- **Alice** paid ₹1000 for dinner (shared by Alice, Bob, Charlie)
- **Bob** paid ₹600 for transport (shared by Alice, Bob, Charlie)  
- **Charlie** paid ₹300 for snacks (shared by Alice, Bob, Charlie)

**Individual shares:** ₹633.33 each

**Simple calculation:**
- Alice should receive: ₹1000 - ₹633.33 = **₹366.67**
- Bob should receive: ₹600 - ₹633.33 = **-₹33.33** (owes)
- Charlie should receive: ₹300 - ₹633.33 = **-₹333.33** (owes)

**Without optimization:** Multiple transactions needed
- Bob pays Alice ₹33.33
- Charlie pays Alice ₹333.33
- Charlie pays Bob ₹0 (already settled)

**With optimization:** Minimal transactions
- Charlie pays Alice ₹333.33
- Bob pays Alice ₹33.33

## Algorithm Implementation

### Step 1: Calculate Net Balances

```typescript
const calculateTourSummary = (tour: Tour): TourSummary => {
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

  // Calculate net balance (positive = owed money, negative = owes money)
  participantSummaries.forEach(ps => {
    ps.netBalance = ps.totalPaid - ps.totalOwed;
  });

  return {
    tour,
    totalExpenses: tour.expenses.reduce((sum, expense) => sum + expense.amount, 0),
    participantSummaries,
  };
};
```

### Step 2: Settlement Optimization Algorithm

```typescript
export const calculateSettlements = (participantSummaries: ParticipantSummary[]): Settlement[] => {
  const settlements: Settlement[] = [];
  
  // Create arrays of creditors (people owed money) and debtors (people who owe money)
  const creditors = participantSummaries
    .filter(ps => ps.netBalance > 0)
    .map(ps => ({ id: ps.participant.id, amount: ps.netBalance }))
    .sort((a, b) => b.amount - a.amount); // Sort by amount descending
    
  const debtors = participantSummaries
    .filter(ps => ps.netBalance < 0)
    .map(ps => ({ id: ps.participant.id, amount: Math.abs(ps.netBalance) }))
    .sort((a, b) => b.amount - a.amount); // Sort by amount descending

  let i = 0, j = 0;
  
  while (i < creditors.length && j < debtors.length) {
    const creditor = creditors[i];
    const debtor = debtors[j];
    
    // Find the minimum amount to settle
    const settlementAmount = Math.min(creditor.amount, debtor.amount);
    
    if (settlementAmount > 0.01) { // Avoid tiny settlements due to floating point precision
      settlements.push({
        from: debtor.id,
        to: creditor.id,
        amount: Math.round(settlementAmount * 100) / 100, // Round to 2 decimal places
      });
    }
    
    // Reduce the amounts
    creditor.amount -= settlementAmount;
    debtor.amount -= settlementAmount;
    
    // Move to next creditor or debtor if current one is settled
    if (creditor.amount < 0.01) i++;
    if (debtor.amount < 0.01) j++;
  }
  
  return settlements;
};
```

## Algorithm Explanation

### 1. **Greedy Approach**
The algorithm uses a greedy approach, always trying to settle the largest amounts first. This typically results in fewer total transactions.

### 2. **Two-Pointer Technique**
- One pointer tracks creditors (people owed money)
- One pointer tracks debtors (people who owe money)
- Algorithm matches them optimally

### 3. **Precision Handling**
- Rounds amounts to 2 decimal places
- Ignores settlements smaller than ₹0.01
- Prevents floating-point precision errors

## Visual Example

### Before Settlement
```
Alice:   +₹366.67  (is owed)
Bob:     -₹33.33   (owes)
Charlie: -₹333.33  (owes)
```

### Algorithm Steps

**Step 1:** Match largest creditor (Alice: ₹366.67) with largest debtor (Charlie: ₹333.33)
- Settlement: Charlie pays Alice ₹333.33
- Remaining: Alice: ₹33.34, Charlie: ₹0

**Step 2:** Match remaining creditor (Alice: ₹33.34) with remaining debtor (Bob: ₹33.33)
- Settlement: Bob pays Alice ₹33.33
- Remaining: Alice: ₹0.01, Bob: ₹0

**Final Result:** 2 transactions instead of potentially more complex arrangements

## UI Implementation

### Settlement Display Component

```typescript
const SettlementsTab: React.FC = () => {
  const settlements = getSettlements(tourId);
  
  return (
    <ScrollView>
      <Card>
        <Text style={styles.sectionTitle}>Suggested Settlements</Text>
        {settlements.length === 0 ? (
          <Text style={styles.emptyText}>All balances are settled!</Text>
        ) : (
          <>
            <Text style={styles.settlementsSubtitle}>
              To settle all debts, the following {settlements.length} transfers are recommended:
            </Text>
            {settlements.map((settlement, index) => (
              <SettlementItem key={index} settlement={settlement} />
            ))}
          </>
        )}
      </Card>
    </ScrollView>
  );
};
```

### Settlement Item Component

```typescript
const SettlementItem: React.FC<{ settlement: Settlement }> = ({ settlement }) => {
  const fromParticipant = tour.participants.find(p => p.id === settlement.from);
  const toParticipant = tour.participants.find(p => p.id === settlement.to);
  
  return (
    <View style={styles.settlementItem}>
      <View style={styles.settlementParticipants}>
        <View style={styles.settlementParticipant}>
          <Avatar
            name={fromParticipant?.name || 'Unknown'}
            color={fromParticipant?.color || '#666'}
            size={32}
          />
          <Text style={styles.settlementName}>
            {fromParticipant?.name || 'Unknown'}
          </Text>
        </View>
        
        <View style={styles.settlementArrow}>
          <Icon name="arrow-forward" size={20} color="#007AFF" />
          <Text style={styles.settlementAmount}>
            {formatCurrency(settlement.amount)}
          </Text>
        </View>
        
        <View style={styles.settlementParticipant}>
          <Avatar
            name={toParticipant?.name || 'Unknown'}
            color={toParticipant?.color || '#666'}
            size={32}
          />
          <Text style={styles.settlementName}>
            {toParticipant?.name || 'Unknown'}
          </Text>
        </View>
      </View>
    </View>
  );
};
```

## Advanced Features

### 1. Settlement History

Track completed settlements:
```typescript
interface SettlementRecord {
  id: string;
  from: string;
  to: string;
  amount: number;
  date: string;
  tourId: string;
  status: 'pending' | 'completed';
}

const markSettlementComplete = (settlementId: string) => {
  dispatch({
    type: 'COMPLETE_SETTLEMENT',
    payload: { settlementId, completedAt: new Date().toISOString() }
  });
};
```

### 2. Partial Settlements

Allow partial payments:
```typescript
const recordPartialPayment = (settlement: Settlement, paidAmount: number) => {
  const remaining = settlement.amount - paidAmount;
  
  if (remaining > 0.01) {
    // Create new settlement for remaining amount
    const partialSettlement: Settlement = {
      from: settlement.from,
      to: settlement.to,
      amount: remaining,
    };
    
    dispatch({ type: 'ADD_PARTIAL_SETTLEMENT', payload: partialSettlement });
  }
  
  // Record the payment
  dispatch({
    type: 'RECORD_PAYMENT',
    payload: {
      from: settlement.from,
      to: settlement.to,
      amount: paidAmount,
      date: new Date().toISOString(),
    }
  });
};
```

### 3. Currency Formatting

Handle different currencies:
```typescript
export const formatCurrency = (amount: number, currency = 'INR'): string => {
  const formatters = {
    INR: (amt: number) => `₹${amt.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`,
    USD: (amt: number) => `$${amt.toLocaleString('en-US', { maximumFractionDigits: 2 })}`,
    EUR: (amt: number) => `€${amt.toLocaleString('en-EU', { maximumFractionDigits: 2 })}`,
  };
  
  return formatters[currency]?.(amount) || `${amount.toFixed(2)}`;
};
```

## Testing the Algorithm

### Unit Tests

```typescript
describe('Settlement Calculations', () => {
  test('calculates optimal settlements', () => {
    const participantSummaries: ParticipantSummary[] = [
      { participant: { id: '1', name: 'Alice' }, totalPaid: 1000, totalOwed: 633.33, netBalance: 366.67 },
      { participant: { id: '2', name: 'Bob' }, totalPaid: 600, totalOwed: 633.33, netBalance: -33.33 },
      { participant: { id: '3', name: 'Charlie' }, totalPaid: 300, totalOwed: 633.33, netBalance: -333.33 },
    ];
    
    const settlements = calculateSettlements(participantSummaries);
    
    expect(settlements).toHaveLength(2);
    expect(settlements[0]).toEqual({
      from: '3', // Charlie
      to: '1',   // Alice
      amount: 333.33
    });
    expect(settlements[1]).toEqual({
      from: '2', // Bob
      to: '1',   // Alice
      amount: 33.33
    });
  });

  test('handles balanced scenario', () => {
    const participantSummaries: ParticipantSummary[] = [
      { participant: { id: '1', name: 'Alice' }, totalPaid: 500, totalOwed: 500, netBalance: 0 },
      { participant: { id: '2', name: 'Bob' }, totalPaid: 500, totalOwed: 500, netBalance: 0 },
    ];
    
    const settlements = calculateSettlements(participantSummaries);
    
    expect(settlements).toHaveLength(0);
  });
});
```

## Benefits of This Approach

### ✅ **Minimal Transactions**
- Reduces the number of payments needed
- Simplifies settlement process
- Less confusion for participants

### ✅ **Fair and Accurate**
- Mathematically optimal
- Handles floating-point precision
- Accounts for all expenses accurately

### ✅ **User-Friendly**
- Clear visual representation
- Step-by-step instructions
- Easy to understand amounts

### ✅ **Flexible**
- Works with any number of participants
- Handles complex expense distributions
- Supports partial settlements

---

**Next:** [Advanced Features](../development/05-testing.md)