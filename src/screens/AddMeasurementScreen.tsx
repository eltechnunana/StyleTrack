import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Appbar } from 'react-native-paper';
import { useRoute } from '@react-navigation/native';
import MeasurementForm from '../components/MeasurementForm';
import { DataService } from '../services/DataService';
import { Measurement } from '../types';

const AddMeasurementScreen = ({ navigation }: any) => {
  const route = useRoute();
  const { clientId } = route.params as { clientId?: string };

  const handleSave = async (measurement: Measurement) => {
    try {
      await DataService.saveMeasurement(measurement);
      navigation.goBack();
    } catch (error) {
      console.error('Error saving measurement:', error);
    }
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={handleCancel} />
        <Appbar.Content title="Add Measurement" />
      </Appbar.Header>
      
      <MeasurementForm
        clientId={clientId}
        onSave={handleSave}
        onCancel={handleCancel}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
});

export default AddMeasurementScreen;