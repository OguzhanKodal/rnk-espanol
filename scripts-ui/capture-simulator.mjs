import { spawnSync } from "node:child_process";
const env = {
  ...process.env,
  DEVELOPER_DIR: "/Applications/Xcode.app/Contents/Developer",
};
const sim = (...args) => {
  const r = spawnSync("xcrun", ["simctl", ...args], { env, encoding: "utf8" });
  if (r.status) throw new Error(r.stderr);
};
const screens = [
  ["01-biblioteca", "?dev=top"],
  ["02-biblioteca-oracion", "?dev=bottom"],
  ["03-menu", "?dev=drawer"],
  ["04-lector-arabe", "reader?book=muestra&page=1&dev=arabic"],
  ["06-seleccion", "reader?book=muestra&page=1&dev=selection"],
  ["07-colores", "reader?book=muestra&page=1&dev=colors"],
  ["08-marcadores", "marcadores"],
  ["09-oracion", "oracion"],
  ["10-lector-oscuro", "reader?book=muestra&page=1&dev=dark"],
  ["12-frases", "frases"],
  ["13-ajustes", "ajustes"],
  ["14-acerca", "acerca"],
  ["15-indice", "reader?book=ramadan-frugalidad-agradecimiento&page=5&dev=toc"],
  ["16-nota", "reader?book=muestra&page=1&dev=note"],
  ["17-persistencia", "reader?book=muestra&page=1&dev=persist"],
  ["18-marcadores-guardados", "marcadores"],
  ["19-texto-grande", "reader?book=muestra&page=1&dev=large"],
  [
    "20-libro-real",
    "reader?book=ramadan-frugalidad-agradecimiento&page=5&dev=arabic",
  ],
];
for (const [name, route] of screens) {
  if (process.argv[2] && !name.startsWith(process.argv[2])) continue;
  sim("terminate", "booted", "host.exp.Exponent");
  sim(
    "openurl",
    "booted",
    `exp://127.0.0.1:8081/--/${route}${route.includes("?") ? "&" : "?"}__expo_disable_fab=1&__expo_disable_onboarding=1&__expo_disable_auto_launch=1`,
  );
  await new Promise((resolve) => setTimeout(resolve, 7500));
  sim("io", "booted", "screenshot", `docs/ekran/${name}.png`);
  console.log(name);
}
