export { useColorScheme as useDeviceColorScheme } from 'react-native';
import { useThemeModeStore } from '@/theme/modeStore';

export const useColorScheme = () => {
  const mode = useThemeModeStore((s) => s.mode);
  return mode;
};
