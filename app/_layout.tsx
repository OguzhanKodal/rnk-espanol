import { StatusBar } from "expo-status-bar";
import { router, Href } from "expo-router";
import { getLinkingURL } from "expo-linking";
import React from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import { brandRed } from "../src/ui/tokens";
import {
  View,
  ActivityIndicator,
  Linking,
  Platform,
  Pressable,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Drawer, DrawerContentScrollView } from "expo-router/drawer";
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
import { UnifrakturMaguntia_400Regular } from "@expo-google-fonts/unifrakturmaguntia";
import { PlayfairDisplay_700Bold } from "@expo-google-fonts/playfair-display";
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
    <>
      <StatusBar style={p.dark ? "light" : "dark"} />
      <Drawer
        drawerContent={(props) => (
          <DrawerContentScrollView {...props}>
            <View style={{ padding: 24, paddingTop: 20, paddingBottom: 28 }}>
              <View
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 16,
                  backgroundColor: brandRed,
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 16,
                }}
              >
                <Ionicons
                  accessible={false}
                  accessibilityElementsHidden
                  importantForAccessibility="no-hide-descendants"
                  name="book-outline"
                  size={28}
                  color={"#FFFFFF"}
                />
              </View>
              <Label style={{ fontSize: 26, fontWeight: "700" }}>
                {es.brand}
              </Label>
              <Label style={{ fontSize: 15, color: p.muted, marginTop: 5 }}>
                Español
              </Label>
            </View>
            {[
              {
                title: "Lectura",
                items: [
                  { name: "index", title: es.library, icon: "library-outline" },
                  {
                    name: "marcadores",
                    title: es.marks,
                    icon: "bookmark-outline",
                  },
                  {
                    name: "frases",
                    title: es.quotes,
                    icon: "chatbox-ellipses-outline",
                  },
                ],
              },
              {
                title: "Herramientas",
                items: [
                  { name: "oracion", title: es.prayers, icon: "time-outline" },
                ],
              },
              {
                title: "Aplicación",
                items: [
                  {
                    name: "ajustes",
                    title: es.settings,
                    icon: "settings-outline",
                  },
                  {
                    name: "acerca",
                    title: es.about,
                    icon: "information-circle-outline",
                  },
                ],
              },
            ].map((group) => (
              <View
                key={group.title}
                style={{ marginHorizontal: 12, marginBottom: 20 }}
              >
                <Label
                  style={{
                    color: p.muted,
                    fontSize: 13,
                    marginLeft: 14,
                    marginBottom: 8,
                  }}
                >
                  {group.title}
                </Label>
                {group.items.map((item) => {
                  const selected =
                    props.state.routes[props.state.index].name === item.name;
                  return (
                    <Pressable
                      key={item.name}
                      onPress={() => {
                        props.navigation.navigate(item.name);
                        props.navigation.closeDrawer();
                      }}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 14,
                        padding: 14,
                        borderRadius: 14,
                        backgroundColor: selected ? p.line : "transparent",
                        marginBottom: 2,
                      }}
                    >
                      <Ionicons
                        accessible={false}
                        accessibilityElementsHidden
                        importantForAccessibility="no-hide-descendants"
                        name={
                          item.icon as React.ComponentProps<
                            typeof Ionicons
                          >["name"]
                        }
                        color={selected ? p.accent : p.muted}
                        size={23}
                      />
                      <Label
                        style={{
                          fontWeight: selected ? "600" : "400",
                          color: selected ? p.accent : p.text,
                        }}
                      >
                        {item.title}
                      </Label>
                    </Pressable>
                  );
                })}
              </View>
            ))}
          </DrawerContentScrollView>
        )}
        screenOptions={{
          headerStyle: { backgroundColor: p.bg },
          headerTintColor: p.text,
          headerShadowVisible: false,
          headerTitleStyle: { fontSize: 28, fontWeight: "700" },
          drawerStyle: { backgroundColor: p.bg, width: 310 },
          drawerActiveTintColor: p.accent,
          drawerInactiveTintColor: p.text,
          drawerActiveBackgroundColor: p.line,
          sceneStyle: { backgroundColor: p.bg },
        }}
      >
        <Drawer.Screen name="index" options={{ title: es.library }} />
        <Drawer.Screen name="frases" options={{ title: es.quotes }} />
        <Drawer.Screen name="marcadores" options={{ title: es.marks }} />
        <Drawer.Screen
          name="oracion"
          options={{
            title: es.prayers,
            headerTitleStyle: { fontSize: 20, fontWeight: "600" },
          }}
        />
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
    </>
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
    UnifrakturMaguntia_400Regular,
    PlayfairDisplay_700Bold,
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
