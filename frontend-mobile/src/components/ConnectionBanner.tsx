import { useColorScheme } from '@/hooks/use-color-scheme';
import { colors } from '@/theme/colors';
import { semanticSpacing } from '@/theme/spacing';
import { runBackendTests } from '@/utils/backendTest';
import NetInfo from '@react-native-community/netinfo';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export const ConnectionBanner: React.FC = () => {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [status, setStatus] = useState<'ok' | 'offline' | 'server'>('ok');

  const check = async () => {
    const net = await NetInfo.fetch();
    if (!net.isConnected || !net.isInternetReachable) {
      setStatus('offline');
      return;
    }
    try {
      const res = await runBackendTests();
      setStatus(res.overall ? 'ok' : 'server');
    } catch {
      setStatus('server');
    }
  };

  useEffect(() => {
    check();
    const unsub = NetInfo.addEventListener(() => check());
    const interval = setInterval(check, 30000);
    return () => { unsub(); clearInterval(interval); };
  }, []);

  if (status === 'ok') return null;

  const message = status === 'offline'
    ? t('errors.networkOffline')
    : t('errors.serverMaintenance');

  return (
    <View style={[styles.container, { backgroundColor: isDark ? colors.error[700] : colors.error[100], borderColor: isDark ? colors.error[600] : colors.error[300] }]}> 
      <Text style={{ color: isDark ? colors.text.inverse : colors.error[700], textAlign: 'center' }}>{message}</Text>
      <TouchableOpacity onPress={check} style={styles.retry}>
        <Text style={{ color: isDark ? colors.text.inverse : colors.error[700], fontWeight: '700' }}>{t('common.retry')}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: semanticSpacing.md,
    paddingVertical: semanticSpacing.xs,
    borderBottomWidth: 1,
  },
  retry: {
    position: 'absolute',
    right: semanticSpacing.md,
    top: semanticSpacing.xs,
    bottom: semanticSpacing.xs,
    justifyContent: 'center',
  }
});

export default ConnectionBanner;



