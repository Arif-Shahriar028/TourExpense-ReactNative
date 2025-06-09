# Participant Management

This comprehensive guide explains how participant management works in TourExpense - from adding people to tours, managing their information, handling avatars, and understanding how participants integrate with expenses and calculations.

## What is Participant Management?

Participant management is the system that handles all the people involved in a tour. It's crucial because:

1. **Expense Attribution**: Who paid for what and who participated
2. **Balance Calculations**: Who owes money and who is owed money  
3. **Settlement Optimization**: How to minimize payment transactions
4. **Visual Identity**: Avatars and colors for easy recognition

## Core Participant Data Structure

```typescript
interface Participant {
  id: string;           // Unique identifier (generated)
  name: string;         // Display name "John Doe"
  color: string;        // Hex color for avatar "#007AFF"
  avatar?: string;      // Future: profile image URL
  email?: string;       // Future: contact information
  phone?: string;       // Future: contact information
}
```

### Why These Properties?

**`id: string`** - Unique Identifier
- Generated using `generateId()` function
- Used to link expenses to specific participants
- Remains constant even if name changes
- Enables data consistency across app

**`name: string`** - Display Name
- What shows up in participant lists
- Used for avatar initial generation
- Searchable and editable
- Required field for creation

**`color: string`** - Visual Identity
- Unique color for each participant's avatar
- Makes participants easily recognizable in lists
- Used consistently throughout the app
- Auto-generated but user-customizable

## Participant Management Screens

### 1. ParticipantsScreen.tsx - Main Management

**Purpose**: Central hub for viewing and managing all participants in a tour.

```typescript
const ParticipantsScreen: React.FC = () => {
  const { tours, dispatch } = useApp();
  const route = useRoute<RouteProps>();
  const { tourId } = route.params;
  
  const tour = tours.find(t => t.id === tourId);
  
  if (!tour) {
    return <ErrorState message="Tour not found" />;
  }
  
  const handleDeleteParticipant = (participantId: string) => {
    const participant = tour.participants.find(p => p.id === participantId);
    
    Alert.alert(
      'Remove Participant',
      `Remove ${participant?.name}? This will also remove all expenses involving this person.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => dispatch({
            type: 'DELETE_PARTICIPANT',
            payload: { tourId, participantId },
          }),
        },
      ]
    );
  };
  
  return (
    <SafeAreaView style={styles.container}>
      {/* Header with tour info and add button */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Participants</Text>
        <Text style={styles.headerSubtitle}>{tour.title}</Text>
        <TouchableOpacity 
          onPress={() => navigation.navigate('AddParticipant', { tourId })}
        >
          <Icon name="person-add" size={24} color="white" />
        </TouchableOpacity>
      </View>
      
      {/* Participant List */}
      <FlatList
        data={tour.participants}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ParticipantCard 
            participant={item}
            onDelete={() => handleDeleteParticipant(item.id)}
          />
        )}
        ListEmptyComponent={<EmptyParticipantsState />}
      />
    </SafeAreaView>
  );
};
```

**Key Features:**
- **Visual Participant List**: Shows all participants with avatars
- **Quick Add**: Header button for adding new participants  
- **Delete Functionality**: Remove participants with confirmation
- **Empty State**: Helpful guidance when no participants exist
- **Tour Context**: Always shows which tour you're managing

### 2. AddParticipantScreen.tsx - Adding New People

**Purpose**: Form for adding new participants with name input and color selection.

```typescript
const AddParticipantScreen: React.FC = () => {
  const { tours, dispatch } = useApp();
  const route = useRoute<RouteProps>();
  const { tourId, prefillName } = route.params;
  
  const [name, setName] = useState(prefillName || '');
  const [selectedColor, setSelectedColor] = useState(generateParticipantColor());
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Available color palette
  const colorOptions = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
    '#FECA57', '#FF9FF3', '#54A0FF', '#5F27CD',
    '#00D2D3', '#FF9F43', '#EE5A24', '#0FB9B1',
    '#D63031', '#6C5CE7', '#A29BFE', '#FD79A8'
  ];
  
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!name.trim()) {
      newErrors.name = 'Participant name is required';
    } else if (tour.participants.some(p => 
      p.name.toLowerCase() === name.toLowerCase()
    )) {
      newErrors.name = 'A participant with this name already exists';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    const newParticipant: Participant = {
      id: generateId(),
      name: name.trim(),
      color: selectedColor,
    };
    
    dispatch({
      type: 'ADD_PARTICIPANT',
      payload: { tourId, participant: newParticipant },
    });
    
    // Success feedback with options
    Alert.alert(
      'Success',
      `${newParticipant.name} has been added!`,
      [
        {
          text: 'Add Another',
          onPress: () => {
            setName('');
            setSelectedColor(generateParticipantColor());
          },
        },
        {
          text: 'Done',
          onPress: () => navigation.goBack(),
        },
      ]
    );
  };
  
  return (
    <ScrollView>
      <Card>
        {/* Live Preview */}
        <View style={styles.previewSection}>
          <Text style={styles.previewLabel}>Preview</Text>
          <Avatar
            name={name || 'Preview'}
            color={selectedColor}
            size={60}
          />
        </View>
        
        {/* Name Input */}
        <Input
          label="Participant Name *"
          placeholder="e.g. John Doe"
          value={name}
          onChangeText={setName}
          error={errors.name}
        />
        
        {/* Color Selection */}
        <Text style={styles.colorLabel}>Choose Color</Text>
        <View style={styles.colorGrid}>
          {colorOptions.map((color) => (
            <TouchableOpacity
              key={color}
              style={[
                styles.colorOption,
                { backgroundColor: color },
                selectedColor === color && styles.selectedColor,
              ]}
              onPress={() => setSelectedColor(color)}
            />
          ))}
        </View>
      </Card>
      
      {/* Existing Participants Reference */}
      {tour.participants.length > 0 && (
        <Card style={styles.existingParticipants}>
          <Text style={styles.existingTitle}>
            Current Participants ({tour.participants.length})
          </Text>
          <ParticipantsGrid participants={tour.participants} />
        </Card>
      )}
    </ScrollView>
  );
};
```

**Key Features:**
- **Live Preview**: See avatar as you type and select colors
- **Smart Validation**: Prevent duplicate names within the same tour
- **Color Selection**: Visual color picker with predefined palette
- **Context Awareness**: Shows existing participants for reference
- **Batch Addition**: Option to add multiple participants quickly

## Avatar System Deep Dive

### Avatar Component Implementation

```typescript
interface AvatarProps {
  name: string;         // Full name for initial extraction
  color: string;        // Background color
  size?: number;        // Diameter in pixels (default: 40)
}

