import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Alert,
  Text,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useApp } from '../context/AppContext';
import { RootStackParamList } from '../navigation/AppNavigator';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import { generateId } from '../utils/calculations';
import { Tour } from '../types';

type NavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'CreateTour'
>;

const CreateTourScreen: React.FC = () => {
  const { dispatch } = useApp();
  const navigation = useNavigation<NavigationProp>();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Tour title is required';
    }

    if (formData.endDate && formData.endDate < formData.startDate) {
      newErrors.endDate = 'End date must be after start date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const newTour: Tour = {
        id: generateId(),
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        startDate: formData.startDate,
        endDate: formData.endDate || undefined,
        participants: [],
        expenses: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      dispatch({ type: 'ADD_TOUR', payload: newTour });

      Alert.alert('Success', 'Tour created successfully!', [
        {
          text: 'Add Participants',
          onPress: () =>
            navigation.replace('Participants', { tourId: newTour.id }),
        },
        {
          text: 'View Tour',
          onPress: () =>
            navigation.replace('TourDetails', { tourId: newTour.id }),
          style: 'default',
        },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to create tour. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Card>
          <Text style={styles.sectionTitle}>Tour Information</Text>

          <Input
            label="Tour Title *"
            placeholder="e.g. Cox's Bazar Trip 2024"
            value={formData.title}
            onChangeText={text => setFormData({ ...formData, title: text })}
            error={errors.title}
          />

          <Input
            label="Description"
            placeholder="Brief description of the tour"
            value={formData.description}
            onChangeText={text =>
              setFormData({ ...formData, description: text })
            }
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />

          <Input
            label="Start Date *"
            placeholder="YYYY-MM-DD"
            value={formData.startDate}
            onChangeText={text => setFormData({ ...formData, startDate: text })}
            error={errors.startDate}
          />

          <Input
            label="End Date"
            placeholder="YYYY-MM-DD (optional)"
            value={formData.endDate}
            onChangeText={text => setFormData({ ...formData, endDate: text })}
            error={errors.endDate}
          />
        </Card>

        <View style={styles.buttonContainer}>
          <Button
            title="Cancel"
            variant="secondary"
            onPress={() => navigation.goBack()}
            style={styles.cancelButton}
          />
          <Button
            title="Create Tour"
            onPress={handleSubmit}
            loading={loading}
            style={styles.createButton}
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 24,
    gap: 16,
  },
  cancelButton: {
    flex: 1,
  },
  createButton: {
    flex: 2,
  },
});

export default CreateTourScreen;
