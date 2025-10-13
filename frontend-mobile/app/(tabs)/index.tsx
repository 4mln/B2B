import { LoginWall } from '@/components/LoginWall';
import { useMessageBoxStore } from '@/context/messageBoxStore';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    FlatList,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GuildCard } from '@/components/GuildCard';
import ProductCard from '@/components/ProductCard';
import { colors, darkColors, lightColors } from '@/theme/colors';
import { semanticSpacing } from '@/theme/spacing';
import { fontWeights, typography } from '@/theme/typography';

interface Guild {
  id: string;
  name: string;
  icon: string;
  productCount: number;
}

interface Product {
  id: string;
  name: string;
  price: number;
  discountedPrice?: number;
  image: string;
  rating: number;
  location: string;
}

export default function HomeScreen() {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { show } = useMessageBoxStore();
  
  const [refreshing, setRefreshing] = useState(false);
  const [selectedGuild, setSelectedGuild] = useState<string | null>(null);

  // Mock data
  const guilds: Guild[] = [
    { id: '1', name: 'Construction', icon: 'construct', productCount: 245 },
    { id: '2', name: 'Electronics', icon: 'hardware-chip', productCount: 189 },
    { id: '3', name: 'Textiles', icon: 'shirt', productCount: 156 },
    { id: '4', name: 'Food & Beverage', icon: 'restaurant', productCount: 98 },
    { id: '5', name: 'Automotive', icon: 'car', productCount: 134 },
    { id: '6', name: 'Chemicals', icon: 'flask', productCount: 87 },
  ];

  const recommendedProducts: Product[] = [
    {
      id: '1',
      name: 'Industrial Steel Pipes',
      price: 1500000,
      image: 'https://via.placeholder.com/150',
      rating: 4.5,
      location: 'Tehran',
    },
    {
      id: '2',
      name: 'Construction Materials',
      price: 800000,
      discountedPrice: 750000,
      image: 'https://via.placeholder.com/150',
      rating: 4.2,
      location: 'Isfahan',
    },
    {
      id: '3',
      name: 'Electrical Components',
      price: 1200000,
      image: 'https://via.placeholder.com/150',
      rating: 4.8,
      location: 'Shiraz',
    },
  ];

  const trendingProducts: Product[] = [
    {
      id: '4',
      name: 'Textile Machinery',
      price: 2500000,
      image: 'https://via.placeholder.com/150',
      rating: 4.6,
      location: 'Tabriz',
    },
    {
      id: '5',
      name: 'Food Processing Equipment',
      price: 1800000,
      image: 'https://via.placeholder.com/150',
      rating: 4.3,
      location: 'Mashhad',
    },
  ];

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const handleGuildPress = (guildId: string) => {
    setSelectedGuild(guildId);
    console.log('Selected guild:', guildId);
  };

  const handleProductPress = (productId: string) => {
    console.log('Product pressed:', productId);
  };

  const testMessageBox = () => {
    show({
      type: 'info',
      title: 'MessageBox Test',
      message: 'This is a test message to verify the MessageBox is working correctly with the Tamagui window system!',
      actions: [
        { label: 'Great!', onPress: () => console.log('MessageBox test successful') }
      ]
    });
  };

  const renderGuild = ({ item }: { item: Guild }) => (
    <GuildCard
      id={item.id}
      name={item.name}
      icon={item.icon}
      productCount={item.productCount}
      onPress={() => handleGuildPress(item.id)}
      isSelected={selectedGuild === item.id}
    />
  );

  const renderProduct = ({ item }: { item: Product }) => (
    <ProductCard
      id={item.id}
      name={item.name}
      price={item.price}
      discountedPrice={item.discountedPrice}
      image={item.image}
      rating={item.rating}
      onPress={() => handleProductPress(item.id)}
    />
  );

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? darkColors.background.dark : lightColors.background.light,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: semanticSpacing.md,
      paddingVertical: semanticSpacing.sm,
      backgroundColor: isDark ? darkColors.background.surface : lightColors.background.surface,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? darkColors.border.light : lightColors.border.light,
    },
    headerTitle: {
      fontSize: typography.h3.fontSize,
      fontWeight: typography.h3.fontWeight,
      color: isDark ? darkColors.text.primary : lightColors.text.primary,
    },
    headerActions: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    headerButton: {
      padding: semanticSpacing.sm,
      marginLeft: semanticSpacing.sm,
    },
    content: {
      flex: 1,
    },
    section: {
      marginBottom: semanticSpacing.xl,
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: semanticSpacing.md,
      paddingVertical: semanticSpacing.md,
    },
    sectionTitle: {
      fontSize: typography.h4.fontSize,
      fontWeight: typography.h4.fontWeight,
      color: isDark ? darkColors.text.primary : lightColors.text.primary,
    },
    viewAllButton: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    viewAllText: {
      fontSize: typography.bodySmall.fontSize,
      color: colors.primary[600],
      fontWeight: fontWeights.medium,
      marginRight: semanticSpacing.xs,
    },
    guildsContainer: {
      paddingLeft: semanticSpacing.md,
    },
    productsContainer: {
      paddingHorizontal: semanticSpacing.md,
    },
    productsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },
    emptyState: {
      alignItems: 'center',
      paddingVertical: semanticSpacing.xl,
    },
    emptyStateText: {
      fontSize: typography.body.fontSize,
      color: isDark ? darkColors.text.secondary : lightColors.text.secondary,
      textAlign: 'center',
      marginTop: semanticSpacing.sm,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('home.title')}</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton} onPress={testMessageBox}>
            <Ionicons
              name="chatbubble-outline"
              size={24}
              color={isDark ? darkColors.gray[400] : lightColors.gray[600]}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons
              name="notifications-outline"
              size={24}
              color={isDark ? darkColors.gray[400] : lightColors.gray[600]}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons
              name="search-outline"
              size={24}
              color={isDark ? darkColors.gray[400] : lightColors.gray[600]}
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Guilds Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('home.guilds')}</Text>
            <TouchableOpacity style={styles.viewAllButton}>
              <Text style={styles.viewAllText}>{t('home.viewAll')}</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.primary[600]} />
            </TouchableOpacity>
          </View>
          <FlatList
            style={styles.guildsContainer}
            data={guilds}
            renderItem={renderGuild}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingRight: semanticSpacing.md }}
          />
        </View>

        {/* Recommended Products */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('home.recommended')}</Text>
            <TouchableOpacity style={styles.viewAllButton}>
              <Text style={styles.viewAllText}>{t('home.viewAll')}</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.primary[600]} />
            </TouchableOpacity>
          </View>
          <View style={styles.productsContainer}>
            <View style={styles.productsGrid}>
              {recommendedProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  price={product.price}
                  discountedPrice={product.discountedPrice}
                  image={product.image}
                  rating={product.rating}
                  onPress={() => handleProductPress(product.id)}
                />
              ))}
            </View>
          </View>
        </View>

        {/* Trending Products */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('home.trending')}</Text>
            <TouchableOpacity style={styles.viewAllButton}>
              <Text style={styles.viewAllText}>{t('home.viewAll')}</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.primary[600]} />
            </TouchableOpacity>
          </View>
          <View style={styles.productsContainer}>
            <View style={styles.productsGrid}>
              {trendingProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  price={product.price}
                  image={product.image}
                  rating={product.rating}
                  onPress={() => handleProductPress(product.id)}
                />
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Login Wall modal over Home */}
      <LoginWall />
    </SafeAreaView>
  );
}
