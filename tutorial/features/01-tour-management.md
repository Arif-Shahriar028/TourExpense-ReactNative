# Tour Management

This guide explains how the tour management system works in the TourExpense app, including creation, editing, and organization of tours.

## Overview

The tour management system allows users to:
- Create multiple tours for different trips
- Edit tour details (title, dates, description)
- View tour summaries and statistics
- Delete tours when no longer needed
- Navigate between tours seamlessly

## Core Components

### 1. Tours List Screen (`ToursListScreen.tsx`)

**Purpose:** Main screen showing all tours with quick statistics.

**Key Features:**
- Grid/list view of all tours
- Quick stats per tour (total expenses, participant count)
- Search and filter capabilities
- "Create Tour" button
- Empty state when no tours exist

**Code Structure:**
```typescript
const ToursListScreen: React.FC = () => {
  const { tours, loading } = useApp();
  const navigation = useNavigation<NavigationProp>();

  const renderTourItem = ({ item }: { item: Tour }) => (
    <Card>
      {/* Tour preview with stats */}
    </Card>
  );

  return (
    <SafeAreaView>
      <FlatList
        data={tours}
        renderItem={renderTourItem}
        ListEmptyComponent={renderEmptyState}
      />
    </SafeAreaView>
  );
};
```

**UI Elements:**
- Header with app title and "Add Tour" button
- List of tour cards with:
  - Tour title and date range
  - Total expense amount
  - Participant count and avatars
  - Quick navigation to tour details

### 2. Create Tour Screen (`CreateTourScreen.tsx`)

**Purpose:** Form to create new tours with validation.

**Form Fields:**
- **Tour Title** (required) - Name of the trip
- **Description** (optional) - Brief trip description  
- **Start Date** (required) - When the tour begins
- **End Date** (optional) - When the tour ends

**Validation Rules:**
```typescript
const validateForm = (): boolean => {
  const newErrors: Record<string, string> = {};

  if (!formData.title.trim()) {
    newErrors.title = 'Tour title is required';
  }

  if (formData.endDate && formData.endDate < formData.startDate) {
    newErrors.endDate = 'End date must be after start date';
  }

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};
```

**Success Flow:**
1. User fills form and submits
2. Validation passes
3. New tour is created with unique ID
4. User is redirected to add participants or view tour
5. Tour appears in tours list

### 3. Tour Details Screen (`TourDetailsScreen.tsx`)

**Purpose:** Comprehensive overview of a single tour.

**Sections:**

#### Header Section
- Tour title, dates, description
- Edit button for tour details
- Quick statistics (total expenses, participants, expense count)

#### Action Buttons
- **Manage Participants** - Add/remove people
- **Add Expense** - Quick expense entry
- **View Summary** - Analytics and reports

#### Recent Expenses
- Last 3 expenses with:
  - Category icon and color
  - Expense title and amount
  - Who paid
  - Quick edit access

#### Participants Grid
- Avatar grid of all participants
- Quick access to participant management

**Code Structure:**
```typescript
const TourDetailsScreen: React.FC = () => {
  const { tours, dispatch, getTourSummary } = useApp();
  const route = useRoute<RouteProps>();
  
  const { tourId } = route.params;
  const tour = tours.find(t => t.id === tourId);
  const summary = getTourSummary(tourId);

  if (!tour) {
    return <ErrorState />;
  }

  return (
    <ScrollView>
      <TourHeader tour={tour} />
      <QuickStats summary={summary} />
      <ActionButtons tourId={tourId} />
      <RecentExpenses tour={tour} />
      <ParticipantsGrid tour={tour} />
      <DeleteButton tourId={tourId} />
    </ScrollView>
  );
};
```

### 4. Edit Tour Screen (`EditTourScreen.tsx`)

**Purpose:** Edit existing tour information.

**Features:**
- Pre-populated form with current tour data
- Same validation as create tour
- Save changes or cancel
- Updates reflected immediately across app

## Data Flow

### Tour Creation
```
CreateTourScreen → Form Validation → Generate ID → Dispatch Action → State Update → Navigation
```

### Tour Updates
```
EditTourScreen → Form Validation → Dispatch Action → State Update → Navigation Back
```

### Tour Deletion
```
TourDetailsScreen → Confirmation Alert → Dispatch Action → State Update → Navigation Back
```

## State Management

### Tour Actions
```typescript
type AppAction =
  | { type: 'ADD_TOUR'; payload: Tour }
  | { type: 'UPDATE_TOUR'; payload: Tour }
  | { type: 'DELETE_TOUR'; payload: string }
  | { type: 'SET_CURRENT_TOUR'; payload: Tour | null };
```

