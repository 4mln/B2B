import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Alert,
    Dimensions,
    Image,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import { useProduct } from '@/features/products/hooks';
import { colors } from '@/theme/colors';
import { semanticSpacing } from '@/theme/spacing';
import { fontWeights, lineHeights, typography } from '@/theme/typography';

const { width } = Dimensions.get('window');

export default function ProductDetailScreen() {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { id } = useLocalSearchParams<{ id: string }>();
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isSaved, setIsSaved] = useState(false);

  const { data: product } = useProduct(String(id));

  const handleRequestQuote = () => {
    Alert.alert(
      t('product.requestQuote'),
      t('product.requestQuoteConfirm', 'Send a quote request to the seller?'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('product.requestQuote', 'Request Quote'), onPress: () => console.log('Quote requested') },
      ]
    );
  };

  const handleContact = () => {
    Alert.alert(
      t('product.contact'),
      t('product.contactConfirm', 'Start a conversation with the seller?'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('chat.startConversation'), onPress: () => router.push('/chat') },
      ]
    );
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
    // Implement save/unsave logic
  };

  const handleShare = () => {
    // Implement share logic
    console.log('Share product');
  };

  const handleReport = () => {
    Alert.alert(
      t('product.report'),
      t('product.reportConfirm', 'Report this product for inappropriate content?'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('product.report'), onPress: () => console.log('Product reported'), style: 'destructive' },
      ]
    );
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Ionicons
        key={i}
        name={i < Math.floor(rating) ? 'star' : 'star-outline'}
        size={16}
        color="#FFD700"
      />
    ));
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? colors.background.dark : colors.background.light,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: semanticSpacing.md,
      paddingVertical: semanticSpacing.sm,
      backgroundColor: isDark ? colors.background.dark : colors.background.light,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? colors.border.light : colors.border.light,
    },
    headerButton: {
      padding: semanticSpacing.sm,
    },
    headerTitle: {
      fontSize: typography.h4.fontSize,
      fontWeight: typography.h4.fontWeight,
      color: isDark ? colors.text.primary : colors.text.primary,
    },
    content: {
      flex: 1,
    },
    imageContainer: {
      height: 300,
      backgroundColor: isDark ? colors.gray[800] : colors.gray[100],
    },
    image: {
      width: width,
      height: 300,
      resizeMode: 'cover',
    },
    imageIndicators: {
      position: 'absolute',
      bottom: semanticSpacing.md,
      left: 0,
      right: 0,
      flexDirection: 'row',
      justifyContent: 'center',
    },
    indicator: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: 'rgba(255, 255, 255, 0.5)',
      marginHorizontal: 4,
    },
    indicatorActive: {
      backgroundColor: colors.primary[500],
    },
    infoContainer: {
      padding: semanticSpacing.lg,
    },
    title: {
      fontSize: typography.h3.fontSize,
      fontWeight: typography.h3.fontWeight,
      color: isDark ? colors.text.primary : colors.text.primary,
      marginBottom: semanticSpacing.sm,
    },
    ratingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: semanticSpacing.md,
    },
    rating: {
      flexDirection: 'row',
      alignItems: 'center',
      marginRight: semanticSpacing.md,
    },
    ratingText: {
      fontSize: typography.body.fontSize,
      color: isDark ? colors.text.secondary : colors.text.secondary,
      marginLeft: semanticSpacing.xs,
    },
    location: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    locationText: {
      fontSize: typography.body.fontSize,
      color: isDark ? colors.text.secondary : colors.text.secondary,
      marginLeft: semanticSpacing.xs,
    },
    priceContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: semanticSpacing.lg,
    },
    price: {
      fontSize: typography.h2.fontSize,
      fontWeight: typography.h2.fontWeight,
      color: colors.primary[600],
      marginRight: semanticSpacing.md,
    },
    originalPrice: {
      fontSize: typography.bodyLarge.fontSize,
      color: isDark ? colors.text.tertiary : colors.text.tertiary,
      textDecorationLine: 'line-through',
    },
    discount: {
      backgroundColor: colors.error[500],
      paddingHorizontal: semanticSpacing.sm,
      paddingVertical: semanticSpacing.xs,
      borderRadius: semanticSpacing.radius.sm,
      marginLeft: semanticSpacing.sm,
    },
    discountText: {
      fontSize: typography.caption.fontSize,
      color: colors.background.light,
      fontWeight: fontWeights.medium,
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
    description: {
      fontSize: typography.body.fontSize,
      color: isDark ? colors.text.secondary : colors.text.secondary,
      lineHeight: typography.body.fontSize * lineHeights.normal,
    },
    specItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: semanticSpacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? colors.border.light : colors.border.light,
    },
    specLabel: {
      fontSize: typography.body.fontSize,
      color: isDark ? colors.text.secondary : colors.text.secondary,
    },
    specValue: {
      fontSize: typography.body.fontSize,
      fontWeight: fontWeights.medium,
      color: isDark ? colors.text.primary : colors.text.primary,
    },
    sellerContainer: {
      backgroundColor: isDark ? colors.card.background : colors.card.background,
      borderRadius: semanticSpacing.radius.lg,
      padding: semanticSpacing.lg,
      borderWidth: 1,
      borderColor: isDark ? colors.card.border : colors.card.border,
    },
    sellerHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: semanticSpacing.md,
    },
    sellerAvatar: {
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: colors.primary[100],
      marginRight: semanticSpacing.md,
    },
    sellerInfo: {
      flex: 1,
    },
    sellerName: {
      fontSize: typography.bodyLarge.fontSize,
      fontWeight: fontWeights.semibold,
      color: isDark ? colors.text.primary : colors.text.primary,
      marginBottom: semanticSpacing.xs,
    },
    sellerRating: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    sellerRatingText: {
      fontSize: typography.bodySmall.fontSize,
      color: isDark ? colors.text.secondary : colors.text.secondary,
      marginLeft: semanticSpacing.xs,
    },
    verifiedBadge: {
      backgroundColor: colors.success[500],
      paddingHorizontal: semanticSpacing.sm,
      paddingVertical: semanticSpacing.xs,
      borderRadius: semanticSpacing.radius.sm,
      marginLeft: semanticSpacing.sm,
    },
    verifiedText: {
      fontSize: typography.caption.fontSize,
      color: colors.background.light,
      fontWeight: fontWeights.medium,
    },
    responseTime: {
      fontSize: typography.bodySmall.fontSize,
      color: isDark ? colors.text.secondary : colors.text.secondary,
      marginTop: semanticSpacing.xs,
    },
    actions: {
      flexDirection: 'row',
      paddingHorizontal: semanticSpacing.lg,
      paddingVertical: semanticSpacing.lg,
      backgroundColor: isDark ? colors.background.dark : colors.background.light,
      borderTopWidth: 1,
      borderTopColor: isDark ? colors.border.light : colors.border.light,
    },
    actionButton: {
      flex: 1,
      paddingVertical: semanticSpacing.md,
      borderRadius: semanticSpacing.radius.lg,
      alignItems: 'center',
      marginHorizontal: semanticSpacing.xs,
    },
    primaryButton: {
      backgroundColor: colors.primary[500],
    },
    secondaryButton: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: colors.primary[500],
    },
    actionButtonText: {
      fontSize: typography.button.fontSize,
      fontWeight: typography.button.fontWeight,
    },
    primaryButtonText: {
      color: colors.background.light,
    },
    secondaryButtonText: {
      color: colors.primary[500],
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={() => router.back()}>
          <Ionicons 
            name="arrow-back" 
            size={24} 
            color={isDark ? colors.gray[400] : colors.gray[600]} 
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('product.title')}</Text>
        <View style={{ flexDirection: 'row' }}>
          <TouchableOpacity style={styles.headerButton} onPress={handleSave}>
            <Ionicons 
              name={isSaved ? 'heart' : 'heart-outline'} 
              size={24} 
              color={isSaved ? colors.error[500] : (isDark ? colors.gray[400] : colors.gray[600])} 
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton} onPress={handleShare}>
            <Ionicons 
              name="share-outline" 
              size={24} 
              color={isDark ? colors.gray[400] : colors.gray[600]} 
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Image Carousel */}
        <View style={styles.imageContainer}>
          {!!product?.images?.length && (
            <Image source={{ uri: product.images[currentImageIndex] }} style={styles.image} />
          )}
          <View style={styles.imageIndicators}>
            {product.images.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.indicator,
                  index === currentImageIndex && styles.indicatorActive,
                ]}
              />
            ))}
          </View>
        </View>

        {/* Product Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.title}>{product?.name}</Text>
          
          <View style={styles.ratingContainer}>
            <View style={styles.rating}>
              {product?.rating ? renderStars(product.rating) : null}
              <Text style={styles.ratingText}>
                {product?.rating || '-'} ({product?.reviewCount || 0} {t('product.reviews', 'reviews')})
              </Text>
            </View>
            <View style={styles.location}>
              <Ionicons 
                name="location-outline" 
                size={16} 
                color={isDark ? colors.gray[400] : colors.gray[500]} 
              />
              <Text style={styles.locationText}>{product?.location}</Text>
            </View>
          </View>

          <View style={styles.priceContainer}>
            <Text style={styles.price}>
              {product?.price?.toLocaleString?.() || '-'} {t('product.currency', 'Toman')}
            </Text>
            {product?.originalPrice && (
              <>
                <Text style={styles.originalPrice}>
                  {product.originalPrice.toLocaleString()} {t('product.currency', 'Toman')}
                </Text>
                <View style={styles.discount}>
                  <Text style={styles.discountText}>
                    {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% {t('product.off', 'OFF')}
                  </Text>
                </View>
              </>
            )}
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('product.description')}</Text>
            <Text style={styles.description}>{product?.description}</Text>
          </View>

          {/* Specifications */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('product.specifications')}</Text>
            {product?.specifications?.map((spec, index) => (
              <View key={index} style={styles.specItem}>
                <Text style={styles.specLabel}>{spec.label}</Text>
                <Text style={styles.specValue}>{spec.value}</Text>
              </View>
            ))}
          </View>

          {/* Seller Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('product.sellerInfo', 'Seller Information')}</Text>
            <View style={styles.sellerContainer}>
              <View style={styles.sellerHeader}>
                <View style={styles.sellerAvatar}>
                  <Ionicons name="business" size={24} color={colors.primary[600]} />
                </View>
                <View style={styles.sellerInfo}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={styles.sellerName}>{product?.seller?.name}</Text>
                    {product?.seller?.verified && (
                      <View style={styles.verifiedBadge}>
                        <Text style={styles.verifiedText}>Verified</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.sellerRating}>
                    {product?.seller?.rating ? renderStars(product.seller.rating) : null}
                    <Text style={styles.sellerRatingText}>
                      {product?.seller?.rating || '-'} ({product?.reviewCount || 0} {t('product.reviews', 'reviews')})
                    </Text>
                  </View>
                <Text style={styles.responseTime}>{product?.seller?.responseTime}</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actions}>
        <TouchableOpacity style={[styles.actionButton, styles.secondaryButton]} onPress={handleContact}>
          <Text style={[styles.actionButtonText, styles.secondaryButtonText]}>
            {t('product.contact')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, styles.primaryButton]} onPress={handleRequestQuote}>
          <Text style={[styles.actionButtonText, styles.primaryButtonText]}>
            {t('product.requestQuote')}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
