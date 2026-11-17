import React, { useEffect, useState } from "react";
import { ScrollView, View, Alert, Pressable, TextInput } from "react-native";
import { useLocalSearchParams } from "expo-router";
import * as Location from "expo-location";
import Ionicons from "@expo/vector-icons/Ionicons";
import { countries } from "../src/data/locations";
import { normalize } from "../src/content/load";
import { usePalette, useStore } from "../src/ui/store";
import { Label, Button, Sheet, styles } from "../src/ui/common";
import { PrayerCard, usePrayer } from "../src/ui/prayer";
import { es } from "../src/i18n/es";
export default function Prayer() {
  const p = usePalette(),
    { settings, update } = useStore(),
    data = usePrayer();
  const [picker, setPicker] = useState(false),
    [country, setCountry] = useState<number>(),
    [query, setQuery] = useState("");
  const params = useLocalSearchParams();
  useEffect(() => {
    if (__DEV__ && ["countries", "cities"].includes(String(params.dev))) {
      const timer = setTimeout(() => {
        setPicker(true);
        setCountry(params.dev === "cities" ? 0 : undefined);
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [params.dev]);
  async function locate() {
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== "granted") throw Error();
      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      update({
        coords: {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        },
      });
      setPicker(false);
    } catch {
      Alert.alert(es.locationDenied);
    }
  }
  const rowStyle = {
    padding: 17,
    borderRadius: 15,
    backgroundColor: p.paper,
    marginBottom: 6,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 12,
  };
  return (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      style={{ backgroundColor: p.bg }}
      contentContainerStyle={styles.pad}
    >
      <Pressable
        accessibilityRole="button"
        onPress={() => {
          setCountry(undefined);
          setQuery("");
          setPicker(true);
        }}
        style={rowStyle}
      >
        <Ionicons name="location-outline" color={p.accent} size={23} />
        <View style={{ flex: 1 }}>
          <Label style={{ fontSize: 14, color: p.muted }}>Ubicación</Label>
          <Label style={{ fontWeight: "600", marginTop: 4 }}>{data.city}</Label>
        </View>
        <Ionicons name="chevron-forward" size={18} color={p.muted} />
      </Pressable>
      <View style={{ marginTop: 14 }}>
        <PrayerCard />
      </View>
      <View
        style={{
          marginTop: 20,
          borderRadius: 20,
          overflow: "hidden",
          backgroundColor: p.paper,
        }}
      >
        {data.values.map((d, i) => (
          <View
            key={i}
            style={[
              rowStyle,
              {
                marginBottom: 0,
                borderRadius: 0,
                borderBottomWidth: i === 5 ? 0 : 0.5,
                borderColor: p.line,
                justifyContent: "space-between",
              },
            ]}
          >
            <Label
              style={{
                color: i === data.next ? p.accent : p.text,
                fontWeight: i === data.next ? "700" : "400",
              }}
            >
              {es.prayerNames[i]}
            </Label>
            <Label style={{ fontVariant: ["tabular-nums"] }}>
              {data.format(d)}
            </Label>
          </View>
        ))}
      </View>
      <Label style={{ color: p.muted, fontSize: 14, marginVertical: 16 }}>
        {es.calculated}
      </Label>
      <Label
        style={{
          fontWeight: "600",
          fontSize: 18,
          marginTop: 12,
          marginBottom: 12,
        }}
      >
        {es.method}
      </Label>
      <View style={{ gap: 8 }}>
        {es.methods.map((m, i) => (
          <Button
            key={m}
            title={m}
            active={settings.method === i}
            onPress={() => update({ method: i })}
          />
        ))}
      </View>
      <Sheet
        title={
          country === undefined ? "Seleccionar país" : countries[country].name
        }
        visible={picker}
        onClose={() => setPicker(false)}
      >
        {country !== undefined && (
          <Pressable
            onPress={() => {
              setCountry(undefined);
              setQuery("");
            }}
            style={{ paddingBottom: 16 }}
          >
            <Label style={{ color: p.accent }}>‹ Todos los países</Label>
          </Pressable>
        )}
        <TextInput
          accessibilityLabel={
            country === undefined ? "Buscar país" : "Buscar ciudad"
          }
          placeholder={country === undefined ? "Buscar país" : "Buscar ciudad"}
          placeholderTextColor={p.muted}
          value={query}
          onChangeText={setQuery}
          style={{
            backgroundColor: p.bg,
            color: p.text,
            padding: 15,
            borderRadius: 13,
            fontSize: 16,
            marginBottom: 12,
          }}
        />
        {country === undefined && (
          <Pressable onPress={() => void locate()} style={rowStyle}>
            <Ionicons name="navigate-outline" size={22} color={p.accent} />
            <Label style={{ color: p.accent }}>Usar mi ubicación</Label>
          </Pressable>
        )}
        {(country === undefined ? countries : countries[country].cities)
          .map((item, i) => ({ item, i }))
          .filter(({ item }) => normalize(item.name).includes(normalize(query)))
          .map(({ item, i }) => (
            <Pressable
              key={item.name}
              style={[
                rowStyle,
                { borderBottomWidth: 0.5, borderColor: p.line },
              ]}
              onPress={() => {
                if (country === undefined) {
                  setCountry(i);
                  setQuery("");
                } else {
                  update({
                    location: {
                      ...countries[country].cities[i],
                      country: countries[country].name,
                    },
                    coords: undefined,
                  });
                  setPicker(false);
                }
              }}
            >
              <Label style={{ flex: 1 }}>{item.name}</Label>
              <Ionicons name="chevron-forward" color={p.muted} size={16} />
            </Pressable>
          ))}
        {(country === undefined ? countries : countries[country].cities).filter(
          (item) => normalize(item.name).includes(normalize(query)),
        ).length === 0 && (
          <Label style={{ padding: 16, color: p.muted }}>{es.noResults}</Label>
        )}
      </Sheet>
    </ScrollView>
  );
}
