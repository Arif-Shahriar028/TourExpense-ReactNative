# Analytics & Summary System

This guide explains the comprehensive analytics and summary system in TourExpense. Learn how complex calculations work, what each metric means, and how the settlement algorithm minimizes payment transactions.

## Why Analytics Matter?

### Problems We Solve
1. **Expense Overview**: Understanding where money was spent
2. **Fair Splitting**: Ensuring accurate balance calculations
3. **Settlement Optimization**: Minimizing payment transactions
4. **Spending Insights**: Identifying patterns and trends
5. **Financial Transparency**: Clear breakdowns for all participants

### What Our Analytics Provide

**Real-time Calculations:**
- Total tour expenses across all categories
- Individual participant spending and balances
- Optimized settlement suggestions
- Category-wise expense breakdowns

**Smart Insights:**
- Who spent the most/least
- Most expensive categories
- Settlement recommendations
- Individual participant summaries

## Core Analytics Architecture

### The TourSummary Interface

```typescript
interface TourSummary {
  // Basic totals
  totalExpenses: number;        // Sum of all expenses in tour
  totalParticipants: number;    // Number of people in tour
  averagePerPerson: number;     // totalExpenses / totalParticipants
  
  // Individual breakdowns
  participantSummaries: ParticipantSummary[];  // Each person's details
  categoryBreakdowns: CategoryBreakdown[];     // Spending by category
  
  // Settlement information
  settlements: Settlement[];    // Optimized payment suggestions
  balances: { [participantId: string]: number };  // Who owes/is owed
}
```

### What Each Property Means

#### `totalExpenses: number`
**Purpose:** The sum of all expense amounts in the tour.

**Calculation:**
```typescript
const totalExpenses = tour.expenses.reduce((sum, expense) => sum + expense.amount, 0);
```

**Used by:**
- Header displays in TourDetailsScreen
- Summary cards in ExpenseSummaryScreen  
- Progress indicators and statistics

**Example:** If you have expenses of $500, $300, and $200, totalExpenses = $1000

#### `averagePerPerson: number`
**Purpose:** How much each person should ideally spend for equal sharing.

**Calculation:**
```typescript
const averagePerPerson = totalExpenses / totalParticipants;
```

**Why it matters:** This is the baseline for calculating who owes money and who should receive money.

**Example:** $1000 total ÷ 4 people = $250 per person

#### `participantSummaries: ParticipantSummary[]`
**Purpose:** Detailed breakdown for each participant.

**ParticipantSummary Structure:**
```typescript
interface ParticipantSummary {
  participant: Participant;     // Person details
  totalPaid: number;           // How much they paid for expenses
  totalShare: number;          // How much they should pay (their fair share)
  balance: number;             // totalPaid - totalShare (positive = they're owed, negative = they owe)
  expenseCount: number;        // Number of expenses they were involved in
  paidCount: number;           // Number of expenses they personally paid for
}
```

**Detailed Calculation Process:**

```typescript
const calculateParticipantSummary = (participant: Participant, tour: Tour) => {
  // 1. Calculate how much they paid for expenses
  const totalPaid = tour.expenses
    .filter(expense => expense.paidBy === participant.id)
    .reduce((sum, expense) => sum + expense.amount, 0);

  // 2. Calculate their fair share of all expenses
  const totalShare = tour.expenses
    .filter(expense => expense.participants.includes(participant.id))
    .reduce((sum, expense) => sum + (expense.amount / expense.participants.length), 0);

  // 3. Calculate balance (positive = they're owed money, negative = they owe money)
  const balance = totalPaid - totalShare;

  return {
    participant,
    totalPaid,
    totalShare,
    balance,
    expenseCount: tour.expenses.filter(e => e.participants.includes(participant.id)).length,
    paidCount: tour.expenses.filter(e => e.paidBy === participant.id).length,
  };
};
```

**Real Example:**
- **Alice** paid $800 for hotel, restaurant (totalPaid = $800)
- **Alice** participated in hotel $600÷4 = $150, restaurant $400÷3 = $133 (totalShare = $283)
- **Alice's balance** = $800 - $283 = +$517 (Alice is owed $517)

