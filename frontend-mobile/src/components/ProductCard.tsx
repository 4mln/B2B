import { useColorScheme } from '@/hooks/use-color-scheme';
import { colors, darkColors, lightColors } from '@/theme/colors';
import { semanticSpacing } from '@/theme/spacing';
import { fontWeights, typography } from '@/theme/typography';
import { FontAwesome } from "@expo/vector-icons";
import React from "react";
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type ProductCardProps = {
  id: string | number;
  name: string;
  price: number;
  discountedPrice?: number;
  image?: string;
  rating?: number;
  onPress: () => void;
};

const ProductCard: React.FC<ProductCardProps> = ({
  id,
  name,
  price,
  discountedPrice,
  image,
  rating = 0,
  onPress,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const stars = Array.from({ length: 5 }, (_, i) => i < rating);

  const styles = StyleSheet.create({
    card: {
      width: 160,
      backgroundColor: isDark ? darkColors.card.background : lightColors.card.background,
      borderRadius: semanticSpacing.radius.lg,
      marginBottom: semanticSpacing.md,
      marginRight: semanticSpacing.md,
      shadowColor: isDark ? darkColors.card.shadow : lightColors.card.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
      overflow: "hidden",
      position: "relative",
    },
    image: {
      width: "100%",
      height: 120,
    },
    info: {
      padding: semanticSpacing.sm,
    },
    name: {
      fontSize: typography.bodySmall.fontSize,
      fontWeight: fontWeights.semibold,
      color: isDark ? darkColors.text.primary : lightColors.text.primary,
      marginBottom: semanticSpacing.xs,
    },
    priceContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: semanticSpacing.xs,
    },
    price: {
      fontSize: typography.body.fontSize,
      fontWeight: fontWeights.bold,
      color: colors.primary[600],
      marginRight: semanticSpacing.xs,
    },
    oldPrice: {
      fontSize: typography.caption.fontSize,
      color: isDark ? darkColors.text.muted : lightColors.text.muted,
      textDecorationLine: "line-through",
    },
    ratingContainer: {
      flexDirection: "row",
    },
    favorite: {
      position: "absolute",
      top: semanticSpacing.xs,
      right: semanticSpacing.xs,
      backgroundColor: isDark ? darkColors.card.elevated : lightColors.card.elevated,
      borderRadius: semanticSpacing.radius.full,
      padding: semanticSpacing.xs,
      shadowColor: isDark ? darkColors.card.shadow : lightColors.card.shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
  });

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Image
        source={{ uri: image || "https://via.placeholder.com/150" }}
        style={styles.image}
        resizeMode="cover"
      />

      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={2}>{name}</Text>

        <View style={styles.priceContainer}>
          <Text style={styles.price}>${discountedPrice || price}</Text>
          {discountedPrice && (
            <Text style={styles.oldPrice}>${price}</Text>
          )}
        </View>

        <View style={styles.ratingContainer}>
          {stars.map((filled, index) => (
            <FontAwesome
              key={index}
              name={filled ? "star" : "star-o"}
              size={14}
              color="#FFD700"
            />
          ))}
        </View>
      </View>

      <TouchableOpacity style={styles.favorite}>
        <FontAwesome name="heart-o" size={20} color={colors.error[500]} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

export default ProductCard;
