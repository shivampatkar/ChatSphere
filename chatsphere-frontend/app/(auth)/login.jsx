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
import { User, Lock, Eye, EyeOff, ArrowRight } from "lucide-react-native";
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
  if (!v.trim()) return "Username is required";
  if (v.trim().length < 3) return "Must be at least 3 characters";
  if (!/^[a-zA-Z0-9_]+$/.test(v.trim())) return "Letters, numbers & _ only";
  return null;
}
function validatePassword(v) {
  if (!v) return "Password is required";
  if (v.length < 6) return "Must be at least 6 characters";
  return null;
}

// ─── AnimatedField ─────────────────────────────────────────────────────────────
// UX rules:
//   • Green checkmark appears while typing as soon as value is valid (positive feedback)
//   • Error only shows after the user leaves the field (onBlur) — never while typing
//   • Once an error is shown, it stays visible on re-focus so user knows what to fix
//   • Password uses keyboardType="visible-password" on Android → normal keyboard, masked chars
function AnimatedField({
  label,
  placeholder,
  value,
  onChangeText,
  onBlur,
  secureTextEntry = false,
  showToggle = false,
  showPassword,
  onTogglePassword,
  inputRef,
  returnKeyType = "done",
  onSubmitEditing,
  keyboardType = "default",
  hasError,
  errorMessage,
  shakeAnim,
  icon: Icon,
}) {
  const [focused, setFocused] = useState(false);

  // 3 states only: 0 = neutral (grey), 1 = focused (blue), 2 = error (red)
  const colorAnim = useRef(new Animated.Value(0)).current;
  const errorOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let target = 0;
    if (hasError) target = 2;
    else if (focused) target = 1;
    Animated.timing(colorAnim, {
      toValue: target,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [focused, hasError]);

  useEffect(() => {
    Animated.timing(errorOpacity, {
      toValue: hasError && errorMessage ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [hasError, errorMessage]);

  const borderColor = colorAnim.interpolate({
    inputRange: [0, 1, 2],
    outputRange: [COLORS.inputBorder, COLORS.inputFocused, COLORS.error],
  });

  const bgColor = colorAnim.interpolate({
    inputRange: [0, 1, 2],
    outputRange: [COLORS.inputBg, "#EFF6FF", "#FFF5F5"],
  });

  const borderWidth = colorAnim.interpolate({
    inputRange: [0, 1, 2],
    outputRange: [1.5, 1.8, 1.5],
  });

  const iconColor = hasError
    ? COLORS.error
    : focused
      ? COLORS.inputFocused
      : COLORS.textMuted;

  const handleBlur = () => {
    setFocused(false);
    onBlur?.();
  };

  return (
    <View style={{ marginBottom: vs(16) }}>
      <Text style={fi.label}>{label}</Text>
      <Animated.View
        style={[
          fi.row,
          {
            borderColor,
            backgroundColor: bgColor,
            borderWidth,
            transform: [{ translateX: shakeAnim }],
          },
        ]}
      >
        <Icon size={rs(17)} color={iconColor} style={fi.icon} />
        <TextInput
          ref={inputRef}
          style={fi.input}
          value={
            secureTextEntry && !showPassword ? "•".repeat(value.length) : value
          }
          onChangeText={(text) => {
            if (secureTextEntry && !showPassword) {
              // When masked, figure out what actually changed
              const prev = value;
              const diff = text.length - "•".repeat(prev.length).length;
              if (diff > 0) {
                // Characters added at end
                onChangeText(prev + text.slice("•".repeat(prev.length).length));
              } else {
                // Characters deleted
                onChangeText(prev.slice(0, text.length));
              }
            } else {
              onChangeText(text);
            }
          }}
          placeholder={placeholder}
          placeholderTextColor={COLORS.textMuted}
          secureTextEntry={false}
          keyboardType="default"
          autoCapitalize="none"
          autoCorrect={false}
          spellCheck={false}
          autoComplete={secureTextEntry ? "current-password" : "username"}
          textContentType={secureTextEntry ? "password" : "username"}
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
          onFocus={() => setFocused(true)}
          onBlur={handleBlur}
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
      </Animated.View>

      {/* Error — fades in only after blur, never while typing */}
      <Animated.View style={{ opacity: errorOpacity, overflow: "hidden" }}>
        {hasError && errorMessage ? (
          <Text style={fi.errorText}>⚠ {errorMessage}</Text>
        ) : null}
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
  errorText: {
    fontSize: rs(11),
    color: COLORS.error,
    marginTop: vs(5),
    paddingHorizontal: rs(2),
    fontWeight: WEIGHT.medium,
  },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function LoginScreen() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [ready, setReady] = useState(false);

  // "blurred" tracks whether user has left a field at least once
  // Errors only show after the user has blurred the field
  const [blurred, setBlurred] = useState({ username: false, password: false });

  const passwordRef = useRef(null);
  const usernameShake = useRef(new Animated.Value(0)).current;
  const passwordShake = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.85)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const cardSlide = useRef(new Animated.Value(30)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const fieldAnims = useRef([0, 1].map(() => new Animated.Value(0))).current;

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

      Animated.stagger(
        70,
        fieldAnims.map((anim) =>
          Animated.timing(anim, {
            toValue: 1,
            duration: 320,
            delay: 120,
            useNativeDriver: true,
          }),
        ),
      ).start();

      Animated.timing(taglineOpacity, {
        toValue: 1,
        duration: 400,
        delay: 250,
        useNativeDriver: true,
      }).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.08,
            duration: 1400,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1400,
            useNativeDriver: true,
          }),
        ]),
      ).start();
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

  // Validation (always computed for submit gating)
  const uValidationErr = validateUsername(username);
  const pValidationErr = validatePassword(password);

  // hasError = only show red after user has blurred the field
  const uErr = blurred.username ? uValidationErr : null;
  const pErr = blurred.password ? pValidationErr : null;

  const canSubmit = !uValidationErr && !pValidationErr && !isLoading;

  const handleLogin = async () => {
    // On submit, force-reveal all errors regardless of blur state
    setBlurred({ username: true, password: true });
    if (uValidationErr) shake(usernameShake);
    if (pValidationErr) shake(passwordShake);
    if (uValidationErr || pValidationErr) return;

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

  const fieldEntrance = (anim) => ({
    opacity: anim,
    transform: [
      {
        translateY: anim.interpolate({
          inputRange: [0, 1],
          outputRange: [14, 0],
        }),
      },
    ],
  });

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
            <Animated.View
              style={[s.ringOuter, { transform: [{ scale: pulseAnim }] }]}
            >
              <Animated.View
                style={[
                  s.ringMid,
                  {
                    opacity: pulseAnim.interpolate({
                      inputRange: [1, 1.08],
                      outputRange: [0.6, 1],
                    }),
                  },
                ]}
              >
                <View style={s.logoBox}>
                  <Image
                    source={require("../../assets/images/logo.png")}
                    style={s.logo}
                    resizeMode="contain"
                  />
                </View>
              </Animated.View>
            </Animated.View>
            <Text style={s.appName} numberOfLines={1} adjustsFontSizeToFit>
              ChatSphere
            </Text>
            <Animated.Text style={[s.tagline, { opacity: taglineOpacity }]}>
              Connect. Chat. Belong.
            </Animated.Text>
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

            <Animated.View style={fieldEntrance(fieldAnims[0])}>
              <AnimatedField
                label="Username"
                placeholder="Enter your username"
                value={username}
                onChangeText={setUsername}
                onBlur={() => setBlurred((b) => ({ ...b, username: true }))}
                icon={User}
                returnKeyType="next"
                onSubmitEditing={() => passwordRef.current?.focus()}
                hasError={!!uErr}
                errorMessage={uErr}
                shakeAnim={usernameShake}
              />
            </Animated.View>

            <Animated.View style={fieldEntrance(fieldAnims[1])}>
              <AnimatedField
                label="Password"
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
                onBlur={() => setBlurred((b) => ({ ...b, password: true }))}
                icon={Lock}
                secureTextEntry
                showToggle
                showPassword={showPassword}
                onTogglePassword={() => setShowPassword((p) => !p)}
                inputRef={passwordRef}
                returnKeyType="done"
                onSubmitEditing={handleLogin}
                hasError={!!pErr}
                errorMessage={pErr}
                shakeAnim={passwordShake}
              />
            </Animated.View>

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
                Don&apos;t have an account?{" "}
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
