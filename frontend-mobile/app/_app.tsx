// app/_app.tsx
import { Stack } from 'expo-router';
import { Platform } from 'react-native';

// Import web fonts stylesheet only when running on web
if (Platform.OS === 'web') {
  try {
    // eslint-disable-next-line import/no-unresolved
    require('../src/styles/fonts.css');
  } catch (err) {
    // ignore in environments where css import isn't supported
  }
}

export default function App() {
  return <Stack />;
}
