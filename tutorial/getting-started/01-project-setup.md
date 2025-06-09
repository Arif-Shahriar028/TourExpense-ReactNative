# Project Setup

This guide walks you through setting up the TourExpense React Native project from scratch.

## Prerequisites

Before starting, ensure you have:

- **Node.js** (>= 18.0.0)
- **React Native CLI** installed globally
- **Android Studio** (for Android development)
- **Xcode** (for iOS development, macOS only)

## Creating a New React Native Project

```bash
# Create a new React Native project with TypeScript
npx @react-native-community/cli@latest init TourExpense --template react-native-template-typescript

# Navigate to the project directory
cd TourExpense
```

## Project Structure Overview

After creation, your project will have this structure:

```
TourExpense/
├── android/                 # Android-specific files
├── ios/                     # iOS-specific files
├── src/                     # Our main source code (we'll create this)
│   ├── components/          # Reusable UI components
│   ├── screens/            # Screen components
│   ├── navigation/         # Navigation configuration
│   ├── context/           # State management
│   ├── types/             # TypeScript definitions
│   ├── utils/             # Utility functions
│   └── services/          # API and data services
├── App.tsx                 # Main app component
├── index.js               # Entry point
├── package.json           # Dependencies and scripts
└── tsconfig.json          # TypeScript configuration
```

## Initial Dependencies

The project comes with basic dependencies. We'll add more as we build features:

```json
{
  "dependencies": {
    "react": "19.1.0",
    "react-native": "0.81.1",
    "react-native-safe-area-context": "^5.5.2"
  },
  "devDependencies": {
    "@types/react": "^19.1.0",
    "@types/react-native": "^0.73.0",
    "typescript": "^5.8.3"
  }
}
```

## Creating the Source Directory

Let's create our organized source structure:

```bash
mkdir -p src/{components,screens,navigation,context,types,utils,services}
```

## Configuring TypeScript

The project comes with a basic `tsconfig.json`. We'll enhance it for better development experience:

```json
{
  "extends": "@react-native/typescript-config/tsconfig.json",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@/components/*": ["src/components/*"],
      "@/screens/*": ["src/screens/*"],
      "@/types/*": ["src/types/*"]
    },
    "strict": true,
    "noImplicitAny": true,
    "noImplicitReturns": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  },
  "include": [
    "src/**/*",
    "App.tsx",
    "index.js"
  ],
  "exclude": [
    "node_modules",
    "android",
    "ios"
  ]
}
```

## ESLint Configuration

Update `.eslintrc.js` for better code quality:

```javascript
module.exports = {
  root: true,
  extends: [
    '@react-native',
    '@typescript-eslint/recommended',
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  rules: {
    '@typescript-eslint/no-unused-vars': ['error'],
    '@typescript-eslint/explicit-function-return-type': 'off',
    'react-hooks/exhaustive-deps': 'warn',
    'react-native/no-inline-styles': 'warn',
    'react/no-unstable-nested-components': ['warn', { allowAsProps: true }],
  },
};
```

## Metro Configuration

Update `metro.config.js` for better asset handling:

```javascript
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

const config = {
  resolver: {
    alias: {
      '@': './src',
    },
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
```

## Initial App.tsx Cleanup

Replace the default `App.tsx` with a clean starting point:

```typescript
import React from 'react';
import {
  SafeAreaView,
  StatusBar,
  Text,
  StyleSheet,
} from 'react-native';

function App(): React.JSX.Element {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <Text style={styles.title}>TourExpense</Text>
      <Text style={styles.subtitle}>Group Tour Expense Tracker</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
});

export default App;
```

## Verifying the Setup

Test that everything is working:

```bash
# Install dependencies
npm install

# Check TypeScript compilation
npx tsc --noEmit

# Run linter
npm run lint

# Start Metro bundler
npm start
```

## Git Initialization

Initialize Git repository for version control:

```bash
git init
git add .
git commit -m "Initial commit: React Native project setup"
```

## Next Steps

Now that your project is set up, you can:

1. [Install and configure dependencies](./02-dependencies.md)
2. [Set up the development environment](./03-running-app.md)
3. Start building the app architecture

## Common Issues

### Node Version Compatibility
If you encounter Node version issues, make sure you're using Node 18 or higher:

```bash
node --version  # Should be >= 18.0.0
```

### Metro Cache Issues
If you encounter Metro cache issues:

```bash
npx react-native start --reset-cache
```

### TypeScript Errors
If TypeScript shows errors, ensure all type definitions are installed:

```bash
npm install --save-dev @types/react @types/react-native
```

---

**Next:** [Dependencies & Configuration](./02-dependencies.md)