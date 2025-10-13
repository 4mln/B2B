import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { SPACING } from "../theme/theme";

type SellerCardProps = {
  name: string;
  rating?: number;
  image?: string;
  onPress?: () => void;
};

export default function SellerCard({ name, rating, image, onPress }: SellerCardProps) {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.8}>
      <Image source={{ uri: image || "https://via.placeholder.com/60" }} style={styles.image} />
      <View style={styles.info}>
        <Text style={styles.name}>{name}</Text>
        {rating !== undefined && <Text style={styles.rating}>⭐ {rating.toFixed(1)}</Text>}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 100,
    alignItems: "center",
    padding: SPACING.small,
    backgroundColor: "#fff",
    borderRadius: 12,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  image: { width: 60, height: 60, borderRadius: 30, marginBottom: SPACING.small },
  info: { alignItems: "center" },
  name: { fontSize: 14, fontWeight: "600", textAlign: "center" },
  rating: { fontSize: 12, color: "#888" },
});
