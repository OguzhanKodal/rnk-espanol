import React from "react";
import {
  Text,
  TextProps,
  Pressable,
  View,
  StyleSheet,
  Modal,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { usePalette } from "./store";
import { es } from "../i18n/es";
export function Label({ style, ...props }: TextProps) {
  const p = usePalette();
  return (
    <Text
      maxFontSizeMultiplier={1.5}
      {...props}
      style={[{ color: p.text, fontSize: 16 }, style]}
    />
  );
}
export function Button({
  title,
  onPress,
  active = false,
}: {
  title: string;
  onPress: () => void;
  active?: boolean;
}) {
  const p = usePalette();
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => ({
        paddingHorizontal: 15,
        paddingVertical: 12,
        borderRadius: 12,
        backgroundColor: active ? p.accent : p.paper,
        borderWidth: 1,
        borderColor: p.line,
        opacity: pressed ? 0.65 : 1,
      })}
    >
      <Label
        style={{
          color: active ? "#fff" : p.text,
          fontSize: 14,
          fontWeight: "600",
        }}
      >
        {title}
      </Label>
    </Pressable>
  );
}
export function Sheet({
  title,
  visible,
  onClose,
  children,
}: {
  title: string;
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const p = usePalette(),
    insets = useSafeAreaInsets();
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{
          flex: 1,
          backgroundColor: "#0006",
          justifyContent: "flex-end",
        }}
      >
        <Pressable
          accessibilityLabel={es.close}
          onPress={onClose}
          style={StyleSheet.absoluteFill}
        />
        <View
          style={{
            backgroundColor: p.paper,
            borderTopLeftRadius: 25,
            borderTopRightRadius: 25,
            padding: 24,
            paddingBottom: Math.max(24, insets.bottom),
            maxHeight: "78%",
          }}
        >
          <View
            style={{
              width: 36,
              height: 4,
              borderRadius: 3,
              backgroundColor: p.line,
              alignSelf: "center",
              marginBottom: 20,
            }}
          />
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 18,
            }}
          >
            <Label style={{ fontSize: 23, fontWeight: "600", flex: 1 }}>
              {title}
            </Label>
            <Button title="×" onPress={onClose} />
          </View>
          <ScrollView keyboardShouldPersistTaps="handled">
            {children}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
export const styles = StyleSheet.create({
  pad: { padding: 22, paddingBottom: 60 },
  row: { flexDirection: "row", alignItems: "center", gap: 10 },
  card: { padding: 20, borderRadius: 18, marginBottom: 12 },
  eyebrow: { fontSize: 11, letterSpacing: 2, fontWeight: "700" },
  title: {
    fontSize: 30,
    fontFamily: "EBGaramond_600SemiBold",
    marginBottom: 8,
  },
  muted: { fontSize: 14 },
  divider: { height: 1, marginVertical: 20 },
});