#### `categoryBreakdowns: CategoryBreakdown[]`
**Purpose:** Shows spending patterns by expense categories.

```typescript
interface CategoryBreakdown {
  category: ExpenseCategory;    // 'food', 'accommodation', 'transport', etc.
  totalAmount: number;          // Total spent in this category
  expenseCount: number;         // Number of expenses in this category
  percentage: number;           // Percentage of total tour expenses
  averageExpense: number;       // Average expense amount in this category
}
```

**Calculation Process:**
```typescript
const calculateCategoryBreakdowns = (tour: Tour, totalExpenses: number) => {
  const categoryMap = new Map<ExpenseCategory, Expense[]>();
  
  // Group expenses by category
  tour.expenses.forEach(expense => {
    const existing = categoryMap.get(expense.category) || [];
    categoryMap.set(expense.category, [...existing, expense]);
  });
  
  // Calculate breakdown for each category
  return Array.from(categoryMap.entries()).map(([category, expenses]) => {
    const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    
    return {
      category,
      totalAmount,
      expenseCount: expenses.length,
      percentage: (totalAmount / totalExpenses) * 100,
      averageExpense: totalAmount / expenses.length,
    };
  });
};
```

**Used for:**
- Pie charts showing expense distribution
- Category-wise spending insights  
- Budget planning for future trips
- Understanding group spending patterns

#### `settlements: Settlement[]`
**Purpose:** Optimized payment suggestions to settle all balances.

```typescript
interface Settlement {
  from: Participant;           // Person who needs to pay
  to: Participant;             // Person who should receive payment
  amount: number;              // Amount to be transferred
  description: string;         // Human-readable description
}
```

**The Settlement Algorithm:**
This is the most complex part of our analytics system. It solves the problem: "How do we minimize the number of transactions needed for everyone to be even?"

```typescript
const calculateOptimalSettlements = (participantSummaries: ParticipantSummary[]): Settlement[] => {
  // 1. Separate people who owe money from people who are owed money
  const debtors = participantSummaries
    .filter(p => p.balance < 0)
    .map(p => ({ participant: p.participant, amount: Math.abs(p.balance) }))
    .sort((a, b) => b.amount - a.amount); // Largest debts first
  
  const creditors = participantSummaries
    .filter(p => p.balance > 0)
    .map(p => ({ participant: p.participant, amount: p.balance }))
    .sort((a, b) => b.amount - a.amount); // Largest credits first
  
  const settlements: Settlement[] = [];
  
  // 2. Use greedy algorithm to match debts with credits
  let debtorIndex = 0;
  let creditorIndex = 0;
  
  while (debtorIndex < debtors.length && creditorIndex < creditors.length) {
    const debtor = debtors[debtorIndex];
    const creditor = creditors[creditorIndex];
    
    // 3. Calculate payment amount (minimum of what debtor owes and creditor is owed)
    const paymentAmount = Math.min(debtor.amount, creditor.amount);
    
    // 4. Create settlement record
    settlements.push({
      from: debtor.participant,
      to: creditor.participant,
      amount: paymentAmount,
      description: `${debtor.participant.name} pays $${paymentAmount} to ${creditor.participant.name}`,
    });
    
    // 5. Update remaining amounts
    debtor.amount -= paymentAmount;
    creditor.amount -= paymentAmount;
    
    // 6. Move to next person if current one is settled
    if (debtor.amount === 0) debtorIndex++;
    if (creditor.amount === 0) creditorIndex++;
  }
  
  return settlements;
};
```

**Algorithm Example:**
```
Initial Balances:
- Alice: +$300 (owed)
- Bob: -$150 (owes)  
- Charlie: -$100 (owes)
- David: -$50 (owes)

Optimal Settlements:
1. Bob pays $150 to Alice (Alice now owed $150, Bob settled)
2. Charlie pays $100 to Alice (Alice now owed $50, Charlie settled)  
3. David pays $50 to Alice (Everyone settled)

Result: 3 transactions instead of potentially 6 transactions with direct payments
```

