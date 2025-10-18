import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SPACING } from "../theme/theme";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

type BannerProps = {
  title: string;
  subtitle?: string;
  image?: string;
  onPress?: () => void;
};

export default function Banner({ title, subtitle, image, onPress }: BannerProps) {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.8}>
      <Image source={{ uri: image }} style={styles.image} />
      <View style={styles.overlay}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: SCREEN_WIDTH - SPACING.base * 2,
    height: 150,
    borderRadius: 12,
    overflow: "hidden",
    marginRight: SPACING.base,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  image: { width: "100%", height: "100%" },
  overlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.35)",
    padding: SPACING.small,
  },
  title: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  subtitle: { color: "#fff", fontSize: 12 },
});
