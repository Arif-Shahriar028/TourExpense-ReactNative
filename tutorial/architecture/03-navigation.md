# Navigation Setup

This comprehensive guide explains the navigation architecture in TourExpense, covering React Navigation 7, type safety, nested navigators, and advanced navigation patterns.

## Why React Navigation 7?

### Key Benefits
- **Type Safety**: Full TypeScript integration with parameter validation
- **Native Performance**: Uses native navigation components
- **Flexible**: Supports complex navigation patterns
- **Widely Adopted**: Industry standard for React Native apps
- **Great DevTools**: Excellent debugging experience

### What We're Building
```
App Root
└── Stack Navigator (RootStack)
    ├── Main Tab Navigator
    │   ├── Tours Tab → ToursListScreen
    │   └── Summary Tab → ExpenseSummaryScreen
    ├── TourDetails → TourDetailsScreen
    ├── CreateTour → CreateTourScreen
    ├── EditTour → EditTourScreen
    ├── AddExpense → AddExpenseScreen
    ├── EditExpense → EditExpenseScreen
    ├── Participants → ParticipantsScreen
    └── AddParticipant → AddParticipantScreen
```

## Complete Navigation Types

```typescript
// All possible routes in the app with their parameters
export type RootStackParamList = {
  // Main tab navigator (no params needed)
  Main: undefined;
  
  // Tour-related screens
  TourDetails: { 
    tourId: string;           // Required: which tour to show
    highlightExpense?: string; // Optional: highlight specific expense
  };
  
  CreateTour: undefined;      // No params - fresh form
  
  EditTour: { 
    tourId: string;           // Required: which tour to edit
  };
  
  // Participant-related screens
  Participants: { 
    tourId: string;           // Required: which tour's participants
  };
  
  AddParticipant: { 
    tourId: string;           // Required: which tour to add participant to
    prefillName?: string;     // Optional: pre-fill participant name
  };
  
  // Expense-related screens
  AddExpense: { 
    tourId: string;           // Required: which tour to add expense to
    category?: ExpenseCategory; // Optional: pre-select category
  };
  
  EditExpense: { 
    tourId: string;           // Required: which tour
    expenseId: string;        // Required: which expense to edit
  };
  
  // Summary and analytics
  ExpenseSummary: { 
    tourId: string;           // Required: which tour to analyze
    initialTab?: 'overview' | 'expenses' | 'balances' | 'settlements';
  };
};

// Tab navigator parameters
export type MainTabParamList = {
  Tours: undefined;
  Summary: { 
    tourId?: string;          // Optional: auto-select specific tour
  };
};
```

### Why These Parameter Types?

**Required Parameters** (`tourId: string`):
- Ensures screens always have the data they need
- Prevents crashes from missing data
- Makes navigation intent explicit

**Optional Parameters** (`category?: ExpenseCategory`):
- Allows pre-filling forms for better UX
- Enables deep linking to specific states
- Supports navigation with context

## Stack Navigator Implementation

```typescript
const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Main"
        screenOptions={{
          // Global header styling
          headerStyle: {
            backgroundColor: '#007AFF',
          },
          headerTintColor: 'white',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          // Enable gestures for better UX
          gestureEnabled: true,
          // Smooth transitions
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
        }}
      >
        {/* Main Tab Navigator */}
        <Stack.Screen 
          name="Main" 
          component={MainTabs} 
          options={{ 
            headerShown: false  // Tabs handle their own headers
          }}
        />
        
        {/* Tour Management Screens */}
        <Stack.Screen 
          name="TourDetails" 
          component={TourDetailsScreen}
          options={({ route }) => ({
            title: 'Tour Details',
            // Dynamic header based on tour data
            headerRight: () => (
              <TouchableOpacity
                onPress={() => navigation.navigate('EditTour', { 
                  tourId: route.params.tourId 
                })}
              >
                <Icon name="edit" size={24} color="white" />
              </TouchableOpacity>
            ),
          })}
        />
        
        <Stack.Screen 
          name="CreateTour" 
          component={CreateTourScreen}
          options={{ 
            title: 'New Tour',
            // Presentation style for form screens
            presentation: 'modal',
          }}
        />
        
        {/* More screens... */}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
```