## ExpenseSummaryScreen Implementation

### Screen Structure

```typescript
const ExpenseSummaryScreen: React.FC<ExpenseSummaryScreenProps> = ({ route }) => {
  const { currentTour } = useApp();
  const [activeTab, setActiveTab] = useState('overview');
  
  // Calculate summary data
  const tourSummary = useMemo(() => {
    if (!currentTour) return null;
    return calculateTourSummary(currentTour);
  }, [currentTour]);
  
  // Tabs configuration
  const tabs = [
    { key: 'overview', title: 'Overview', icon: 'chart-pie' },
    { key: 'expenses', title: 'Expenses', icon: 'list' },
    { key: 'balances', title: 'Balances', icon: 'scale-balance' },
    { key: 'settlements', title: 'Settlements', icon: 'handshake' },
  ];
};
```

### Why This Tab Structure?

**Overview Tab:**
- Quick snapshot of key metrics
- Visual charts and summaries
- Most important information at a glance

**Expenses Tab:**
- Detailed list of all expenses
- Sortable and filterable
- Edit/delete capabilities

**Balances Tab:**
- Individual participant summaries
- Who owes what to whom
- Detailed breakdowns

**Settlements Tab:**
- Optimized payment suggestions
- Step-by-step settlement instructions
- Mark settlements as completed

### Overview Tab Implementation

```typescript
const renderOverviewTab = () => {
  if (!tourSummary) return <Text>Loading...</Text>;
  
  return (
    <ScrollView style={styles.tabContent}>
      {/* Key Metrics Cards */}
      <View style={styles.metricsRow}>
        <Card style={styles.metricCard}>
          <Text style={styles.metricValue}>${tourSummary.totalExpenses}</Text>
          <Text style={styles.metricLabel}>Total Expenses</Text>
        </Card>
        
        <Card style={styles.metricCard}>
          <Text style={styles.metricValue}>${tourSummary.averagePerPerson}</Text>
          <Text style={styles.metricLabel}>Per Person</Text>
        </Card>
        
        <Card style={styles.metricCard}>
          <Text style={styles.metricValue}>{tourSummary.settlements.length}</Text>
          <Text style={styles.metricLabel}>Settlements</Text>
        </Card>
      </View>
      
      {/* Category Breakdown Chart */}
      <Card style={styles.chartCard}>
        <Text style={styles.sectionTitle}>Spending by Category</Text>
        <CategoryPieChart data={tourSummary.categoryBreakdowns} />
      </Card>
      
      {/* Top Spenders */}
      <Card style={styles.summaryCard}>
        <Text style={styles.sectionTitle}>Participant Summary</Text>
        {tourSummary.participantSummaries
          .sort((a, b) => b.totalPaid - a.totalPaid)
          .map(summary => (
            <ParticipantSummaryRow 
              key={summary.participant.id} 
              summary={summary} 
            />
          ))}
      </Card>
    </ScrollView>
  );
};
```

### Balances Tab Implementation

```typescript
const renderBalancesTab = () => {
  if (!tourSummary) return <Text>Loading...</Text>;
  
  return (
    <ScrollView style={styles.tabContent}>
      {tourSummary.participantSummaries.map(summary => (
        <Card key={summary.participant.id} style={styles.balanceCard}>
          <View style={styles.balanceHeader}>
            <Avatar participant={summary.participant} size="medium" />
            <Text style={styles.participantName}>{summary.participant.name}</Text>
          </View>
          
          <View style={styles.balanceDetails}>
            <View style={styles.balanceRow}>
              <Text style={styles.balanceLabel}>Total Paid:</Text>
              <Text style={styles.balanceAmount}>${summary.totalPaid}</Text>
            </View>
            
            <View style={styles.balanceRow}>
              <Text style={styles.balanceLabel}>Fair Share:</Text>
              <Text style={styles.balanceAmount}>${summary.totalShare.toFixed(2)}</Text>
            </View>
            
            <View style={styles.balanceRow}>
              <Text style={styles.balanceLabel}>Balance:</Text>
              <Text style={[
                styles.balanceAmount, 
                summary.balance > 0 ? styles.positiveBalance : styles.negativeBalance
              ]}>
                {summary.balance > 0 ? '+' : ''}${summary.balance.toFixed(2)}
              </Text>
            </View>
            
            <View style={styles.balanceStats}>
              <Text style={styles.statText}>
                Involved in {summary.expenseCount} expenses
              </Text>
              <Text style={styles.statText}>
                Paid for {summary.paidCount} expenses
              </Text>
            </View>
          </View>
        </Card>
      ))}
    </ScrollView>
  );
};
```

