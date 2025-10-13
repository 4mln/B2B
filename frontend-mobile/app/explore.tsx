import { useColorScheme } from "@/hooks/use-color-scheme";
import { useDebounce } from "@/hooks/useDebounce";
import { productService } from "@/services/product";
import { useQuery } from "@tanstack/react-query";
import sellerService from "@/services/seller";
import { colors } from "@/theme/colors";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
    Dimensions,
    FlatList,
    Modal,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import Banner from "../src/components/Banner";
import ProductCard from "../src/components/ProductCard";
import SellerCard from "../src/components/SellerCard";
import { SPACING } from "../src/theme/theme";
// Avoid SSR crash on web due to reanimated in skeleton-content
const isWeb = typeof window !== "undefined" && !('__EXPO_E2E__' in (globalThis as any));

const { width: SCREEN_WIDTH } = Dimensions.get("window");

type Product = {
  id: number;
  name: string;
  price: number;
  image?: string;
  category?: string;
  rating?: number;
};
type Seller = { id: number; name: string; rating?: number; image?: string };
type BannerData = { id: number; title: string; subtitle?: string; image?: string };
type Category = { id: string; name: string };

export default function ExploreScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [banners, setBanners] = useState<BannerData[]>([]);
  const [categories, setCategories] = useState<Category[]>([{ id: "all", name: "All" }]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedQuery = useDebounce(searchQuery, 400);
  const [sortOption, setSortOption] = useState<string>("default");
  const [sortModalVisible, setSortModalVisible] = useState(false);
  const bannerListRef = useRef<FlatList>(null);

  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const styles = createStyles(isDark);

  const safeData = <T,>(res: any, fallback: T): T => {
    if (!res) return fallback;
    const data = res?.data;
    if (Array.isArray(data)) return data as T;
    return fallback;
  };

  // Ensure we don't try to iterate over undefined values
  const ensureArray = <T,>(data: T[] | undefined | null): T[] => {
    return Array.isArray(data) ? data : [];
  };

  const { data: productSearch, isFetching: productsLoading, refetch: refetchProducts } = useQuery({
    queryKey: ["products", { q: debouncedQuery, category: selectedCategory, sort: sortOption }],
    queryFn: async () => {
      // Map local sort keys to service sortBy where possible
      const sortBy = sortOption === "priceLow" ? "price_low" : sortOption === "priceHigh" ? "price_high" : sortOption === "rating" ? "popularity" : "newest";
      const filters: any = { sortBy };
      if (selectedCategory && selectedCategory !== "all") filters.category = selectedCategory;
      if (debouncedQuery) filters.search = debouncedQuery;
      const res = await productService.getProducts(filters);
      if (res.success && res.data) return res.data.products || [];
      return [] as Product[];
    },
  });

  useEffect(() => {
    setLoading(productsLoading);
    setProducts(ensureArray(productSearch as any));
    // Placeholders for sellers/banners/categories until their services are wired
    setBanners([]);
  }, [productSearch, productsLoading]);

  const { data: sellerList } = useQuery({
    queryKey: ["sellers", {}],
    queryFn: async () => {
      try { return await sellerService.listSellers({ pageSize: 10 }); } catch { return [] as Seller[]; }
    },
  });

  const { data: categoryList } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      try {
        const res = await productService.getCategories();
        if (res.success && res.data) return res.data.map((c) => ({ id: c.id, name: c.name })) as Category[];
      } catch {}
      return [] as Category[];
    },
  });

  useEffect(() => {
    setSellers(ensureArray(sellerList as any));
  }, [sellerList]);

  useEffect(() => {
    const base = [{ id: "all", name: t("products.all", "All") }];
    setCategories([...base, ...ensureArray(categoryList as any)]);
  }, [categoryList, t]);

  // Auto-scroll banners
  useEffect(() => {
    if (!banners.length) return;
    let currentIndex = 0;
    const interval = setInterval(() => {
      currentIndex = (currentIndex + 1) % banners.length;
      bannerListRef.current?.scrollToIndex({ index: currentIndex, animated: true });
    }, 3000);
    return () => clearInterval(interval);
  }, [banners]);

  const onRefresh = async () => { setRefreshing(true); try { await refetchProducts(); } finally { setRefreshing(false); } };

  // Filter & sort products
  const filteredProducts = Array.isArray(products) ? products
    .filter((p) =>
      p && p.name && p.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (selectedCategory === "all" || p.category === selectedCategory)
    )
    .sort((a, b) => {
      if (sortOption === "priceLow") return a.price - b.price;
      if (sortOption === "priceHigh") return b.price - a.price;
      if (sortOption === "rating") return (b.rating || 0) - (a.rating || 0);
      return 0;
    }) : [];

  if (loading) {
    return (
      <View style={{ flex: 1, padding: SPACING.base, backgroundColor: isDark ? colors.background.dark : colors.background.light }}>
        <View style={{ width: "100%", height: 50, backgroundColor: isDark ? colors.background.surface : colors.background.gray, borderRadius: 12, marginBottom: SPACING.base }} />
        <View style={{ width: "100%", height: 50, backgroundColor: isDark ? colors.background.surface : colors.background.gray, borderRadius: 12, marginBottom: SPACING.base }} />
        <View style={{ width: "100%", height: 45, backgroundColor: isDark ? colors.background.surface : colors.background.gray, borderRadius: 12, marginBottom: SPACING.base }} />
        <View style={{ width: "100%", height: 150, backgroundColor: isDark ? colors.background.surface : colors.background.gray, borderRadius: 12, marginBottom: SPACING.base }} />
        <View style={{ flexDirection: "row", marginBottom: SPACING.base }}>
          <View style={{ width: 80, height: 80, backgroundColor: isDark ? colors.background.surface : colors.background.gray, borderRadius: 40, marginRight: 12 }} />
          <View style={{ width: 80, height: 80, backgroundColor: isDark ? colors.background.surface : colors.background.gray, borderRadius: 40, marginRight: 12 }} />
          <View style={{ width: 80, height: 80, backgroundColor: isDark ? colors.background.surface : colors.background.gray, borderRadius: 40 }} />
        </View>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <View style={{ width: "48%", height: 220, backgroundColor: isDark ? colors.background.surface : colors.background.gray, borderRadius: 12 }} />
          <View style={{ width: "48%", height: 220, backgroundColor: isDark ? colors.background.surface : colors.background.gray, borderRadius: 12 }} />
        </View>
      </View>
    );
  }

  // 2-column product layout
  const numColumns = 2;
  const productItemWidth = (SCREEN_WIDTH - SPACING.base * 3) / numColumns;

  const listData = Array.isArray(filteredProducts) ? filteredProducts : [];

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? colors.background.dark : colors.background.light }}>
      <FlatList
        data={listData}
        keyExtractor={(item) => item?.id?.toString() || Math.random().toString()}
        numColumns={numColumns}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListHeaderComponent={() => (
        <View>
          {/* Search + Filter */}
          <View style={styles.searchContainer}>
            <TextInput
              style={[styles.searchInput, { color: isDark ? colors.text.primary : colors.text.primary }]}
              placeholder={t("explore.searchProducts")}
              placeholderTextColor={isDark ? colors.gray[400] : colors.gray[500]}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <TouchableOpacity
              style={styles.filterButton}
              onPress={() => console.log("Open filter modal")}
            >
              <Text style={{ color: "#fff", fontWeight: "bold" }}>{t("explore.filter")}</Text>
            </TouchableOpacity>
          </View>

          {/* Category Chips */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: SPACING.base }}>
            {Array.isArray(categories) && categories.length > 0 && categories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.categoryChip,
                  selectedCategory === cat.id && styles.categoryChipActive,
                ]}
                onPress={() => setSelectedCategory(cat.id)}
              >
                <Text style={[
                  styles.categoryText,
                  selectedCategory === cat.id && { color: "#fff", fontWeight: "bold" },
                ]}>
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Sorting */}
          <TouchableOpacity
            style={styles.sortButton}
            onPress={() => setSortModalVisible(true)}
          >
            <Text style={{ fontWeight: "bold" }}>
              {t("explore.sort")}: {sortOption === "default" ? t("explore.default") : sortOption === "priceLow" ? t("explore.priceLowHigh") : sortOption === "priceHigh" ? t("explore.priceHighLow") : t("explore.rating")}
            </Text>
          </TouchableOpacity>

          <Modal visible={sortModalVisible} transparent animationType="fade">
            <TouchableOpacity
              style={styles.modalOverlay}
              onPress={() => setSortModalVisible(false)}
            />
            <View style={styles.modalContent}>
              {[
                { id: "default", label: t("Default") },
                { id: "priceLow", label: t("Price: Low → High") },
                { id: "priceHigh", label: t("Price: High → Low") },
                { id: "rating", label: t("Rating") },
              ].map((opt) => (
                <TouchableOpacity
                  key={opt.id}
                  style={styles.sortOption}
                  onPress={() => { setSortOption(opt.id); setSortModalVisible(false); }}
                >
                  <Text>{opt.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </Modal>

          {/* Promotions */}
          {Array.isArray(banners) && banners.length > 0 && (
            <>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>{t("explore.promotions")}</Text>
                <TouchableOpacity onPress={() => console.log("See All Promotions")}>
                  <Text style={styles.seeAll}>{t("common.seeAll")}</Text>
                </TouchableOpacity>
              </View>
              <FlatList
                ref={bannerListRef}
                data={banners}
                horizontal
                showsHorizontalScrollIndicator={false}
                pagingEnabled
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={{ paddingVertical: SPACING.base }}
                ItemSeparatorComponent={() => <View style={{ width: SPACING.small }} />}
                renderItem={({ item }) => (
                  <Banner
                    title={item.title}
                    subtitle={item.subtitle}
                    image={item.image || "https://via.placeholder.com/300x150"}
                    onPress={() => console.log("Banner clicked", item.id)}
                  />
                )}
              />
            </>
          )}

          {/* Sellers */}
          {Array.isArray(sellers) && sellers.length > 0 && (
            <>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>{t("explore.topSellers")}</Text>
                <TouchableOpacity onPress={() => console.log("See All Sellers")}>
                  <Text style={styles.seeAll}>{t("common.seeAll")}</Text>
                </TouchableOpacity>
              </View>
              <FlatList
                data={sellers}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingVertical: SPACING.base }}
                ItemSeparatorComponent={() => <View style={{ width: SPACING.small }} />}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  <SellerCard
                    name={item.name}
                    rating={item.rating}
                    image={item.image || "https://via.placeholder.com/60"}
                    onPress={() => console.log("Seller clicked", item.id)}
                  />
                )}
              />
            </>
          )}

          {/* Products Header */}
          <View style={[styles.sectionHeader, { marginTop: SPACING.base }]}>
            <Text style={styles.sectionTitle}>{t("explore.products")}</Text>
          </View>
        </View>
      )}
      renderItem={({ item }) => {
        if (!item) return null;
        return (
          <View style={{ width: productItemWidth }}>
            <ProductCard
              id={item.id}
              name={item.name || "Unknown Product"}
              price={item.price || 0}
              image={item.image || "https://via.placeholder.com/150"}
              rating={item.rating}
              onPress={() => console.log("Clicked product", item.id)}
            />
          </View>
        );
      }}
        contentContainerStyle={{ padding: SPACING.base }}
      />
    </View>
  );
}