const Avatar: React.FC<AvatarProps> = ({ name, color, size = 40 }) => {
  // Extract initials intelligently
  const initials = name
    .split(' ')                    // Split by spaces
    .map(word => word.charAt(0))   // First letter of each word
    .join('')                      // Combine letters
    .toUpperCase()                 // Uppercase for consistency
    .slice(0, 2);                  // Max 2 characters
  
  return (
    <View
      style={[
        styles.avatar,
        {
          backgroundColor: color,
          width: size,
          height: size,
          borderRadius: size / 2,    // Perfect circle
        },
      ]}
    >
      <Text
        style={[
          styles.initials,
          {
            fontSize: size * 0.4,     // Scale text with avatar size
          },
        ]}
      >
        {initials}
      </Text>
    </View>
  );
};
```

### Initial Extraction Logic

**Examples:**
- "John Doe" → "JD"
- "Alice" → "A"  
- "Mary Jane Watson" → "MJ" (takes first 2)
- "Jean-Pierre" → "J" (hyphenated names)
- "李小明" → "李小" (works with any Unicode characters)

### Color Generation System

```typescript
export const generateParticipantColor = (): string => {
  const colors = [
    '#FF6B6B',  // Red
    '#4ECDC4',  // Teal  
    '#45B7D1',  // Blue
    '#96CEB4',  // Green
    '#FECA57',  // Yellow
    '#FF9FF3',  // Pink
    '#54A0FF',  // Light Blue
    '#5F27CD',  // Purple
    '#00D2D3',  // Cyan
    '#FF9F43',  // Orange
    '#EE5A24',  // Dark Orange
    '#0FB9B1',  // Dark Teal
    '#D63031',  // Dark Red
    '#6C5CE7',  // Light Purple
    '#A29BFE',  // Lavender
    '#FD79A8'   // Hot Pink
  ];
  
  return colors[Math.floor(Math.random() * colors.length)];
};
```

**Color Strategy:**
- **High Contrast**: All colors work well with white text
- **Distinct**: Colors are visually different from each other
- **Accessible**: Meet WCAG contrast requirements
- **Pleasant**: Chosen for visual appeal

## State Management Integration

### Adding Participants

```typescript
case 'ADD_PARTICIPANT':
  return {
    ...state,
    tours: state.tours.map(tour =>
      tour.id === action.payload.tourId
        ? { 
            ...tour, 
            participants: [...tour.participants, action.payload.participant],
            updatedAt: new Date().toISOString()  // Track changes
          }
        : tour
    ),
    // Also update currentTour reference if it matches
    currentTour: state.currentTour?.id === action.payload.tourId
      ? { 
          ...state.currentTour, 
          participants: [...state.currentTour.participants, action.payload.participant],
          updatedAt: new Date().toISOString()
        }
      : state.currentTour,
  };
