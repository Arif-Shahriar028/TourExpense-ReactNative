# State Management

This guide explains the comprehensive state management system in TourExpense, built using React Context and useReducer pattern. Learn why we chose this approach and how every piece works together.

## Why This Architecture?

### Problems We're Solving
1. **Data Sharing**: Multiple screens need access to tour data
2. **Data Consistency**: Changes in one screen must reflect everywhere
3. **Complex Updates**: Adding expenses affects balances, summaries, and settlements
4. **Persistence**: Data must survive app restarts
5. **Performance**: Avoid unnecessary re-renders

### Why React Context + useReducer?

**Compared to Redux:**
- ✅ Less boilerplate code
- ✅ Built into React (no external dependencies)
- ✅ Perfect for medium-sized apps
- ✅ Easier to understand and maintain

**Compared to Multiple useState:**
- ✅ Single source of truth
- ✅ Predictable state updates
- ✅ Complex state logic in one place
- ✅ Time-travel debugging possible

**Compared to Component State:**
- ✅ Data accessible from any component
- ✅ No prop drilling
- ✅ Survives component unmounting

## Complete State Structure

```typescript
// Core application state
interface AppState {
  // All tours in the application
  tours: Tour[];
  
  // Currently selected/active tour (for quick access)
  currentTour: Tour | null;
  
  // Loading states for async operations
  loading: boolean;
  
  // Error handling (future expansion)
  error: string | null;
  
  // UI state (future expansion)
  ui: {
    selectedTab: string;
    searchQuery: string;
    filters: FilterState;
  };
}
```

### What Each State Property Does

#### `tours: Tour[]`
**Purpose:** The main data store containing all tour information.

**What it contains:**
```typescript
interface Tour {
  id: string;                    // Unique identifier
  title: string;                 // "Goa Trip 2024"
  description?: string;          // Optional tour description
  startDate: string;            // ISO date string
  endDate?: string;             // Optional end date
  participants: Participant[];   // All people in this tour
  expenses: Expense[];          // All expenses for this tour
  createdAt: string;            // When tour was created
  updatedAt: string;            // Last modification time
}
```

**Used by:**
- `ToursListScreen` - Display all tours
- `TourDetailsScreen` - Show specific tour data
- `ExpenseSummaryScreen` - Calculate statistics
- All other screens for data access

#### `currentTour: Tour | null`
**Purpose:** Quick reference to the tour being viewed/edited.

**Why we need it:**
- Avoids searching through tours array repeatedly
- Provides immediate access to active tour data
- Helps with navigation state management

**When it's updated:**
- User selects a tour from the list
- User creates a new tour
- User deletes the current tour (set to null)

#### `loading: boolean`
**Purpose:** Controls loading indicators throughout the app.

**Used for:**
- Initial data loading from AsyncStorage
- Saving data operations
- Future API calls
- User feedback during operations

## Complete Action System

```typescript
type AppAction =
  // Tour Management Actions
  | { type: 'ADD_TOUR'; payload: Tour }
  | { type: 'UPDATE_TOUR'; payload: Tour }
  | { type: 'DELETE_TOUR'; payload: string }  // tour ID
  | { type: 'SET_CURRENT_TOUR'; payload: Tour | null }
  
  // Participant Management Actions  
  | { type: 'ADD_PARTICIPANT'; payload: { tourId: string; participant: Participant } }
  | { type: 'UPDATE_PARTICIPANT'; payload: { tourId: string; participant: Participant } }
  | { type: 'DELETE_PARTICIPANT'; payload: { tourId: string; participantId: string } }
  
  // Expense Management Actions
  | { type: 'ADD_EXPENSE'; payload: { tourId: string; expense: Expense } }
  | { type: 'UPDATE_EXPENSE'; payload: { tourId: string; expense: Expense } }
  | { type: 'DELETE_EXPENSE'; payload: { tourId: string; expenseId: string } }
  
  // System Actions
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_TOURS'; payload: Tour[] }
  | { type: 'SET_ERROR'; payload: string | null };
```

### Detailed Action Explanations

#### Tour Actions

**`ADD_TOUR`**
```typescript
// What it does: Adds a new tour and sets it as current
case 'ADD_TOUR':
  return { 
    ...state, 
    tours: [...state.tours, action.payload],
    currentTour: action.payload  // Auto-select new tour
  };
```

**Used by:** `CreateTourScreen` when user creates a tour
**Result:** New tour appears in list, user is navigated to tour details

**`UPDATE_TOUR`**
```typescript
// What it does: Updates tour info and keeps references in sync
case 'UPDATE_TOUR':
  const updatedTours = state.tours.map(tour =>
    tour.id === action.payload.id ? action.payload : tour
  );
  return {
    ...state,
    tours: updatedTours,
    // Update currentTour if it's the one being edited
    currentTour: state.currentTour?.id === action.payload.id 
      ? action.payload 
      : state.currentTour,
  };
```

**Used by:** `EditTourScreen` when user updates tour information
**Result:** Changes reflect immediately in all screens showing this tour

