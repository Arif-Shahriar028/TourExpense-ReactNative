import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useNavigation, useRoute, RouteProp as NavigationRouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { useApp } from '../context/AppContext';
import { RootStackParamList } from '../navigation/AppNavigator';
import Card from '../components/Card';
import Button from '../components/Button';
import Avatar from '../components/Avatar';
import { formatDate, formatCurrency } from '../utils/calculations';
import { CATEGORY_ICONS, CATEGORY_COLORS } from '../types';

type NavigationProp = StackNavigationProp<RootStackParamList, 'TourDetails'>;
type RouteProps = NavigationRouteProp<RootStackParamList, 'TourDetails'>;

const TourDetailsScreen: React.FC = () => {
  const { tours, dispatch, getTourSummary } = useApp();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();

  const { tourId } = route.params;
  const tour = tours.find(t => t.id === tourId);
  const summary = getTourSummary(tourId);

  if (!tour) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Tour not found</Text>
      </SafeAreaView>
    );
  }

  const handleDeleteTour = () => {
    Alert.alert(
      'Delete Tour',
      'Are you sure you want to delete this tour? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            dispatch({ type: 'DELETE_TOUR', payload: tourId });
            navigation.goBack();
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Tour Header */}
        <Card>
          <View style={styles.header}>
            <View style={styles.headerInfo}>
              <Text style={styles.tourTitle}>{tour.title}</Text>
              <Text style={styles.tourDate}>
                {formatDate(tour.startDate)}
                {tour.endDate && ` - ${formatDate(tour.endDate)}`}
              </Text>
              {tour.description && (
                <Text style={styles.description}>{tour.description}</Text>
              )}
            </View>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => navigation.navigate('EditTour', { tourId })}
            >
              <Icon name="edit" size={20} color="#007AFF" />
            </TouchableOpacity>
          </View>
        </Card>

        {/* Quick Stats */}
        <Card>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{formatCurrency(summary?.totalExpenses || 0)}</Text>
              <Text style={styles.statLabel}>Total Expenses</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{tour.participants.length}</Text>
              <Text style={styles.statLabel}>Participants</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{tour.expenses.length}</Text>
              <Text style={styles.statLabel}>Expenses</Text>
            </View>
          </View>
        </Card>

        {/* Action Buttons */}
        <Card>
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('Participants', { tourId })}
            >
              <Icon name="people" size={24} color="#007AFF" />
              <Text style={styles.actionText}>Manage Participants</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('AddExpense', { tourId })}
            >
              <Icon name="add-circle" size={24} color="#34C759" />
              <Text style={styles.actionText}>Add Expense</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('ExpenseSummary', { tourId })}
            >
              <Icon name="analytics" size={24} color="#FF9500" />
              <Text style={styles.actionText}>View Summary</Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Recent Expenses */}
        {tour.expenses.length > 0 && (
          <Card>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Expenses</Text>
              {tour.expenses.length > 3 && (
                <TouchableOpacity
                  onPress={() => navigation.navigate('ExpenseSummary', { tourId })}
                >
                  <Text style={styles.viewAllText}>View All</Text>
                </TouchableOpacity>
              )}
            </View>
            
            {tour.expenses.slice(0, 3).map((expense) => {
              const payer = tour.participants.find(p => p.id === expense.paidBy);
              return (
                <TouchableOpacity
                  key={expense.id}
                  style={styles.expenseItem}
                  onPress={() => navigation.navigate('EditExpense', { tourId, expenseId: expense.id })}
                >
                  <View style={styles.expenseLeft}>
                    <View
                      style={[
                        styles.categoryIcon,
                        { backgroundColor: CATEGORY_COLORS[expense.category] },
                      ]}
                    >
                      <Text style={styles.categoryIconText}>
                        {CATEGORY_ICONS[expense.category]}
                      </Text>
                    </View>
                    <View>
                      <Text style={styles.expenseTitle}>{expense.title}</Text>
                      <Text style={styles.expensePayer}>
                        Paid by {payer?.name || 'Unknown'}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.expenseAmount}>
                    {formatCurrency(expense.amount)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </Card>
        )}

        {/* Participants */}
        {tour.participants.length > 0 && (
          <Card>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Participants</Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('Participants', { tourId })}
              >
                <Text style={styles.viewAllText}>Manage</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.participantsGrid}>
              {tour.participants.map((participant) => (
                <View key={participant.id} style={styles.participantItem}>
                  <Avatar
                    name={participant.name}
                    color={participant.color}
                    size={40}
                  />
                  <Text style={styles.participantName} numberOfLines={1}>
                    {participant.name}
                  </Text>
                </View>
              ))}
            </View>
          </Card>
        )}

        {/* Delete Button */}
        <Button
          title="Delete Tour"
          variant="danger"
          onPress={handleDeleteTour}
          style={styles.deleteButton}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollContent: {
    padding: 16,
  },
  errorText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginTop: 50,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerInfo: {
    flex: 1,
  },
  tourTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  tourDate: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#666',
  },
  editButton: {
    padding: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    alignItems: 'center',
    padding: 16,
  },
  actionText: {
    fontSize: 12,
    color: '#333',
    marginTop: 8,
    textAlign: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  viewAllText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
  expenseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  expenseLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  categoryIconText: {
    fontSize: 16,
  },
  expenseTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  expensePayer: {
    fontSize: 12,
    color: '#666',
  },
  expenseAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  participantsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  participantItem: {
    alignItems: 'center',
    width: '25%',
    marginBottom: 16,
  },
  participantName: {
    fontSize: 12,
    color: '#333',
    marginTop: 8,
    textAlign: 'center',
  },
  deleteButton: {
    marginTop: 24,
    marginBottom: 32,
  },
});

export default TourDetailsScreen;