```

### Deleting Participants (Complex Operation)

```typescript
case 'DELETE_PARTICIPANT':
  return {
    ...state,
    tours: state.tours.map(tour =>
      tour.id === action.payload.tourId
        ? {
            ...tour,
            // Remove from participants array
            participants: tour.participants.filter(
              participant => participant.id !== action.payload.participantId
            ),
            // CRITICAL: Also remove related expenses
            expenses: tour.expenses.filter(expense => 
              // Remove expenses where this person paid
              expense.paidBy !== action.payload.participantId &&
              // Remove expenses where this person participated
              !expense.participants.includes(action.payload.participantId)
            ),
            updatedAt: new Date().toISOString()
          }
        : tour
    ),
    currentTour: /* similar logic for currentTour */
  };
```

**Why Delete Related Expenses?**
- **Data Integrity**: Prevents orphaned expense records
- **Calculation Accuracy**: Ensures balance calculations remain correct
- **User Experience**: Avoids confusion from incomplete data

## Integration with Expense System

### Expense Creation Flow

```typescript
// In AddExpenseScreen, participants are used for:

1. **Payer Selection**: Who paid for the expense
const [paidBy, setPaidBy] = useState('');

// Render participant selection
{tour.participants.map((participant) => (
  <TouchableOpacity
    key={participant.id}
    style={[
      styles.payerOption,
      paidBy === participant.id && styles.selected,
    ]}
    onPress={() => setPaidBy(participant.id)}
  >
    <Avatar name={participant.name} color={participant.color} />
    <Text>{participant.name}</Text>
  </TouchableOpacity>
))}

2. **Participant Selection**: Who was involved in the expense
const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);

const toggleParticipant = (participantId: string) => {
  if (selectedParticipants.includes(participantId)) {
    setSelectedParticipants(prev => prev.filter(id => id !== participantId));
  } else {
    setSelectedParticipants(prev => [...prev, participantId]);
  }
};

3. **Validation**: Ensure valid selections
const validateExpense = (): boolean => {
  if (!paidBy) {
    errors.paidBy = 'Please select who paid';
    return false;
  }
  
  if (selectedParticipants.length === 0) {
    errors.participants = 'Please select participants';
    return false;
  }
  
  return true;
};
```

### Balance Calculations

```typescript
// In calculations.ts, participants are used for:

