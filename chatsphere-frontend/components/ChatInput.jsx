import { useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import { Send } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  COLORS,
  FONT,
  RADIUS,
  SPACING,
  SHADOW,
  WEIGHT,
} from "../constants/theme";

export default function ChatInput({ onSend, disabled }) {
  const [text, setText] = useState("");

  const handleSend = () => {
    if (!text.trim() || disabled) return;
    onSend(text.trim());
    setText("");
  };

  const canSend = text.trim().length > 0 && !disabled;

  return (
    <View style={styles.container}>
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          placeholderTextColor={COLORS.textMuted}
          value={text}
          onChangeText={setText}
          multiline
          maxLength={1000}
          returnKeyType="default"
          editable={!disabled}
        />
        <TouchableOpacity
          onPress={handleSend}
          disabled={!canSend}
          activeOpacity={0.8}
          style={styles.sendWrapper}
        >
          <LinearGradient
            colors={
              canSend
                ? [COLORS.primaryDark, COLORS.primaryLight]
                : [COLORS.border, COLORS.border]
            }
            style={styles.sendButton}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Send size={18} color={canSend ? "#fff" : COLORS.textMuted} />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    paddingBottom: Platform.OS === "ios" ? SPACING.lg : SPACING.sm,
    ...SHADOW.sm,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    backgroundColor: COLORS.inputBg,
    borderRadius: RADIUS.xl,
    borderWidth: 1.5,
    borderColor: COLORS.inputBorder,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    gap: SPACING.sm,
  },
  input: {
    flex: 1,
    fontSize: FONT.md,
    color: COLORS.textPrimary,
    maxHeight: 100,
    paddingVertical: SPACING.sm,
    fontWeight: WEIGHT.regular,
  },
  sendWrapper: {
    marginBottom: Platform.OS === "ios" ? 2 : 4,
  },
  sendButton: {
    width: 38,
    height: 38,
    borderRadius: RADIUS.full,
    justifyContent: "center",
    alignItems: "center",
  },
});
