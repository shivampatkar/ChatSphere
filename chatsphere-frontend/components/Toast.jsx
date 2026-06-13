import {
  useEffect,
  useRef,
  useState,
  useCallback,
  createContext,
  useContext,
} from "react";
import { View, Text, StyleSheet, Animated, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  CheckCircle2,
  XCircle,
  Info,
  LogOut,
  LogIn,
} from "lucide-react-native";
import {
  COLORS,
  FONT,
  WEIGHT,
  SPACING,
  RADIUS,
  SHADOW,
} from "../constants/theme";

const { width } = Dimensions.get("window");

const ICONS = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
  login: LogIn,
  logout: LogOut,
};

const THEMES = {
  success: { bg: "#1F2937", accent: COLORS.success, icon: "#22C55E" },
  error: { bg: "#1F2937", accent: "#EF4444", icon: "#EF4444" },
  info: { bg: "#1F2937", accent: COLORS.primary ?? "#3B82F6", icon: "#3B82F6" },
  login: { bg: "#1F2937", accent: "#22C55E", icon: "#22C55E" },
  logout: { bg: "#1F2937", accent: "#F59E0B", icon: "#F59E0B" },
};

const ToastContext = createContext(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);
  const translateY = useRef(new Animated.Value(-120)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const timerRef = useRef(null);

  const hide = useCallback(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -120,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => setToast(null));
  }, [translateY, opacity]);

  const show = useCallback(
    ({ type = "info", title, message, duration = 2500 }) => {
      if (timerRef.current) clearTimeout(timerRef.current);

      setToast({ type, title, message });
      translateY.setValue(-120);
      opacity.setValue(0);

      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          damping: 14,
          mass: 0.9,
          stiffness: 180,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      timerRef.current = setTimeout(hide, duration);
    },
    [translateY, opacity, hide],
  );

  return (
    <ToastContext.Provider value={{ show, hide }}>
      {children}
      {toast && (
        <ToastOverlay toast={toast} translateY={translateY} opacity={opacity} />
      )}
    </ToastContext.Provider>
  );
}

function ToastOverlay({ toast, translateY, opacity }) {
  const theme = THEMES[toast.type] ?? THEMES.info;
  const Icon = ICONS[toast.type] ?? Info;

  return (
    <SafeAreaView style={styles.safeArea} pointerEvents="box-none">
      <Animated.View
        style={[
          styles.toast,
          {
            backgroundColor: theme.bg,
            borderColor: theme.accent + "55",
            transform: [{ translateY }],
            opacity,
          },
        ]}
      >
        <View
          style={[styles.iconWrapper, { backgroundColor: theme.accent + "22" }]}
        >
          <Icon size={22} color={theme.icon} strokeWidth={2.2} />
        </View>
        <View style={styles.textWrapper}>
          {!!toast.title && <Text style={styles.title}>{toast.title}</Text>}
          {!!toast.message && (
            <Text style={styles.message} numberOfLines={2}>
              {toast.message}
            </Text>
          )}
        </View>
        <View style={[styles.accentBar, { backgroundColor: theme.accent }]} />
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    alignItems: "center",
  },
  toast: {
    width: width - SPACING.lg * 2,
    marginTop: SPACING.sm,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: SPACING.sm + 2,
    paddingHorizontal: SPACING.md,
    overflow: "hidden",
    ...SHADOW.lg,
  },
  iconWrapper: {
    width: 38,
    height: 38,
    borderRadius: RADIUS.full,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.sm + 2,
  },
  textWrapper: {
    flex: 1,
  },
  title: {
    color: "#ffffff",
    fontSize: FONT.sm,
    fontWeight: WEIGHT.bold,
    marginBottom: 1,
  },
  message: {
    color: "rgba(255,255,255,0.7)",
    fontSize: FONT.xs,
    fontWeight: WEIGHT.regular,
  },
  accentBar: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
});