### Why This Stack Structure?

**Root Stack Navigator:**
- Handles all major navigation flows
- Provides consistent header styling
- Manages navigation history
- Enables deep linking

**Modal Presentation:**
- Forms (CreateTour, AddExpense) feel like overlays
- Clear visual distinction between navigation and actions
- Better user mental model

## Tab Navigator Implementation

```typescript
const Tab = createBottomTabNavigator<MainTabParamList>();

// Extracted for performance (prevents recreation on render)
const getTabIcon = (routeName: string, color: string, size: number) => {
  let iconName: string;
  
  if (routeName === 'Tours') {
    iconName = 'list';
  } else {
    iconName = 'analytics';  // Summary tab
  }
  
  return <Icon name={iconName} size={size} color={color} />;
};

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => getTabIcon(route.name, color, size),
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,  // Individual screens handle headers
        
        // Better tab bar styling
        tabBarStyle: {
          paddingBottom: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      })}
    >
      <Tab.Screen 
        name="Tours" 
        component={ToursListScreen}
        options={{
          tabBarLabel: 'Tours',
          tabBarBadge: tourCount > 0 ? tourCount : undefined,  // Show count
        }}
      />
      
      <Tab.Screen 
        name="Summary" 
        component={ExpenseSummaryScreen}
        options={{
          tabBarLabel: 'Summary',
        }}
      />
    </Tab.Navigator>
  );
}
```

### Tab Navigator Benefits

**Bottom Tabs are Perfect for:**
- Primary app sections (Tours vs Summary)
- Always-accessible functionality
- Clear visual hierarchy
- Platform-consistent behavior

**Why Two Tabs Only:**
- Keeps navigation simple
- Focuses on core functionality
- Avoids tab bar crowding
- Better mobile UX

## Type-Safe Navigation Hooks

### useNavigation Hook

```typescript
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from './AppNavigator';

// Type-safe navigation prop
type NavigationProp = StackNavigationProp<RootStackParamList, 'TourDetails'>;

const TourDetailsScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  
  const handleEditTour = (tourId: string) => {
    // TypeScript ensures we pass correct parameters
    navigation.navigate('EditTour', { tourId });  ✅
    
    // This would cause TypeScript error:
    // navigation.navigate('EditTour', { wrongParam: 'value' });  ❌
  };
  
  const handleAddExpense = (tourId: string, category?: ExpenseCategory) => {
    navigation.navigate('AddExpense', { 
      tourId,
      category,  // Optional parameter
    });
  };
  
  return (
    <View>
      <Button title="Edit Tour" onPress={() => handleEditTour(tour.id)} />
      <Button title="Add Food Expense" onPress={() => handleAddExpense(tour.id, 'Food')} />
    </View>
  );
};
```

### useRoute Hook

```typescript
import { useRoute, RouteProp } from '@react-navigation/native';

type RouteProps = RouteProp<RootStackParamList, 'TourDetails'>;

const TourDetailsScreen: React.FC = () => {
  const route = useRoute<RouteProps>();
  
  // TypeScript knows exactly what parameters are available
  const { tourId, highlightExpense } = route.params;
  
  // Optional parameter handling
  useEffect(() => {
    if (highlightExpense) {
      // Scroll to and highlight specific expense
      scrollToExpense(highlightExpense);
    }
  }, [highlightExpense]);
  
  return (
    <View>
      {/* Component content */}
    </View>
  );
};
```

## Advanced Navigation Patterns

### 1. Deep Linking

```typescript
// Configure deep links
const linking = {
  prefixes: ['tourexpense://'],
  config: {
    screens: {
      Main: {
        screens: {
          Tours: 'tours',
          Summary: 'summary',
        },
      },
      TourDetails: 'tour/:tourId',
      AddExpense: 'tour/:tourId/add-expense',
      ExpenseSummary: 'tour/:tourId/summary',
    },
  },
};

// Usage in NavigationContainer
<NavigationContainer linking={linking}>
  <Stack.Navigator>
    {/* screens */}
  </Stack.Navigator>
</NavigationContainer>
```

**URL Examples:**
- `tourexpense://tours` → Tours list
- `tourexpense://tour/123` → Tour details for tour 123
- `tourexpense://tour/123/add-expense` → Add expense form for tour 123

