# Expense Tracking

This comprehensive guide explains the expense tracking system in TourExpense - the core feature that handles recording, categorizing, and managing all financial transactions during group tours.

## What is Expense Tracking?

Expense tracking is the heart of the TourExpense app. It handles:

1. **Recording Expenses**: Who paid how much for what
2. **Categorization**: Organizing expenses by type (Food, Transport, etc.)
3. **Participant Attribution**: Who was involved in each expense
4. **Split Calculation**: How to divide costs fairly
5. **Real-time Updates**: Immediate impact on balances and summaries

## Core Expense Data Structure

```typescript
interface Expense {
  id: string;                    // Unique identifier
  title: string;                 // "Lunch at Restaurant ABC"
  amount: number;                // 1500.00 (in base currency)
  paidBy: string;               // Participant ID who paid
  participants: string[];        // Array of participant IDs who participated
  category: ExpenseCategory;     // Food, Transportation, etc.
  date: string;                 // ISO date string when expense occurred
  description?: string;          // Optional additional details
  tourId: string;               // Which tour this expense belongs to
  
  // Future enhancements
  receipt?: string;             // Photo/document reference
  location?: {                  // GPS coordinates
    latitude: number;
    longitude: number;
    address?: string;
  };
  currency?: string;            // For multi-currency support
}

type ExpenseCategory = 
  | 'Food'
  | 'Transportation'
  | 'Accommodation' 
  | 'Entertainment'
  | 'Shopping'
  | 'Activities'
  | 'Miscellaneous';
```

### Why This Structure?

**`amount: number`**: Stored as decimal (1500.00, not 1500)
- Avoids floating-point calculation errors
- Consistent precision for financial calculations
- Easy to format for different currencies

**`participants: string[]`**: Array of participant IDs
- Flexible: expense can involve any subset of tour participants
- Enables complex splitting scenarios
- Maintains data integrity through references

**`paidBy: string`**: Single participant ID
- Clear accountability for payment
- Supports "who owes whom" calculations  
- Enables reimbursement tracking

## Category System Deep Dive

### Category Configuration

```typescript
export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'Food',           // Meals, snacks, beverages
  'Transportation', // Flights, trains, buses, fuel, parking
  'Accommodation',  // Hotels, Airbnb, hostels
  'Entertainment',  // Movies, shows, attractions
  'Shopping',       // Souvenirs, clothing, personal items
  'Activities',     // Tours, sports, experiences
  'Miscellaneous',  // Everything else
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
  Food: '#FF6B6B',           // Red
  Transportation: '#4ECDC4',  // Teal
  Accommodation: '#45B7D1',   // Blue
  Entertainment: '#96CEB4',   // Green
  Shopping: '#FECA57',        // Yellow
  Activities: '#FF9FF3',      // Pink
  Miscellaneous: '#A0A0A0',   // Gray
};
```

### Why These Categories?

**Food**: Usually the largest expense category
- Includes restaurants, groceries, street food
- Easy to split equally among participants
- High frequency, various amounts

**Transportation**: Often pre-planned and shared
- Flights, trains, rental cars
- Usually involves all tour participants
- Can be expensive single transactions

**Accommodation**: Typically shared costs
- Hotels split by room occupancy
- Airbnb split equally
- Usually involves specific participants

**Entertainment & Activities**: Variable participation
- Not everyone joins every activity
- Helps track optional vs essential expenses
- Important for individual budgeting

## Expense Management Screens

### 1. AddExpenseScreen.tsx - Creating New Expenses

**Purpose**: Comprehensive form for recording new expenses with all necessary details.

