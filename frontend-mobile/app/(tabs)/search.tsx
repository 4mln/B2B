import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    RefreshControl,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

import { FilterBottomSheet } from '@/components/FilterBottomSheet';
import ProductCard from '@/components/ProductCard';
import { useSearchProducts } from '@/features/products/hooks';
import { useProductsStore } from '@/features/products/store';
import { colors } from '@/theme/colors';
import { semanticSpacing } from '@/theme/spacing';
import { fontWeights, typography } from '@/theme/typography';
import { useRouter } from 'expo-router';

export default function SearchScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  const { products } = useProductsStore();
  const searchMutation = useSearchProducts();

  const handleSearch = async () => {
    await searchMutation.mutateAsync({
      query: searchQuery,
      filters: { sortBy },
    } as any);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    // Implement refresh logic
    setTimeout(() => setRefreshing(false), 1000);
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? colors.background.dark : colors.background.light,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: semanticSpacing.md,
      paddingVertical: semanticSpacing.sm,
      backgroundColor: isDark ? colors.background.dark : colors.background.light,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? colors.border.light : colors.border.light,
    },
    searchContainer: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDark ? colors.gray[800] : colors.gray[100],
      borderRadius: semanticSpacing.radius.lg,
      paddingHorizontal: semanticSpacing.md,
      marginRight: semanticSpacing.sm,
    },
    searchInput: {
      flex: 1,
      paddingVertical: semanticSpacing.sm,
      fontSize: typography.body.fontSize,
      color: isDark ? colors.text.primary : colors.text.primary,
    },
    filterButton: {
      padding: semanticSpacing.sm,
      backgroundColor: colors.primary[500],
      borderRadius: semanticSpacing.radius.md,
    },
    sortContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: semanticSpacing.md,
      paddingVertical: semanticSpacing.sm,
      backgroundColor: isDark ? colors.background.dark : colors.background.light,
    },
    sortButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: semanticSpacing.md,
      paddingVertical: semanticSpacing.sm,
      backgroundColor: isDark ? colors.gray[800] : colors.gray[100],
      borderRadius: semanticSpacing.radius.md,
      marginRight: semanticSpacing.sm,
    },
    sortText: {
      fontSize: typography.bodySmall.fontSize,
      color: isDark ? colors.text.secondary : colors.text.secondary,
      marginRight: semanticSpacing.xs,
    },
    resultsContainer: {
      flex: 1,
      paddingHorizontal: semanticSpacing.md,
    },
    resultsHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: semanticSpacing.md,
    },
    resultsText: {
      fontSize: typography.bodySmall.fontSize,
      color: isDark ? colors.text.secondary : colors.text.secondary,
    },
    clearFiltersButton: {
      paddingHorizontal: semanticSpacing.sm,
      paddingVertical: semanticSpacing.xs,
      backgroundColor: colors.primary[100],
      borderRadius: semanticSpacing.radius.sm,
    },
    clearFiltersText: {
      fontSize: typography.caption.fontSize,
      color: colors.primary[600],
      fontWeight: fontWeights.medium,
    },
    productsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },
    emptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: semanticSpacing.xl,
    },
    emptyStateText: {
      fontSize: typography.bodyLarge.fontSize,
      color: isDark ? colors.text.secondary : colors.text.secondary,
      textAlign: 'center',
      marginTop: semanticSpacing.md,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Search Header */}
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Ionicons 
            name="search" 
            size={20} 
            color={isDark ? colors.gray[400] : colors.gray[500]} 
          />
          <TextInput
            style={styles.searchInput}
            placeholder={t('search.placeholder')}
            placeholderTextColor={isDark ? colors.gray[400] : colors.gray[500]}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
        </View>
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => setShowFilters(true)}
        >
          <Ionicons name="options-outline" size={20} color={colors.background.light} />
        </TouchableOpacity>
      </View>

      {/* Sort Options */}
      <View style={styles.sortContainer}>
        <TouchableOpacity style={styles.sortButton}>
          <Text style={styles.sortText}>{t('search.sortBy')}</Text>
          <Ionicons name="chevron-down" size={16} color={isDark ? colors.gray[400] : colors.gray[500]} />
        </TouchableOpacity>
      </View>

      {/* Results */}
      <ScrollView
        style={styles.resultsContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <View style={styles.resultsHeader}>
          <Text style={styles.resultsText}>
            {t('search.results', { count: products.length })}
          </Text>
          <TouchableOpacity style={styles.clearFiltersButton}>
            <Text style={styles.clearFiltersText}>{t('search.clearFilters')}</Text>
          </TouchableOpacity>
        </View>

        {products.length > 0 ? (
          <View style={styles.productsGrid}>
            {products.map((product: any) => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                price={product.price}
                image={product.images?.[0]}
                rating={product.rating}
                onPress={() => router.push(`/product/${product.id}`)}
              />
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons 
              name="search-outline" 
              size={64} 
              color={isDark ? colors.gray[400] : colors.gray[500]} 
            />
            <Text style={styles.emptyStateText}>{t('search.noResults')}</Text>
          </View>
        )}
      </ScrollView>

      {/* Filter Bottom Sheet */}
      <FilterBottomSheet
        visible={showFilters}
        onClose={() => setShowFilters(false)}
        onApplyFilters={(filters) => {
          console.log('Applied filters:', filters);
          setShowFilters(false);
        }}
      />
    </SafeAreaView>
  );
}