### Tour Reducer Logic
```typescript
case 'ADD_TOUR':
  return { 
    ...state, 
    tours: [...state.tours, action.payload],
    currentTour: action.payload 
  };

case 'UPDATE_TOUR':
  const updatedTours = state.tours.map(tour =>
    tour.id === action.payload.id ? action.payload : tour
  );
  return {
    ...state,
    tours: updatedTours,
    currentTour: state.currentTour?.id === action.payload.id 
      ? action.payload 
      : state.currentTour,
  };
```

## Data Persistence

### AsyncStorage Integration
- Tours automatically saved on every change
- Data loaded on app startup
- No internet connection required

```typescript
const saveTours = useCallback(async () => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state.tours));
  } catch (error) {
    console.error('Error saving tours:', error);
  }
}, [state.tours]);
```

## UI Design Patterns

### Tour Cards
```typescript
<Card style={styles.tourCard}>
  <View style={styles.tourHeader}>
    <View style={styles.tourInfo}>
      <Text style={styles.tourTitle}>{tour.title}</Text>
      <Text style={styles.tourDate}>
        {formatDate(tour.startDate)}
        {tour.endDate && ` - ${formatDate(tour.endDate)}`}
      </Text>
    </View>
    <View style={styles.tourStats}>
      <Text style={styles.totalAmount}>
        {formatCurrency(totalExpenses)}
      </Text>
      <Text style={styles.expenseCount}>
        {tour.expenses.length} expenses
      </Text>
    </View>
  </View>
  
  <View style={styles.participantsContainer}>
    <ParticipantAvatars participants={tour.participants} />
    <Text style={styles.participantCount}>
      {tour.participants.length} participants
    </Text>
  </View>
</Card>
```

### Empty States
```typescript
const renderEmptyState = () => (
  <View style={styles.emptyState}>
    <Icon name="airplanemode-on" size={80} color="#E1E1E1" />
    <Text style={styles.emptyTitle}>No Tours Yet</Text>
    <Text style={styles.emptySubtitle}>
      Create your first tour to start tracking expenses
    </Text>
    <Button
      title="Create Tour"
      onPress={() => navigation.navigate('CreateTour')}
    />
  </View>
);
```

## Navigation Flow

### Tour Management Flow
```
Tours List → Create Tour → Add Participants → Tour Details → Add Expenses → Summary
     ↓              ↓            ↓               ↓             ↓           ↓
Edit Tour ← ← ← Edit Tour ← ← ← Edit Participants ← ← Edit Expense ← ← View Analytics
```

### Navigation Implementation
```typescript
// Type-safe navigation
type RootStackParamList = {
  Main: undefined;
  TourDetails: { tourId: string };
  CreateTour: undefined;
  EditTour: { tourId: string };
};

// Usage in components
const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
navigation.navigate('TourDetails', { tourId: tour.id });
```

## Validation & Error Handling

### Form Validation
```typescript
const validateTour = (tourData: Partial<Tour>): ValidationErrors => {
  const errors: ValidationErrors = {};
  
  if (!tourData.title?.trim()) {
    errors.title = 'Tour title is required';
  }
  
  if (tourData.title && tourData.title.length > 100) {
    errors.title = 'Tour title must be less than 100 characters';
  }
  
  return errors;
};
```

### Error States
- Form validation errors with inline messages
- Network error handling (future)
- Data loading states
- Empty states with helpful actions

## Advanced Features

### Tour Statistics
```typescript
const calculateTourStats = (tour: Tour) => ({
  totalExpenses: tour.expenses.reduce((sum, exp) => sum + exp.amount, 0),
  expenseCount: tour.expenses.length,
  participantCount: tour.participants.length,
  averagePerPerson: totalExpenses / tour.participants.length || 0,
  dateRange: formatDateRange(tour.startDate, tour.endDate),
});
```

### Search and Filtering
```typescript
const filteredTours = tours.filter(tour => {
  const matchesSearch = tour.title.toLowerCase().includes(searchQuery.toLowerCase());
  const matchesDateRange = isWithinDateRange(tour.startDate, dateFilter);
  return matchesSearch && matchesDateRange;
});
```

### Bulk Operations
- Select multiple tours
- Bulk delete
- Export tour data
- Archive completed tours

## Testing Considerations

### Unit Tests
- Tour validation logic
- Date formatting functions
- Statistics calculations
- State reducer logic

### Integration Tests
- Tour creation flow
- Navigation between screens
- Data persistence
- Form submissions

### E2E Tests
- Complete tour management workflow
- Cross-screen data consistency
- Error handling flows

---

**Next:** [Participant Management](./02-participant-management.md)