```typescript
const AddExpenseScreen: React.FC = () => {
  const { tours, dispatch } = useApp();
  const route = useRoute<RouteProps>();
  const { tourId, category } = route.params;
  
  const tour = tours.find(t => t.id === tourId);
  
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    description: '',
    paidBy: '',
    participants: [] as string[],
    category: category || EXPENSE_CATEGORIES[0], // Pre-select if provided
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Validation with detailed error messages
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Expense title is required';
    }

    const amount = parseFloat(formData.amount);
    if (!formData.amount || isNaN(amount) || amount <= 0) {
      newErrors.amount = 'Please enter a valid amount greater than 0';
    }

    if (!formData.paidBy) {
      newErrors.paidBy = 'Please select who paid for this expense';
    }

    if (formData.participants.length === 0) {
      newErrors.participants = 'Please select at least one participant';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const newExpense: Expense = {
        id: generateId(),
        title: formData.title.trim(),
        amount: parseFloat(formData.amount),
        paidBy: formData.paidBy,
        participants: formData.participants,
        category: formData.category,
        date: new Date().toISOString(),
        description: formData.description.trim() || undefined,
        tourId,
      };

      // Optimistic update - show immediately in UI
      dispatch({
        type: 'ADD_EXPENSE',
        payload: { tourId, expense: newExpense },
      });

      // Success feedback with options
      Alert.alert(
        'Success',
        'Expense added successfully!',
        [
          {
            text: 'Add Another',
            onPress: () => resetForm(),
          },
          {
            text: 'View Tour',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to add expense. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView>
      {/* Basic Expense Details */}
      <Card>
        <Text style={styles.sectionTitle}>Expense Details</Text>
        
        <Input
          label="Expense Title *"
          placeholder="e.g. Lunch at Restaurant ABC"
          value={formData.title}
          onChangeText={(text) => setFormData({ ...formData, title: text })}
          error={errors.title}
        />

        <Input
          label="Amount ($) *"
          placeholder="0.00"
          value={formData.amount}
          onChangeText={(text) => setFormData({ ...formData, amount: text })}
          keyboardType="numeric"
          error={errors.amount}
        />

        <Input
          label="Description"
          placeholder="Additional notes (optional)"
          value={formData.description}
          onChangeText={(text) => setFormData({ ...formData, description: text })}
          multiline
          numberOfLines={2}
        />
      </Card>

      {/* Category Selection */}
      <Card>
        <Text style={styles.sectionTitle}>Category</Text>
        <CategorySelector
          categories={EXPENSE_CATEGORIES}
          selected={formData.category}
          onSelect={(category) => setFormData({ ...formData, category })}
        />
      </Card>

      {/* Payer Selection */}
      <Card>
        <Text style={styles.sectionTitle}>Who Paid? *</Text>
        <PayerSelector
          participants={tour.participants}
          selected={formData.paidBy}
          onSelect={(payerId) => setFormData({ ...formData, paidBy: payerId })}
          error={errors.paidBy}
        />
      </Card>

      {/* Participant Selection */}
      <Card>
        <ParticipantSelector
          participants={tour.participants}
          selected={formData.participants}
          onSelectionChange={(participants) => 
            setFormData({ ...formData, participants })
          }
          error={errors.participants}
        />
      </Card>

      {/* Submit Actions */}
      <View style={styles.buttonContainer}>
        <Button title="Cancel" variant="secondary" onPress={() => navigation.goBack()} />
        <Button title="Add Expense" onPress={handleSubmit} loading={loading} />
      </View>
    </ScrollView>
  );
};
```

**Key Features:**
- **Smart Defaults**: Pre-fill category if navigated with context
- **Real-time Validation**: Immediate feedback on form errors
- **Participant Pre-selection**: Quick "Select All" option
- **Currency Input**: Formatted numeric input for amounts
- **Context Preservation**: Remember selections while filling form

### 2. Category Selection Component

