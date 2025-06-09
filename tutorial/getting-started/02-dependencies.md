# Dependencies & Configuration

This guide covers all the dependencies needed for the TourExpense app and their configuration.

## Core Dependencies

### Navigation Dependencies

```bash
npm install @react-navigation/native @react-navigation/stack @react-navigation/bottom-tabs
```

**Platform-specific navigation dependencies:**

```bash
npm install react-native-screens react-native-safe-area-context react-native-gesture-handler react-native-reanimated
```

### UI and Styling Dependencies

```bash
npm install react-native-vector-icons
```

### Data Storage

```bash
npm install @react-native-async-storage/async-storage
```

### Development Dependencies

```bash
npm install --save-dev @types/react-native-vector-icons
```

## Complete Package.json

After installing all dependencies, your `package.json` should include:

```json
{
  "name": "TourExpense",
  "version": "0.0.1",
  "private": true,
  "scripts": {
    "android": "react-native run-android",
    "ios": "react-native run-ios",
    "lint": "eslint .",
    "start": "react-native start",
    "test": "jest"
  },
  "dependencies": {
    "@react-native-async-storage/async-storage": "^2.2.0",
    "@react-native/new-app-screen": "0.81.1",
    "@react-navigation/bottom-tabs": "^7.4.7",
    "@react-navigation/native": "^7.1.17",
    "@react-navigation/stack": "^7.4.8",
    "react": "19.1.0",
    "react-native": "0.81.1",
    "react-native-gesture-handler": "^2.28.0",
    "react-native-reanimated": "^4.1.0",
    "react-native-safe-area-context": "^5.6.1",
    "react-native-screens": "^4.16.0",
    "react-native-vector-icons": "^10.3.0"
  },
  "devDependencies": {
    "@babel/core": "^7.25.2",
    "@react-native/babel-preset": "0.81.1",
    "@react-native/eslint-config": "0.81.1",
    "@react-native/metro-config": "0.81.1",
    "@react-native/typescript-config": "0.81.1",
    "@types/react": "^19.1.0",
    "@types/react-native-vector-icons": "^6.4.18",
    "@types/react-test-renderer": "^19.1.0",
    "eslint": "^8.19.0",
    "prettier": "2.8.8",
    "typescript": "^5.8.3"
  }
}
```

## Android Configuration

### Vector Icons Setup

Add this line to `android/app/build.gradle` (at the bottom of the file):

```gradle
apply from: file("../../node_modules/react-native-vector-icons/fonts.gradle")
```

### Gesture Handler Setup

In `android/app/src/main/java/.../MainApplication.java`, add:

```java
import com.swmansion.gesturehandler.react.RNGestureHandlerEnabledRootView;
```

## iOS Configuration (if targeting iOS)

### Install CocoaPods dependencies:

```bash
cd ios && pod install && cd ..
```

### Info.plist Configuration

Add fonts to `ios/TourExpense/Info.plist`:

```xml
<key>UIAppFonts</key>
<array>
  <string>MaterialIcons.ttf</string>
</array>
```

## Gesture Handler Setup

Create/update `index.js` to include gesture handler:

```javascript
import 'react-native-gesture-handler';
import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => App);
```

## Reanimated Configuration

Add to `babel.config.js`:

```javascript
module.exports = {
  presets: ['@react-native/babel-preset'],
  plugins: ['react-native-reanimated/plugin'],
};
```

## Metro Configuration Update

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

## TypeScript Configuration for Dependencies

Update `tsconfig.json` to include type definitions:

```json
{
  "extends": "@react-native/typescript-config/tsconfig.json",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    },
    "strict": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "skipLibCheck": true
  },
  "include": [
    "src/**/*",
    "App.tsx",
    "index.js"
  ]
}
```

## Dependency Verification

After installing all dependencies, verify they work:

### 1. Test Navigation

Create a simple test in `App.tsx`:

```typescript
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Text, View } from 'react-native';

const Stack = createStackNavigator();

function HomeScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Navigation Working!</Text>
    </View>
  );
}

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
```

### 2. Test Vector Icons

```typescript
import Icon from 'react-native-vector-icons/MaterialIcons';

// In your component
<Icon name="home" size={30} color="#900" />
```

### 3. Test AsyncStorage

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

// Test storage
const testStorage = async () => {
  await AsyncStorage.setItem('test', 'working');
  const value = await AsyncStorage.getItem('test');
  console.log('Storage test:', value);
};
```

## Running the App

After configuration, test the app:

```bash
# Clear Metro cache
npx react-native start --reset-cache

# Run on Android
npm run android

# Run on iOS (macOS only)
npm run ios
```

## Common Configuration Issues

### 1. Vector Icons Not Showing

**Solution:** Ensure fonts are properly linked and rebuild the app:

```bash
# Android
cd android && ./gradlew clean && cd ..
npm run android

# iOS
cd ios && pod install && cd ..
npm run ios
```

### 2. Navigation Crashes

**Solution:** Ensure gesture handler is properly imported in `index.js`

### 3. Metro Bundle Issues

**Solution:** Clear cache and restart:

```bash
npx react-native start --reset-cache
```

### 4. TypeScript Errors

**Solution:** Ensure all type definitions are installed:

```bash
npm install --save-dev @types/react @types/react-native @types/react-native-vector-icons
```

## Development Scripts

Add these useful scripts to `package.json`:

```json
{
  "scripts": {
    "android": "react-native run-android",
    "ios": "react-native run-ios",
    "lint": "eslint .",
    "start": "react-native start",
    "test": "jest",
    "clean": "npx react-native clean",
    "reset-cache": "npx react-native start --reset-cache",
    "type-check": "npx tsc --noEmit"
  }
}
```

## Next Steps

Now that all dependencies are configured:

1. [Learn how to run and debug the app](./03-running-app.md)
2. [Understand the project architecture](../architecture/01-project-structure.md)
3. Start building the core features

---

**Next:** [Running the App](./03-running-app.md)