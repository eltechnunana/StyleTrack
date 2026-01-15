import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import {
  Card,
  TextInput,
  Button,
  SegmentedButtons,
} from 'react-native-paper';
import { DataService } from '../services/DataService';
import { Client, Measurement, Order } from '../types';

const AddOrderScreen = ({ navigation }: any) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [selectedClient, setSelectedClient] = useState<string>('');
  const [selectedMeasurement, setSelectedMeasurement] = useState<string>('');
  const [orderNumber, setOrderNumber] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'pending' | 'in-progress' | 'completed' | 'delivered'>('pending');
  const [price, setPrice] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadClients();
    generateOrderNumber();
  }, []);

  useEffect(() => {
    if (selectedClient) {
      loadMeasurements(selectedClient);
    }
  }, [selectedClient]);

  const loadClients = async () => {
    try {
      const data = await DataService.getClients();
      setClients(data);
    } catch (error) {
      console.error('Error loading clients:', error);
    }
  };

  const loadMeasurements = async (clientId: string) => {
    try {
      const data = await DataService.getMeasurementsByClient(clientId);
      setMeasurements(data);
    } catch (error) {
      console.error('Error loading measurements:', error);
    }
  };

  const generateOrderNumber = () => {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    setOrderNumber(`ORD-${timestamp}-${random}`);
  };

  const validateForm = (): boolean => {
    if (!selectedClient) {
      Alert.alert('Validation Error', 'Please select a client');
      return false;
    }
    if (!description.trim()) {
      Alert.alert('Validation Error', 'Please enter order description');
      return false;
    }
    if (price && isNaN(parseFloat(price))) {
      Alert.alert('Validation Error', 'Please enter a valid price');
      return false;
    }
    if (dueDate && !isValidDate(dueDate)) {
      Alert.alert('Validation Error', 'Please enter a valid due date (YYYY-MM-DD)');
      return false;
    }
    return true;
  };

  const isValidDate = (dateString: string): boolean => {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date.getTime());
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      
      const client = clients.find(c => c.id === selectedClient);
      if (!client) {
        Alert.alert('Error', 'Selected client not found');
        return;
      }

      const measurement = measurements.find(m => m.id === selectedMeasurement);

      const order: Order = {
        id: Date.now().toString(),
        clientId: selectedClient,
        clientName: client.name,
        orderNumber,
        description: description.trim(),
        measurements: measurement || undefined,
        status,
        price: price ? parseFloat(price) : undefined,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        notes: notes.trim() || undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await DataService.saveOrder(order);
      Alert.alert('Success', 'Order created successfully!');
      navigation.goBack();
    } catch (error) {
      console.error('Error saving order:', error);
      Alert.alert('Error', 'Failed to create order. Please try again.');
    } finally {
      setLoading(false);
    }
  };



  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Create New Order</Text>
        <Text style={styles.subtitle}>Enter order details</Text>
      </View>

      <Card style={styles.sectionCard}>
        <Card.Title
          title="Order Information"
          left={() => <Text>📝</Text>}
        />
        <Card.Content>
          <TextInput
            label="Order Number"
            value={orderNumber}
            onChangeText={setOrderNumber}
            mode="outlined"
            style={styles.input}
            disabled
            left={<TextInput.Icon icon="tag" />}
          />

          <Text style={styles.sectionLabel}>Select Client *</Text>
          <SegmentedButtons
            value={selectedClient}
            onValueChange={setSelectedClient}
            buttons={clients.map(client => ({
              value: client.id,
              label: client.name,
            }))}
            style={styles.clientSelector}
          />

          {selectedClient && measurements.length > 0 && (
            <>
              <Text style={styles.sectionLabel}>Select Measurement (Optional)</Text>
              <SegmentedButtons
                value={selectedMeasurement}
                onValueChange={setSelectedMeasurement}
                buttons={[
                  { value: '', label: 'No Measurement' },
                  ...measurements.map(measurement => ({
                    value: measurement.id,
                    label: new Date(measurement.createdAt).toLocaleDateString(),
                  }))
                ]}
                style={styles.measurementSelector}
              />
            </>
          )}

          <TextInput
            label="Description *"
            value={description}
            onChangeText={setDescription}
            placeholder="Describe the tailoring order"
            mode="outlined"
            style={styles.input}
            multiline
            numberOfLines={3}
            left={<TextInput.Icon icon="text" />}
          />

          <Text style={styles.sectionLabel}>Status</Text>
          <SegmentedButtons
            value={status}
            onValueChange={(value) => setStatus(value as any)}
            buttons={[
              { value: 'pending', label: 'Pending' },
              { value: 'in-progress', label: 'In Progress' },
              { value: 'completed', label: 'Completed' },
              { value: 'delivered', label: 'Delivered' },
            ]}
            style={styles.statusSelector}
          />

          <TextInput
            label="Price"
            value={price}
            onChangeText={setPrice}
            placeholder="0.00"
            mode="outlined"
            style={styles.input}
            keyboardType="numeric"
            left={<TextInput.Icon icon="currency-usd" />}
          />

          <TextInput
            label="Due Date (YYYY-MM-DD)"
            value={dueDate}
            onChangeText={setDueDate}
            placeholder="2024-12-31"
            mode="outlined"
            style={styles.input}
            keyboardType="default"
            left={<TextInput.Icon icon="calendar" />}
          />

          <TextInput
            label="Notes"
            value={notes}
            onChangeText={setNotes}
            placeholder="Any additional notes"
            mode="outlined"
            style={styles.input}
            multiline
            numberOfLines={3}
            left={<TextInput.Icon icon="note" />}
          />
        </Card.Content>
      </Card>

      <View style={styles.actionButtons}>
        <Button
          mode="outlined"
          onPress={() => navigation.goBack()}
          style={styles.cancelButton}
        >
          Cancel
        </Button>
        <Button
          mode="contained"
          onPress={handleSave}
          style={styles.saveButton}
          loading={loading}
          icon="content-save"
        >
          Create Order
        </Button>
      </View>
    </ScrollView>
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
  sectionCard: {
    margin: 16,
    marginBottom: 8,
    borderRadius: 12,
    elevation: 2,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  input: {
    marginBottom: 12,
  },
  clientSelector: {
    marginBottom: 12,
  },
  measurementSelector: {
    marginBottom: 12,
  },
  statusSelector: {
    marginBottom: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    marginBottom: 30,
  },
  cancelButton: {
    flex: 1,
    marginRight: 8,
  },
  saveButton: {
    flex: 1,
    marginLeft: 8,
  },
});

export default AddOrderScreen;