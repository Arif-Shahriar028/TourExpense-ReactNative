import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppProvider } from './src/context/AppContext';
import { AlertProvider } from './src/context/AlertContext';
import AppNavigator from './src/navigation/AppNavigator';

function App() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <AlertProvider>
          <AppNavigator />
        </AlertProvider>
      </AppProvider>
    </SafeAreaProvider>
  );
}

export default App;
