// app/_app.tsx
import { Stack } from 'expo-router';
import { Platform } from 'react-native';

// Import web fonts stylesheet only when running on web
if (Platform.OS === 'web') {
  try {
    const id = 'vazirmatn-google-font';
    if (typeof document !== 'undefined' && !document.getElementById(id)) {
      const link = document.createElement('link');
      link.id = id;
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=Vazirmatn:wght@200;300;400;500;600;700;800;900&display=swap';
      document.head.appendChild(link);
    }
  } catch {}
}

export default function App() {
  return <Stack />;
}