```typescript
const CategorySelector: React.FC<{
  categories: ExpenseCategory[];
  selected: ExpenseCategory;
  onSelect: (category: ExpenseCategory) => void;
}> = ({ categories, selected, onSelect }) => {
  
  return (
    <View style={styles.categoryGrid}>
      {categories.map((category) => (
        <TouchableOpacity
          key={category}
          style={[
            styles.categoryItem,
            selected === category ? 
              { backgroundColor: CATEGORY_COLORS[category] } : 
              styles.unselectedCategory,
          ]}
          onPress={() => onSelect(category)}
        >
          <Text style={styles.categoryIcon}>
            {CATEGORY_ICONS[category]}
          </Text>
          <Text
            style={[
              styles.categoryText,
              selected === category ? 
                styles.selectedCategoryText : 
                styles.unselectedCategoryText,
            ]}
          >
            {category}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};
```

### 3. Participant Selection Component

```typescript
const ParticipantSelector: React.FC<{
  participants: Participant[];
  selected: string[];
  onSelectionChange: (selected: string[]) => void;
  error?: string;
}> = ({ participants, selected, onSelectionChange, error }) => {
  
  const toggleParticipant = (participantId: string) => {
    if (selected.includes(participantId)) {
      onSelectionChange(selected.filter(id => id !== participantId));
    } else {
      onSelectionChange([...selected, participantId]);
    }
  };
  
  const selectAllParticipants = () => {
    onSelectionChange(participants.map(p => p.id));
  };
  
  const clearAllParticipants = () => {
    onSelectionChange([]);
  };

  return (
    <View>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Who Participated? *</Text>
        <View style={styles.quickActions}>
          <TouchableOpacity onPress={selectAllParticipants}>
            <Text style={styles.actionText}>Select All</Text>
          </TouchableOpacity>
          {selected.length > 0 && (
            <TouchableOpacity onPress={clearAllParticipants}>
              <Text style={styles.actionText}>Clear</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
      
      {error && <Text style={styles.error}>{error}</Text>}
      
      <View style={styles.participantsGrid}>
        {participants.map((participant) => (
          <TouchableOpacity
            key={participant.id}
            style={[
              styles.participantItem,
              selected.includes(participant.id) && styles.selectedParticipant,
            ]}
            onPress={() => toggleParticipant(participant.id)}
          >
            <Avatar
              name={participant.name}
              color={participant.color}
              size={40}
            />
            <Text style={styles.participantName} numberOfLines={1}>
              {participant.name}
            </Text>
            {selected.includes(participant.id) && (
              <View style={styles.checkmark}>
                <Icon name="check" size={12} color="white" />
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>
      
      {/* Show expense split preview */}
      {selected.length > 0 && (
        <View style={styles.splitPreview}>
          <Text style={styles.splitText}>
            Split between {selected.length} people
            {formData.amount && ` · $${(parseFloat(formData.amount) / selected.length).toFixed(2)} per person`}
          </Text>
        </View>
      )}
    </View>
  );
};
```

## Edit Expense Functionality

### EditExpenseScreen.tsx - Modifying Existing Expenses

