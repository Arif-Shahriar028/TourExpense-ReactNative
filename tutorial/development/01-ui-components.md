# UI Components

This guide explains the reusable UI components in the TourExpense app and how to use them effectively.

## Component Library Overview

The app uses a consistent set of reusable components that follow Material Design principles and maintain visual consistency across all screens.

## Core Components

### 1. Button Component

**File:** `src/components/Button.tsx`

**Purpose:** Consistent button styling with multiple variants and states.

#### Props Interface
```typescript
interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}
```

#### Usage Examples
```typescript
// Primary button (default)
<Button
  title="Create Tour"
  onPress={handleCreateTour}
/>

// Secondary button
<Button
  title="Cancel"
  variant="secondary"
  onPress={handleCancel}
/>

// Danger button for destructive actions
<Button
  title="Delete Tour"
  variant="danger"
  onPress={handleDelete}
/>

// Loading state
<Button
  title="Saving..."
  loading={isSaving}
  disabled={isSaving}
  onPress={handleSave}
/>

// Different sizes
<Button title="Small" size="small" onPress={handlePress} />
<Button title="Large" size="large" onPress={handlePress} />
```

#### Styling Variants
- **Primary**: Blue background, white text (main actions)
- **Secondary**: Transparent background, blue border and text (secondary actions)
- **Danger**: Red background, white text (destructive actions)

### 2. Card Component

**File:** `src/components/Card.tsx`

**Purpose:** Container component with consistent padding, border radius, and shadow.

#### Props Interface
```typescript
interface CardProps {
  children: ReactNode;
  style?: ViewStyle;
  elevated?: boolean;
}
```

#### Usage Examples
```typescript
// Basic card
<Card>
  <Text>Card content</Text>
</Card>

// Card without elevation
<Card elevated={false}>
  <Text>Flat card</Text>
</Card>

// Card with custom styling
<Card style={{ marginBottom: 20 }}>
  <Text>Custom styled card</Text>
</Card>
```

#### Styling Features
- 16px padding
- 16px border radius
- Subtle shadow for elevation
- White background
- 8px vertical margin

### 3. Input Component

**File:** `src/components/Input.tsx`

**Purpose:** Text input with label, validation, and consistent styling.

#### Props Interface
```typescript
interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
}
```

#### Usage Examples
```typescript
// Basic input with label
<Input
  label="Tour Title"
  placeholder="Enter tour name"
  value={title}
  onChangeText={setTitle}
/>

// Input with validation error
<Input
  label="Email"
  placeholder="your@email.com"
  value={email}
  onChangeText={setEmail}
  error={emailError}
/>

// Multiline input
<Input
  label="Description"
  placeholder="Tour description"
  value={description}
  onChangeText={setDescription}
  multiline
  numberOfLines={3}
/>

// Custom styling
<Input
  label="Amount"
  placeholder="0.00"
  keyboardType="numeric"
  containerStyle={{ marginBottom: 20 }}
/>
```

#### Styling Features
- Label above input field
- Border that changes color on focus
- Error state with red border and error text
- 16px horizontal padding
- 14px vertical padding

### 4. Avatar Component

**File:** `src/components/Avatar.tsx`

**Purpose:** User avatar displaying initials with customizable color and size.

#### Props Interface
```typescript
interface AvatarProps {
  name: string;
  color: string;
  size?: number;
}
```

#### Usage Examples
```typescript
// Default avatar (40px)
<Avatar
  name="John Doe"
  color="#007AFF"
/>

// Large avatar
<Avatar
  name="Jane Smith"
  color="#FF6B6B"
  size={60}
/>

// Small avatar for lists
<Avatar
  name="Mike Johnson"
  color="#34C759"
  size={24}
/>
```

#### Features
- Extracts initials from name (up to 2 characters)
- Circular design
- Customizable background color
- Responsive text size based on avatar size
- White text color for contrast

## Component Design Patterns

### 1. Consistent Props Interface

All components follow TypeScript interface patterns:
```typescript
interface ComponentProps {
  // Required props first
  requiredProp: string;
  
  // Optional props with defaults
  optionalProp?: string;
  
  // Style overrides
  style?: ViewStyle;
  
  // Event handlers
  onPress?: () => void;
}
```

### 2. Style Composition

Components support style overrides:
```typescript
const Component: React.FC<Props> = ({ style, ...props }) => (
  <View style={[styles.default, style]}>
    {/* Component content */}
  </View>
);
```

