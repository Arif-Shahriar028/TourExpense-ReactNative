import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Text,
  TouchableOpacity,
} from 'react-native';
import { useNavigation, useRoute, RouteProp as NavigationRouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useApp } from '../context/AppContext';
import { RootStackParamList } from '../navigation/AppNavigator';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import Avatar from '../components/Avatar';
import { useAlertHelpers } from '../hooks/useAlertHelpers';
import { generateId, generateParticipantColor } from '../utils/calculations';
import { Participant } from '../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'AddParticipant'>;
type RouteProps = NavigationRouteProp<RootStackParamList, 'AddParticipant'>;

const AddParticipantScreen: React.FC = () => {
  const { tours, dispatch } = useApp();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { showCustomAlert, showErrorAlert } = useAlertHelpers();

  const { tourId } = route.params;
  const tour = tours.find(t => t.id === tourId);

  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState(generateParticipantColor());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const colorOptions = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
    '#FECA57', '#FF9FF3', '#54A0FF', '#5F27CD',
    '#00D2D3', '#FF9F43', '#EE5A24', '#0FB9B1',
    '#D63031', '#6C5CE7', '#A29BFE', '#FD79A8'
  ];

  if (!tour) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Tour not found</Text>
      </SafeAreaView>
    );
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = 'Participant name is required';
    } else if (tour.participants.some(p => p.name.toLowerCase() === name.toLowerCase())) {
      newErrors.name = 'A participant with this name already exists';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const newParticipant: Participant = {
        id: generateId(),
        name: name.trim(),
        color: selectedColor,
      };

      dispatch({
        type: 'ADD_PARTICIPANT',
        payload: { tourId, participant: newParticipant },
      });

      showCustomAlert(
        'Success',
        `${newParticipant.name} has been added to the tour!`,
        [
          {
            text: 'Add Another',
            onPress: () => {
              setName('');
              setSelectedColor(generateParticipantColor());
            },
          },
          {
            text: 'Done',
            onPress: () => navigation.goBack(),
            style: 'default',
          },
        ]
      );
    } catch (error) {
      showErrorAlert('Error', 'Failed to add participant. Please try again.');
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
          <Text style={styles.sectionTitle}>Participant Information</Text>
          
          <View style={styles.previewSection}>
            <Text style={styles.previewLabel}>Preview</Text>
            <Avatar
              name={name || 'Preview'}
              color={selectedColor}
              size={60}
            />
          </View>

          <Input
            label="Participant Name *"
            placeholder="e.g. John Doe"
            value={name}
            onChangeText={setName}
            error={errors.name}
          />

          <Text style={styles.colorLabel}>Choose Color</Text>
          <View style={styles.colorGrid}>
            {colorOptions.map((color) => (
              <TouchableOpacity
                key={color}
                style={[
                  styles.colorOption,
                  { backgroundColor: color },
                  selectedColor === color && styles.selectedColor,
                ]}
                onPress={() => setSelectedColor(color)}
              />
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
            title="Add Participant"
            onPress={handleSubmit}
            loading={loading}
            style={styles.addButton}
          />
        </View>

        {tour.participants.length > 0 && (
          <Card style={styles.existingParticipants}>
            <Text style={styles.existingTitle}>
              Current Participants ({tour.participants.length})
            </Text>
            <View style={styles.participantsList}>
              {tour.participants.map((participant) => (
                <View key={participant.id} style={styles.participantItem}>
                  <Avatar
                    name={participant.name}
                    color={participant.color}
                    size={32}
                  />
                  <Text style={styles.participantName} numberOfLines={1}>
                    {participant.name}
                  </Text>
                </View>
              ))}
            </View>
          </Card>
        )}
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
  previewSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  previewLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  colorLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginBottom: 12,
    borderWidth: 3,
    borderColor: 'transparent',
  },
  selectedColor: {
    borderColor: '#007AFF',
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
  existingParticipants: {
    marginTop: 24,
  },
  existingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  participantsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  participantItem: {
    alignItems: 'center',
    width: '20%',
    marginBottom: 16,
  },
  participantName: {
    fontSize: 10,
    color: '#333',
    marginTop: 4,
    textAlign: 'center',
  },
});

export default AddParticipantScreen;