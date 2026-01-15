import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  Modal,
} from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface CameraComponentProps {
  onImageSelected: (imageUri: string) => void;
  existingImages?: string[];
  maxImages?: number;
}

const CameraComponent = ({ onImageSelected, existingImages = [], maxImages = 5 }: CameraComponentProps) => {
  const [images, setImages] = useState<string[]>(existingImages);
  const [modalVisible, setModalVisible] = useState(false);

  const selectImage = () => {
    if (images.length >= maxImages) {
      Alert.alert('Limit Reached', `You can only add up to ${maxImages} images.`);
      return;
    }
    setModalVisible(true);
  };

  const takePhoto = () => {
    setModalVisible(false);
    const options = {
      mediaType: 'photo' as const,
      quality: 0.8,
      includeBase64: false,
    };

    launchCamera(options, (response) => {
      if (response.didCancel) {
        console.log('User cancelled camera');
      } else if (response.errorCode) {
        console.log('Camera Error: ', response.errorMessage);
        Alert.alert('Camera Error', response.errorMessage || 'Failed to take photo');
      } else if (response.assets && response.assets[0]) {
        const imageUri = response.assets[0].uri;
        if (imageUri) {
          const newImages = [...images, imageUri];
          setImages(newImages);
          onImageSelected(imageUri);
        }
      }
    });
  };

  const chooseFromLibrary = () => {
    setModalVisible(false);
    const options = {
      mediaType: 'photo' as const,
      quality: 0.8,
      includeBase64: false,
      selectionLimit: maxImages - images.length,
    };

    launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorCode) {
        console.log('ImagePicker Error: ', response.errorMessage);
        Alert.alert('Image Picker Error', response.errorMessage || 'Failed to select image');
      } else if (response.assets) {
        const newImageUris = response.assets
          .map(asset => asset.uri)
          .filter((uri): uri is string => uri !== undefined);
        
        if (newImageUris.length > 0) {
          const newImages = [...images, ...newImageUris];
          setImages(newImages);
          newImageUris.forEach(uri => onImageSelected(uri));
        }
      }
    });
  };

  const removeImage = (index: number) => {
    Alert.alert(
      'Remove Image',
      'Are you sure you want to remove this image?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            const newImages = images.filter((_, i) => i !== index);
            setImages(newImages);
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        {images.map((imageUri, index) => (
          <View key={index} style={styles.imageWrapper}>
            <Image source={{ uri: imageUri }} style={styles.image} />
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => removeImage(index)}
            >
              <Icon name="close" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
        ))}
        
        {images.length < maxImages && (
          <TouchableOpacity style={styles.addButton} onPress={selectImage}>
            <Icon name="add-a-photo" size={32} color="#0d6efd" />
            <Text style={styles.addButtonText}>Add Photo</Text>
          </TouchableOpacity>
        )}
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Image Source</Text>
            
            <TouchableOpacity style={styles.modalButton} onPress={takePhoto}>
              <Icon name="camera-alt" size={24} color="#0d6efd" />
              <Text style={styles.modalButtonText}>Take Photo</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.modalButton} onPress={chooseFromLibrary}>
              <Icon name="photo-library" size={24} color="#0d6efd" />
              <Text style={styles.modalButtonText}>Choose from Library</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  imageContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  imageWrapper: {
    position: 'relative',
    margin: 4,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  removeButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#f44336',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
  addButton: {
    width: 80,
    height: 80,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#0d6efd',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 4,
  },
  addButtonText: {
    fontSize: 12,
    color: '#0d6efd',
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
    marginBottom: 12,
  },
  modalButtonText: {
    fontSize: 16,
    marginLeft: 12,
    color: '#333',
  },
  cancelButton: {
    backgroundColor: '#f44336',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CameraComponent;