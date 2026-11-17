import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { getBook } from "../content/load";
import { wordBounds } from "./selection-range";
import type { SavedLocation } from "../data/locations";
import * as SQLite from "expo-sqlite";
import { Alert } from "react-native";
import { es } from "../i18n/es";
export type Mark = {
  id: string;
  kind: "bookmark" | "highlight" | "note";
  bookId: string;
  blockId: string;
  start: number;
  end: number;
  color: string;
  bold: boolean;
  italic: boolean;
  text: string;
  note?: string;
  page: number;
};
export type Settings = {
  theme: number;
  themeVersion?: number;
  fontSize: number;
  font: number;
  city: number;
  method: number;
  location?: SavedLocation;
  coords?: { latitude: number; longitude: number };
};
export type Progress = { blockId: string; page: number };
const defaults: Settings = {
  theme: 2,
  themeVersion: 2,
  fontSize: 23,
  font: 0,
  city: 0,
  method: 0,
};
let database: Promise<SQLite.SQLiteDatabase>;
const db = () => (database ??= SQLite.openDatabaseAsync("risale-reader.db"));
let queue = Promise.resolve();
function write(key: string, value: unknown) {
  queue = queue
    .then(async () => {
      const d = await db();
      await d.withTransactionAsync(async () => {
        await d.runAsync(
          "INSERT OR REPLACE INTO state (key,value) VALUES (?,?)",
          key,
          JSON.stringify(value),
        );
      });
    })
    .catch(() => Alert.alert(es.error));
  return queue;
}
const PaletteContext = createContext<(typeof palettes)[number] | null>(null);
const Context = createContext<{
  ready: boolean;
  settings: Settings;
  update: (s: Partial<Settings>) => void;
  marks: Mark[];
  putMark: (m: Mark) => void;
  deleteMark: (id: string) => void;
  progress: Record<string, Progress>;
  saveProgress: (id: string, p: Progress) => void;
}>({} as never);
export function Store({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false),
    [settings, setSettings] = useState(defaults),
    [marks, setMarks] = useState<Mark[]>([]),
    [progress, setProgress] = useState<Record<string, Progress>>({});
  useEffect(() => {
    (async () => {
      const d = await db();
      await d.execAsync(
        "CREATE TABLE IF NOT EXISTS state (key TEXT PRIMARY KEY, value TEXT NOT NULL)",
      );
      const rows = await d.getAllAsync<{ key: string; value: string }>(
        "SELECT * FROM state",
      );
      for (const r of rows) {
        const v = JSON.parse(r.value);
        if (r.key === "settings") {
          const migrated = {
            ...defaults,
            ...v,
            theme:
              v.themeVersion === 2
                ? Math.max(0, Math.min(6, v.theme ?? 2))
                : [1, 2, 3][v.theme ?? 1],
            themeVersion: 2,
          };
          setSettings(migrated);
          if (v.themeVersion !== 2) void write("settings", migrated);
        }
        if (r.key === "marks") {
          const repaired = (v as Mark[]).map((m) => {
            const book = getBook(m.bookId);
            if (book.id !== m.bookId) return m;
            const block = book.sections
              .flatMap((s) => s.blocks)
              .find((b) => b.id === m.blockId);
            if (!block) return m;
            const text =
              "spans" in block
                ? block.spans.map((s) => s.text).join("")
                : "text" in block
                  ? block.text
                  : "";
            // Only repair records still matching the source; never replace stale anchors.
            if (!text || text.slice(m.start, m.end) !== m.text) return m;
            const bounds = wordBounds(text, m.start, m.end);
            return {
              ...m,
              ...bounds,
              text: text.slice(bounds.start, bounds.end),
            };
          });
          setMarks(repaired);
          if (JSON.stringify(repaired) !== JSON.stringify(v))
            void write("marks", repaired);
        }
        if (r.key === "progress") setProgress(v);
      }
      setReady(true);
    })().catch(() => Alert.alert(es.error));
  }, []);
  const update = useCallback(
    (s: Partial<Settings>) =>
      setSettings((prev) => {
        const v = { ...prev, ...s };
        void write("settings", v);
        return v;
      }),
    [],
  );
  const putMark = useCallback(
    (m: Mark) =>
      setMarks((prev) => {
        const v = [...prev.filter((x) => x.id !== m.id), m];
        void write("marks", v);
        return v;
      }),
    [],
  );
  const deleteMark = useCallback(
    (id: string) =>
      setMarks((prev) => {
        const v = prev.filter((x) => x.id !== id);
        void write("marks", v);
        return v;
      }),
    [],
  );
  const saveProgress = useCallback(
    (id: string, p: Progress) =>
      setProgress((prev) => {
        if (prev[id]?.blockId === p.blockId) return prev;
        const v = { ...prev, [id]: p };
        void write("progress", v);
        return v;
      }),
    [],
  );
  return (
    <PaletteContext.Provider value={palettes[settings.theme] ?? palettes[2]}>
      <Context.Provider
        value={{
          ready,
          settings,
          update,
          marks,
          putMark,
          deleteMark,
          progress,
          saveProgress,
        }}
      >
        {children}
      </Context.Provider>
    </PaletteContext.Provider>
  );
}
export const useStore = () => useContext(Context);
// bg is also the reader page; paper is the raised chrome/card surface.
const basePalettes = [
  {
    bg: "#EFEFEF",
    paper: "#FAFAFA",
    text: "#292D30",
    muted: "#62676B",
    line: "#D9DCDE",
    accentText: "#FFFFFF",
    arabic: "#B72D48",
    accent: "#006D65",
  },
  {
    bg: "#FFFFFF",
    paper: "#F6F7F8",
    text: "#25282C",
    muted: "#65696F",
    line: "#E0E3E5",
    accentText: "#FFFFFF",
    arabic: "#BC244A",
    accent: "#00665E",
  },
  {
    bg: "#FBF4E3",
    paper: "#F2EAD6",
    text: "#352E26",
    muted: "#746954",
    line: "#DDD1B8",
    accentText: "#FFFFFF",
    arabic: "#B53731",
    accent: "#176653",
  },
  {
    bg: "#181B22",
    paper: "#232832",
    text: "#E2E4E9",
    muted: "#AFB7C5",
    line: "#3B4352",
    accentText: "#181B22",
    arabic: "#E3A1B0",
    accent: "#E9B565",
  },
  {
    bg: "#232539",
    paper: "#2D3048",
    text: "#ECEAF5",
    muted: "#BDBBD2",
    line: "#454963",
    accentText: "#181B22",
    arabic: "#F093C9",
    accent: "#C0A5F7",
  },
  {
    bg: "#11141B",
    paper: "#20252E",
    text: "#E4DFDA",
    muted: "#B6B2B0",
    line: "#383F4B",
    accentText: "#181B22",
    arabic: "#F18B87",
    accent: "#F0AB67",
  },
  {
    bg: "#232A36",
    paper: "#2D3543",
    text: "#E8E2D5",
    muted: "#BCB8AD",
    line: "#465161",
    accentText: "#181B22",
    arabic: "#EDC078",
    accent: "#F39E8D",
  },
];
export const palettes = basePalettes.map((p, i) => ({
  ...p,
  dark: i >= 3,
  selection: i >= 3 ? "#344B65" : "#C9DDF0",
  selectionText: i >= 3 ? "#FFFFFF" : "#172B40",
  selectionArabic: i >= 3 ? "#FFD0CE" : "#701923",
}));
export const usePalette = () => useContext(PaletteContext) ?? palettes[2];