### Settlements Tab Implementation

```typescript
const renderSettlementsTab = () => {
  if (!tourSummary) return <Text>Loading...</Text>;
  
  if (tourSummary.settlements.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Icon name="check-circle" size={64} color="#4CAF50" />
        <Text style={styles.emptyStateTitle}>All Settled!</Text>
        <Text style={styles.emptyStateMessage}>
          Everyone's expenses are balanced. No settlements needed.
        </Text>
      </View>
    );
  }
  
  return (
    <ScrollView style={styles.tabContent}>
      <Card style={styles.instructionCard}>
        <Text style={styles.instructionTitle}>Settlement Instructions</Text>
        <Text style={styles.instructionText}>
          Follow these {tourSummary.settlements.length} transactions to settle all balances:
        </Text>
      </Card>
      
      {tourSummary.settlements.map((settlement, index) => (
        <Card key={`${settlement.from.id}-${settlement.to.id}`} style={styles.settlementCard}>
          <View style={styles.settlementHeader}>
            <Text style={styles.stepNumber}>{index + 1}</Text>
            <Text style={styles.settlementAmount}>${settlement.amount}</Text>
          </View>
          
          <View style={styles.settlementParties}>
            <View style={styles.settlementParty}>
              <Avatar participant={settlement.from} size="small" />
              <Text style={styles.partyName}>{settlement.from.name}</Text>
              <Text style={styles.partyRole}>pays</Text>
            </View>
            
            <Icon name="arrow-right" size={24} color="#666" />
            
            <View style={styles.settlementParty}>
              <Avatar participant={settlement.to} size="small" />
              <Text style={styles.partyName}>{settlement.to.name}</Text>
              <Text style={styles.partyRole}>receives</Text>
            </View>
          </View>
          
          <Text style={styles.settlementDescription}>
            {settlement.description}
          </Text>
        </Card>
      ))}
      
      <Card style={styles.tipCard}>
        <Icon name="lightbulb" size={20} color="#FF9800" />
        <Text style={styles.tipText}>
          Tip: You can use UPI, cash, or bank transfer for settlements. 
          Mark expenses as settled once payments are made.
        </Text>
      </Card>
    </ScrollView>
  );
};
```

## Real-World Example

Let's walk through a complete example:

### Tour Setup
**"Cox's Bazar Beach Trip"** - 4 participants:
- Alice, Bob, Charlie, David

### Expenses Added
1. **Hotel**: $2400 (paid by Alice, split among all 4)
2. **Dinner**: $800 (paid by Bob, split among all 4)  
3. **Breakfast**: $400 (paid by Charlie, split among Alice, Bob, Charlie)
4. **Taxi**: $300 (paid by David, split between Bob and David)

### Calculations

**1. Total Expenses:** $2400 + $800 + $400 + $300 = $3900

**2. Participant Summaries:**

**Alice:**
- Total Paid: $2400 (hotel)
- Fair Share: $2400÷4 + $800÷4 + $400÷3 + $0 = $600 + $200 + $133 = $933
- Balance: $2400 - $933 = +$1467 (Alice is owed $1467)

**Bob:**
- Total Paid: $800 (dinner)
- Fair Share: $2400÷4 + $800÷4 + $400÷3 + $300÷2 = $600 + $200 + $133 + $150 = $1083
- Balance: $800 - $1083 = -$283 (Bob owes $283)

