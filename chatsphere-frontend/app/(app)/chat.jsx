import { useEffect, useRef } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { LogOut, Users } from "lucide-react-native";
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

export default function ChatScreen() {
  const flatListRef = useRef(null);
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);
  const { messages, isLoading, connectionStatus, sendMessage, currentUserId } =
    useChat();

  // Auto scroll to bottom on new message
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
        <Users size={40} color={COLORS.accentLight} />
      </View>
      <Text style={styles.emptyTitle}>No messages yet</Text>
      <Text style={styles.emptySubtitle}>Be the first to say something!</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
      >
        {/* Header */}
        <LinearGradient
          colors={[COLORS.gradientStart, COLORS.gradientMid]}
          style={styles.header}
        >
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
              <View style={styles.statusRow}>
                <View
                  style={[
                    styles.statusDot,
                    connectionStatus === "connected"
                      ? styles.statusDotOnline
                      : styles.statusDotOffline,
                  ]}
                />
                <Text style={styles.statusText}>
                  {connectionStatus === "connected"
                    ? `@${user?.username}`
                    : "Connecting..."}
                </Text>
              </View>
            </View>
          </View>

          <TouchableOpacity
            onPress={handleLogout}
            style={styles.logoutButton}
            activeOpacity={0.7}
          >
            <LogOut size={20} color="#fff" />
          </TouchableOpacity>
        </LinearGradient>

        {/* Connection banner */}
        <ConnectionBanner status={connectionStatus} />

        {/* Messages */}
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Loading messages...</Text>
          </View>
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
            onContentSizeChange={() =>
              flatListRef.current?.scrollToEnd({ animated: false })
            }
          />
        )}

        {/* Input */}
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
    gap: SPACING.sm,
  },
  headerLogoWrapper: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.full,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.3)",
  },
  headerLogo: {
    width: 24,
    height: 24,
    tintColor: "#ffffff",
  },
  headerTitle: {
    fontSize: FONT.lg,
    fontWeight: WEIGHT.bold,
    color: "#ffffff",
    letterSpacing: 0.3,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
    marginTop: 1,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: RADIUS.full,
  },
  statusDotOnline: {
    backgroundColor: COLORS.success,
  },
  statusDotOffline: {
    backgroundColor: COLORS.warning,
  },
  statusText: {
    fontSize: FONT.xs,
    color: "rgba(255,255,255,0.8)",
    fontWeight: WEIGHT.medium,
  },
  logoutButton: {
    width: 38,
    height: 38,
    borderRadius: RADIUS.full,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: SPACING.md,
  },
  loadingText: {
    fontSize: FONT.md,
    color: COLORS.textSecondary,
    fontWeight: WEIGHT.medium,
  },
  messagesList: {
    paddingVertical: SPACING.md,
  },
  messagesListEmpty: {
    flex: 1,
  },
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
