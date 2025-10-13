import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';
import { apiClient } from './api';

// Image upload types
export type ImageUploadResult = {
  uri: string;
  width: number;
  height: number;
  type: string;
  fileName: string;
  fileSize: number;
};

// Document upload types
export type DocumentUploadResult = {
  uri: string;
  type: string;
  name: string;
  size: number;
};

// Request camera permissions
export async function requestCameraPermissions() {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  return status === 'granted';
}

// Request media library permissions
export async function requestMediaLibraryPermissions() {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  return status === 'granted';
}

// Pick image from camera
export async function takePhoto(): Promise<ImageUploadResult | null> {
  const permissionGranted = await requestCameraPermissions();
  
  if (!permissionGranted) {
    console.log('Camera permission not granted');
    return null;
  }
  
  try {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    
    if (result.canceled) {
      return null;
    }
    
    const asset = result.assets[0];
    const fileInfo = await FileSystem.getInfoAsync(asset.uri);
    
    return {
      uri: asset.uri,
      width: asset.width,
      height: asset.height,
      type: asset.type || 'image/jpeg',
      fileName: asset.fileName || 'photo.jpg',
      fileSize: fileInfo.size || 0,
    };
  } catch (error) {
    console.error('Error taking photo:', error);
    return null;
  }
}

// Pick image from library
export async function pickImage(): Promise<ImageUploadResult | null> {
  const permissionGranted = await requestMediaLibraryPermissions();
  
  if (!permissionGranted) {
    console.log('Media library permission not granted');
    return null;
  }
  
  try {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    
    if (result.canceled) {
      return null;
    }
    
    const asset = result.assets[0];
    const fileInfo = await FileSystem.getInfoAsync(asset.uri);
    
    return {
      uri: asset.uri,
      width: asset.width,
      height: asset.height,
      type: asset.type || 'image/jpeg',
      fileName: asset.fileName || 'image.jpg',
      fileSize: fileInfo.size || 0,
    };
  } catch (error) {
    console.error('Error picking image:', error);
    return null;
  }
}

// Pick document (PDF, Excel, etc.)
export async function pickDocument(): Promise<DocumentUploadResult | null> {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['application/pdf', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
      copyToCacheDirectory: true,
    });
    
    if (result.canceled) {
      return null;
    }
    
    const asset = result.assets[0];
    const fileInfo = await FileSystem.getInfoAsync(asset.uri);
    
    return {
      uri: asset.uri,
      type: asset.mimeType || 'application/octet-stream',
      name: asset.name || 'document',
      size: fileInfo.size || 0,
    };
  } catch (error) {
    console.error('Error picking document:', error);
    return null;
  }
}

// Upload file to server
export async function uploadFile(
  fileUri: string, 
  fileType: string, 
  fileName: string,
  endpoint: string = '/uploads'
): Promise<string | null> {
  try {
    // Create form data
    const formData = new FormData();
    formData.append('file', {
      uri: Platform.OS === 'android' ? fileUri : fileUri.replace('file://', ''),
      type: fileType,
      name: fileName,
    } as any);
    
    // Upload to server
    const response = await apiClient.post(endpoint, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    if (response.status === 200 && response.data.url) {
      return response.data.url;
    }
    
    return null;
  } catch (error) {
    console.error('Error uploading file:', error);
    return null;
  }
}