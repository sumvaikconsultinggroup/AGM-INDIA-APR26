import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { colors, spacing, borderRadius } from '../../theme';
import { pickImage, takePhoto, uploadImage } from '../../services/imageUpload';

interface Props {
  onImageUploaded: (url: string) => void;
  currentImage?: string;
  folder?: string;
}

export function ImagePickerButton({ onImageUploaded, currentImage, folder = 'general' }: Props) {
  const [localUri, setLocalUri] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const handlePick = () => {
    Alert.alert('Select Image', 'Choose an option', [
      { text: 'Camera', onPress: handleCamera },
      { text: 'Gallery', onPress: handleGallery },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handleGallery = async () => {
    try {
      const uri = await pickImage();
      if (uri) {
        setLocalUri(uri);
        setUploading(true);
        const url = await uploadImage(uri, folder);
        onImageUploaded(url);
        setUploading(false);
      }
    } catch (error: any) {
      setUploading(false);
      Alert.alert('Error', error.message || 'Failed to upload image');
    }
  };

  const handleCamera = async () => {
    try {
      const uri = await takePhoto();
      if (uri) {
        setLocalUri(uri);
        setUploading(true);
        const url = await uploadImage(uri, folder);
        onImageUploaded(url);
        setUploading(false);
      }
    } catch (error: any) {
      setUploading(false);
      Alert.alert('Error', error.message || 'Failed to upload image');
    }
  };

  const displayUri = localUri || currentImage;

  return (
    <TouchableOpacity style={styles.container} onPress={handlePick} disabled={uploading}>
      {displayUri ? (
        <View style={styles.imageContainer}>
          <Image source={{ uri: displayUri }} style={styles.image} />
          {uploading && (
            <View style={styles.uploadOverlay}>
              <ActivityIndicator color={colors.gold.main} />
              <Text style={styles.uploadText}>Uploading...</Text>
            </View>
          )}
        </View>
      ) : (
        <View style={styles.placeholder}>
          <Text style={styles.placeholderIcon}>📷</Text>
          <Text style={styles.placeholderText}>Tap to add image</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 200,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: colors.border.gold as string,
    borderStyle: 'dashed',
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  imageContainer: { width: '100%', height: '100%' },
  image: { width: '100%', height: '100%', resizeMode: 'cover' },
  uploadOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadText: { color: colors.gold.light, marginTop: spacing.xs, fontSize: 12 },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.cream,
  },
  placeholderIcon: { fontSize: 40, marginBottom: spacing.sm },
  placeholderText: { color: colors.text.secondary, fontSize: 14 },
});
