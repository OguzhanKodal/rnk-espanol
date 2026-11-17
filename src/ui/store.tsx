import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
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
  fontSize: number;
  font: number;
  city: number;
  method: number;
  coords?: { latitude: number; longitude: number };
};
export type Progress = { blockId: string; page: number };
const defaults: Settings = {
  theme: 1,
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
        if (r.key === "settings") setSettings({ ...defaults, ...v });
        if (r.key === "marks") setMarks(v);
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
  );
}
export const useStore = () => useContext(Context);
export const palettes = [
  {
    bg: "#FCFAF6",
    paper: "#FFFEFA",
    text: "#352E29",
    muted: "#87796E",
    line: "#E6DDD1",
    accent: "#7C3536",
  },
  {
    bg: "#F5EFE4",
    paper: "#FFF9EE",
    text: "#3B3028",
    muted: "#887361",
    line: "#DDD0BC",
    accent: "#873C38",
  },
  {
    bg: "#1C2022",
    paper: "#282D30",
    text: "#E9DFCD",
    muted: "#B2A897",
    line: "#414545",
    accent: "#E0A58A",
  },
];
export const usePalette = () => palettes[useStore().settings.theme];