### 2. Navigation with State Updates

```typescript
const handleCreateTour = async (tourData: CreateTourData) => {
  try {
    // Create tour in state
    dispatch({ type: 'ADD_TOUR', payload: newTour });
    
    // Navigate with success feedback
    navigation.navigate('TourDetails', { tourId: newTour.id });
    
    // Optional: Show success message
    navigation.setOptions({
      headerTitle: `${newTour.title} Created!`,
    });
    
  } catch (error) {
    // Handle error without navigation
    Alert.alert('Error', 'Failed to create tour');
  }
};
```

### 3. Conditional Navigation

```typescript
const handleExpenseAction = (tourId: string) => {
  const tour = tours.find(t => t.id === tourId);
  
  if (!tour) {
    Alert.alert('Error', 'Tour not found');
    return;
  }
  
  if (tour.participants.length === 0) {
    // Navigate to add participants first
    navigation.navigate('AddParticipant', { tourId });
  } else {
    // Go straight to add expense
    navigation.navigate('AddExpense', { tourId });
  }
};
```

### 4. Navigation Guards

```typescript
const useNavigationGuard = () => {
  const { currentTour } = useApp();
  const navigation = useNavigation();
  
  const navigateToTourScreen = (
    screenName: keyof RootStackParamList,
    params: any
  ) => {
    if (!currentTour) {
      Alert.alert(
        'No Tour Selected',
        'Please select a tour first.',
        [
          { text: 'OK', onPress: () => navigation.navigate('Main') }
        ]
      );
      return;
    }
    
    navigation.navigate(screenName as any, params);
  };
  
  return { navigateToTourScreen };
};
```

## Navigation State Management

### 1. Navigation State in Context

```typescript
interface NavigationState {
  currentScreen: string;
  previousScreen: string;
  navigationHistory: string[];
}

const NavigationContext = createContext<NavigationState>();

// Track navigation in provider
export const NavigationProvider = ({ children }: { children: ReactNode }) => {
  const [navState, setNavState] = useState<NavigationState>({
    currentScreen: 'Main',
    previousScreen: '',
    navigationHistory: ['Main'],
  });
  
  return (
    <NavigationContext.Provider value={navState}>
      {children}
    </NavigationContext.Provider>
  );
};
```

### 2. Navigation Analytics

```typescript
const navigationRef = useNavigationContainerRef();

const onStateChange = (state: NavigationState | undefined) => {
  if (state) {
    const currentRoute = getCurrentRoute(state);
    
    // Track screen views
    analytics.trackScreenView(currentRoute.name, currentRoute.params);
    
    // Track navigation patterns
    analytics.trackNavigation({
      from: previousRoute?.name,
      to: currentRoute.name,
      timestamp: Date.now(),
    });
  }
};

return (
  <NavigationContainer
    ref={navigationRef}
    onStateChange={onStateChange}
  >
    {/* navigators */}
  </NavigationContainer>
);
```

## Screen-Specific Navigation Patterns

### 1. Form Screens (Create/Edit)

```typescript
const CreateTourScreen = () => {
  const navigation = useNavigation();
  
  const handleSubmit = async (formData: TourFormData) => {
    try {
      const newTour = await createTour(formData);
      
      // Success: Navigate to tour details
      navigation.replace('TourDetails', { tourId: newTour.id });
      
    } catch (error) {
      // Stay on form, show error
      Alert.alert('Error', 'Failed to create tour');
    }
  };
  
  const handleCancel = () => {
    // Check for unsaved changes
    if (hasUnsavedChanges) {
      Alert.alert(
        'Unsaved Changes',
        'Are you sure you want to leave? Your changes will be lost.',
        [
          { text: 'Stay', style: 'cancel' },
          { text: 'Leave', onPress: () => navigation.goBack() },
        ]
      );
    } else {
      navigation.goBack();
    }
  };
  
  // Handle hardware back button
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        handleCancel();
        return true; // Prevent default back behavior
      };
      
      BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, [hasUnsavedChanges])
  );
};
```

### 2. List Screens (Tours, Participants)

