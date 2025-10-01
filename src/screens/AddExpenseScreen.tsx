import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Alert,
  Text,
  TouchableOpacity,
} from 'react-native';
import {
  useNavigation,
  useRoute,
  RouteProp as NavigationRouteProp,
} from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useApp } from '../context/AppContext';
import { RootStackParamList } from '../navigation/AppNavigator';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import Avatar from '../components/Avatar';
import { generateId } from '../utils/calculations';
import {
  Expense,
  EXPENSE_CATEGORIES,
  CATEGORY_ICONS,
  CATEGORY_COLORS,
} from '../types';

type NavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'AddExpense'
>;
type RouteProps = NavigationRouteProp<RootStackParamList, 'AddExpense'>;

const AddExpenseScreen: React.FC = () => {
  const { tours, dispatch } = useApp();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();

  const { tourId } = route.params;
  const tour = tours.find(t => t.id === tourId);

  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    description: '',
    paidBy: '',
    participants: [] as string[],
    category: EXPENSE_CATEGORIES[0],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  if (!tour) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Tour not found</Text>
      </SafeAreaView>
    );
  }

  if (tour.participants.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.noParticipantsContainer}>
          <Text style={styles.noParticipantsTitle}>No Participants</Text>
          <Text style={styles.noParticipantsSubtitle}>
            You need to add participants before creating expenses
          </Text>
          <Button
            title="Add Participants"
            onPress={() => navigation.navigate('Participants', { tourId })}
          />
        </View>
      </SafeAreaView>
    );
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Expense title is required';
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Please enter a valid amount';
    }

    if (!formData.paidBy) {
      newErrors.paidBy = 'Please select who paid';
    }

    if (formData.participants.length === 0) {
      newErrors.participants = 'Please select at least one participant';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const newExpense: Expense = {
        id: generateId(),
        title: formData.title.trim(),
        amount: parseFloat(formData.amount),
        paidBy: formData.paidBy,
        participants: formData.participants,
        category: formData.category,
        date: new Date().toISOString(),
        description: formData.description.trim() || undefined,
        tourId,
      };

      dispatch({
        type: 'ADD_EXPENSE',
        payload: { tourId, expense: newExpense },
      });

      Alert.alert('Success', 'Expense added successfully!', [
        {
          text: 'Add Another',
          onPress: () => {
            setFormData({
              title: '',
              amount: '',
              description: '',
              paidBy: '',
              participants: [],
              category: EXPENSE_CATEGORIES[0],
            });
            setErrors({});
          },
        },
        {
          text: 'View Tour',
          onPress: () => navigation.goBack(),
          style: 'default',
        },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to add expense. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleParticipant = (participantId: string) => {
    const isSelected = formData.participants.includes(participantId);
    if (isSelected) {
      setFormData({
        ...formData,
        participants: formData.participants.filter(id => id !== participantId),
      });
    } else {
      setFormData({
        ...formData,
        participants: [...formData.participants, participantId],
      });
    }
  };

  const selectAllParticipants = () => {
    setFormData({
      ...formData,
      participants: tour.participants.map(p => p.id),
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Card>
          <Text style={styles.sectionTitle}>Expense Details</Text>

          <Input
            label="Expense Title *"
            placeholder="e.g. Lunch at Restaurant"
            value={formData.title}
            onChangeText={text => setFormData({ ...formData, title: text })}
            error={errors.title}
          />

          <Input
            label="Amount ($) *"
            placeholder="0.00"
            value={formData.amount}
            onChangeText={text => setFormData({ ...formData, amount: text })}
            keyboardType="numeric"
            error={errors.amount}
          />

          <Input
            label="Description"
            placeholder="Additional notes (optional)"
            value={formData.description}
            onChangeText={text =>
              setFormData({ ...formData, description: text })
            }
            multiline
            numberOfLines={2}
            textAlignVertical="top"
          />
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>Category</Text>
          <View style={styles.categoryGrid}>
            {EXPENSE_CATEGORIES.map(category => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryItem,
                  formData.category === category
                    ? { backgroundColor: CATEGORY_COLORS[category] }
                    : styles.unselectedCategory,
                ]}
                onPress={() => setFormData({ ...formData, category })}
              >
                <Text style={styles.categoryIcon}>
                  {CATEGORY_ICONS[category]}
                </Text>
                <Text
                  style={[
                    styles.categoryText,
                    formData.category === category
                      ? styles.selectedCategoryText
                      : styles.unselectedCategoryText,
                  ]}
                >
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>Who Paid? *</Text>
          {errors.paidBy && <Text style={styles.error}>{errors.paidBy}</Text>}
          <View style={styles.participantsGrid}>
            {tour.participants.map(participant => (
              <TouchableOpacity
                key={participant.id}
                style={[
                  styles.payerItem,
                  formData.paidBy === participant.id && styles.selectedPayer,
                ]}
                onPress={() =>
                  setFormData({ ...formData, paidBy: participant.id })
                }
              >
                <Avatar
                  name={participant.name}
                  color={participant.color}
                  size={40}
                />
                <Text style={styles.participantName} numberOfLines={1}>
                  {participant.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        <Card>
          <View style={styles.participantsSectionHeader}>
            <Text style={styles.sectionTitle}>Who Participated? *</Text>
            <TouchableOpacity onPress={selectAllParticipants}>
              <Text style={styles.selectAllText}>Select All</Text>
            </TouchableOpacity>
          </View>
          {errors.participants && (
            <Text style={styles.error}>{errors.participants}</Text>
          )}
          <View style={styles.participantsGrid}>
            {tour.participants.map(participant => (
              <TouchableOpacity
                key={participant.id}
                style={[
                  styles.participantItem,
                  formData.participants.includes(participant.id) &&
                    styles.selectedParticipant,
                ]}
                onPress={() => toggleParticipant(participant.id)}
              >
                <Avatar
                  name={participant.name}
                  color={participant.color}
                  size={40}
                />
                <Text style={styles.participantName} numberOfLines={1}>
                  {participant.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        <View style={styles.buttonContainer}>
          <Button
            title="Cancel"
            variant="secondary"
            onPress={() => navigation.goBack()}
            style={styles.cancelButton}
          />
          <Button
            title="Add Expense"
            onPress={handleSubmit}
            loading={loading}
            style={styles.addButton}
          />
        </View>
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
  noParticipantsContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  noParticipantsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  noParticipantsSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryItem: {
    width: '48%',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    marginBottom: 8,
  },
  categoryIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
  },
  unselectedCategory: {
    backgroundColor: '#F5F5F5',
  },
  selectedCategoryText: {
    color: 'white',
  },
  unselectedCategoryText: {
    color: '#333',
  },
  participantsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  participantItem: {
    alignItems: 'center',
    width: '25%',
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  selectedParticipant: {
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
  },
  payerItem: {
    alignItems: 'center',
    width: '25%',
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  selectedPayer: {
    backgroundColor: 'rgba(0, 122, 255, 0.2)',
  },
  participantName: {
    fontSize: 12,
    color: '#333',
    marginTop: 8,
    textAlign: 'center',
  },
  participantsSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  selectAllText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
  error: {
    color: '#FF3B30',
    fontSize: 14,
    marginBottom: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 24,
    gap: 16,
  },
  cancelButton: {
    flex: 1,
  },
  addButton: {
    flex: 2,
  },
});

export default AddExpenseScreen;
