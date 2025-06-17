import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Alert,
  Text,
} from 'react-native';
import { useNavigation, useRoute, RouteProp as NavigationRouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useApp } from '../context/AppContext';
import { RootStackParamList } from '../navigation/AppNavigator';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'EditTour'>;
type RouteProps = NavigationRouteProp<RootStackParamList, 'EditTour'>;

const EditTourScreen: React.FC = () => {
  const { tours, dispatch } = useApp();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();

  const { tourId } = route.params;
  const tour = tours.find(t => t.id === tourId);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (tour) {
      setFormData({
        title: tour.title,
        description: tour.description || '',
        startDate: tour.startDate,
        endDate: tour.endDate || '',
      });
    }
  }, [tour]);

  if (!tour) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Tour not found</Text>
      </SafeAreaView>
    );
  }

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
      const updatedTour = {
        ...tour,
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        startDate: formData.startDate,
        endDate: formData.endDate || undefined,
        updatedAt: new Date().toISOString(),
      };

      dispatch({ type: 'UPDATE_TOUR', payload: updatedTour });
      
      Alert.alert('Success', 'Tour updated successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to update tour. Please try again.');
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
            placeholder="e.g. Goa Trip 2024"
            value={formData.title}
            onChangeText={(text) =>
              setFormData({ ...formData, title: text })
            }
            error={errors.title}
          />

          <Input
            label="Description"
            placeholder="Brief description of the tour"
            value={formData.description}
            onChangeText={(text) =>
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
            onChangeText={(text) =>
              setFormData({ ...formData, startDate: text })
            }
            error={errors.startDate}
          />

          <Input
            label="End Date"
            placeholder="YYYY-MM-DD (optional)"
            value={formData.endDate}
            onChangeText={(text) =>
              setFormData({ ...formData, endDate: text })
            }
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
            title="Save Changes"
            onPress={handleSubmit}
            loading={loading}
            style={styles.saveButton}
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
  saveButton: {
    flex: 2,
  },
});

export default EditTourScreen;