# Project Structure

This guide explains the organized structure of the TourExpense app and the reasoning behind each directory and file.

## Overall Structure

```
TourExpense/
├── src/                     # Main source code
│   ├── components/          # Reusable UI components
│   ├── screens/            # Screen components
│   ├── navigation/         # Navigation configuration
│   ├── context/           # State management (React Context)
│   ├── types/             # TypeScript type definitions
│   ├── utils/             # Utility functions and helpers
│   └── services/          # External services (future use)
├── tutorial/              # This documentation
├── App.tsx               # Root app component
├── index.js              # Entry point
└── package.json          # Dependencies and scripts
```

## Directory Breakdown

### 📁 `src/components/`

**Purpose:** Reusable UI components that can be used across multiple screens.

```
components/
├── Avatar.tsx           # User avatar with initials
├── Button.tsx           # Custom button component
├── Card.tsx            # Container component with shadow
└── Input.tsx           # Text input with label and validation
```

**Design Principles:**
- Each component is self-contained
- Props are typed with TypeScript interfaces
- Consistent styling patterns
- Reusable across different screens

**Example Structure:**
```typescript
// components/Button.tsx
interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  // ... other props
}

const Button: React.FC<ButtonProps> = ({ title, onPress, variant = 'primary' }) => {
  // Component implementation
};
```

### 📁 `src/screens/`

**Purpose:** Screen components that represent full pages in the app.

```
screens/
├── ToursListScreen.tsx      # Main tour list with overview
├── CreateTourScreen.tsx     # Form to create new tours
├── EditTourScreen.tsx       # Form to edit existing tours
├── TourDetailsScreen.tsx    # Detailed tour view
├── ParticipantsScreen.tsx   # Manage tour participants
├── AddParticipantScreen.tsx # Add new participants
├── AddExpenseScreen.tsx     # Add new expenses
├── EditExpenseScreen.tsx    # Edit existing expenses
└── ExpenseSummaryScreen.tsx # Analytics and summaries
```

**Screen Organization:**
- Each screen handles one main functionality
- Screens use shared components from `components/`
- Navigation between screens is type-safe
- State is managed through React Context

### 📁 `src/navigation/`

**Purpose:** Navigation configuration and type definitions.

```
navigation/
└── AppNavigator.tsx     # Main navigation setup
```

**Navigation Structure:**
```typescript
// Type-safe navigation parameters
export type RootStackParamList = {
  Main: undefined;
  TourDetails: { tourId: string };
  CreateTour: undefined;
  // ... other routes
};

// Nested navigators
Stack Navigator (Main)
├── Tab Navigator
│   ├── Tours Tab
│   └── Summary Tab
├── Tour Details
├── Create Tour
└── ... other screens
```

### 📁 `src/context/`

**Purpose:** Global state management using React Context and useReducer.

```
context/
└── AppContext.tsx       # Main app state and actions
```

**State Management Pattern:**
```typescript
// State structure
interface AppState {
  tours: Tour[];
  currentTour: Tour | null;
  loading: boolean;
}

// Action types
type AppAction =
  | { type: 'ADD_TOUR'; payload: Tour }
  | { type: 'UPDATE_TOUR'; payload: Tour }
  // ... other actions

// Context provides state and dispatch
const AppContext = createContext<AppContextValue | undefined>(undefined);
```

### 📁 `src/types/`

**Purpose:** TypeScript type definitions and interfaces.

```
types/
└── index.ts            # All app types and interfaces
```

**Core Types:**
```typescript
// Main data models
export interface Tour {
  id: string;
  title: string;
  participants: Participant[];
  expenses: Expense[];
  // ... other properties
}

export interface Participant {
  id: string;
  name: string;
  color: string;
}

export interface Expense {
  id: string;
  title: string;
  amount: number;
  paidBy: string;
  participants: string[];
  category: ExpenseCategory;
  // ... other properties
}
```

### 📁 `src/utils/`

**Purpose:** Utility functions, helpers, and calculations.

```
utils/
└── calculations.ts     # Expense calculations and helpers
```

**Key Utilities:**
- `calculateTourSummary()` - Calculate balances and statistics
- `calculateSettlements()` - Optimize payment settlements
- `formatCurrency()` - Format amounts for display
- `generateId()` - Generate unique IDs
- Helper functions for dates, colors, etc.

### 📁 `src/services/` (Future)

**Purpose:** External API calls and data services (currently unused but prepared for future features).

```
services/
├── api.ts              # API client configuration
├── storage.ts          # AsyncStorage helpers
└── sync.ts             # Cloud sync functionality
```

## File Naming Conventions

### Components and Screens
- **PascalCase** for component files: `Button.tsx`, `ToursListScreen.tsx`
- Components export as default: `export default Button`
- Screens include "Screen" suffix for clarity

### Utilities and Services
- **camelCase** for utility files: `calculations.ts`, `storage.ts`
- Named exports: `export const calculateTotal = () => {}`

### Types and Interfaces
- **PascalCase** for interfaces: `interface Tour`, `type ExpenseCategory`
- All types in single `index.ts` file for easy importing

## Import/Export Patterns

### Absolute Imports (with path aliases)
```typescript
// Instead of relative imports
import Button from '../../../components/Button';

// Use absolute imports
import Button from '@/components/Button';
import { Tour, Expense } from '@/types';
```

### Barrel Exports
```typescript
// types/index.ts - Single export point
export type { Tour, Participant, Expense };
export type { ExpenseCategory, Settlement };
export { EXPENSE_CATEGORIES, CATEGORY_ICONS } from './constants';
```

### Component Exports
```typescript
// Default exports for components
export default Button;

// Named exports for utilities
export const calculateTotal = () => {};
export const formatCurrency = () => {};
```

## Code Organization Principles

### 1. **Single Responsibility**
Each file has one clear purpose:
- Components handle UI rendering
- Screens handle page logic
- Utils handle calculations
- Context handles state

### 2. **Consistent Patterns**
- All components follow same structure
- Props are always typed
- Error handling is consistent
- Styling patterns are uniform

### 3. **Scalability**
Structure supports easy addition of:
- New screens and components
- Additional features
- External integrations
- Testing files

### 4. **Type Safety**
- All props and data are typed
- Navigation is type-safe
- State actions are typed
- API responses will be typed

## Adding New Features

When adding new functionality:

### 1. **New Screen:**
```bash
# Create screen file
touch src/screens/NewFeatureScreen.tsx

# Add to navigation types
# Update AppNavigator.tsx
# Add navigation from existing screens
```

### 2. **New Component:**
```bash
# Create component file
touch src/components/NewComponent.tsx

# Follow component interface pattern
# Add to screens that need it
```

### 3. **New Data Type:**
```typescript
// Add to src/types/index.ts
export interface NewDataType {
  id: string;
  // ... properties
}

// Update state and actions if needed
```

### 4. **New Utility:**
```typescript
// Add to src/utils/calculations.ts or new file
export const newUtilityFunction = () => {
  // Implementation
};
```

## Benefits of This Structure

### ✅ **Maintainability**
- Clear separation of concerns
- Easy to find and modify code
- Consistent patterns

### ✅ **Scalability**
- Easy to add new features
- Structure supports growth
- No major refactoring needed

### ✅ **Developer Experience**
- TypeScript provides excellent intellisense
- Clear file organization
- Easy navigation in IDE

### ✅ **Testing**
- Each file can be tested independently
- Clear interfaces for mocking
- Utility functions are pure

### ✅ **Collaboration**
- New developers can quickly understand structure
- Code reviews are easier
- Consistent patterns across team

---

**Next:** [State Management](./02-state-management.md)