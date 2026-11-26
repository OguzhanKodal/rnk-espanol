import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { loadQuran, PAGE_COUNT, QURAN_ID } from "../src/content/quran";
import { dateInZone } from "../src/ui/prayer-date";
import { Coordinates, CalculationMethod, PrayerTimes } from "adhan";
// Metro gives static images numeric IDs. Node needs a loader for the same requires.
const require = createRequire(import.meta.url);
for (const extension of [".png", ".jpg", ".jpeg"]) {
  require.extensions[extension] = (module) => { module.exports = 1; };
}
const { bookImage, getBook, catalog, hasBook } = await import("../src/content/load");
const midnight = new Date("2026-11-18T00:30:00Z");
assert.equal(dateInZone(midnight, "America/Mexico_City").getDate(), 17);
assert.equal(dateInZone(midnight, "Europe/Istanbul").getDate(), 18);
for (const [lat, lon, tz] of [
  [40.4168, -3.7038, "Europe/Madrid"],
  [19.4326, -99.1332, "America/Mexico_City"],
  [-34.6037, -58.3816, "America/Argentina/Buenos_Aires"],
  [-33.4489, -70.6693, "America/Santiago"],
  [41.0082, 28.9784, "Europe/Istanbul"],
]) {
  for (const date of ["2026-11-17T23:59:00Z", "2026-06-21T00:01:00Z"]) {
    const d = dateInZone(new Date(date), tz);
    const t = new PrayerTimes(
      new Coordinates(lat, lon),
      d,
      CalculationMethod.MuslimWorldLeague(),
    );
    const values = [t.fajr, t.sunrise, t.dhuhr, t.asr, t.maghrib, t.isha].map(
      (x) => x.getTime(),
    );
    assert.ok(values.every(Number.isFinite));
    assert.deepEqual(
      [...values].sort((a, b) => a - b),
      values,
    );
  }
}
for (const c of catalog.books.filter((b) => b.available)) {
  if (c.id === QURAN_ID) {
    assert.equal(loadQuran().pages.length, PAGE_COUNT);
    continue;
  }
  assert.ok(hasBook(c.id));
  const book = getBook(c.id);
  if (book.kind === "pages") {
    assert.ok(book.pages.length > 0);
    book.pages.forEach((page, index) => {
      assert.equal(page.id, `page-${index + 1}`);
      assert.ok(bookImage(book.id, page.image));
      assert.ok(page.imageSize.every((size) => size > 0));
    });
  }
  const ids = book.sections.flatMap((s) => s.blocks.map((b) => b.id));
  assert.equal(ids.length, new Set(ids).size);
}
const sample = getBook("muestra");
const all = JSON.stringify(sample);
assert.ok(all.includes("مِنْ حَيْثُ لَا يَحْتَسِبُ"));
assert.ok(all.includes("لَٓا اِلٰهَ اِلَّٓا اَنْتَ"));
console.log(
  "Reader checks passed: zoned dates, prayer ordering, stable block IDs, Arabic fixture.",
);
