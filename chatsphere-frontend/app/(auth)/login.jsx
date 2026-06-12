import { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  Image,
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

const { height } = Dimensions.get("window");

export default function LoginScreen() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [focusedInput, setFocusedInput] = useState(null);

  const passwordRef = useRef(null);
  const setAuth = useAuthStore((s) => s.setAuth);

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      setError("Please fill in all fields");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      const res = await authAPI.login({
        username: username.trim().toLowerCase(),
        password,
      });

      const { token, user } = res.data;
      setAuth(token, user);
      router.replace("/(app)/chat");
    } catch (err) {
      const msg = err?.response?.data?.message || "Login failed. Try again.";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={[COLORS.gradientStart, COLORS.gradientMid, COLORS.gradientEnd]}
      style={styles.gradient}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Top section — logo + title */}
          <View style={styles.topSection}>
            <View style={styles.logoWrapper}>
              <Image
                source={require("../../assets/images/logo.png")}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.appName}>ChatSphere</Text>
            <Text style={styles.tagline}>Connect. Chat. Belong.</Text>
          </View>

          {/* Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Welcome back</Text>
            <Text style={styles.cardSubtitle}>Sign in to continue</Text>

            {/* Error */}
            {error ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {/* Username input */}
            <View
              style={[
                styles.inputWrapper,
                focusedInput === "username" && styles.inputWrapperFocused,
              ]}
            >
              <User
                size={18}
                color={
                  focusedInput === "username"
                    ? COLORS.primary
                    : COLORS.textMuted
                }
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Username"
                placeholderTextColor={COLORS.textMuted}
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                returnKeyType="next"
                onSubmitEditing={() => passwordRef.current?.focus()}
                onFocus={() => setFocusedInput("username")}
                onBlur={() => setFocusedInput(null)}
              />
            </View>

            {/* Password input */}
            <View
              style={[
                styles.inputWrapper,
                focusedInput === "password" && styles.inputWrapperFocused,
              ]}
            >
              <Lock
                size={18}
                color={
                  focusedInput === "password"
                    ? COLORS.primary
                    : COLORS.textMuted
                }
                style={styles.inputIcon}
              />
              <TextInput
                ref={passwordRef}
                style={styles.input}
                placeholder="Password"
                placeholderTextColor={COLORS.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                returnKeyType="done"
                onSubmitEditing={handleLogin}
                onFocus={() => setFocusedInput("password")}
                onBlur={() => setFocusedInput(null)}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                {showPassword ? (
                  <EyeOff size={18} color={COLORS.textMuted} />
                ) : (
                  <Eye size={18} color={COLORS.textMuted} />
                )}
              </TouchableOpacity>
            </View>

            {/* Login button */}
            <TouchableOpacity
              onPress={handleLogin}
              disabled={isLoading}
              activeOpacity={0.85}
              style={styles.buttonWrapper}
            >
              <LinearGradient
                colors={[
                  COLORS.primaryDark,
                  COLORS.primary,
                  COLORS.primaryLight,
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.button}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <View style={styles.buttonContent}>
                    <Text style={styles.buttonText}>Sign In</Text>
                    <ArrowRight size={18} color="#fff" />
                  </View>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Register link */}
            <TouchableOpacity
              onPress={() => router.push("/(auth)/register")}
              style={styles.linkButton}
              activeOpacity={0.7}
            >
              <Text style={styles.linkText}>
                Don&apos;t have an account?{" "}
                <Text style={styles.linkTextBold}>Create one</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.xxxl,
  },
  topSection: {
    alignItems: "center",
    marginBottom: SPACING.xxxl,
  },
  logoWrapper: {
    width: 90,
    height: 90,
    borderRadius: RADIUS.xxl,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SPACING.md,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.3)",
    ...SHADOW.md,
  },
  logo: {
    width: 56,
    height: 56,
    tintColor: "#ffffff",
  },
  appName: {
    fontSize: FONT.xxxl,
    fontWeight: WEIGHT.extrabold,
    color: "#ffffff",
    letterSpacing: 0.5,
  },
  tagline: {
    fontSize: FONT.sm,
    color: "rgba(255,255,255,0.75)",
    marginTop: SPACING.xs,
    letterSpacing: 1.2,
    fontWeight: WEIGHT.medium,
  },
  card: {
    backgroundColor: "rgba(255,255,255,0.97)",
    borderRadius: RADIUS.xl,
    padding: SPACING.xxl,
    ...SHADOW.lg,
  },
  cardTitle: {
    fontSize: FONT.xl,
    fontWeight: WEIGHT.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  cardSubtitle: {
    fontSize: FONT.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xl,
  },
  errorBox: {
    backgroundColor: "#FEF2F2",
    borderRadius: RADIUS.sm,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.error,
  },
  errorText: {
    fontSize: FONT.sm,
    color: COLORS.error,
    fontWeight: WEIGHT.medium,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.inputBg,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    borderColor: COLORS.inputBorder,
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.md,
    height: 52,
  },
  inputWrapperFocused: {
    borderColor: COLORS.inputFocused,
    backgroundColor: "#F0F7FF",
  },
  inputIcon: {
    marginRight: SPACING.sm,
  },
  input: {
    flex: 1,
    fontSize: FONT.md,
    color: COLORS.textPrimary,
    fontWeight: WEIGHT.regular,
  },
  eyeButton: {
    padding: SPACING.xs,
  },
  buttonWrapper: {
    marginTop: SPACING.sm,
    borderRadius: RADIUS.md,
    overflow: "hidden",
    ...SHADOW.md,
  },
  button: {
    height: 52,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: RADIUS.md,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
  },
  buttonText: {
    fontSize: FONT.lg,
    fontWeight: WEIGHT.bold,
    color: "#ffffff",
    letterSpacing: 0.3,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: SPACING.xl,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  dividerText: {
    fontSize: FONT.sm,
    color: COLORS.textMuted,
    marginHorizontal: SPACING.md,
    fontWeight: WEIGHT.medium,
  },
  linkButton: {
    alignItems: "center",
  },
  linkText: {
    fontSize: FONT.sm,
    color: COLORS.textSecondary,
  },
  linkTextBold: {
    color: COLORS.primary,
    fontWeight: WEIGHT.bold,
  },
});
