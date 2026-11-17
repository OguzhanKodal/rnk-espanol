import assert from "node:assert/strict";
import { countries } from "../src/data/locations";
import { dateInZone } from "../src/ui/prayer-date";
import { Coordinates, CalculationMethod, PrayerTimes } from "adhan";
assert.equal(countries.length, 27);
assert.equal(new Set(countries.map((c) => c.name)).size, 27);
let count = 0;
for (const country of countries) {
  assert.ok(
    country.cities.length >= 4 && country.cities.length <= 12,
    country.name,
  );
  for (const city of country.cities) {
    count++;
    assert.ok(Math.abs(city.lat) <= 90 && Math.abs(city.lng) <= 180, city.name);
    for (const date of ["2026-11-18T00:30:00Z", "2026-06-21T23:30:00Z"]) {
      const now = new Date(date);
      const local = dateInZone(now, city.timeZone);
      const times = new PrayerTimes(
        new Coordinates(city.lat, city.lng),
        local,
        CalculationMethod.MuslimWorldLeague(),
      );
      const values = [
        times.fajr,
        times.sunrise,
        times.dhuhr,
        times.asr,
        times.maghrib,
        times.isha,
      ].map((x) => x.getTime());
      assert.ok(values.every(Number.isFinite), country.name + "/" + city.name);
      assert.deepEqual(
        [...values].sort((a, b) => a - b),
        values,
        city.name,
      );
      const format = new Intl.DateTimeFormat("es", {
        timeZone: city.timeZone,
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
      assert.ok(format.format(times.fajr).length >= 4);
    }
  }
}
console.log(
  "PASS: 27 countries, " +
    count +
    " cities; valid IANA zones, winter/summer prayer ordering and formatting.",
);
