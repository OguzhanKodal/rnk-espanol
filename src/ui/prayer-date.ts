// Never parse locale-formatted strings: Hermes and V8 accept different date formats.
export function dateInZone(now: Date, timeZone: string): Date {
  const parts = new Intl.DateTimeFormat("en", {
    timeZone,
    year: "numeric",
    month: "numeric",
    day: "numeric",
  }).formatToParts(now);
  const part = (type: string) =>
    Number(parts.find((p) => p.type === type)?.value);
  return new Date(part("year"), part("month") - 1, part("day"));
}
