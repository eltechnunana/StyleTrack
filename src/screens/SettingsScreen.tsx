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
  Switch,
  Divider,
  List,
} from 'react-native-paper';
import { DataService } from '../services/DataService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';

const SettingsScreen = () => {
  const [settings, setSettings] = useState({
    defaultUnit: 'cm',
    currency: 'USD',
    businessName: '',
    businessEmail: '',
    businessPhone: '',
    notifications: true,
    autoBackup: false,
    darkMode: false,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = await DataService.getSettings();
      setSettings(savedSettings);
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveSettings = async () => {
    try {
      setLoading(true);
      await DataService.saveSettings(settings);
      Alert.alert('Success', 'Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      Alert.alert('Error', 'Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const exportData = async () => {
    Alert.alert(
      'Export Data',
      'This will export all your data to a JSON file. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Export',
          onPress: async () => {
            try {
              const clients = await DataService.getClients();
              const measurements = await DataService.getMeasurements();
              const orders = await DataService.getOrders();
              
              const exportDataObj = {
                clients,
                measurements,
                orders,
                settings,
                exportDate: new Date().toISOString(),
              };
              
              // In a real app, you would save this to a file
              console.log('Export data:', JSON.stringify(exportDataObj, null, 2));
              Alert.alert('Success', 'Data exported successfully!');
            } catch (error) {
              console.error('Error exporting data:', error);
              Alert.alert('Error', 'Failed to export data');
            }
          },
        },
      ]
    );
  };

  const importData = () => {
    Alert.alert(
      'Import Data',
      'This will replace all existing data. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Import',
          style: 'destructive',
          onPress: () => {
            // In a real app, you would implement file picker and data validation
            Alert.alert('Info', 'Import functionality would be implemented here');
          },
        },
      ]
    );
  };

  const clearAllData = () => {
    Alert.alert(
      'Clear All Data',
      'This will permanently delete all clients, measurements, and orders. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.clear();
              Alert.alert('Success', 'All data has been cleared');
              loadSettings();
            } catch (error) {
              console.error('Error clearing data:', error);
              Alert.alert('Error', 'Failed to clear data');
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.subtitle}>Configure your app preferences</Text>
      </View>

      <Card style={styles.sectionCard}>
        <Card.Title
          title="Business Information"
          left={(props) => <Icon {...props} name="business" size={24} color="#0d6efd" />}
        />
        <Card.Content>
          <TextInput
            label="Business Name"
            value={settings.businessName}
            onChangeText={(text) => setSettings({ ...settings, businessName: text })}
            style={styles.input}
            mode="outlined"
          />
          <TextInput
            label="Business Email"
            value={settings.businessEmail}
            onChangeText={(text) => setSettings({ ...settings, businessEmail: text })}
            style={styles.input}
            mode="outlined"
            keyboardType="email-address"
          />
          <TextInput
            label="Business Phone"
            value={settings.businessPhone}
            onChangeText={(text) => setSettings({ ...settings, businessPhone: text })}
            style={styles.input}
            mode="outlined"
            keyboardType="phone-pad"
          />
        </Card.Content>
      </Card>

      <Card style={styles.sectionCard}>
        <Card.Title
          title="Measurement Settings"
          left={(props) => <Icon {...props} name="straighten" size={24} color="#0d6efd" />}
        />
        <Card.Content>
          <List.Section>
            <List.Item
              title="Default Unit"
              description="Choose default measurement unit"
              left={() => <Icon name="linear-scale" size={24} color="#666" />}
              right={() => (
                <View style={styles.unitSelector}>
                  <Button
                    mode={settings.defaultUnit === 'cm' ? 'contained' : 'outlined'}
                    onPress={() => setSettings({ ...settings, defaultUnit: 'cm' })}
                    style={styles.unitButton}
                    compact
                  >
                    CM
                  </Button>
                  <Button
                    mode={settings.defaultUnit === 'inches' ? 'contained' : 'outlined'}
                    onPress={() => setSettings({ ...settings, defaultUnit: 'inches' })}
                    style={styles.unitButton}
                    compact
                  >
                    Inches
                  </Button>
                </View>
              )}
            />
            <List.Item
              title="Currency"
              description="Select your currency"
              left={() => <Icon name="attach-money" size={24} color="#666" />}
              right={() => (
                <TextInput
                  value={settings.currency}
                  onChangeText={(text) => setSettings({ ...settings, currency: text })}
                  style={styles.currencyInput}
                  mode="outlined"
                  dense
                />
              )}
            />
          </List.Section>
        </Card.Content>
      </Card>

      <Card style={styles.sectionCard}>
        <Card.Title
          title="App Preferences"
          left={(props) => <Icon {...props} name="settings" size={24} color="#0d6efd" />}
        />
        <Card.Content>
          <List.Section>
            <List.Item
              title="Enable Notifications"
              description="Receive notifications for order updates"
              left={() => <Icon name="notifications" size={24} color="#666" />}
              right={() => (
                <Switch
                  value={settings.notifications}
                  onValueChange={(value) => setSettings({ ...settings, notifications: value })}
                />
              )}
            />
            <Divider />
            <List.Item
              title="Auto Backup"
              description="Automatically backup data to cloud"
              left={() => <Icon name="backup" size={24} color="#666" />}
              right={() => (
                <Switch
                  value={settings.autoBackup}
                  onValueChange={(value) => setSettings({ ...settings, autoBackup: value })}
                />
              )}
            />
            <Divider />
            <List.Item
              title="Dark Mode"
              description="Use dark theme"
              left={() => <Icon name="brightness-6" size={24} color="#666" />}
              right={() => (
                <Switch
                  value={settings.darkMode}
                  onValueChange={(value) => setSettings({ ...settings, darkMode: value })}
                />
              )}
            />
          </List.Section>
        </Card.Content>
      </Card>

      <Card style={styles.sectionCard}>
        <Card.Title
          title="Data Management"
          left={(props) => <Icon {...props} name="storage" size={24} color="#0d6efd" />}
        />
        <Card.Content>
          <Button
            mode="outlined"
            onPress={exportData}
            style={styles.dataButton}
            icon="file-download"
          >
            Export Data
          </Button>
          <Button
            mode="outlined"
            onPress={importData}
            style={styles.dataButton}
            icon="file-upload"
          >
            Import Data
          </Button>
          <Button
            mode="contained"
            onPress={saveSettings}
            style={styles.saveButton}
            loading={loading}
            icon="save"
          >
            Save Settings
          </Button>
        </Card.Content>
      </Card>

      <Card style={[styles.sectionCard, styles.dangerCard]}>
        <Card.Title
          title="Danger Zone"
          left={(props) => <Icon {...props} name="warning" size={24} color="#f44336" />}
        />
        <Card.Content>
          <Button
            mode="contained"
            onPress={clearAllData}
            style={styles.dangerButton}
            buttonColor="#f44336"
            icon="delete-forever"
          >
            Clear All Data
          </Button>
        </Card.Content>
      </Card>
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
  input: {
    marginBottom: 12,
  },
  unitSelector: {
    flexDirection: 'row',
    gap: 8,
  },
  unitButton: {
    minWidth: 60,
  },
  currencyInput: {
    width: 80,
    height: 40,
  },
  dataButton: {
    marginBottom: 12,
  },
  saveButton: {
    marginTop: 8,
  },
  dangerCard: {
    borderColor: '#f44336',
    borderWidth: 1,
  },
  dangerButton: {
    marginTop: 8,
  },
});

export default SettingsScreen;