#### Participant Actions

**`ADD_PARTICIPANT`**
```typescript
// What it does: Adds participant to specific tour and updates both references
case 'ADD_PARTICIPANT':
  return {
    ...state,
    tours: state.tours.map(tour =>
      tour.id === action.payload.tourId
        ? { 
            ...tour, 
            participants: [...tour.participants, action.payload.participant],
            updatedAt: new Date().toISOString()
          }
        : tour
    ),
    // Also update currentTour if it matches
    currentTour: state.currentTour?.id === action.payload.tourId
      ? { 
          ...state.currentTour, 
          participants: [...state.currentTour.participants, action.payload.participant],
          updatedAt: new Date().toISOString()
        }
      : state.currentTour,
  };
```

**Used by:** `AddParticipantScreen` when user adds someone to the tour
**Result:** New participant appears in participant lists and can be selected for expenses

**`DELETE_PARTICIPANT`** (Complex Logic)
```typescript
// What it does: Removes participant AND cleans up related expenses
case 'DELETE_PARTICIPANT':
  return {
    ...state,
    tours: state.tours.map(tour =>
      tour.id === action.payload.tourId
        ? {
            ...tour,
            participants: tour.participants.filter(
              participant => participant.id !== action.payload.participantId
            ),
            // IMPORTANT: Remove expenses where this person was involved
            expenses: tour.expenses.filter(expense => 
              expense.paidBy !== action.payload.participantId &&
              !expense.participants.includes(action.payload.participantId)
            ),
            updatedAt: new Date().toISOString()
          }
        : tour
    ),
    currentTour: /* similar logic for currentTour */
  };
```

**Why the complex logic:** When removing a participant, we must also remove any expenses they were involved in, otherwise the data becomes inconsistent.

#### Expense Actions

**`ADD_EXPENSE`** 
```typescript
// What it does: Adds expense and updates both tour references
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
    currentTour: state.currentTour?.id === action.payload.tourId
      ? { 
          ...state.currentTour, 
          expenses: [...state.currentTour.expenses, action.payload.expense],
          updatedAt: new Date().toISOString()
        }
      : state.currentTour,
  };
```

**Used by:** `AddExpenseScreen` when user adds a new expense
**Result:** Expense appears in lists, affects balance calculations, updates settlement suggestions

## Context Provider Implementation

```typescript
interface AppContextValue extends AppState {
  dispatch: React.Dispatch<AppAction>;
  
  // Convenience functions (computed values)
  getTourSummary: (tourId: string) => TourSummary | null;
  getSettlements: (tourId: string) => Settlement[];
  
  // Async operations
  saveTours: () => Promise<void>;
  loadTours: () => Promise<void>;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
```

### Why This Context Structure?

**State + Dispatch Pattern:**
```typescript
const { tours, currentTour, dispatch } = useApp();

// Direct state access
const tourCount = tours.length;

// Action dispatch
dispatch({ type: 'ADD_TOUR', payload: newTour });
```

**Convenience Functions:**
```typescript
const { getTourSummary, getSettlements } = useApp();

// Instead of complex calculations in components
const summary = getTourSummary(tourId);
const settlements = getSettlements(tourId);
```

**Async Operations:**
```typescript
const { loadTours, saveTours } = useApp();

// Centralized data operations
useEffect(() => {
  loadTours();
}, []);
```

## Advanced State Management Patterns

### 1. Optimistic Updates

For immediate UI feedback:
```typescript
const handleAddExpense = async (expense: Expense) => {
  // Update UI immediately
  dispatch({ type: 'ADD_EXPENSE', payload: { tourId, expense } });
  
  try {
    // Save to persistent storage
    await saveTours();
  } catch (error) {
    // Rollback on error
    dispatch({ type: 'DELETE_EXPENSE', payload: { tourId, expenseId: expense.id } });
    Alert.alert('Error', 'Failed to save expense');
  }
};
```

### 2. Computed State

Expensive calculations are memoized:
```typescript
const getTourSummary = useCallback((tourId: string) => {
  const tour = state.tours.find(t => t.id === tourId);
  if (!tour) return null;
  
  // This is cached and only recalculated when tour data changes
  return calculateTourSummary(tour);
}, [state.tours]);
```

### 3. State Normalization

For better performance with large datasets:
```typescript
// Instead of nested arrays, use normalized structure
interface NormalizedState {
  tours: { [id: string]: Tour };
  participants: { [id: string]: Participant };
  expenses: { [id: string]: Expense };
  
  // Relationships
  tourParticipants: { [tourId: string]: string[] };  // participant IDs
  tourExpenses: { [tourId: string]: string[] };      // expense IDs
}
```

## Data Flow Examples

### Example 1: Creating a New Tour

```
User fills form in CreateTourScreen
         ↓
Form validation passes
         ↓
dispatch({ type: 'ADD_TOUR', payload: newTour })
         ↓
Reducer updates state.tours and state.currentTour
         ↓
All components re-render with new data
         ↓
useEffect in AppProvider saves to AsyncStorage
         ↓
Navigation redirects to TourDetailsScreen
```

