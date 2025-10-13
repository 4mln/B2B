import { getItem, saveItem } from '@/utils/secureStore';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { I18nManager, Platform } from 'react-native';

// Import translation files
import en from './locales/en.json';
import fa from './locales/fa.json';

const resources = {
  en: { translation: en },
  fa: { translation: fa },
};

const getStoredLangWeb = () => {
  try {
    const v = typeof localStorage !== 'undefined' ? localStorage.getItem('app_lang') : null;
    return v || null;
  } catch {
    return null;
  }
};

const storeLang = async (lng: string) => {
  try {
    if (typeof localStorage !== 'undefined') localStorage.setItem('app_lang', lng);
  } catch {}
  try {
    await saveItem('app_lang', lng);
  } catch {}
};

// Default to Farsi if nothing stored synchronously (web uses localStorage)
const initialLng = getStoredLangWeb() || 'fa';

i18n.use(initReactI18next).init({
  resources,
  lng: initialLng,
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
  react: { useSuspense: false },
});

// Apply initial dir on web
if (typeof document !== 'undefined') {
  document.documentElement.dir = initialLng === 'fa' ? 'rtl' : 'ltr';
}

// After init, load native-stored language asynchronously and apply if different
(async () => {
  try {
    const nativeLang = await getItem('app_lang');
    if (nativeLang && nativeLang !== i18n.language) {
      await i18n.changeLanguage(nativeLang);
    }
  } catch {}
})();

// Listen for manual changes to persist and flip RTL if needed
i18n.on('languageChanged', async (lng) => {
  await storeLang(lng);
  const shouldRTL = lng === 'fa';
  
  // Update document direction for web
  if (typeof document !== 'undefined') {
    document.documentElement.dir = shouldRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = lng;
  }
  
  // For native platforms, only change RTL if needed
  if (Platform.OS !== 'web' && I18nManager.isRTL !== shouldRTL) {
    try {
      I18nManager.allowRTL(shouldRTL);
      I18nManager.forceRTL(shouldRTL);
      // Don't reload immediately, let the UI update naturally
    } catch (error) {
      console.error('RTL change error:', error);
    }
  }
});

export default i18n;