**Charlie:**
- Total Paid: $400 (breakfast)
- Fair Share: $2400÷4 + $800÷4 + $400÷3 + $0 = $600 + $200 + $133 = $933
- Balance: $400 - $933 = -$533 (Charlie owes $533)

**David:**
- Total Paid: $300 (taxi)
- Fair Share: $2400÷4 + $800÷4 + $0 + $300÷2 = $600 + $200 + $150 = $950
- Balance: $300 - $950 = -$650 (David owes $650)

**3. Settlement Algorithm:**
- **Creditors:** Alice (+$1467)
- **Debtors:** David (-$650), Charlie (-$533), Bob (-$283)

**Optimal Settlements:**
1. David pays $650 to Alice (Alice now owed $817, David settled)
2. Charlie pays $533 to Alice (Alice now owed $284, Charlie settled)
3. Bob pays $283 to Alice (Everyone settled)

**Result:** 3 transactions settle everything!

## Performance Optimizations

### 1. Memoization

```typescript
const ExpenseSummaryScreen: React.FC = () => {
  // Only recalculate when tour data changes
  const tourSummary = useMemo(() => {
    if (!currentTour) return null;
    return calculateTourSummary(currentTour);
  }, [currentTour]);
  
  // Cache category breakdowns
  const categoryData = useMemo(() => {
    if (!tourSummary) return [];
    return tourSummary.categoryBreakdowns.map(breakdown => ({
      name: breakdown.category,
      value: breakdown.totalAmount,
      percentage: breakdown.percentage,
    }));
  }, [tourSummary]);
};
```

### 2. Virtual Lists for Large Data

```typescript
// For tours with many expenses, use FlatList instead of ScrollView
const renderExpensesList = () => (
  <FlatList
    data={tour.expenses}
    keyExtractor={item => item.id}
    renderItem={({ item }) => <ExpenseCard expense={item} />}
    removeClippedSubviews={true}
    maxToRenderPerBatch={10}
    windowSize={21}
  />
);
```

### 3. Calculation Caching

```typescript
// Cache expensive calculations at the context level
const AppProvider: React.FC = ({ children }) => {
  const [summaryCache, setSummaryCache] = useState(new Map());
  
  const getTourSummary = useCallback((tour: Tour) => {
    const cacheKey = `${tour.id}-${tour.updatedAt}`;
    
    if (summaryCache.has(cacheKey)) {
      return summaryCache.get(cacheKey);
    }
    
    const summary = calculateTourSummary(tour);
    setSummaryCache(prev => new Map(prev).set(cacheKey, summary));
    return summary;
  }, [summaryCache]);
};
```

## Testing Analytics

### Unit Tests for Calculations

```typescript
describe('calculateTourSummary', () => {
  test('calculates correct totals', () => {
    const tour = createMockTour();
    const summary = calculateTourSummary(tour);
    
    expect(summary.totalExpenses).toBe(3900);
    expect(summary.totalParticipants).toBe(4);
    expect(summary.averagePerPerson).toBe(975);
  });
  
  test('calculates participant balances correctly', () => {
    const tour = createMockTour();
    const summary = calculateTourSummary(tour);
    
    const alice = summary.participantSummaries.find(p => p.participant.name === 'Alice');
    expect(alice?.balance).toBeCloseTo(1467);
  });
  
  test('settlement algorithm minimizes transactions', () => {
    const tour = createMockTour();
    const summary = calculateTourSummary(tour);
    
    expect(summary.settlements).toHaveLength(3);
    
    // Verify all balances are settled
    const totalSettlementAmount = summary.settlements.reduce(
      (sum, settlement) => sum + settlement.amount, 
      0
    );
    const totalPositiveBalances = summary.participantSummaries
      .filter(p => p.balance > 0)
      .reduce((sum, p) => sum + p.balance, 0);
    
    expect(totalSettlementAmount).toBeCloseTo(totalPositiveBalances);
  });
});
```

This analytics system provides comprehensive insights while maintaining high performance and accuracy, making TourExpense a powerful tool for group expense management!

---

**Next:** [Data Models](../architecture/04-data-models.md)