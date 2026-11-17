import { router, Href } from "expo-router";
import { getLinkingURL } from "expo-linking";
import React from "react";
import { View, ActivityIndicator, Linking, Platform } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import {
  Drawer,
  DrawerContentScrollView,
  DrawerItemList,
} from "expo-router/drawer";
import { useFonts } from "expo-font";
import { Amiri_400Regular } from "@expo-google-fonts/amiri";
import {
  EBGaramond_400Regular,
  EBGaramond_600SemiBold,
  EBGaramond_700Bold,
  EBGaramond_400Regular_Italic,
  EBGaramond_700Bold_Italic,
} from "@expo-google-fonts/eb-garamond";
import {
  LibreBaskerville_400Regular,
  LibreBaskerville_700Bold,
  LibreBaskerville_400Regular_Italic,
  LibreBaskerville_700Bold_Italic,
} from "@expo-google-fonts/libre-baskerville";
import { Store, usePalette, useStore } from "../src/ui/store";
import { Label } from "../src/ui/common";
import { es } from "../src/i18n/es";
function Navigation() {
  const p = usePalette(),
    { ready } = useStore();
  React.useEffect(() => {
    if (!ready || Platform.OS !== "ios" || getLinkingURL()) return;
    // Expo Go SDK 58 can return null from getLinkingURL even though RN has the launch URL.
    const timer = setTimeout(() => {
      void Linking.getInitialURL().then((url) => {
        const path = url?.split("/--/")[1];
        if (path) router.replace(("/" + path) as Href);
      });
    }, 100);
    return () => clearTimeout(timer);
  }, [ready]);
  if (!ready) return <ActivityIndicator style={{ flex: 1 }} />;
  return (
    <Drawer
      drawerContent={(props) => (
        <DrawerContentScrollView {...props}>
          <View style={{ padding: 25, paddingTop: 25, paddingBottom: 35 }}>
            <Label
              style={{
                fontSize: 32,
                color: p.accent,
                fontFamily: "EBGaramond_600SemiBold",
              }}
            >
              {es.brand}
            </Label>
            <Label style={{ fontSize: 12, letterSpacing: 3, marginTop: 6 }}>
              {es.language}
            </Label>
            <Label style={{ fontSize: 13, color: p.muted, marginTop: 18 }}>
              {es.free}
            </Label>
          </View>
          <DrawerItemList {...props} />
        </DrawerContentScrollView>
      )}
      screenOptions={{
        headerStyle: { backgroundColor: p.bg },
        headerTintColor: p.text,
        headerShadowVisible: false,
        headerTitleStyle: { fontSize: 20 },
        drawerStyle: { backgroundColor: p.bg, width: 310 },
        drawerActiveTintColor: p.accent,
        drawerInactiveTintColor: p.text,
        drawerActiveBackgroundColor: p.line,
        sceneStyle: { backgroundColor: p.bg },
      }}
    >
      <Drawer.Screen name="index" options={{ title: es.library }} />
      <Drawer.Screen name="glosario" options={{ title: es.glossary }} />
      <Drawer.Screen name="frases" options={{ title: es.quotes }} />
      <Drawer.Screen name="marcadores" options={{ title: es.marks }} />
      <Drawer.Screen name="oracion" options={{ title: es.prayers }} />
      <Drawer.Screen name="ajustes" options={{ title: es.settings }} />
      <Drawer.Screen name="acerca" options={{ title: es.about }} />
      <Drawer.Screen
        name="reader"
        options={{
          headerShown: false,
          drawerItemStyle: { display: "none" },
          swipeEnabled: false,
        }}
      />
    </Drawer>
  );
}
export default function Layout() {
  const [loaded, error] = useFonts({
    Amiri_400Regular,
    EBGaramond_400Regular,
    EBGaramond_600SemiBold,
    EBGaramond_700Bold,
    EBGaramond_400Regular_Italic,
    EBGaramond_700Bold_Italic,
    LibreBaskerville_400Regular,
    LibreBaskerville_700Bold,
    LibreBaskerville_400Regular_Italic,
    LibreBaskerville_700Bold_Italic,
  });
  if (!loaded && !error) return <ActivityIndicator style={{ flex: 1 }} />;
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Store>
        <Navigation />
      </Store>
    </GestureHandlerRootView>
  );
}
