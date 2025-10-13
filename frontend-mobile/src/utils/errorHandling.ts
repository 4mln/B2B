import { Alert } from 'react-native';
import { useMessageBoxStore } from '@/context/messageBoxStore';

export interface ApiError {
  status?: number;
  message?: string;
  detail?: string;
  error?: string;
}

export const handleApiError = (error: ApiError): string => {
  if (error.status === 403) {
    return 'You do not have permission to perform this action';
  } else if (error.status === 404) {
    return 'Resource not found';
  } else if (error.status === 400) {
    return error.message || error.detail || 'Invalid request';
  } else if (error.status === 401) {
    return 'Please log in to continue';
  } else if (error.status === 500) {
    return 'Server error. Please try again later';
  } else if (error.status === 0 || !error.status) {
    return 'Network error. Please check your connection';
  }
  return error.message || error.detail || error.error || 'An error occurred';
};

export const showErrorAlert = (error: ApiError, title = 'Error') => {
  const message = handleApiError(error);
  Alert.alert(title, message);
};

export const showErrorMessageBox = (error: ApiError, title = 'Error') => {
  const message = handleApiError(error);
  useMessageBoxStore.getState().show({
    title,
    message,
    actions: [{ label: 'OK' }],
  });
};

export const handleCapabilityError = (requiredCapability: string) => {
  const message = `You need the "${requiredCapability.replace('can_', '').replace('_', ' ')}" capability to perform this action.`;
  Alert.alert('Permission Denied', message);
};

export const handleStoreError = (error: ApiError) => {
  if (error.status === 403) {
    Alert.alert(
      'Store Access Denied',
      'You do not have permission to manage stores. Please contact support if you believe this is an error.',
      [{ text: 'OK' }]
    );
  } else {
    showErrorAlert(error, 'Store Error');
  }
};

export const handleProductError = (error: ApiError) => {
  if (error.status === 403) {
    Alert.alert(
      'Product Access Denied',
      'You do not have permission to manage products. Please contact support if you believe this is an error.',
      [{ text: 'OK' }]
    );
  } else {
    showErrorAlert(error, 'Product Error');
  }
};

export const handleAuthError = (error: ApiError) => {
  if (error.status === 401) {
    Alert.alert(
      'Session Expired',
      'Your session has expired. Please log in again.',
      [
        { text: 'OK', onPress: () => {
          // This would typically trigger a logout
          console.log('Redirect to login');
        }}
      ]
    );
  } else {
    showErrorAlert(error, 'Authentication Error');
  }
};

