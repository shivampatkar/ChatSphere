import { useEffect, useRef } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Text,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { LogOut } from "lucide-react-native";
import { router } from "expo-router";
import useAuthStore from "../../store/useAuthStore";
import useChat from "../../hooks/useChat";
import MessageBubble from "../../components/MessageBubble";
import ChatInput from "../../components/ChatInput";
import ConnectionBanner from "../../components/ConnectionBanner";
import {
  COLORS,
  FONT,
  WEIGHT,
  SPACING,
  RADIUS,
  SHADOW,
} from "../../constants/theme";

// ---------------------------------------------------------------------------
// Shimmer primitive
// ---------------------------------------------------------------------------
function ShimmerBar({ width, height = 14, style }) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(anim, {
          toValue: 0,
          duration: 900,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  const opacity = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.35, 0.7],
  });

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius: RADIUS.md,
          backgroundColor: COLORS.border,
          opacity,
        },
        style,
      ]}
    />
  );
}

// ---------------------------------------------------------------------------
// Skeleton bubble row
// ---------------------------------------------------------------------------
function SkeletonBubble({ isOwn }) {
  return (
    <View
      style={[
        skeletonStyles.row,
        isOwn ? skeletonStyles.rowOwn : skeletonStyles.rowOther,
      ]}
    >
      {/* Avatar placeholder — only for "other" bubbles */}
      {!isOwn && (
        <ShimmerBar
          width={32}
          height={32}
          style={{
            borderRadius: RADIUS.full,
            marginRight: SPACING.sm,
            marginBottom: 18,
          }}
        />
      )}

      <View
        style={[
          skeletonStyles.wrapper,
          isOwn ? skeletonStyles.wrapperOwn : skeletonStyles.wrapperOther,
        ]}
      >
        {/* Sender name placeholder — only for others */}
        {!isOwn && (
          <ShimmerBar
            width={64}
            height={10}
            style={{ marginBottom: 6, marginLeft: 4 }}
          />
        )}

        {/* Bubble body */}
        <ShimmerBar
          width={isOwn ? 180 : 220}
          height={44}
          style={{ borderRadius: RADIUS.lg }}
        />

        {/* Timestamp placeholder */}
        <ShimmerBar width={40} height={9} style={{ marginTop: 4 }} />
      </View>
    </View>
  );
}

const SKELETON_PATTERN = [false, true, false, false, true, false, true];

function SkeletonList() {
  return (
    <View style={{ flex: 1, paddingVertical: SPACING.md }}>
      {SKELETON_PATTERN.map((isOwn, i) => (
        <SkeletonBubble key={i} isOwn={isOwn} />
      ))}
    </View>
  );
}

const skeletonStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    marginVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
    alignItems: "flex-end",
  },
  rowOwn: { justifyContent: "flex-end" },
  rowOther: { justifyContent: "flex-start" },
  wrapper: { maxWidth: "75%" },
  wrapperOwn: { alignItems: "flex-end" },
  wrapperOther: { alignItems: "flex-start" },
});

// ---------------------------------------------------------------------------
// Status pill
// ---------------------------------------------------------------------------
function StatusPill({ status, username }) {
  const isConnected = status === "connected";
  return (
    <View
      style={[
        pillStyles.pill,
        isConnected ? pillStyles.pillOnline : pillStyles.pillOffline,
      ]}
    >
      <View
        style={[
          pillStyles.dot,
          isConnected ? pillStyles.dotOnline : pillStyles.dotOffline,
        ]}
      />
      <Text
        style={[
          pillStyles.text,
          isConnected ? pillStyles.textOnline : pillStyles.textOffline,
        ]}
        numberOfLines={1}
      >
        {isConnected ? `@${username}` : "Connecting…"}
      </Text>
    </View>
  );
}

const pillStyles = StyleSheet.create({
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    marginTop: 4,
  },
  pillOnline: {
    backgroundColor: "rgba(255,255,255,0.12)",
    borderColor: "rgba(255,255,255,0.25)",
  },
  pillOffline: {
    backgroundColor: "rgba(255,200,50,0.12)",
    borderColor: "rgba(255,200,50,0.3)",
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: RADIUS.full,
  },
  dotOnline: { backgroundColor: COLORS.success },
  dotOffline: { backgroundColor: COLORS.warning },
  text: {
    fontSize: FONT.xs,
    fontWeight: WEIGHT.medium,
    maxWidth: 120,
  },
  textOnline: { color: "rgba(255,255,255,0.85)" },
  textOffline: { color: "rgba(255,200,50,0.9)" },
});

