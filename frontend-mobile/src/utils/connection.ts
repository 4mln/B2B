import { useMessageBoxStore } from '@/context/messageBoxStore';
import i18n from '@/i18n';
import { runBackendTests } from '@/utils/backendTest';
import NetInfo from '@react-native-community/netinfo';

export const ensureOnlineOrMessage = async (): Promise<boolean> => {
  try {
    // Prefer native NetInfo when available; otherwise fall back to navigator.onLine
    let isConnected = true;
    let isInternetReachable = true;
    try {
      const net = await NetInfo.fetch();
      isConnected = !!net.isConnected;
      isInternetReachable = net.isInternetReachable !== false;
    } catch {
      if (typeof navigator !== 'undefined') {
        isConnected = (navigator as any).onLine !== false;
        isInternetReachable = isConnected;
      }
    }
    if (!isConnected || !isInternetReachable) {
      const backLabel = i18n.t('common.back');
      const title = i18n.t('errors.networkErrorTitle', 'Connection Error');
      const message = i18n.t('errors.networkOffline', 'No internet connection. Please check your network.');
      useMessageBoxStore.getState().show({ title, message, actions: [{ label: backLabel }] });
      return false;
    }

    const results = await runBackendTests();
    if (results.overall) return true;

    const backLabel = i18n.t('common.back');
    const title = i18n.t('errors.networkErrorTitle', 'Connection Error');
    const message = i18n.t('errors.serverMaintenance', 'Currently servers are not reachable or under maintenance. We will be back soon.');
    useMessageBoxStore.getState().show({ title, message, actions: [{ label: backLabel }] });
    return false;
  } catch {
    const backLabel = i18n.t('common.back');
    const title = i18n.t('errors.networkErrorTitle', 'Connection Error');
    const message = i18n.t('errors.unknownError', 'An unknown error occurred.');
    useMessageBoxStore.getState().show({ title, message, actions: [{ label: backLabel }] });
    return false;
  }
};