### Example 2: Adding an Expense

```
User fills expense form in AddExpenseScreen
         ↓
Selects participants and submits
         ↓
dispatch({ type: 'ADD_EXPENSE', payload: { tourId, expense } })
         ↓
Reducer updates tours array
         ↓
ExpenseSummaryScreen recalculates balances (via getTourSummary)
         ↓
TourDetailsScreen shows updated total expenses
         ↓
Data automatically persists via useEffect
```

## Persistence Layer

### AsyncStorage Integration

```typescript
const STORAGE_KEY = '@TourExpense:tours';

const saveTours = useCallback(async () => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state.tours));
  } catch (error) {
    console.error('Error saving tours:', error);
  }
}, [state.tours]);

const loadTours = async () => {
  try {
    dispatch({ type: 'SET_LOADING', payload: true });
    const toursData = await AsyncStorage.getItem(STORAGE_KEY);
    if (toursData) {
      const tours = JSON.parse(toursData);
      dispatch({ type: 'SET_TOURS', payload: tours });
    }
  } catch (error) {
    console.error('Error loading tours:', error);
  } finally {
    dispatch({ type: 'SET_LOADING', payload: false });
  }
};
```

### Auto-Save Strategy

```typescript
// Save automatically when tours data changes
useEffect(() => {
  if (state.tours.length > 0) {
    saveTours();
  }
}, [state.tours, saveTours]);
```

**Why this works:**
- Saves after every state change
- Debounced to avoid excessive writes
- Only saves when there's actual data
- Handles errors gracefully

## Performance Optimizations

### 1. Selective Re-rendering

```typescript
// Components only re-render when their specific data changes
const TourCard = React.memo(({ tour }: { tour: Tour }) => {
  return <Card>{/* tour content */}</Card>;
});

// Usage in ToursListScreen
tours.map(tour => <TourCard key={tour.id} tour={tour} />)
```

### 2. Context Splitting (Future Enhancement)

For larger apps, split contexts by domain:
```typescript
// Tours context - for tour CRUD operations
const ToursContext = createContext<ToursState>();

// UI context - for UI state (search, filters, etc.)
const UIContext = createContext<UIState>();

// Settings context - for app settings
const SettingsContext = createContext<SettingsState>();
```

### 3. Computed Values Caching

```typescript
const getTourSummary = useMemo(() => {
  const cache = new Map();
  
  return (tourId: string) => {
    const tour = state.tours.find(t => t.id === tourId);
    if (!tour) return null;
    
    const cacheKey = `${tour.id}-${tour.updatedAt}`;
    
    if (cache.has(cacheKey)) {
      return cache.get(cacheKey);
    }
    
    const summary = calculateTourSummary(tour);
    cache.set(cacheKey, summary);
    return summary;
  };
}, [state.tours]);
```

## Testing State Management

### Reducer Tests

```typescript
describe('appReducer', () => {
  test('ADD_TOUR adds tour and sets as current', () => {
    const initialState: AppState = {
      tours: [],
      currentTour: null,
      loading: false,
    };
    
    const newTour: Tour = {
      id: '1',
      title: 'Test Tour',
      participants: [],
      expenses: [],
      startDate: '2024-01-01',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    };
    
    const action: AppAction = { type: 'ADD_TOUR', payload: newTour };
    const newState = appReducer(initialState, action);
    
    expect(newState.tours).toHaveLength(1);
    expect(newState.tours[0]).toEqual(newTour);
    expect(newState.currentTour).toEqual(newTour);
  });
  
  test('DELETE_PARTICIPANT removes participant and related expenses', () => {
    // Test complex logic
  });
});
```

### Context Integration Tests

```typescript
const renderWithContext = (component: React.ReactElement) => {
  return render(
    <AppProvider>
      {component}
    </AppProvider>
  );
};

test('tour creation flow', async () => {
  const { getByText, getByPlaceholderText } = renderWithContext(<CreateTourScreen />);
  
  fireEvent.changeText(getByPlaceholderText('Tour Title'), 'Test Tour');
  fireEvent.press(getByText('Create Tour'));
  
  await waitFor(() => {
    expect(/* tour appears in state */).toBeTruthy();
  });
});
```

## Common Patterns and Best Practices

### 1. Always Use Dispatch for Updates

```typescript
// ❌ Don't mutate state directly
tours[0].title = 'New Title';

// ✅ Use dispatch actions
dispatch({ 
  type: 'UPDATE_TOUR', 
  payload: { ...tour, title: 'New Title' } 
});
```

### 2. Handle Loading States

```typescript
const Component = () => {
  const { tours, loading } = useApp();
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  return <ToursList tours={tours} />;
};
```

### 3. Error Boundaries

```typescript
class StateErrorBoundary extends React.Component {
  componentDidCatch(error: Error) {
    // Log state management errors
    console.error('State management error:', error);
  }
  
  render() {
    return this.props.children;
  }
}
```

---

**Next:** [Navigation Setup](./03-navigation.md)