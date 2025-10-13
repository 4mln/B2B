import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

import { colors } from '@/theme/colors';
import { semanticSpacing } from '@/theme/spacing';
import { fontWeights, lineHeights, typography } from '@/theme/typography';

export default function AddScreen() {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const handleAddProduct = () => {
    router.push('/product/create');
  };

  const handleAddRFQ = () => {
    router.push('/rfq/create');
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? colors.background.dark : colors.background.light,
    },
    header: {
      paddingHorizontal: semanticSpacing.md,
      paddingVertical: semanticSpacing.lg,
      backgroundColor: isDark ? colors.background.dark : colors.background.light,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? colors.border.light : colors.border.light,
    },
    headerTitle: {
      fontSize: typography.h3.fontSize,
      fontWeight: typography.h3.fontWeight,
      color: isDark ? colors.text.primary : colors.text.primary,
      textAlign: 'center',
    },
    content: {
      flex: 1,
      paddingHorizontal: semanticSpacing.md,
      paddingTop: semanticSpacing.xl,
    },
    section: {
      marginBottom: semanticSpacing.xl,
    },
    sectionTitle: {
      fontSize: typography.h4.fontSize,
      fontWeight: typography.h4.fontWeight,
      color: isDark ? colors.text.primary : colors.text.primary,
      marginBottom: semanticSpacing.md,
    },
    optionCard: {
      backgroundColor: isDark ? colors.card.background : colors.card.background,
      borderRadius: semanticSpacing.radius.lg,
      padding: semanticSpacing.lg,
      marginBottom: semanticSpacing.md,
      borderWidth: 1,
      borderColor: isDark ? colors.card.border : colors.card.border,
      ...semanticSpacing.shadow.md,
    },
    optionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: semanticSpacing.sm,
    },
    optionIcon: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: colors.primary[100],
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: semanticSpacing.md,
    },
    optionTitle: {
      fontSize: typography.bodyLarge.fontSize,
      fontWeight: fontWeights.semibold,
      color: isDark ? colors.text.primary : colors.text.primary,
      flex: 1,
    },
    optionDescription: {
      fontSize: typography.body.fontSize,
      color: isDark ? colors.text.secondary : colors.text.secondary,
      lineHeight: typography.body.fontSize * lineHeights.normal,
    },
    quickActions: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: semanticSpacing.lg,
    },
    quickActionButton: {
      flex: 1,
      backgroundColor: colors.primary[500],
      borderRadius: semanticSpacing.radius.lg,
      paddingVertical: semanticSpacing.md,
      marginHorizontal: semanticSpacing.xs,
      alignItems: 'center',
    },
    quickActionText: {
      fontSize: typography.button.fontSize,
      fontWeight: typography.button.fontWeight,
      color: colors.background.light,
    },
    recentSection: {
      marginTop: semanticSpacing.xl,
    },
    recentItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: semanticSpacing.md,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? colors.border.light : colors.border.light,
    },
    recentIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.gray[100],
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: semanticSpacing.md,
    },
    recentText: {
      flex: 1,
      fontSize: typography.body.fontSize,
      color: isDark ? colors.text.primary : colors.text.primary,
    },
    recentTime: {
      fontSize: typography.caption.fontSize,
      color: isDark ? colors.text.tertiary : colors.text.tertiary,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('add.header', 'Add New')}</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Main Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('add.whatToAdd', 'What would you like to add?')}</Text>
          
          {/* Add Product */}
          <TouchableOpacity style={styles.optionCard} onPress={handleAddProduct}>
            <View style={styles.optionHeader}>
              <View style={styles.optionIcon}>
                <Ionicons name="cube-outline" size={24} color={colors.primary[600]} />
              </View>
              <Text style={styles.optionTitle}>{t('add.addProduct', 'Add Product')}</Text>
            </View>
            <Text style={styles.optionDescription}>
              {t('add.addProductDesc', 'List a new product or service for sale in the marketplace')}
            </Text>
          </TouchableOpacity>

          {/* Create RFQ */}
          <TouchableOpacity style={styles.optionCard} onPress={handleAddRFQ}>
            <View style={styles.optionHeader}>
              <View style={styles.optionIcon}>
                <Ionicons name="document-text-outline" size={24} color={colors.primary[600]} />
              </View>
              <Text style={styles.optionTitle}>{t('add.createRfq', 'Create RFQ')}</Text>
            </View>
            <Text style={styles.optionDescription}>
              {t('add.createRfqDesc', 'Request quotes from suppliers for your business needs')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('add.quickActions', 'Quick Actions')}</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.quickActionButton} onPress={handleAddProduct}>
              <Ionicons name="add" size={20} color={colors.background.light} />
              <Text style={styles.quickActionText}>{t('add.product', 'Product')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionButton} onPress={handleAddRFQ}>
              <Ionicons name="document" size={20} color={colors.background.light} />
              <Text style={styles.quickActionText}>{t('add.rfq', 'RFQ')}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.recentSection}>
          <Text style={styles.sectionTitle}>{t('add.recentActivity', 'Recent Activity')}</Text>
          
          <TouchableOpacity style={styles.recentItem}>
            <View style={styles.recentIcon}>
              <Ionicons name="cube" size={20} color={colors.gray[600]} />
            </View>
            <Text style={styles.recentText}>{t('add.sampleProduct1', 'Industrial Steel Pipes')}</Text>
            <Text style={styles.recentTime}>{t('add.timeHours', { count: 2, defaultValue: '2 hours ago' })}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.recentItem}>
            <View style={styles.recentIcon}>
              <Ionicons name="document-text" size={20} color={colors.gray[600]} />
            </View>
            <Text style={styles.recentText}>{t('add.sampleRfq1', 'Construction Materials RFQ')}</Text>
            <Text style={styles.recentTime}>{t('add.timeDays', { count: 1, defaultValue: '1 day ago' })}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.recentItem}>
            <View style={styles.recentIcon}>
              <Ionicons name="cube" size={20} color={colors.gray[600]} />
            </View>
            <Text style={styles.recentText}>{t('add.sampleProduct2', 'Electrical Components')}</Text>
            <Text style={styles.recentTime}>{t('add.timeDays', { count: 3, defaultValue: '3 days ago' })}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
