import { View, Text, StyleSheet, Animated } from "react-native";
import { Wifi, WifiOff, RefreshCw } from "lucide-react-native";
import { COLORS, FONT, WEIGHT, SPACING } from "../constants/theme";

export default function ConnectionBanner({ status }) {
  if (status === "connected") return null;

  const isConnecting = status === "connecting";
  const isReconnecting = status === "reconnecting";

  return (
    <View
      style={[
        styles.banner,
        isConnecting && styles.bannerConnecting,
        isReconnecting && styles.bannerReconnecting,
      ]}
    >
      {isReconnecting ? (
        <RefreshCw size={13} color="#fff" />
      ) : (
        <WifiOff size={13} color="#fff" />
      )}
      <Text style={styles.bannerText}>
        {isConnecting ? "Connecting..." : "Reconnecting..."}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: SPACING.xs,
    gap: SPACING.xs,
  },
  bannerConnecting: {
    backgroundColor: COLORS.warning,
  },
  bannerReconnecting: {
    backgroundColor: COLORS.error,
  },
  bannerText: {
    fontSize: FONT.xs,
    color: "#fff",
    fontWeight: WEIGHT.semibold,
    letterSpacing: 0.3,
  },
});
