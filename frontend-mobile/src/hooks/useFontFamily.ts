import { fontFamilies } from '@/theme/typography';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

export const useFontFamily = () => {
  const { i18n } = useTranslation();

  const fontFamily = useMemo(() => {
    const currentLanguage = i18n.language;

    if (currentLanguage === 'fa') {
      return fontFamilies.persian;
    }

    return fontFamilies.english;
  }, [i18n.language]);

  return fontFamily;
};

export default useFontFamily;