### 3. Accessibility

All components include accessibility features:
```typescript
<TouchableOpacity
  accessible
  accessibilityLabel="Create new tour"
  accessibilityRole="button"
  onPress={onPress}
>
  <Text>Create Tour</Text>
</TouchableOpacity>
```

## Advanced Usage Patterns

### 1. Compound Components

Some screens use compound component patterns:
```typescript
// ExpenseForm compound component
<ExpenseForm onSubmit={handleSubmit}>
  <ExpenseForm.Title value={title} onChange={setTitle} />
  <ExpenseForm.Amount value={amount} onChange={setAmount} />
  <ExpenseForm.Category value={category} onChange={setCategory} />
  <ExpenseForm.Participants 
    selected={participants} 
    onChange={setParticipants} 
  />
</ExpenseForm>
```

### 2. Render Props Pattern

For flexible component composition:
```typescript
<DataProvider tourId={tourId}>
  {({ tour, loading, error }) => {
    if (loading) return <LoadingSpinner />;
    if (error) return <ErrorMessage error={error} />;
    return <TourDetails tour={tour} />;
  }}
</DataProvider>
```

### 3. Higher-Order Components

For common functionality:
```typescript
const withLoading = <P extends object>(
  Component: React.ComponentType<P>
) => {
  return (props: P & { loading?: boolean }) => {
    if (props.loading) return <LoadingSpinner />;
    return <Component {...props} />;
  };
};

const TourDetailsWithLoading = withLoading(TourDetails);
```

## Styling System

### 1. Theme Configuration

```typescript
// src/styles/theme.ts
export const theme = {
  colors: {
    primary: '#007AFF',
    secondary: '#34C759',
    danger: '#FF3B30',
    warning: '#FF9500',
    text: '#333333',
    textSecondary: '#666666',
    background: '#F5F5F5',
    surface: '#FFFFFF',
    border: '#E1E1E1',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  typography: {
    title: { fontSize: 24, fontWeight: 'bold' },
    subtitle: { fontSize: 18, fontWeight: '600' },
    body: { fontSize: 16, fontWeight: 'normal' },
    caption: { fontSize: 12, fontWeight: 'normal' },
  },
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
  },
};
```

### 2. Consistent Spacing

Using spacing scale throughout components:
```typescript
const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.md, // 16px
    margin: theme.spacing.sm,  // 8px
  },
  title: {
    ...theme.typography.title,
    marginBottom: theme.spacing.sm,
  },
});
```

### 3. Responsive Design

Components adapt to different screen sizes:
```typescript
const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    padding: width > 600 ? theme.spacing.lg : theme.spacing.md,
  },
});
```

## Component Testing

### Unit Tests Example
```typescript
import { render, fireEvent } from '@testing-library/react-native';
import Button from '../Button';

describe('Button Component', () => {
  test('renders title correctly', () => {
    const { getByText } = render(
      <Button title="Test Button" onPress={() => {}} />
    );
    expect(getByText('Test Button')).toBeTruthy();
  });

  test('calls onPress when pressed', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <Button title="Test Button" onPress={onPress} />
    );
    
    fireEvent.press(getByText('Test Button'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  test('shows loading state', () => {
    const { getByTestId } = render(
      <Button 
        title="Test Button" 
        onPress={() => {}} 
        loading={true}
      />
    );
    expect(getByTestId('loading-indicator')).toBeTruthy();
  });
});
```

## Creating New Components

### 1. Component Template

```typescript
import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';

interface NewComponentProps {
  // Define props
  children: React.ReactNode;
  style?: ViewStyle;
}

const NewComponent: React.FC<NewComponentProps> = ({
  children,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // Default styles
  },
});

export default NewComponent;
```

### 2. Best Practices

- **Type everything** with TypeScript interfaces
- **Support style overrides** for flexibility
- **Include accessibility** props
- **Follow naming conventions** (PascalCase for components)
- **Write tests** for component behavior
- **Document props** with JSDoc comments

```typescript
interface ComponentProps {
  /**
   * The title to display in the component
   */
  title: string;
  
  /**
   * Callback fired when component is pressed
   */
  onPress: () => void;
  
  /**
   * Visual variant of the component
   * @default 'primary'
   */
  variant?: 'primary' | 'secondary';
}
```

---

**Next:** [Screen Development](./02-screen-development.md)