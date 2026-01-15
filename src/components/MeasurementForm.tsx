import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {
  Card,
  Button,
  TextInput as PaperTextInput,
  SegmentedButtons,
  FAB,
} from 'react-native-paper';
import { DataService } from '../services/DataService';
import { Client, Measurement } from '../types';
import CameraComponent from './CameraComponent';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface MeasurementFormProps {
  clientId?: string;
  existingMeasurement?: Measurement;
  onSave: (measurement: Measurement) => void;
  onCancel: () => void;
}

const MeasurementForm = ({ clientId, existingMeasurement, onSave, onCancel }: MeasurementFormProps) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<string>(clientId || '');
  const [gender, setGender] = useState<'male' | 'female' | 'custom'>('male');
  const [unit, setUnit] = useState<'cm' | 'inches'>('cm');
  const [measurements, setMeasurements] = useState({
    height: '',
    neck: '',
    shoulder: '',
    chest: '',
    waist: '',
    hip: '',
    armLength: '',
    sleeveLength: '',
    backWidth: '',
    trouserLength: '',
    thigh: '',
    inseam: '',
  });
  const [notes, setNotes] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [customFields, setCustomFields] = useState<{ [key: string]: string }>({});
  const [showCustomField, setShowCustomField] = useState(false);
  const [newFieldName, setNewFieldName] = useState('');

  useEffect(() => {
    loadClients();
    loadSettings();
    if (existingMeasurement) {
      loadExistingMeasurement();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadClients = async () => {
    try {
      const data = await DataService.getClients();
      setClients(data);
    } catch (error) {
      console.error('Error loading clients:', error);
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

  const loadExistingMeasurement = () => {
    if (existingMeasurement) {
      setSelectedClient(existingMeasurement.clientId);
      setGender(existingMeasurement.gender);
      setUnit(existingMeasurement.unit);
      setNotes(existingMeasurement.notes || '');
      setPhotos(existingMeasurement.photos || []);
      
      setMeasurements({
        height: existingMeasurement.height?.toString() || '',
        neck: existingMeasurement.neck?.toString() || '',
        shoulder: existingMeasurement.shoulder?.toString() || '',
        chest: existingMeasurement.chest?.toString() || '',
        waist: existingMeasurement.waist?.toString() || '',
        hip: existingMeasurement.hip?.toString() || '',
        armLength: existingMeasurement.armLength?.toString() || '',
        sleeveLength: existingMeasurement.sleeveLength?.toString() || '',
        backWidth: existingMeasurement.backWidth?.toString() || '',
        trouserLength: existingMeasurement.trouserLength?.toString() || '',
        thigh: existingMeasurement.thigh?.toString() || '',
        inseam: existingMeasurement.inseam?.toString() || '',
      });
      
      if (existingMeasurement.customFields) {
        const customFieldsObj: { [key: string]: string } = {};
        Object.entries(existingMeasurement.customFields).forEach(([key, value]) => {
          customFieldsObj[key] = value.toString();
        });
        setCustomFields(customFieldsObj);
      }
    }
  };

  const handleMeasurementChange = (field: string, value: string) => {
    setMeasurements(prev => ({ ...prev, [field]: value }));
  };

  const addCustomField = () => {
    if (newFieldName.trim()) {
      setCustomFields(prev => ({ ...prev, [newFieldName]: '' }));
      setNewFieldName('');
      setShowCustomField(false);
    }
  };

  const removeCustomField = (fieldName: string) => {
    Alert.alert(
      'Remove Field',
      `Remove "${fieldName}" field?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            const updated = { ...customFields };
            delete updated[fieldName];
            setCustomFields(updated);
          },
        },
      ]
    );
  };

  const handlePhotoSelected = (imageUri: string) => {
    setPhotos(prev => [...prev, imageUri]);
  };

  const convertToNumber = (value: string): number | undefined => {
    const num = parseFloat(value);
    return isNaN(num) ? undefined : num;
  };

  const validateForm = (): boolean => {
    if (!selectedClient) {
      Alert.alert('Validation Error', 'Please select a client');
      return false;
    }
    return true;
  };

  const handleSave = () => {
    if (!validateForm()) return;

    const client = clients.find(c => c.id === selectedClient);
    if (!client) {
      Alert.alert('Error', 'Selected client not found');
      return;
    }

    const customFieldsObj: { [key: string]: number } = {};
    Object.entries(customFields).forEach(([key, value]) => {
      const num = convertToNumber(value);
      if (num !== undefined) {
        customFieldsObj[key] = num;
      }
    });

    const measurement: Measurement = {
      id: existingMeasurement?.id || Date.now().toString(),
      clientId: selectedClient,
      clientName: client.name,
      gender,
      unit,
      height: convertToNumber(measurements.height),
      neck: convertToNumber(measurements.neck),
      shoulder: convertToNumber(measurements.shoulder),
      chest: convertToNumber(measurements.chest),
      waist: convertToNumber(measurements.waist),
      hip: convertToNumber(measurements.hip),
      armLength: convertToNumber(measurements.armLength),
      sleeveLength: convertToNumber(measurements.sleeveLength),
      backWidth: convertToNumber(measurements.backWidth),
      trouserLength: convertToNumber(measurements.trouserLength),
      thigh: convertToNumber(measurements.thigh),
      inseam: convertToNumber(measurements.inseam),
      customFields: Object.keys(customFieldsObj).length > 0 ? customFieldsObj : undefined,
      notes: notes.trim() || undefined,
      photos: photos.length > 0 ? photos : undefined,
      createdAt: existingMeasurement?.createdAt || new Date(),
      updatedAt: new Date(),
    };

    onSave(measurement);
  };

  const measurementFields = [
    { key: 'height', label: 'Height', icon: 'height' },
    { key: 'neck', label: 'Neck', icon: 'person' },
    { key: 'shoulder', label: 'Shoulder', icon: 'accessibility' },
    { key: 'chest', label: 'Chest/Bust', icon: 'favorite' },
    { key: 'waist', label: 'Waist', icon: 'circle' },
    { key: 'hip', label: 'Hip', icon: 'circle' },
    { key: 'armLength', label: 'Arm Length', icon: 'hand' },
    { key: 'sleeveLength', label: 'Sleeve Length', icon: 'content-cut' },
    { key: 'backWidth', label: 'Back Width', icon: 'accessibility' },
    { key: 'trouserLength', label: 'Trouser Length', icon: 'height' },
    { key: 'thigh', label: 'Thigh', icon: 'circle' },
    { key: 'inseam', label: 'Inseam', icon: 'height' },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Card style={styles.sectionCard}>
        <Card.Title title="Client Information" />
        <Card.Content>
          <SegmentedButtons
            value={selectedClient}
            onValueChange={setSelectedClient}
            buttons={clients.map(client => ({
              value: client.id,
              label: client.name,
            }))}
            style={styles.clientSelector}
          />
          
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

          <SegmentedButtons
            value={unit}
            onValueChange={(value) => setUnit(value as 'cm' | 'inches')}
            buttons={[
              { value: 'cm', label: 'CM' },
              { value: 'inches', label: 'Inches' },
            ]}
            style={styles.unitSelector}
          />
        </Card.Content>
      </Card>

      <Card style={styles.sectionCard}>
        <Card.Title title="Body Measurements" />
        <Card.Content>
          <View style={styles.measurementsGrid}>
            {measurementFields.map((field) => (
              <View key={field.key} style={styles.measurementInput}>
                <PaperTextInput
                  label={field.label}
                  value={measurements[field.key as keyof typeof measurements]}
                  onChangeText={(text) => handleMeasurementChange(field.key, text)}
                  keyboardType="numeric"
                  placeholder="0"
                  right={<PaperTextInput.Affix text={unit} />}
                  mode="outlined"
                  dense
                />
              </View>
            ))}
          </View>
        </Card.Content>
      </Card>

      {Object.keys(customFields).length > 0 && (
        <Card style={styles.sectionCard}>
          <Card.Title title="Custom Measurements" />
          <Card.Content>
            <View style={styles.customFieldsContainer}>
              {Object.entries(customFields).map(([fieldName, value]) => (
                <View key={fieldName} style={styles.customFieldRow}>
                  <View style={styles.customFieldInput}>
                    <PaperTextInput
                      label={fieldName}
                      value={value}
                      onChangeText={(text) => setCustomFields(prev => ({ ...prev, [fieldName]: text }))}
                      keyboardType="numeric"
                      placeholder="0"
                      right={<PaperTextInput.Affix text={unit} />}
                      mode="outlined"
                      dense
                    />
                  </View>
                  <TouchableOpacity
                    style={styles.removeFieldButton}
                    onPress={() => removeCustomField(fieldName)}
                  >
                    <Icon name="close" size={20} color="#dc3545" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </Card.Content>
        </Card>
      )}

      {showCustomField && (
        <Card style={styles.sectionCard}>
          <Card.Content>
            <PaperTextInput
              label="Field Name"
              value={newFieldName}
              onChangeText={setNewFieldName}
              placeholder="e.g., Wrist, Ankle"
              mode="outlined"
              dense
            />
            <View style={styles.customFieldButtons}>
              <Button
                mode="outlined"
                onPress={() => setShowCustomField(false)}
                style={styles.customFieldButton}
                compact
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={addCustomField}
                style={styles.customFieldButton}
                compact
              >
                Add Field
              </Button>
            </View>
          </Card.Content>
        </Card>
      )}

      <Card style={styles.sectionCard}>
        <Card.Title title="Style Photos" />
        <Card.Content>
          <CameraComponent
            onImageSelected={handlePhotoSelected}
            existingImages={photos}
            maxImages={5}
          />
        </Card.Content>
      </Card>

      <Card style={styles.sectionCard}>
        <Card.Title title="Additional Notes" />
        <Card.Content>
          <PaperTextInput
            label="Notes"
            value={notes}
            onChangeText={setNotes}
            placeholder="Any special fit preferences or instructions"
            multiline
            numberOfLines={4}
            mode="outlined"
          />
        </Card.Content>
      </Card>

      <View style={styles.actionButtons}>
        <Button
          mode="outlined"
          onPress={onCancel}
          style={styles.cancelButton}
        >
          Cancel
        </Button>
        <Button
          mode="contained"
          onPress={handleSave}
          style={styles.saveButton}
        >
          {existingMeasurement ? 'Update' : 'Save'} Measurement
        </Button>
      </View>

      {!showCustomField && (
        <FAB
          style={styles.addCustomFieldFab}
          icon="plus"
          onPress={() => setShowCustomField(true)}
          color="#fff"
          label="Add Custom Field"
        />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  sectionCard: {
    margin: 16,
    marginBottom: 8,
    borderRadius: 12,
    elevation: 2,
  },
  clientSelector: {
    marginBottom: 16,
  },
  genderSelector: {
    marginBottom: 16,
  },
  unitSelector: {
    marginBottom: 16,
  },
  measurementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  measurementInput: {
    width: '50%',
    paddingHorizontal: 8,
    marginBottom: 12,
  },
  customFieldsContainer: {
    marginTop: 8,
  },
  customFieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  customFieldInput: {
    flex: 1,
    marginRight: 8,
  },
  removeFieldButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
  },
  customFieldButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  customFieldButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    marginBottom: 80,
  },
  cancelButton: {
    flex: 1,
    marginRight: 8,
  },
  saveButton: {
    flex: 1,
    marginLeft: 8,
  },
  addCustomFieldFab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#0d6efd',
  },
});

export default MeasurementForm;