// ---------------------------------------------------------------------------
// Main screen
// ---------------------------------------------------------------------------
export default function ChatScreen() {
  const flatListRef = useRef(null);
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);
  const { messages, isLoading, connectionStatus, sendMessage, currentUserId } =
    useChat();

  // Scroll to bottom only when a new message arrives
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const handleLogout = async () => {
    await logout();
    router.replace("/(auth)/login");
  };

  const renderMessage = ({ item }) => (
    <MessageBubble message={item} isOwn={item.senderId === currentUserId} />
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconWrapper}>
        {/* Using a simple placeholder icon — swap for your Users icon if preferred */}
        <Text style={styles.emptyIconText}>💬</Text>
      </View>
      <Text style={styles.emptyTitle}>No messages yet</Text>
      <Text style={styles.emptySubtitle}>Be the first to say something!</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      {/*
        KAV fix:
        - iOS: "padding" shifts content up when keyboard appears — correct.
        - Android: use undefined here and set in app.json:
            "android": { "softwareKeyboardLayoutMode": "resize" }
          This lets the OS handle it natively, avoids layout jumps entirely.
      */}
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={0}
      >
        {/* ── Header ───────────────────────────────────────────── */}
        <LinearGradient
          colors={[COLORS.gradientStart, COLORS.gradientMid]}
          style={styles.header}
        >
          {/* Left: open logo + name + status pill */}
          <View style={styles.headerLeft}>
            <View style={styles.headerLogoWrapper}>
              <Image
                source={require("../../assets/images/logo.png")}
                style={styles.headerLogo}
                resizeMode="contain"
              />
            </View>
            <View>
              <Text style={styles.headerTitle}>ChatSphere</Text>
              <StatusPill status={connectionStatus} username={user?.username} />
            </View>
          </View>

          {/* Right: bare LogOut icon */}
          <TouchableOpacity
            onPress={handleLogout}
            style={styles.logoutButton}
            activeOpacity={0.5}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <LogOut
              size={22}
              color="rgba(255,255,255,0.75)"
              strokeWidth={1.8}
            />
          </TouchableOpacity>
        </LinearGradient>

        {/* ── Connection banner ────────────────────────────────── */}
        <ConnectionBanner status={connectionStatus} />

        {/* ── Messages / Skeleton ──────────────────────────────── */}
        {isLoading ? (
          <SkeletonList />
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item._id}
            contentContainerStyle={[
              styles.messagesList,
              messages.length === 0 && styles.messagesListEmpty,
            ]}
            ListEmptyComponent={renderEmpty}
            showsVerticalScrollIndicator={false}
            // onContentSizeChange removed — redundant with the useEffect scroll above
          />
        )}

        {/* ── Input ────────────────────────────────────────────── */}
        <ChatInput
          onSend={sendMessage}
          disabled={connectionStatus !== "connected"}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.gradientStart,
  },
  flex: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    ...SHADOW.md,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerLogoWrapper: {
    width: 50,
    height: 50,
    borderRadius: RADIUS.full,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.25)",
  },
  headerLogo: {
    width: 45,
    height: 45,
    tintColor: "#ffffff",
  },
  headerTitle: {
    fontSize: FONT.lg,
    fontWeight: WEIGHT.bold,
    color: "#ffffff",
    letterSpacing: 0.3,
  },

  // Logout
  logoutButton: {
    padding: SPACING.xs,
  },

  // Messages list
  messagesList: {
    paddingVertical: SPACING.md,
  },
  messagesListEmpty: {
    flex: 1,
  },

  // Empty state
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: SPACING.md,
    paddingBottom: SPACING.xxxl,
  },
  emptyIconWrapper: {
    width: 80,
    height: 80,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primaryGhost,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: COLORS.accentLight,
  },
  emptyIconText: {
    fontSize: 32,
  },
  emptyTitle: {
    fontSize: FONT.lg,
    fontWeight: WEIGHT.bold,
    color: COLORS.textPrimary,
  },
  emptySubtitle: {
    fontSize: FONT.sm,
    color: COLORS.textMuted,
    fontWeight: WEIGHT.regular,
  },
});
