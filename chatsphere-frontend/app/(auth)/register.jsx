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
  if (!v.trim()) return "Username is required";
  if (v.trim().length < 3) return "Must be at least 3 characters";
  if (!/^[a-zA-Z0-9_]+$/.test(v.trim())) return "Letters, numbers & _ only";
  return null;
}

function validateEmail(v) {
  if (!v.trim()) return "Email is required";
  // Proper email regex: local@domain.tld — supports subdomains, all valid TLDs
  const emailRegex = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(v.trim())) return "Enter a valid email address";
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
  isValid,
  shakeAnim,
  icon: Icon,
}) {
  const [focused, setFocused] = useState(false);

  const colorAnim = useRef(new Animated.Value(0)).current;
  const checkScale = useRef(new Animated.Value(0)).current;
  const errorOpacity = useRef(new Animated.Value(0)).current;
  const errorHeight = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let target = 0;
    if (hasError) target = 3;
    else if (isValid && !focused) target = 2;
    else if (focused) target = 1;
    Animated.timing(colorAnim, {
      toValue: target,
      duration: 220,
      useNativeDriver: false,
    }).start();
  }, [focused, isValid, hasError]);

  useEffect(() => {
    Animated.spring(checkScale, {
      toValue: isValid && !showToggle ? 1 : 0,
      friction: 5,
      tension: 140,
      useNativeDriver: true,
    }).start();
  }, [isValid, showToggle]);

  useEffect(() => {
    const show = hasError && !!errorMessage;
    Animated.parallel([
      Animated.timing(errorOpacity, {
        toValue: show ? 1 : 0,
        duration: 200,
        useNativeDriver: false,
      }),
      Animated.timing(errorHeight, {
        toValue: show ? vs(22) : 0,
        duration: 200,
        useNativeDriver: false,
      }),
    ]).start();
  }, [hasError, errorMessage]);

  const borderColor = colorAnim.interpolate({
    inputRange: [0, 1, 2, 3],
    outputRange: [
      COLORS.inputBorder,
      COLORS.inputFocused,
      "#10B981",
      COLORS.error,
    ],
  });

  const bgColor = colorAnim.interpolate({
    inputRange: [0, 1, 2, 3],
    outputRange: [COLORS.inputBg, "#EFF6FF", COLORS.inputBg, "#FFF5F5"],
  });

  const borderWidth = colorAnim.interpolate({
    inputRange: [0, 1, 2, 3],
    outputRange: [1.5, 1.8, 1.5, 1.5],
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
              const prev = value;
              const diff = text.length - prev.length;
              if (diff > 0) {
                onChangeText(prev + text.slice(prev.length));
              } else {
                onChangeText(prev.slice(0, text.length));
              }
            } else {
              onChangeText(text);
            }
          }}
          placeholder={placeholder}
          placeholderTextColor={COLORS.textMuted}
          secureTextEntry={false}
          keyboardType={keyboardType}
          autoCapitalize="none"
          autoCorrect={false}
          spellCheck={false}
          autoComplete={
            secureTextEntry
              ? "new-password"
              : keyboardType === "email-address"
                ? "email"
                : "username"
          }
          textContentType={
            secureTextEntry
              ? "newPassword"
              : keyboardType === "email-address"
                ? "emailAddress"
                : "username"
          }
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
        {!showToggle && (
          <Animated.View
            style={[fi.validDot, { transform: [{ scale: checkScale }] }]}
          >
            <Check size={rs(10)} color="#fff" strokeWidth={2.5} />
          </Animated.View>
        )}
      </Animated.View>

      {/* Error — animates in height + opacity, only after blur */}
      <Animated.View
        style={{
          opacity: errorOpacity,
          height: errorHeight,
          overflow: "hidden",
        }}
      >
        <Text style={fi.errorText}>⚠ {errorMessage}</Text>
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
  errorText: {
    fontSize: rs(11),
    color: COLORS.error,
    marginTop: vs(4),
    paddingHorizontal: rs(2),
    fontWeight: WEIGHT.medium,
  },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function RegisterScreen() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // "blurred" tracks whether user has left each field at least once
  // Errors only appear after blurring — never while actively typing
  const [blurred, setBlurred] = useState({
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
  const fieldAnims = useRef([0, 1, 2].map(() => new Animated.Value(0))).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;

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

    Animated.stagger(
      70,
      fieldAnims.map((anim) =>
        Animated.timing(anim, {
          toValue: 1,
          duration: 320,
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

  // Always compute validation results
  const uValidationErr = validateUsername(username);
  const eValidationErr = validateEmail(email);
  const pValidationErr = validatePassword(password);

  // isValid drives the green checkmark — shows while typing, no blur needed
  const uValid = !uValidationErr && username.length > 0;
  const eValid = !eValidationErr && email.length > 0;
  const pValid = !pValidationErr && password.length > 0;

  // hasError only shows red after the field has been blurred at least once
  const uErr = blurred.username ? uValidationErr : null;
  const eErr = blurred.email ? eValidationErr : null;
  const pErr = blurred.password ? pValidationErr : null;

  const canSubmit = uValid && eValid && pValid && !isLoading;

  const handleRegister = async () => {
    // On submit, force-reveal all errors regardless of blur state
    setBlurred({ username: true, email: true, password: true });
    if (uValidationErr) shake(usernameShake);
    if (eValidationErr) shake(emailShake);
    if (pValidationErr) shake(passwordShake);
    if (uValidationErr || eValidationErr || pValidationErr) return;

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
              Join the conversation
            </Animated.Text>
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

            <Animated.View style={fieldEntrance(fieldAnims[0])}>
              <AnimatedField
                label="Username"
                placeholder="Choose a username"
                value={username}
                onChangeText={setUsername}
                onBlur={() => setBlurred((b) => ({ ...b, username: true }))}
                icon={User}
                returnKeyType="next"
                onSubmitEditing={() => emailRef.current?.focus()}
                hasError={!!uErr}
                errorMessage={uErr}
                isValid={uValid}
                shakeAnim={usernameShake}
              />
            </Animated.View>

            <Animated.View style={fieldEntrance(fieldAnims[1])}>
              <AnimatedField
                label="Email"
                placeholder="you@example.com"
                value={email}
                onChangeText={setEmail}
                onBlur={() => setBlurred((b) => ({ ...b, email: true }))}
                icon={Mail}
                keyboardType="email-address"
                returnKeyType="next"
                onSubmitEditing={() => passwordRef.current?.focus()}
                inputRef={emailRef}
                hasError={!!eErr}
                errorMessage={eErr}
                isValid={eValid}
                shakeAnim={emailShake}
              />
            </Animated.View>

            <Animated.View style={fieldEntrance(fieldAnims[2])}>
              <AnimatedField
                label="Password"
                placeholder="Min 6 characters"
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
                onSubmitEditing={handleRegister}
                hasError={!!pErr}
                errorMessage={pErr}
                isValid={pValid}
                shakeAnim={passwordShake}
              />
            </Animated.View>

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