```typescript
const ToursListScreen = () => {
  const navigation = useNavigation();
  
  const handleTourPress = (tour: Tour) => {
    // Set as current tour and navigate
    dispatch({ type: 'SET_CURRENT_TOUR', payload: tour });
    navigation.navigate('TourDetails', { tourId: tour.id });
  };
  
  const handleCreateTour = () => {
    navigation.navigate('CreateTour');
  };
  
  // Pull to refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadTours();
    setRefreshing(false);
  }, []);
  
  return (
    <FlatList
      data={tours}
      renderItem={({ item }) => (
        <TourCard 
          tour={item} 
          onPress={() => handleTourPress(item)}
        />
      )}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    />
  );
};
```

### 3. Detail Screens (Tour Details, Expense Summary)

```typescript
const TourDetailsScreen = () => {
  const route = useRoute<RouteProp<RootStackParamList, 'TourDetails'>>();
  const navigation = useNavigation();
  
  const { tourId, highlightExpense } = route.params;
  
  // Navigation actions
  const navigationActions = [
    {
      title: 'Add Expense',
      icon: 'add-circle',
      onPress: () => navigation.navigate('AddExpense', { tourId }),
      color: '#34C759',
    },
    {
      title: 'Manage Participants',
      icon: 'people',
      onPress: () => navigation.navigate('Participants', { tourId }),
      color: '#007AFF',
    },
    {
      title: 'View Summary',
      icon: 'analytics',
      onPress: () => navigation.navigate('ExpenseSummary', { tourId }),
      color: '#FF9500',
    },
  ];
  
  return (
    <ScrollView>
      <TourHeader tour={tour} />
      <QuickActions actions={navigationActions} />
      <RecentExpenses 
        expenses={tour.expenses} 
        onExpensePress={(expense) => 
          navigation.navigate('EditExpense', { 
            tourId, 
            expenseId: expense.id 
          })
        }
      />
    </ScrollView>
  );
};
```

## Navigation Testing

### 1. Navigation Flow Tests

```typescript
import { NavigationContainer } from '@react-navigation/native';
import { render, fireEvent } from '@testing-library/react-native';

const renderWithNavigation = (component: React.ReactElement) => {
  return render(
    <NavigationContainer>
      <AppProvider>
        {component}
      </AppProvider>
    </NavigationContainer>
  );
};

test('tour creation navigates to tour details', async () => {
  const { getByText, getByPlaceholderText } = renderWithNavigation(<AppNavigator />);
  
  // Navigate to create tour
  fireEvent.press(getByText('Create Tour'));
  
  // Fill form
  fireEvent.changeText(getByPlaceholderText('Tour Title'), 'Test Tour');
  
  // Submit
  fireEvent.press(getByText('Create Tour'));
  
  // Should navigate to tour details
  await waitFor(() => {
    expect(getByText('Tour Details')).toBeTruthy();
  });
});
```

### 2. Parameter Validation Tests

```typescript
test('tour details screen handles invalid tour id', () => {
  const navigation = createMockNavigation();
  const route = createMockRoute({ 
    params: { tourId: 'nonexistent' } 
  });
  
  const { getByText } = render(
    <TourDetailsScreen navigation={navigation} route={route} />
  );
  
  expect(getByText('Tour not found')).toBeTruthy();
});
```

## Common Navigation Patterns

### 1. Replace vs Push

```typescript
// Use 'replace' for login flows, form completion
navigation.replace('TourDetails', { tourId });

// Use 'navigate' for normal navigation
navigation.navigate('AddExpense', { tourId });

// Use 'push' to add same screen to stack
navigation.push('TourDetails', { tourId: 'different-id' });
```

### 2. Stack Manipulation

```typescript
// Go back to specific screen
navigation.popToTop();  // Go to root of stack
navigation.pop(2);      // Go back 2 screens

// Reset entire stack
navigation.reset({
  index: 0,
  routes: [{ name: 'Main' }],
});
```

### 3. Cross-Tab Navigation

```typescript
// Navigate from Tours tab to Summary tab with data
const navigateToSummary = (tourId: string) => {
  navigation.navigate('Main', {
    screen: 'Summary',
    params: { tourId },
  });
};
```

---

**Next:** [Data Models](./04-data-models.md)