```typescript
const EditExpenseScreen: React.FC = () => {
  const { tours, dispatch } = useApp();
  const route = useRoute<RouteProps>();
  const { tourId, expenseId } = route.params;
  
  const tour = tours.find(t => t.id === tourId);
  const expense = tour?.expenses.find(e => e.id === expenseId);
  
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    description: '',
    paidBy: '',
    participants: [] as string[],
    category: EXPENSE_CATEGORIES[0],
  });
  
  // Pre-populate form with existing expense data
  useEffect(() => {
    if (expense) {
      setFormData({
        title: expense.title,
        amount: expense.amount.toString(),
        description: expense.description || '',
        paidBy: expense.paidBy,
        participants: expense.participants,
        category: expense.category,
      });
    }
  }, [expense]);

  const handleUpdate = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const updatedExpense: Expense = {
        ...expense!,
        title: formData.title.trim(),
        amount: parseFloat(formData.amount),
        paidBy: formData.paidBy,
        participants: formData.participants,
        category: formData.category,
        description: formData.description.trim() || undefined,
        // Keep original date and ID
      };

      dispatch({
        type: 'UPDATE_EXPENSE',
        payload: { tourId, expense: updatedExpense },
      });

      Alert.alert('Success', 'Expense updated successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to update expense.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Expense',
      `Are you sure you want to delete "${expense?.title}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            dispatch({
              type: 'DELETE_EXPENSE',
              payload: { tourId, expenseId },
            });
            navigation.goBack();
          },
        },
      ]
    );
  };

  return (
    <ScrollView>
      {/* Same form structure as AddExpenseScreen */}
      {/* ... form components ... */}
      
      <View style={styles.buttonContainer}>
        <Button
          title="Delete"
          variant="danger"
          onPress={handleDelete}
          style={styles.deleteButton}
        />
        <Button
          title="Save Changes"
          onPress={handleUpdate}
          loading={loading}
          style={styles.saveButton}
        />
      </View>
    </ScrollView>
  );
};
```

## State Management for Expenses

### Adding Expenses

```typescript
case 'ADD_EXPENSE':
  return {
    ...state,
    tours: state.tours.map(tour =>
      tour.id === action.payload.tourId
        ? { 
            ...tour, 
            expenses: [...tour.expenses, action.payload.expense],
            updatedAt: new Date().toISOString()
          }
        : tour
    ),
    // Update currentTour reference
    currentTour: state.currentTour?.id === action.payload.tourId
      ? { 
          ...state.currentTour, 
          expenses: [...state.currentTour.expenses, action.payload.expense],
          updatedAt: new Date().toISOString()
        }
      : state.currentTour,
  };
```

### Updating Expenses

```typescript
case 'UPDATE_EXPENSE':
  return {
    ...state,
    tours: state.tours.map(tour =>
      tour.id === action.payload.tourId
        ? {
            ...tour,
            expenses: tour.expenses.map(expense =>
              expense.id === action.payload.expense.id 
                ? action.payload.expense 
                : expense
            ),
            updatedAt: new Date().toISOString()
          }
        : tour
    ),
    currentTour: state.currentTour?.id === action.payload.tourId
      ? {
          ...state.currentTour,
          expenses: state.currentTour.expenses.map(expense =>
            expense.id === action.payload.expense.id 
              ? action.payload.expense 
              : expense
          ),
          updatedAt: new Date().toISOString()
        }
      : state.currentTour,
  };
```

## Expense Display and Lists

### Expense List Item Component

```typescript
const ExpenseListItem: React.FC<{
  expense: Expense;
  participants: Participant[];
  onPress: () => void;
  showDate?: boolean;
}> = ({ expense, participants, onPress, showDate = true }) => {
  
  const payer = participants.find(p => p.id === expense.paidBy);
  const expenseParticipants = participants.filter(p => 
    expense.participants.includes(p.id)
  );
  
  return (
    <TouchableOpacity style={styles.expenseItem} onPress={onPress}>
      <View style={styles.expenseLeft}>
        {/* Category Icon */}
        <View
          style={[
            styles.categoryIcon,
            { backgroundColor: CATEGORY_COLORS[expense.category] },
          ]}
        >
          <Text style={styles.categoryIconText}>
            {CATEGORY_ICONS[expense.category]}
          </Text>
        </View>
        
        {/* Expense Details */}
        <View style={styles.expenseDetails}>
          <Text style={styles.expenseTitle}>{expense.title}</Text>
          
          <View style={styles.expenseMetadata}>
            <Text style={styles.expensePayer}>
              Paid by {payer?.name || 'Unknown'}
            </Text>
            
            {showDate && (
              <Text style={styles.expenseDate}>
                · {formatDate(expense.date)}
              </Text>
            )}
          </View>
          
          {/* Participants involved */}
          <View style={styles.participantsRow}>
            <Text style={styles.participantsLabel}>Split:</Text>
            <View style={styles.participantAvatars}>
              {expenseParticipants.slice(0, 3).map((participant) => (
                <Avatar
                  key={participant.id}
                  name={participant.name}
                  color={participant.color}
                  size={16}
                />
              ))}
              {expenseParticipants.length > 3 && (
                <Text style={styles.moreParticipants}>
                  +{expenseParticipants.length - 3}
                </Text>
              )}
            </View>
          </View>
        </View>
      </View>
      
      {/* Amount and Per-Person Cost */}
      <View style={styles.expenseRight}>
        <Text style={styles.expenseAmount}>
          {formatCurrency(expense.amount)}
        </Text>
        <Text style={styles.perPersonAmount}>
          {formatCurrency(expense.amount / expense.participants.length)} pp
        </Text>
      </View>
    </TouchableOpacity>
  );
};
```

### Expense Grouping by Date

```typescript
const useExpenseGrouping = (expenses: Expense[]) => {
  return useMemo(() => {
    const groups: { [date: string]: Expense[] } = {};
    
    expenses
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .forEach(expense => {
        const dateKey = format(new Date(expense.date), 'yyyy-MM-dd');
        if (!groups[dateKey]) {
          groups[dateKey] = [];
        }
        groups[dateKey].push(expense);
      });
    
    return Object.entries(groups).map(([date, expenses]) => ({
      date,
      expenses,
      total: expenses.reduce((sum, exp) => sum + exp.amount, 0),
    }));
  }, [expenses]);
};