const createStyles = (isDark: boolean) => StyleSheet.create({
  searchContainer: {
    flexDirection: "row",
    marginBottom: SPACING.base,
    alignItems: "center",
  },
  searchInput: {
    flex: 1,
    height: 45,
    borderRadius: 12,
    backgroundColor: isDark ? colors.background.surface : colors.background.gray,
    paddingHorizontal: SPACING.base,
    marginRight: SPACING.small,
    borderWidth: 1,
    borderColor: isDark ? colors.border.light : colors.border.light,
  },
  filterButton: {
    height: 45,
    paddingHorizontal: SPACING.base,
    borderRadius: 12,
    backgroundColor: colors.primary[500],
    justifyContent: "center",
    alignItems: "center",
  },
  categoryChip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: isDark ? colors.background.surface : colors.background.gray,
    marginRight: SPACING.small,
    borderWidth: 1,
    borderColor: isDark ? colors.border.light : colors.border.light,
  },
  categoryChipActive: {
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[500],
  },
  sortButton: {
    height: 40,
    borderRadius: 12,
    backgroundColor: isDark ? colors.background.surface : colors.background.gray,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SPACING.base,
    borderWidth: 1,
    borderColor: isDark ? colors.border.light : colors.border.light,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    position: "absolute",
    top: 100,
    left: 20,
    right: 20,
    backgroundColor: isDark ? colors.card.background : colors.card.background,
    borderRadius: 12,
    padding: SPACING.base,
    borderWidth: 1,
    borderColor: isDark ? colors.border.light : colors.border.light,
  },
  sortOption: {
    paddingVertical: 12,
    borderBottomColor: isDark ? colors.border.light : colors.border.light,
    borderBottomWidth: 1,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.small,
  },
  sectionTitle: { 
    fontSize: 18, 
    fontWeight: "bold",
    color: isDark ? colors.text.primary : colors.text.primary,
  },
  seeAll: { 
    color: colors.primary[500],
  },
  categoryText: { 
    color: isDark ? colors.text.primary : colors.text.primary,
  },
});
