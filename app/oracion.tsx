import React from "react";
import { ScrollView, View, Alert } from "react-native";
import * as Location from "expo-location";
import { usePalette, useStore } from "../src/ui/store";
import { Label, Button, styles } from "../src/ui/common";
import { PrayerCard, cities, usePrayer } from "../src/ui/prayer";
import { es } from "../src/i18n/es";
export default function Prayer() {
  const p = usePalette(),
    { settings, update } = useStore(),
    data = usePrayer();
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
    } catch {
      Alert.alert(es.locationDenied);
    }
  }
  return (
    <ScrollView
      style={{ backgroundColor: p.bg }}
      contentContainerStyle={styles.pad}
    >
      <Label style={[styles.eyebrow, { color: p.muted, marginBottom: 18 }]}>
        {es.prayerIntro.toUpperCase()}
      </Label>
      <PrayerCard />
      <View style={{ marginTop: 20 }}>
        {data.values.map((d, i) => (
          <View
            key={i}
            style={[
              styles.row,
              {
                justifyContent: "space-between",
                padding: 17,
                borderBottomWidth: 1,
                borderColor: p.line,
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
      <Label style={{ color: p.muted, fontSize: 12, marginVertical: 20 }}>
        {es.calculated}
      </Label>
      <Button title={es.location} onPress={() => void locate()} />
      <Label style={{ fontWeight: "600", marginTop: 25, marginBottom: 12 }}>
        {es.city}
      </Label>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {cities.map((c, i) => (
          <Button
            key={c.name}
            title={c.name}
            active={!settings.coords && settings.city === i}
            onPress={() => update({ city: i, coords: undefined })}
          />
        ))}
      </View>
      <Label style={{ fontWeight: "600", marginTop: 25, marginBottom: 12 }}>
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
    </ScrollView>
  );
}
