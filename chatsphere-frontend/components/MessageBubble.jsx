import { View, Text, StyleSheet } from "react-native";
import {
  COLORS,
  FONT,
  WEIGHT,
  RADIUS,
  SPACING,
  SHADOW,
} from "../constants/theme";
import { formatTime } from "../utils/formatTime";

export default function MessageBubble({ message, isOwn }) {
  return (
    <View style={[styles.row, isOwn ? styles.rowOwn : styles.rowOther]}>
      {/* Avatar initial — only for others */}
      {!isOwn && (
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {message.senderName?.charAt(0).toUpperCase()}
          </Text>
        </View>
      )}

      <View
        style={[
          styles.bubbleWrapper,
          isOwn ? styles.wrapperOwn : styles.wrapperOther,
        ]}
      >
        {/* Sender name — only for others */}
        {!isOwn && <Text style={styles.senderName}>{message.senderName}</Text>}

        <View
          style={[styles.bubble, isOwn ? styles.bubbleOwn : styles.bubbleOther]}
        >
          <Text
            style={[
              styles.messageText,
              isOwn ? styles.textOwn : styles.textOther,
            ]}
          >
            {message.text}
          </Text>
        </View>

        <Text
          style={[
            styles.timestamp,
            isOwn ? styles.timestampOwn : styles.timestampOther,
          ]}
        >
          {formatTime(message.createdAt)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    marginVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
    alignItems: "flex-end",
  },
  rowOwn: {
    justifyContent: "flex-end",
  },
  rowOther: {
    justifyContent: "flex-start",
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.accentLight,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.sm,
    marginBottom: 18,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },
  avatarText: {
    fontSize: FONT.sm,
    fontWeight: WEIGHT.bold,
    color: COLORS.primary,
  },
  bubbleWrapper: {
    maxWidth: "75%",
  },
  wrapperOwn: {
    alignItems: "flex-end",
  },
  wrapperOther: {
    alignItems: "flex-start",
  },
  senderName: {
    fontSize: FONT.xs,
    fontWeight: WEIGHT.semibold,
    color: COLORS.primary,
    marginBottom: 3,
    marginLeft: SPACING.xs,
  },
  bubble: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.lg,
  },
  bubbleOwn: {
    backgroundColor: COLORS.bubbleOwn,
    borderBottomRightRadius: RADIUS.xs,
    ...SHADOW.sm,
  },
  bubbleOther: {
    backgroundColor: COLORS.bubbleOther,
    borderBottomLeftRadius: RADIUS.xs,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOW.sm,
  },
  messageText: {
    fontSize: FONT.md,
    lineHeight: 22,
  },
  textOwn: {
    color: COLORS.bubbleOwnText,
    fontWeight: WEIGHT.regular,
  },
  textOther: {
    color: COLORS.bubbleOtherText,
    fontWeight: WEIGHT.regular,
  },
  timestamp: {
    fontSize: FONT.xs,
    marginTop: 3,
    color: COLORS.textMuted,
  },
  timestampOwn: {
    marginRight: SPACING.xs,
  },
  timestampOther: {
    marginLeft: SPACING.xs,
  },
});
