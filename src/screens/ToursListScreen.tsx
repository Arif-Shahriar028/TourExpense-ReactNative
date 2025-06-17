import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { useApp } from '../context/AppContext';
import { RootStackParamList } from '../navigation/AppNavigator';
import Card from '../components/Card';
import Button from '../components/Button';
import Avatar from '../components/Avatar';
import { formatDate, formatCurrency } from '../utils/calculations';
import { Tour } from '../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Main'>;

const ToursListScreen: React.FC = () => {
  const { tours, loading } = useApp();
  const navigation = useNavigation<NavigationProp>();

  const renderTourItem = ({ item }: { item: Tour }) => (
    <Card style={styles.tourCard}>
      <TouchableOpacity
        onPress={() => navigation.navigate('TourDetails', { tourId: item.id })}
      >
        <View style={styles.tourHeader}>
          <View style={styles.tourInfo}>
            <Text style={styles.tourTitle}>{item.title}</Text>
            <Text style={styles.tourDate}>
              {formatDate(item.startDate)}
              {item.endDate && ` - ${formatDate(item.endDate)}`}
            </Text>
          </View>
          <View style={styles.tourStats}>
            <Text style={styles.totalAmount}>
              {formatCurrency(item.expenses.reduce((sum, exp) => sum + exp.amount, 0))}
            </Text>
            <Text style={styles.expenseCount}>
              {item.expenses.length} expenses
            </Text>
          </View>
        </View>

        <View style={styles.participantsContainer}>
          <View style={styles.participantsList}>
            {item.participants.slice(0, 4).map((participant) => (
              <Avatar
                key={participant.id}
                name={participant.name}
                color={participant.color}
                size={32}
              />
            ))}
            {item.participants.length > 4 && (
              <View style={styles.moreParticipants}>
                <Text style={styles.moreParticipantsText}>
                  +{item.participants.length - 4}
                </Text>
              </View>
            )}
          </View>
          <Text style={styles.participantCount}>
            {item.participants.length} participants
          </Text>
        </View>
      </TouchableOpacity>
    </Card>
  );

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
        style={styles.emptyButton}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#007AFF" barStyle="light-content" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Tours</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('CreateTour')}
        >
          <Icon name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={tours}
        renderItem={renderTourItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={loading ? null : renderEmptyState}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    flex: 1,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContainer: {
    padding: 16,
    flexGrow: 1,
  },
  tourCard: {
    marginBottom: 16,
  },
  tourHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  tourInfo: {
    flex: 1,
  },
  tourTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  tourDate: {
    fontSize: 14,
    color: '#666',
  },
  tourStats: {
    alignItems: 'flex-end',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 4,
  },
  expenseCount: {
    fontSize: 12,
    color: '#666',
  },
  participantsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  participantsList: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  moreParticipants: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E1E1E1',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -8,
  },
  moreParticipantsText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#666',
  },
  participantCount: {
    fontSize: 12,
    color: '#666',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 24,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
  },
  emptyButton: {
    paddingHorizontal: 32,
  },
});

export default ToursListScreen;