export const calculateTourSummary = (tour: Tour): TourSummary => {
  // Initialize summary for each participant
  const participantSummaries: ParticipantSummary[] = tour.participants.map(participant => ({
    participant,
    totalPaid: 0,      // How much they paid for others
    totalOwed: 0,      // How much they should pay
    netBalance: 0,     // totalPaid - totalOwed
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

  // Calculate net balances
  participantSummaries.forEach(ps => {
    ps.netBalance = ps.totalPaid - ps.totalOwed;
  });

  return { tour, participantSummaries, totalExpenses };
};
```

## UI Patterns and Components

### 1. Participant Selection Lists

```typescript
const ParticipantSelector: React.FC<{
  participants: Participant[];
  selected: string[];
  onSelectionChange: (selected: string[]) => void;
  mode: 'single' | 'multiple';
}> = ({ participants, selected, onSelectionChange, mode }) => {
  
  const handleSelection = (participantId: string) => {
    if (mode === 'single') {
      onSelectionChange([participantId]);
    } else {
      if (selected.includes(participantId)) {
        onSelectionChange(selected.filter(id => id !== participantId));
      } else {
        onSelectionChange([...selected, participantId]);
      }
    }
  };
  
  return (
    <View style={styles.grid}>
      {participants.map(participant => (
        <TouchableOpacity
          key={participant.id}
          style={[
            styles.participantOption,
            selected.includes(participant.id) && styles.selected,
          ]}
          onPress={() => handleSelection(participant.id)}
        >
          <Avatar
            name={participant.name}
            color={participant.color}
            size={40}
          />
          <Text style={styles.participantName}>
            {participant.name}
          </Text>
          {selected.includes(participant.id) && (
            <Icon name="check-circle" size={16} color="#007AFF" />
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
};
```

### 2. Participant Grid Display

```typescript
const ParticipantsGrid: React.FC<{
  participants: Participant[];
  maxVisible?: number;
}> = ({ participants, maxVisible = 8 }) => {
  
  const visibleParticipants = participants.slice(0, maxVisible);
  const hiddenCount = Math.max(0, participants.length - maxVisible);
  
  return (
    <View style={styles.participantsGrid}>
      {visibleParticipants.map(participant => (
        <View key={participant.id} style={styles.participantItem}>
          <Avatar
            name={participant.name}
            color={participant.color}
            size={32}
          />
          <Text style={styles.participantName} numberOfLines={1}>
            {participant.name}
          </Text>
        </View>
      ))}
      
      {hiddenCount > 0 && (
        <View style={styles.moreParticipants}>
          <Text style={styles.moreText}>+{hiddenCount}</Text>
        </View>
      )}
    </View>
  );
};
```

### 3. Quick Add Participant

```typescript
const QuickAddParticipant: React.FC<{
  tourId: string;
  onAdded?: (participant: Participant) => void;
}> = ({ tourId, onAdded }) => {
  
  const [name, setName] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  
  const handleQuickAdd = async () => {
    if (!name.trim()) return;
    
    setIsAdding(true);
    
    const newParticipant: Participant = {
      id: generateId(),
      name: name.trim(),
      color: generateParticipantColor(),
    };
    
    dispatch({
      type: 'ADD_PARTICIPANT',
      payload: { tourId, participant: newParticipant },
    });
    
    setName('');
    setIsAdding(false);
    onAdded?.(newParticipant);
  };
  
  return (
    <View style={styles.quickAdd}>
      <Input
        placeholder="Add participant name"
        value={name}
        onChangeText={setName}
        onSubmitEditing={handleQuickAdd}
      />
      <Button
        title={isAdding ? '...' : 'Add'}
        onPress={handleQuickAdd}
        disabled={!name.trim() || isAdding}
        size="small"
      />
    </View>
  );
};
```

## Advanced Features

### 1. Participant Search and Filtering

```typescript
const useParticipantSearch = (participants: Participant[]) => {
  const [searchQuery, setSearchQuery] = useState('');
  
  const filteredParticipants = useMemo(() => {
    if (!searchQuery.trim()) return participants;
    
    return participants.filter(participant =>
      participant.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [participants, searchQuery]);
  
  return {
    searchQuery,
    setSearchQuery,
    filteredParticipants,
  };
};
```

### 2. Participant Statistics

```typescript
const calculateParticipantStats = (participant: Participant, tour: Tour) => {
  const participantExpenses = tour.expenses.filter(
    expense => expense.participants.includes(participant.id)
  );
  
  const paidExpenses = tour.expenses.filter(
    expense => expense.paidBy === participant.id
  );
  
  return {
    totalExpenses: participantExpenses.length,
    totalPaid: paidExpenses.reduce((sum, exp) => sum + exp.amount, 0),
    averageExpense: participantExpenses.length > 0 
      ? participantExpenses.reduce((sum, exp) => sum + exp.amount, 0) / participantExpenses.length 
      : 0,
    categories: [...new Set(participantExpenses.map(exp => exp.category))],
  };
};
```

### 3. Bulk Participant Operations

```typescript
const ParticipantBulkActions: React.FC<{
  participants: Participant[];
  tourId: string;
}> = ({ participants, tourId }) => {
  
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  
  const handleBulkDelete = () => {
    Alert.alert(
      'Delete Multiple Participants',
      `Delete ${selectedParticipants.length} participants and all related expenses?`,
      [
        { text: 'Cancel' },
        {
          text: 'Delete All',
          style: 'destructive',
          onPress: () => {
            selectedParticipants.forEach(participantId => {
              dispatch({
                type: 'DELETE_PARTICIPANT',
                payload: { tourId, participantId },
              });
            });
            setSelectedParticipants([]);
          },
        },
      ]
    );
  };
  
  return (
    <View style={styles.bulkActions}>
      {selectedParticipants.length > 0 && (
        <View style={styles.bulkActionBar}>
          <Text>{selectedParticipants.length} selected</Text>
          <Button title="Delete All" onPress={handleBulkDelete} variant="danger" />
        </View>
      )}
    </View>
  );
};
```

## Best Practices

### 1. Data Consistency
- Always update both `tours` array and `currentTour` in state
- Handle participant deletion carefully (clean up related expenses)
- Validate participant references before using them

### 2. User Experience
- Provide immediate visual feedback for selections
- Show context (which tour) when managing participants
- Offer bulk operations for efficiency

### 3. Performance
- Use `React.memo` for participant cards in long lists
- Memoize expensive calculations
- Optimize avatar rendering for large participant counts

---

**Next:** [Expense Tracking](./03-expense-tracking.md)