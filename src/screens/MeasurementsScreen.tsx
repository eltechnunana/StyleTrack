import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Card, FAB, Searchbar, Button } from 'react-native-paper';
import { DataService } from '../services/DataService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Measurement } from '../types';
import Icon from 'react-native-vector-icons/MaterialIcons';

const MeasurementsScreen = ({ navigation }: any) => {
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredMeasurements, setFilteredMeasurements] = useState<Measurement[]>([]);
  const [unit, setUnit] = useState<'cm' | 'inches'>('cm');

  useEffect(() => {
    loadMeasurements();
    loadSettings();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = measurements.filter(measurement =>
        measurement.clientName.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredMeasurements(filtered);
    } else {
      setFilteredMeasurements(measurements);
    }
  }, [searchQuery, measurements]);

  const loadMeasurements = async () => {
    try {
      const data = await DataService.getMeasurements();
      setMeasurements(data);
    } catch (error) {
      console.error('Error loading measurements:', error);
    }
  };

  const loadSettings = async () => {
    try {
      const settings = await DataService.getSettings();
      setUnit(settings.defaultUnit || 'cm');
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const deleteMeasurement = (measurementId: string) => {
    Alert.alert(
      'Delete Measurement',
      'Are you sure you want to delete this measurement?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const allMeasurements = await DataService.getMeasurements();
              const updatedMeasurements = allMeasurements.filter(m => m.id !== measurementId);
              await AsyncStorage.setItem('@styletrack:measurements', JSON.stringify(updatedMeasurements));
              loadMeasurements();
            } catch (error) {
              console.error('Error deleting measurement:', error);
            }
          },
        },
      ]
    );
  };

  const convertUnit = (value: number | undefined, fromUnit: string, toUnit: string) => {
    if (!value) return 0;
    if (fromUnit === toUnit) return value;
    if (fromUnit === 'cm' && toUnit === 'inches') return value / 2.54;
    if (fromUnit === 'inches' && toUnit === 'cm') return value * 2.54;
    return value;
  };

  const renderMeasurementItem = ({ item }: { item: Measurement }) => (
    <Card style={styles.measurementCard}>
      <Card.Content>
        <View style={styles.measurementHeader}>
          <View style={styles.measurementInfo}>
            <Text style={styles.clientName}>{item.clientName}</Text>
            <Text style={styles.measurementDate}>
              {new Date(item.createdAt).toLocaleDateString()}
            </Text>
          </View>
          <View style={styles.measurementActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('MeasurementDetails', { measurementId: item.id })}
            >
              <Icon name="visibility" size={20} color="#0d6efd" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => deleteMeasurement(item.id)}
            >
              <Icon name="delete" size={20} color="#dc3545" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.measurementsGrid}>
          {item.height && (
            <View style={styles.measurementItem}>
              <Text style={styles.measurementLabel}>Height</Text>
              <Text style={styles.measurementValue}>
                {convertUnit(item.height, item.unit, unit).toFixed(1)} {unit}
              </Text>
            </View>
          )}
          {item.chest && (
            <View style={styles.measurementItem}>
              <Text style={styles.measurementLabel}>Chest</Text>
              <Text style={styles.measurementValue}>
                {convertUnit(item.chest, item.unit, unit).toFixed(1)} {unit}
              </Text>
            </View>
          )}
          {item.waist && (
            <View style={styles.measurementItem}>
              <Text style={styles.measurementLabel}>Waist</Text>
              <Text style={styles.measurementValue}>
                {convertUnit(item.waist, item.unit, unit).toFixed(1)} {unit}
              </Text>
            </View>
          )}
          {item.hip && (
            <View style={styles.measurementItem}>
              <Text style={styles.measurementLabel}>Hip</Text>
              <Text style={styles.measurementValue}>
                {convertUnit(item.hip, item.unit, unit).toFixed(1)} {unit}
              </Text>
            </View>
          )}
        </View>

        {item.notes && (
          <Text style={styles.notes} numberOfLines={2}>{item.notes}</Text>
        )}
      </Card.Content>
    </Card>
  );

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Icon name="straighten" size={64} color="#ccc" />
      <Text style={styles.emptyTitle}>No Measurements Found</Text>
      <Text style={styles.emptyText}>
        Add your first measurement to start tracking client sizes.
      </Text>
      <Button
        mode="contained"
        onPress={() => navigation.navigate('AddMeasurement')}
        style={styles.addButton}
      >
        Add First Measurement
      </Button>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Measurements</Text>
        <Text style={styles.subtitle}>Track client body measurements</Text>
      </View>

      <Searchbar
        placeholder="Search measurements..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
      />

      <View style={styles.unitToggle}>
        <Button
          mode={unit === 'cm' ? 'contained' : 'outlined'}
          onPress={() => setUnit('cm')}
          style={styles.unitButton}
        >
          CM
        </Button>
        <Button
          mode={unit === 'inches' ? 'contained' : 'outlined'}
          onPress={() => setUnit('inches')}
          style={styles.unitButton}
        >
          Inches
        </Button>
      </View>

      <FlatList
        data={filteredMeasurements}
        renderItem={renderMeasurementItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={renderEmptyList}
        showsVerticalScrollIndicator={false}
      />

      <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => navigation.navigate('AddMeasurement')}
        color="#fff"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#0d6efd',
    padding: 20,
    paddingTop: 40,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.8,
    marginTop: 4,
  },
  searchBar: {
    margin: 16,
    borderRadius: 12,
    elevation: 2,
  },
  unitToggle: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginBottom: 16,
    gap: 8,
  },
  unitButton: {
    flex: 1,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  measurementCard: {
    marginBottom: 12,
    borderRadius: 12,
    elevation: 2,
  },
  measurementHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  measurementInfo: {
    flex: 1,
  },
  clientName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  measurementDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  measurementActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
  },
  measurementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  measurementItem: {
    flex: 1,
    minWidth: 80,
    paddingHorizontal: 8,
    marginBottom: 8,
  },
  measurementLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  measurementValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  notes: {
    fontSize: 12,
    color: '#888',
    marginTop: 8,
    lineHeight: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    marginTop: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  addButton: {
    marginTop: 16,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#0d6efd',
  },
});

export default MeasurementsScreen;