import { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  Image,
  Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import {
  User,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Check,
} from "lucide-react-native";
import { authAPI } from "../../services/api";
import useAuthStore from "../../store/useAuthStore";
import {
  COLORS,
  FONT,
  WEIGHT,
  RADIUS,
  SPACING,
  SHADOW,
} from "../../constants/theme";

// ─── Responsive helpers ───────────────────────────────────────────────────────
const { width, height } = Dimensions.get("window");
const rs = (n) => Math.min(Math.max((width / 390) * n, n * 0.82), n * 1.14);
const vs = (n) => Math.min(Math.max((height / 844) * n, n * 0.82), n * 1.14);

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function SkeletonPulse({ style }) {
  const opacity = useRef(new Animated.Value(0.3)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.85,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);
  return (
    <Animated.View
      style={[
        {
          opacity,
          backgroundColor: "rgba(255,255,255,0.20)",
          borderRadius: rs(10),
        },
        style,
      ]}
    />
  );
}

function SkeletonScreen() {
  return (
    <View style={sk.wrap}>
      <SkeletonPulse style={sk.ring} />
      <SkeletonPulse style={sk.name} />
      <SkeletonPulse style={sk.tag} />
      <View style={sk.card}>
        <SkeletonPulse style={sk.h1} />
        <SkeletonPulse style={sk.h2} />
        <SkeletonPulse style={sk.lbl} />
        <SkeletonPulse style={sk.inp} />
        <SkeletonPulse style={sk.lbl} />
        <SkeletonPulse style={sk.inp} />
        <SkeletonPulse style={sk.btn} />
      </View>
    </View>
  );
}

const sk = StyleSheet.create({
  wrap: {
    flex: 1,
    alignItems: "center",
    paddingTop: vs(52),
    paddingHorizontal: rs(24),
  },
  ring: {
    width: rs(120),
    height: rs(120),
    borderRadius: rs(60),
    marginBottom: vs(14),
  },
  name: {
    width: rs(150),
    height: rs(24),
    borderRadius: rs(6),
    marginBottom: vs(8),
  },
  tag: {
    width: rs(110),
    height: rs(13),
    borderRadius: rs(6),
    marginBottom: vs(36),
  },
  card: {
    width: "100%",
    backgroundColor: "rgba(255,255,255,0.09)",
    borderRadius: rs(24),
    padding: rs(24),
  },
  h1: {
    width: rs(130),
    height: rs(20),
    borderRadius: rs(6),
    marginBottom: vs(8),
  },
  h2: {
    width: rs(100),
    height: rs(13),
    borderRadius: rs(6),
    marginBottom: vs(22),
  },
  lbl: {
    width: rs(70),
    height: rs(12),
    borderRadius: rs(4),
    marginBottom: vs(6),
  },
  inp: {
    width: "100%",
    height: rs(52),
    borderRadius: rs(12),
    marginBottom: vs(16),
  },
  btn: {
    width: "100%",
    height: rs(52),
    borderRadius: rs(12),
    marginTop: vs(4),
  },
});

// ─── Validation ───────────────────────────────────────────────────────────────
function validateUsername(v) {
  if (!v.trim()) return "required";
  if (v.trim().length < 3) return "too short";
  if (!/^[a-zA-Z0-9_]+$/.test(v.trim())) return "letters, numbers & _ only";
  return null;
}
function validatePassword(v) {
  if (!v) return "required";
  if (v.length < 6) return "min 6 characters";
  return null;
}

// ─── FieldInput ───────────────────────────────────────────────────────────────
function FieldInput({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  showToggle = false,
  showPassword,
  onTogglePassword,
  inputRef,
  returnKeyType = "done",
  onSubmitEditing,
  hasError,
  isValid,
  shakeAnim,
  icon: Icon,
}) {
  const [focused, setFocused] = useState(false);

  const borderColor = hasError
    ? COLORS.error
    : isValid && !focused
      ? "#10B981"
      : focused
        ? COLORS.inputFocused
        : COLORS.inputBorder;

  const bgColor = hasError
    ? "#FFF5F5"
    : isValid && !focused
      ? "#F0FDF8"
      : focused
        ? "#EFF6FF"
        : COLORS.inputBg;

  const iconColor = hasError
    ? COLORS.error
    : focused
      ? COLORS.inputFocused
      : COLORS.textMuted;

  return (
    <View style={{ marginBottom: vs(16) }}>
      <Text style={fi.label}>{label}</Text>
      <Animated.View
        style={[
          fi.row,
          {
            borderColor,
            backgroundColor: bgColor,
            borderWidth: focused ? 1.8 : 1.5,
          },
          { transform: [{ translateX: shakeAnim }] },
        ]}
      >
        <Icon size={rs(17)} color={iconColor} style={fi.icon} />
        <TextInput
          ref={inputRef}
          style={fi.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={COLORS.textMuted}
          secureTextEntry={secureTextEntry && !showPassword}
          autoCapitalize="none"
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        {showToggle && (
          <Pressable
            onPress={onTogglePassword}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={fi.eyeBtn}
          >
            {showPassword ? (
              <EyeOff size={rs(17)} color={COLORS.textMuted} />
            ) : (
              <Eye size={rs(17)} color={COLORS.textMuted} />
            )}
          </Pressable>
        )}
        {isValid && !showToggle && (
          <View style={fi.validDot}>
            <Check size={rs(10)} color="#fff" strokeWidth={2.5} />
          </View>
        )}
      </Animated.View>
    </View>
  );
}

const fi = StyleSheet.create({
  label: {
    fontSize: rs(12),
    fontWeight: WEIGHT.semibold,
    color: COLORS.textSecondary,
    letterSpacing: 0.4,
    textTransform: "uppercase",
    marginBottom: vs(6),
    paddingHorizontal: rs(2),
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: rs(12),
    paddingHorizontal: rs(14),
    height: rs(52),
  },
  icon: { marginRight: rs(10) },
  input: {
    flex: 1,
    fontSize: rs(14),
    color: COLORS.textPrimary,
    fontWeight: WEIGHT.regular,
  },
  eyeBtn: { padding: rs(4), marginLeft: rs(4) },
  validDot: {
    width: rs(20),
    height: rs(20),
    borderRadius: rs(10),
    backgroundColor: "#10B981",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: rs(8),
  },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function LoginScreen() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [touched, setTouched] = useState({ username: false, password: false });
  const [ready, setReady] = useState(false);

  const passwordRef = useRef(null);
  const usernameShake = useRef(new Animated.Value(0)).current;
  const passwordShake = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.85)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const cardSlide = useRef(new Animated.Value(30)).current;

  const setAuth = useAuthStore((s) => s.setAuth);

  useEffect(() => {
    const t = setTimeout(() => {
      setReady(true);
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1,
          useNativeDriver: true,
          tension: 55,
          friction: 8,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        }),
        Animated.timing(cardOpacity, {
          toValue: 1,
          duration: 400,
          delay: 120,
          useNativeDriver: true,
        }),
        Animated.timing(cardSlide, {
          toValue: 0,
          duration: 400,
          delay: 120,
          useNativeDriver: true,
        }),
      ]).start();
    }, 850);
    return () => clearTimeout(t);
  }, []);

  const shake = (anim) => {
    Animated.sequence([
      Animated.timing(anim, {
        toValue: 9,
        duration: 55,
        useNativeDriver: true,
      }),
      Animated.timing(anim, {
        toValue: -9,
        duration: 55,
        useNativeDriver: true,
      }),
      Animated.timing(anim, {
        toValue: 6,
        duration: 55,
        useNativeDriver: true,
      }),
      Animated.timing(anim, {
        toValue: -6,
        duration: 55,
        useNativeDriver: true,
      }),
      Animated.timing(anim, {
        toValue: 0,
        duration: 55,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const uErr = touched.username ? validateUsername(username) : null;
  const pErr = touched.password ? validatePassword(password) : null;
  const uValid = !validateUsername(username) && username.length > 0;
  const pValid = !validatePassword(password) && password.length > 0;
  const canSubmit = uValid && pValid && !isLoading;

  const handleLogin = async () => {
    setTouched({ username: true, password: true });
    const ue = validateUsername(username);
    const pe = validatePassword(password);
    if (ue) shake(usernameShake);
    if (pe) shake(passwordShake);
    if (ue || pe) return;

    setIsLoading(true);
    try {
      const res = await authAPI.login({
        username: username.trim().toLowerCase(),
        password,
      });
      const { token, user } = res.data;
      setAuth(token, user);
      router.replace("/(app)/chat");
    } catch {
      shake(usernameShake);
      shake(passwordShake);
    } finally {
      setIsLoading(false);
    }
  };

  if (!ready) {
    return (
      <LinearGradient
        colors={[COLORS.gradientStart, COLORS.gradientMid, COLORS.gradientEnd]}
        style={s.gradient}
      >
        <SkeletonScreen />
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={[COLORS.gradientStart, COLORS.gradientMid, COLORS.gradientEnd]}
      style={s.gradient}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={s.kav}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={s.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo */}
          <Animated.View
            style={[
              s.top,
              { opacity: logoOpacity, transform: [{ scale: logoScale }] },
            ]}
          >
            <View style={s.ringOuter}>
              <View style={s.ringMid}>
                <View style={s.logoBox}>
                  <Image
                    source={require("../../assets/images/logo.png")}
                    style={s.logo}
                    resizeMode="contain"
                  />
                </View>
              </View>
            </View>
            <Text style={s.appName} numberOfLines={1} adjustsFontSizeToFit>
              ChatSphere
            </Text>
            <Text style={s.tagline}>Connect. Chat. Belong.</Text>
          </Animated.View>

          {/* Card */}
          <Animated.View
            style={[
              s.card,
              { opacity: cardOpacity, transform: [{ translateY: cardSlide }] },
            ]}
          >
            <Text style={s.cardTitle}>Welcome back</Text>
            <Text style={s.cardSub}>Sign in to your account</Text>

            <FieldInput
              label="Username"
              placeholder="Enter your username"
              value={username}
              onChangeText={(v) => {
                setUsername(v);
                if (!touched.username)
                  setTouched((t) => ({ ...t, username: true }));
              }}
              icon={User}
              returnKeyType="next"
              onSubmitEditing={() => passwordRef.current?.focus()}
              hasError={!!uErr}
              isValid={uValid}
              shakeAnim={usernameShake}
            />

            <FieldInput
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChangeText={(v) => {
                setPassword(v);
                if (!touched.password)
                  setTouched((t) => ({ ...t, password: true }));
              }}
              icon={Lock}
              secureTextEntry
              showToggle
              showPassword={showPassword}
              onTogglePassword={() => setShowPassword((p) => !p)}
              inputRef={passwordRef}
              returnKeyType="done"
              onSubmitEditing={handleLogin}
              hasError={!!pErr}
              isValid={pValid}
              shakeAnim={passwordShake}
            />

            <Pressable
              onPress={handleLogin}
              disabled={!canSubmit}
              style={({ pressed }) => [
                s.btnWrap,
                !canSubmit && { opacity: 0.5 },
                pressed && canSubmit && { transform: [{ scale: 0.977 }] },
              ]}
              android_ripple={{ color: "rgba(255,255,255,0.25)" }}
            >
              <LinearGradient
                colors={
                  canSubmit
                    ? [COLORS.primaryDark, COLORS.primary, COLORS.primaryLight]
                    : ["#94A3B8", "#94A3B8", "#94A3B8"]
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={s.btn}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <View style={s.btnContent}>
                    <Text style={s.btnText}>Sign In</Text>
                    <View style={s.arrowPill}>
                      <ArrowRight
                        size={rs(15)}
                        color="#fff"
                        strokeWidth={2.5}
                      />
                    </View>
                  </View>
                )}
              </LinearGradient>
            </Pressable>

            <View style={s.divider}>
              <View style={s.divLine} />
              <Text style={s.divText}>or</Text>
              <View style={s.divLine} />
            </View>

            <Pressable
              onPress={() => router.push("/(auth)/register")}
              style={({ pressed }) => [s.link, pressed && { opacity: 0.55 }]}
            >
              <Text style={s.linkText}>
                Don't have an account?{" "}
                <Text style={s.linkBold}>Create one</Text>
              </Text>
            </Pressable>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const s = StyleSheet.create({
  gradient: { flex: 1 },
  kav: { flex: 1 },
  scroll: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: rs(22),
    paddingVertical: vs(32),
  },
  top: { alignItems: "center", marginBottom: vs(28) },
  ringOuter: {
    width: rs(152),
    height: rs(152),
    borderRadius: rs(76),
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: vs(14),
  },
  ringMid: {
    width: rs(134),
    height: rs(134),
    borderRadius: rs(67),
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.18)",
    justifyContent: "center",
    alignItems: "center",
  },
  logoBox: {
    width: rs(114),
    height: rs(114),
    borderRadius: rs(57),
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.30)",
  },
  logo: { width: rs(140), height: rs(140), tintColor: "#ffffff" },
  appName: {
    fontSize: rs(28),
    fontWeight: WEIGHT.extrabold,
    color: "#fff",
    letterSpacing: 0.4,
  },
  tagline: {
    fontSize: rs(12),
    color: "rgba(255,255,255,0.70)",
    marginTop: vs(5),
    letterSpacing: 1.4,
    fontWeight: WEIGHT.medium,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: rs(24),
    padding: rs(24),
    ...SHADOW.lg,
  },
  cardTitle: {
    fontSize: rs(20),
    fontWeight: WEIGHT.bold,
    color: COLORS.textPrimary,
    marginBottom: vs(4),
  },
  cardSub: {
    fontSize: rs(13),
    color: COLORS.textSecondary,
    marginBottom: vs(22),
  },
  btnWrap: {
    marginTop: vs(4),
    borderRadius: rs(12),
    overflow: "hidden",
    ...SHADOW.md,
  },
  btn: {
    height: rs(52),
    justifyContent: "center",
    alignItems: "center",
    borderRadius: rs(12),
  },
  btnContent: { flexDirection: "row", alignItems: "center", gap: rs(10) },
  btnText: {
    fontSize: rs(15),
    fontWeight: WEIGHT.bold,
    color: "#fff",
    letterSpacing: 0.3,
  },
  arrowPill: {
    width: rs(26),
    height: rs(26),
    borderRadius: rs(13),
    backgroundColor: "rgba(255,255,255,0.20)",
    justifyContent: "center",
    alignItems: "center",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: vs(18),
  },
  divLine: { flex: 1, height: 1, backgroundColor: COLORS.border },
  divText: {
    fontSize: rs(12),
    color: COLORS.textMuted,
    marginHorizontal: rs(12),
    fontWeight: WEIGHT.medium,
  },
  link: { alignItems: "center" },
  linkText: { fontSize: rs(13), color: COLORS.textSecondary },
  linkBold: { color: COLORS.primary, fontWeight: WEIGHT.bold },
});
