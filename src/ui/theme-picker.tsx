import React from "react";
import {
  Modal,
  View,
  Pressable,
  Text,
  ScrollView,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { palettes, usePalette, useStore } from "./store";
import { Label } from "./common";
import { es } from "../i18n/es";
export function ThemePicker({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const p = usePalette(),
    { settings, update } = useStore(),
    inset = useSafeAreaInsets(),
    { height } = useWindowDimensions();
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: "#0007",
          justifyContent: "flex-end",
        }}
      >
        <Pressable
          accessibilityLabel={es.close}
          onPress={onClose}
          style={{ position: "absolute", inset: 0 }}
        />
        <View
          style={{
            backgroundColor: p.paper,
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            padding: 20,
            paddingBottom: Math.max(inset.bottom, 20),
            maxHeight: height * 0.94,
          }}
        >
          <View
            style={{
              width: 38,
              height: 4,
              borderRadius: 4,
              backgroundColor: p.muted,
              opacity: 0.45,
              alignSelf: "center",
              marginBottom: 16,
            }}
          />
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <Ionicons name="color-palette-outline" size={25} color={p.text} />
            <Label style={{ fontSize: 26, fontWeight: "600", flex: 1 }}>
              {es.theme}
            </Label>
            <Pressable
              accessibilityLabel={es.close}
              onPress={onClose}
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: p.line,
              }}
            >
              <Ionicons name="close" size={24} color={p.text} />
            </Pressable>
          </View>
          <Label
            style={{
              fontSize: 14,
              color: p.muted,
              marginTop: 8,
              marginBottom: 18,
            }}
          >
            {es.themeHint}
          </Label>
          <ScrollView style={{ borderRadius: 21 }} bounces={false}>
            {palettes.map((t, i) => (
              <Pressable
                key={i}
                accessibilityRole="radio"
                accessibilityState={{ checked: settings.theme === i }}
                onPress={() => update({ theme: i })}
                style={{
                  backgroundColor: t.bg,
                  alignItems: "center",
                  paddingVertical: 12,
                }}
              >
                <Text
                  style={{
                    fontFamily: "EBGaramond_400Regular",
                    fontSize: 24,
                    color: t.text,
                  }}
                >
                  {es.themes[i]}
                </Text>
                <Text
                  style={{
                    fontFamily: "EBGaramond_400Regular_Italic",
                    fontSize: 17,
                    color: t.text,
                  }}
                >
                  {es.sampleBefore}
                  <Text style={{ color: t.arabic }}>{es.sampleText}</Text>
                  {es.sampleMiddle}
                  <Text style={{ color: t.accent }}>{es.sampleEnd}</Text>.
                </Text>
                {settings.theme === i && (
                  <Ionicons name="checkmark-circle" size={24} color={t.accent} style={{ position: "absolute", right: 18, top: 24 }} />
                )}
              </Pressable>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
