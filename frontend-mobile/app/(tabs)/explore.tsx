import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';

import Banner from '@/components/Banner';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import ProductCard from '@/components/ProductCard';
import SellerCard from '@/components/SellerCard';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useProducts } from '@/features/products/hooks';
import { useProductsStore } from '@/features/products/store';
import apiClient from '@/services/api';

export default function ExploreScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { products, isLoading } = useProductsStore();
  const { refetch, isFetching } = useProducts();
  const [refreshing, setRefreshing] = useState(false);
  const bannersQuery = useQuery({
    queryKey: ['banners'],
    queryFn: async () => {
      const res = await apiClient.get('/banners');
      return res.data as Array<{ id: string; title: string; subtitle?: string; image?: string }>;
    },
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  const renderItem = ({ item }: any) => (
    <ProductCard
      id={item.id}
      name={item.name}
      price={item.price}
      discountedPrice={item.originalPrice}
      image={item.images?.[0]}
      rating={item.rating}
      onPress={() => router.push(`/product/${item.id}`)}
    />
  );

  const topSellers = useMemo(() => {
    const map = new Map<string, any>();
    // Ensure products is an array before calling forEach
    if (Array.isArray(products)) {
      products.forEach((p: any) => {
        if (p?.seller?.id && !map.has(p.seller.id)) {
          map.set(p.seller.id, p.seller);
        }
      });
    }
    return Array.from(map.values()).slice(0, 10);
  }, [products]);

  if (isLoading && (!products || products.length === 0)) {
    return (
      <ThemedView style={styles.center}>
        <LoadingSpinner />
        <ThemedText>{t('common.loading')}</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      {!!bannersQuery.data?.length && (
        <FlatList
          data={bannersQuery.data}
          keyExtractor={(b) => String(b.id)}
          renderItem={({ item }) => (
            <Banner title={item.title} subtitle={item.subtitle} image={item.image} onPress={() => {}} />
          )}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingVertical: 8 }}
        />
      )}

      {!!topSellers.length && (
        <View style={{ marginBottom: 12 }}>
          <ThemedText style={{ marginBottom: 8 }}>{t('home.recommended')}</ThemedText>
          <FlatList
            data={topSellers}
            keyExtractor={(s: any) => String(s.id)}
            horizontal
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }: any) => (
              <SellerCard name={item.name} rating={item.rating} image={item.avatar} onPress={() => {}} />
            )}
            ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
            contentContainerStyle={{ paddingBottom: 4 }}
          />
        </View>
      )}
      <FlatList
        data={Array.isArray(products) ? products : []}
        keyExtractor={(item: any) => String(item.id)}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl refreshing={refreshing || isFetching} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.center}>
            <ThemedText>{t('home.noProducts')}</ThemedText>
          </View>
        }
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 12,
    paddingTop: 12,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  listContent: {
    paddingBottom: 24,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
});
