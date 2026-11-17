import { router } from "expo-router";

import { dateInZone } from "./prayer-date";
import React, { useEffect, useMemo, useState } from "react";
import { View, Pressable } from "react-native";
import { Coordinates, CalculationMethod, PrayerTimes } from "adhan";
import { useStore, usePalette } from "./store";
import { Label, styles } from "./common";
import { es } from "../i18n/es";
export const cities = [
  { name: es.cities[0], lat: 40.4168, lon: -3.7038, tz: "Europe/Madrid" },
  { name: es.cities[1], lat: 41.3874, lon: 2.1686, tz: "Europe/Madrid" },
  {
    name: es.cities[2],
    lat: 19.4326,
    lon: -99.1332,
    tz: "America/Mexico_City",
  },
  { name: es.cities[3], lat: 4.711, lon: -74.0721, tz: "America/Bogota" },
  {
    name: es.cities[4],
    lat: -34.6037,
    lon: -58.3816,
    tz: "America/Argentina/Buenos_Aires",
  },
  { name: es.cities[5], lat: -12.0464, lon: -77.0428, tz: "America/Lima" },
  { name: es.cities[6], lat: -33.4489, lon: -70.6693, tz: "America/Santiago" },
  { name: es.cities[7], lat: 10.4806, lon: -66.9036, tz: "America/Caracas" },
  { name: es.cities[8], lat: 40.7128, lon: -74.006, tz: "America/New_York" },
  { name: es.cities[9], lat: 41.0082, lon: 28.9784, tz: "Europe/Istanbul" },
];
export function usePrayer() {
  const { settings } = useStore(),
    [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  const legacy = cities[settings.city] ?? cities[0];
  const city = settings.location
      ? {
          name: settings.location.name + ", " + settings.location.country,
          lat: settings.location.lat,
          lon: settings.location.lng,
          tz: settings.location.timeZone,
        }
      : {
          ...legacy,
          name:
            legacy.name +
            ", " +
            ([
              "España",
              "España",
              "México",
              "Colombia",
              "Argentina",
              "Perú",
              "Chile",
              "Venezuela",
              "Estados Unidos",
              "Turquía",
            ][settings.city] ?? "España"),
        },
    tz = settings.coords
      ? Intl.DateTimeFormat().resolvedOptions().timeZone
      : city.tz;
  const localDate = dateInZone(now, tz);
  const day = localDate.getTime();
  const lat = settings.coords?.latitude ?? city.lat;
  const lon = settings.coords?.longitude ?? city.lon;
  const { values, tomorrowFajr } = useMemo(() => {
    const method = [
      CalculationMethod.MuslimWorldLeague,
      CalculationMethod.NorthAmerica,
      CalculationMethod.UmmAlQura,
    ][settings.method]();
    const coord = new Coordinates(lat, lon);
    const times = new PrayerTimes(coord, new Date(day), method);
    const tomorrow = new Date(day);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return {
      values: [
        times.fajr, times.sunrise, times.dhuhr, times.asr, times.maghrib, times.isha,
      ],
      tomorrowFajr: new PrayerTimes(coord, tomorrow, method).fajr,
    };
  }, [day, lat, lon, settings.method]);
  let next = values.findIndex((d, i) => i !== 1 && d > now);
  let target = values[next];
  if (next < 0) {
    next = 0;
    target = tomorrowFajr;
  }
  const seconds = Math.max(
    0,
    Math.floor((target.getTime() - now.getTime()) / 1000),
  );
  const countdown = [
    Math.floor(seconds / 3600),
    Math.floor((seconds % 3600) / 60),
    seconds % 60,
  ]
    .map((n) => String(n).padStart(2, "0"))
    .join(":");
  const formatter = useMemo(
    () => new Intl.DateTimeFormat("es", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: tz,
    }),
    [tz],
  );
  const format = (d: Date) => formatter.format(d);
  return {
    city: settings.coords ? es.local : city.name,
    values,
    next,
    countdown,
    format,
    now,
  };
}
export function PrayerCard() {
  const data = usePrayer(),
    p = usePalette();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Ver horarios de oración"
      onPress={() => router.push("/oracion")}
      style={{
        shadowColor: "#301020",
        shadowOpacity: 0.06,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
        backgroundColor: p.paper,
        borderRadius: 20,
        padding: 22,
        borderWidth: 1,
        borderColor: p.line,
      }}
    >
      <Label style={[styles.eyebrow, { color: p.muted }]}>
        {es.next} · {data.city}
      </Label>
      <View
        style={[
          styles.row,
          { justifyContent: "space-between", marginVertical: 15 },
        ]}
      >
        <Label style={{ fontWeight: "600", fontSize: 32 }}>
          {es.prayerNames[data.next]}
        </Label>
        <Label
          style={{
            fontSize: 26,
            color: p.accent,
            fontVariant: ["tabular-nums"],
          }}
        >
          {data.countdown}
        </Label>
      </View>
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        {data.values.map((d, i) =>
          i === 1 ? null : (
            <View key={i}>
              <Label style={{ fontSize: 11, color: p.muted }}>
                {es.prayerNames[i]}
              </Label>
              <Label style={{ fontSize: 13, marginTop: 5 }}>
                {data.format(d)}
              </Label>
            </View>
          ),
        )}
      </View>
    </Pressable>
  );
}