// Usage in ExpensesList
const ExpensesList: React.FC<{ expenses: Expense[] }> = ({ expenses }) => {
  const groupedExpenses = useExpenseGrouping(expenses);
  
  return (
    <SectionList
      sections={groupedExpenses}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <ExpenseListItem expense={item} />}
      renderSectionHeader={({ section }) => (
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionDate}>
            {formatDateHeader(section.date)}
          </Text>
          <Text style={styles.sectionTotal}>
            {formatCurrency(section.total)}
          </Text>
        </View>
      )}
    />
  );
};
```

## Advanced Expense Features

### 1. Expense Search and Filtering

```typescript
const useExpenseFiltering = (expenses: Expense[]) => {
  const [filters, setFilters] = useState({
    searchQuery: '',
    category: null as ExpenseCategory | null,
    paidBy: null as string | null,
    dateRange: null as { start: Date; end: Date } | null,
    amountRange: null as { min: number; max: number } | null,
  });

  const filteredExpenses = useMemo(() => {
    return expenses.filter(expense => {
      // Search in title and description
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        const matchesTitle = expense.title.toLowerCase().includes(query);
        const matchesDescription = expense.description?.toLowerCase().includes(query);
        if (!matchesTitle && !matchesDescription) return false;
      }

      // Category filter
      if (filters.category && expense.category !== filters.category) {
        return false;
      }

      // Payer filter
      if (filters.paidBy && expense.paidBy !== filters.paidBy) {
        return false;
      }

      // Date range filter
      if (filters.dateRange) {
        const expenseDate = new Date(expense.date);
        if (expenseDate < filters.dateRange.start || expenseDate > filters.dateRange.end) {
          return false;
        }
      }

      // Amount range filter
      if (filters.amountRange) {
        if (expense.amount < filters.amountRange.min || expense.amount > filters.amountRange.max) {
          return false;
        }
      }

      return true;
    });
  }, [expenses, filters]);

  return {
    filteredExpenses,
    filters,
    setFilters,
    clearFilters: () => setFilters({
      searchQuery: '',
      category: null,
      paidBy: null,
      dateRange: null,
      amountRange: null,
    }),
  };
};
```

### 2. Expense Statistics

```typescript
const calculateExpenseStatistics = (expenses: Expense[], participants: Participant[]) => {
  const totalAmount = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const expenseCount = expenses.length;
  const averageExpense = expenseCount > 0 ? totalAmount / expenseCount : 0;

  // Category breakdown
  const categoryBreakdown = EXPENSE_CATEGORIES.map(category => {
    const categoryExpenses = expenses.filter(exp => exp.category === category);
    return {
      category,
      count: categoryExpenses.length,
      total: categoryExpenses.reduce((sum, exp) => sum + exp.amount, 0),
      percentage: totalAmount > 0 ? (categoryExpenses.reduce((sum, exp) => sum + exp.amount, 0) / totalAmount) * 100 : 0,
    };
  }).filter(item => item.count > 0);

  // Daily spending pattern
  const dailySpending: { [date: string]: number } = {};
  expenses.forEach(expense => {
    const date = format(new Date(expense.date), 'yyyy-MM-dd');
    dailySpending[date] = (dailySpending[date] || 0) + expense.amount;
  });

  // Who pays most often
  const payerFrequency = participants.map(participant => {
    const paidExpenses = expenses.filter(exp => exp.paidBy === participant.id);
    return {
      participant,
      count: paidExpenses.length,
      total: paidExpenses.reduce((sum, exp) => sum + exp.amount, 0),
    };
  }).filter(item => item.count > 0);

  return {
    totalAmount,
    expenseCount,
    averageExpense,
    categoryBreakdown,
    dailySpending,
    payerFrequency,
    dateRange: {
      earliest: expenses.length > 0 ? new Date(Math.min(...expenses.map(e => new Date(e.date).getTime()))) : null,
      latest: expenses.length > 0 ? new Date(Math.max(...expenses.map(e => new Date(e.date).getTime()))) : null,
    },
  };
};
```

### 3. Quick Expense Templates

```typescript
const ExpenseTemplates: React.FC<{
  onSelectTemplate: (template: Partial<Expense>) => void;
}> = ({ onSelectTemplate }) => {
  
  const templates = [
    {
      title: 'Breakfast',
      category: 'Food' as ExpenseCategory,
      icon: '🥞',
    },
    {
      title: 'Lunch',
      category: 'Food' as ExpenseCategory,
      icon: '🍽️',
    },
    {
      title: 'Dinner',
      category: 'Food' as ExpenseCategory,
      icon: '🍷',
    },
    {
      title: 'Taxi/Uber',
      category: 'Transportation' as ExpenseCategory,
      icon: '🚗',
    },
    {
      title: 'Gas/Fuel',
      category: 'Transportation' as ExpenseCategory,
      icon: '⛽',
    },
    {
      title: 'Entrance Ticket',
      category: 'Activities' as ExpenseCategory,
      icon: '🎫',
    },
  ];
  
  return (
    <View style={styles.templatesContainer}>
      <Text style={styles.templatesTitle}>Quick Templates</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {templates.map((template, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.templateItem,
              { backgroundColor: CATEGORY_COLORS[template.category] },
            ]}
            onPress={() => onSelectTemplate(template)}
          >
            <Text style={styles.templateIcon}>{template.icon}</Text>
            <Text style={styles.templateTitle}>{template.title}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};
```

## Integration with Other Systems

### Impact on Balance Calculations

Every expense operation immediately affects:

1. **Individual Balances**: Who owes what changes
2. **Settlement Suggestions**: Optimal payment paths update
3. **Tour Summary**: Total expenses and statistics refresh
4. **Participant Summaries**: Each person's financial position updates

### Real-time Updates

```typescript
// When an expense is added/updated/deleted
const recalculateAllSummaries = (tours: Tour[]) => {
  return tours.map(tour => ({
    ...tour,
    // Trigger recalculation of dependent data
    summary: calculateTourSummary(tour),
    settlements: calculateSettlements(calculateTourSummary(tour).participantSummaries),
  }));
};
```

## Best Practices

### 1. Data Validation
- Always validate amounts are positive numbers
- Ensure payer exists in participants list
- Verify participants array is not empty
- Check for reasonable expense amounts (not too high/low)

### 2. User Experience
- Pre-fill common values (recent payer, all participants)
- Provide expense templates for common scenarios  
- Show real-time split calculations
- Enable quick editing of recent expenses

### 3. Performance
- Memoize expensive calculations
- Use FlatList for large expense lists
- Debounce search and filter operations
- Optimize image handling for receipts (future feature)

---

**Next:** [Analytics & Summaries](./04-analytics.md)