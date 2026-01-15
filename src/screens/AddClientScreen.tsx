import React, { useState } from 'react';
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
import { Client } from '../types';

const AddClientScreen = ({ navigation }: any) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'custom'>('male');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const validateForm = (): boolean => {
    if (!name.trim()) {
      Alert.alert('Validation Error', 'Please enter client name');
      return false;
    }
    if (email && !isValidEmail(email)) {
      Alert.alert('Validation Error', 'Please enter a valid email address');
      return false;
    }
    if (phone && !isValidPhone(phone)) {
      Alert.alert('Validation Error', 'Please enter a valid phone number');
      return false;
    }
    return true;
  };

  const isValidEmail = (emailAddress: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(emailAddress);
  };

  const isValidPhone = (phoneNumber: string): boolean => {
    const phoneRegex = /^[+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phoneNumber.replace(/\s/g, ''));
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      
      const client: Client = {
        id: Date.now().toString(),
        name: name.trim(),
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        gender,
        notes: notes.trim() || undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await DataService.saveClient(client);
      Alert.alert('Success', 'Client added successfully!');
      navigation.goBack();
    } catch (error) {
      console.error('Error saving client:', error);
      Alert.alert('Error', 'Failed to save client. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Add New Client</Text>
        <Text style={styles.subtitle}>Enter client details</Text>
      </View>

      <Card style={styles.sectionCard}>
        <Card.Title
          title="Basic Information"
          left={() => <Text>👤</Text>}
        />
        <Card.Content>
          <TextInput
            label="Full Name *"
            value={name}
            onChangeText={setName}
            placeholder="Enter client name"
            mode="outlined"
            style={styles.input}
            left={<TextInput.Icon icon="account" />}
          />

          <TextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="client@example.com"
            mode="outlined"
            style={styles.input}
            left={<TextInput.Icon icon="email" />}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <TextInput
            label="Phone"
            value={phone}
            onChangeText={setPhone}
            placeholder="+1234567890"
            mode="outlined"
            style={styles.input}
            left={<TextInput.Icon icon="phone" />}
            keyboardType="phone-pad"
          />

          <Text style={styles.sectionLabel}>Gender</Text>
          <SegmentedButtons
            value={gender}
            onValueChange={(value) => setGender(value as 'male' | 'female' | 'custom')}
            buttons={[
              { value: 'male', label: 'Male' },
              { value: 'female', label: 'Female' },
              { value: 'custom', label: 'Custom' },
            ]}
            style={styles.genderSelector}
          />

          <TextInput
            label="Notes"
            value={notes}
            onChangeText={setNotes}
            placeholder="Any special notes about this client"
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
          Save Client
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
  genderSelector: {
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

export default AddClientScreen;