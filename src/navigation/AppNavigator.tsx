import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialIcons';

import ToursListScreen from '../screens/ToursListScreen';
import TourDetailsScreen from '../screens/TourDetailsScreen';
import CreateTourScreen from '../screens/CreateTourScreen';
import EditTourScreen from '../screens/EditTourScreen';
import AddExpenseScreen from '../screens/AddExpenseScreen';
import EditExpenseScreen from '../screens/EditExpenseScreen';
import ExpenseSummaryScreen from '../screens/ExpenseSummaryScreen';
import ParticipantsScreen from '../screens/ParticipantsScreen';
import AddParticipantScreen from '../screens/AddParticipantScreen';

export type RootStackParamList = {
  Main: undefined;
  TourDetails: { tourId: string };
  CreateTour: undefined;
  EditTour: { tourId: string };
  AddExpense: { tourId: string };
  EditExpense: { tourId: string; expenseId: string };
  ExpenseSummary: { tourId: string };
  Participants: { tourId: string };
  AddParticipant: { tourId: string };
};

export type MainTabParamList = {
  Tours: undefined;
  Summary: { tourId?: string };
};

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

const getTabIcon = (routeName: string, color: string, size: number) => {
  let iconName: string;
  if (routeName === 'Tours') {
    iconName = 'list';
  } else {
    iconName = 'analytics';
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
        headerShown: false,
      })}
    >
      <Tab.Screen name="Tours" component={ToursListScreen} />
      <Tab.Screen name="Summary" component={ExpenseSummaryScreen} />
    </Tab.Navigator>
  );
}

const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Main"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#007AFF',
          },
          headerTintColor: 'white',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen
          name="Main"
          component={MainTabs}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="TourDetails"
          component={TourDetailsScreen}
          options={{ title: 'Tour Details' }}
        />
        <Stack.Screen
          name="CreateTour"
          component={CreateTourScreen}
          options={{ title: 'New Tour' }}
        />
        <Stack.Screen
          name="EditTour"
          component={EditTourScreen}
          options={{ title: 'Edit Tour' }}
        />
        <Stack.Screen
          name="AddExpense"
          component={AddExpenseScreen}
          options={{ title: 'Add Expense' }}
        />
        <Stack.Screen
          name="EditExpense"
          component={EditExpenseScreen}
          options={{ title: 'Edit Expense' }}
        />
        <Stack.Screen
          name="ExpenseSummary"
          component={ExpenseSummaryScreen}
          options={{ title: 'Expense Summary' }}
        />
        <Stack.Screen
          name="Participants"
          component={ParticipantsScreen}
          options={{ title: 'Participants' }}
        />
        <Stack.Screen
          name="AddParticipant"
          component={AddParticipantScreen}
          options={{ title: 'Add Participant' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
