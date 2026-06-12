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
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
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

// ─── Validation ───────────────────────────────────────────────────────────────
function validateUsername(v) {
  if (!v.trim()) return "required";
  if (v.trim().length < 3) return "min 3 characters";
  if (!/^[a-zA-Z0-9_]+$/.test(v.trim())) return "letters, numbers & _ only";
  return null;
}
function validateEmail(v) {
  if (!v.trim()) return "required";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()))
    return "enter a valid email";
  return null;
}
function validatePassword(v) {
  if (!v) return "required";
  if (v.length < 6) return "min 6 characters";
  return null;
}
function passwordStrength(v) {
  if (!v || v.length < 3) return 0;
  let s = 0;
  if (v.length >= 6) s++;
  if (v.length >= 10) s++;
  if (/[^a-zA-Z0-9]/.test(v)) s++;
  return s;
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
  keyboardType = "default",
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
          keyboardType={keyboardType}
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

// ─── Strength Bar ─────────────────────────────────────────────────────────────
function StrengthBar({ strength }) {
  const colors = [COLORS.error, COLORS.warning, "#10B981"];
  const labels = ["Weak", "Fair", "Strong"];
  if (!strength) return null;
  return (
    <View style={sb.wrap}>
      <View style={sb.row}>
        {[0, 1, 2].map((i) => (
          <View
            key={i}
            style={[
              sb.seg,
              {
                backgroundColor:
                  i < strength ? colors[strength - 1] : COLORS.border,
              },
            ]}
          />
        ))}
      </View>
      <Text style={[sb.lbl, { color: colors[strength - 1] }]}>
        {labels[strength - 1]}
      </Text>
    </View>
  );
}

const sb = StyleSheet.create({
  wrap: { marginTop: vs(6), paddingHorizontal: rs(2) },
  row: { flexDirection: "row", gap: rs(4) },
  seg: { flex: 1, height: rs(3), borderRadius: 99 },
  lbl: {
    fontSize: rs(10),
    fontWeight: WEIGHT.semibold,
    marginTop: vs(3),
    letterSpacing: 0.3,
  },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function RegisterScreen() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [touched, setTouched] = useState({
    username: false,
    email: false,
    password: false,
  });

  const emailRef = useRef(null);
  const passwordRef = useRef(null);

  const usernameShake = useRef(new Animated.Value(0)).current;
  const emailShake = useRef(new Animated.Value(0)).current;
  const passwordShake = useRef(new Animated.Value(0)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const cardSlide = useRef(new Animated.Value(24)).current;

  const setAuth = useAuthStore((s) => s.setAuth);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(cardOpacity, {
        toValue: 1,
        duration: 380,
        useNativeDriver: true,
      }),
      Animated.timing(cardSlide, {
        toValue: 0,
        duration: 380,
        useNativeDriver: true,
      }),
    ]).start();
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
  const eErr = touched.email ? validateEmail(email) : null;
  const pErr = touched.password ? validatePassword(password) : null;
  const uValid = !validateUsername(username) && username.length > 0;
  const eValid = !validateEmail(email) && email.length > 0;
  const pValid = !validatePassword(password) && password.length > 0;
  const pStr = passwordStrength(password);
  const canSubmit = uValid && eValid && pValid && !isLoading;

  const handleRegister = async () => {
    setTouched({ username: true, email: true, password: true });
    const ue = validateUsername(username);
    const ee = validateEmail(email);
    const pe = validatePassword(password);
    if (ue) shake(usernameShake);
    if (ee) shake(emailShake);
    if (pe) shake(passwordShake);
    if (ue || ee || pe) return;

    setIsLoading(true);
    try {
      const res = await authAPI.register({
        username: username.trim().toLowerCase(),
        email: email.trim().toLowerCase(),
        password,
      });
      const { token, user } = res.data;
      setAuth(token, user);
      router.replace("/(app)/chat");
    } catch {
      shake(usernameShake);
      shake(emailShake);
      shake(passwordShake);
    } finally {
      setIsLoading(false);
    }
  };

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
          {/* Back */}
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [s.back, pressed && { opacity: 0.6 }]}
          >
            <ArrowLeft size={rs(18)} color="#fff" strokeWidth={2.2} />
            <Text style={s.backText}>Back</Text>
          </Pressable>

          {/* Logo */}
          <View style={s.top}>
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
            <Text style={s.tagline}>Join the conversation</Text>
          </View>

          {/* Card */}
          <Animated.View
            style={[
              s.card,
              { opacity: cardOpacity, transform: [{ translateY: cardSlide }] },
            ]}
          >
            <Text style={s.cardTitle}>Create account</Text>
            <Text style={s.cardSub}>Free forever, takes one minute</Text>

            <FieldInput
              label="Username"
              placeholder="Choose a username"
              value={username}
              onChangeText={(v) => {
                setUsername(v);
                if (!touched.username)
                  setTouched((t) => ({ ...t, username: true }));
              }}
              icon={User}
              returnKeyType="next"
              onSubmitEditing={() => emailRef.current?.focus()}
              hasError={!!uErr}
              isValid={uValid}
              shakeAnim={usernameShake}
            />

            <FieldInput
              label="Email"
              placeholder="Enter your email"
              value={email}
              onChangeText={(v) => {
                setEmail(v);
                if (!touched.email) setTouched((t) => ({ ...t, email: true }));
              }}
              icon={Mail}
              keyboardType="email-address"
              returnKeyType="next"
              onSubmitEditing={() => passwordRef.current?.focus()}
              inputRef={emailRef}
              hasError={!!eErr}
              isValid={eValid}
              shakeAnim={emailShake}
            />

            {/* Password with strength bar */}
            <View style={{ marginBottom: vs(16) }}>
              <Text style={fi.label}>Password</Text>
              <Animated.View
                style={[
                  fi.row,
                  {
                    borderColor: pErr
                      ? COLORS.error
                      : pValid
                        ? "#10B981"
                        : passwordShake
                          ? COLORS.inputFocused
                          : COLORS.inputBorder,
                    backgroundColor: pErr
                      ? "#FFF5F5"
                      : pValid
                        ? "#F0FDF8"
                        : COLORS.inputBg,
                    borderWidth: 1.5,
                  },
                  { transform: [{ translateX: passwordShake }] },
                ]}
              >
                <Lock
                  size={rs(17)}
                  color={pErr ? COLORS.error : COLORS.textMuted}
                  style={fi.icon}
                />
                <TextInput
                  ref={passwordRef}
                  style={fi.input}
                  value={password}
                  onChangeText={(v) => {
                    setPassword(v);
                    if (!touched.password)
                      setTouched((t) => ({ ...t, password: true }));
                  }}
                  placeholder="Min 6 characters"
                  placeholderTextColor={COLORS.textMuted}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  returnKeyType="done"
                  onSubmitEditing={handleRegister}
                />
                <Pressable
                  onPress={() => setShowPassword((p) => !p)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  style={fi.eyeBtn}
                >
                  {showPassword ? (
                    <EyeOff size={rs(17)} color={COLORS.textMuted} />
                  ) : (
                    <Eye size={rs(17)} color={COLORS.textMuted} />
                  )}
                </Pressable>
              </Animated.View>
              {password.length > 0 && <StrengthBar strength={pStr} />}
            </View>

            <Pressable
              onPress={handleRegister}
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
                    <Text style={s.btnText}>Create Account</Text>
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
              onPress={() => router.replace("/(auth)/login")}
              style={({ pressed }) => [s.link, pressed && { opacity: 0.55 }]}
            >
              <Text style={s.linkText}>
                Already have an account? <Text style={s.linkBold}>Sign in</Text>
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
  back: {
    flexDirection: "row",
    alignItems: "center",
    gap: rs(6),
    marginBottom: vs(20),
    alignSelf: "flex-start",
  },
  backText: { fontSize: rs(14), color: "#fff", fontWeight: WEIGHT.medium },
  top: { alignItems: "center", marginBottom: vs(24) },
  ringOuter: {
    width: rs(120),
    height: rs(120),
    borderRadius: rs(60),
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: vs(12),
  },
  ringMid: {
    width: rs(104),
    height: rs(104),
    borderRadius: rs(52),
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.18)",
    justifyContent: "center",
    alignItems: "center",
  },
  logoBox: {
    width: rs(88),
    height: rs(88),
    borderRadius: rs(44),
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.30)",
  },
  logo: { width: rs(100), height: rs(100), tintColor: "#ffffff" },
  appName: {
    fontSize: rs(24),
    fontWeight: WEIGHT.extrabold,
    color: "#fff",
    letterSpacing: 0.4,
  },
  tagline: {
    fontSize: rs(12),
    color: "rgba(255,255,255,0.70)",
    marginTop: vs(4),
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
    marginBottom: vs(20),
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
