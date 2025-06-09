import React from 'react';
import {
  View,
  Text,
  FlatList,
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
import { Participant } from '../types';

type NavigationProp = StackNavigationProp<RootStackParamList, 'Participants'>;
type RouteProps = NavigationRouteProp<RootStackParamList, 'Participants'>;

const ParticipantsScreen: React.FC = () => {
  const { tours, dispatch } = useApp();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();

  const { tourId } = route.params;
  const tour = tours.find(t => t.id === tourId);

  if (!tour) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Tour not found</Text>
      </SafeAreaView>
    );
  }

  const handleDeleteParticipant = (participantId: string) => {
    const participant = tour.participants.find(p => p.id === participantId);
    if (!participant) return;

    Alert.alert(
      'Remove Participant',
      `Are you sure you want to remove ${participant.name} from this tour? All expenses involving this participant will also be removed.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            dispatch({
              type: 'DELETE_PARTICIPANT',
              payload: { tourId, participantId },
            });
          },
        },
      ]
    );
  };

  const renderParticipantItem = ({ item }: { item: Participant }) => (
    <Card style={styles.participantCard}>
      <View style={styles.participantInfo}>
        <Avatar name={item.name} color={item.color} size={50} />
        <View style={styles.participantDetails}>
          <Text style={styles.participantName}>{item.name}</Text>
          <Text style={styles.participantId}>ID: {item.id.slice(-8)}</Text>
        </View>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteParticipant(item.id)}
        >
          <Icon name="delete" size={20} color="#FF3B30" />
        </TouchableOpacity>
      </View>
    </Card>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Icon name="group" size={80} color="#E1E1E1" />
      <Text style={styles.emptyTitle}>No Participants Yet</Text>
      <Text style={styles.emptySubtitle}>
        Add participants to start tracking expenses
      </Text>
      <Button
        title="Add First Participant"
        onPress={() => navigation.navigate('AddParticipant', { tourId })}
        style={styles.emptyButton}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>Participants</Text>
          <Text style={styles.headerSubtitle}>{tour.title}</Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('AddParticipant', { tourId })}
        >
          <Icon name="person-add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={tour.participants}
        renderItem={renderParticipantItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />

      {tour.participants.length > 0 && (
        <View style={styles.bottomActions}>
          <Button
            title="Continue to Expenses"
            onPress={() => navigation.navigate('TourDetails', { tourId })}
          />
        </View>
      )}
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
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
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
  participantCard: {
    marginBottom: 12,
  },
  participantInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  participantDetails: {
    flex: 1,
    marginLeft: 16,
  },
  participantName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  participantId: {
    fontSize: 12,
    color: '#666',
  },
  deleteButton: {
    padding: 8,
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
  bottomActions: {
    padding: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E1E1E1',
  },
  errorText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginTop: 50,
  },
});

export default ParticipantsScreen;