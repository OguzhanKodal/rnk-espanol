import { spawnSync } from "node:child_process";
import { mkdirSync } from "node:fs";
const device =
  process.env.DESIGN_SIMULATOR ?? "A2F277D6-C87D-407E-B49D-4C552FF41517";
const phase = process.argv[2] ?? "before";
const dir = `docs/ekran/modern/${phase}`;
mkdirSync(dir, { recursive: true });
const sim = (...args) => {
  const r = spawnSync("xcrun", ["simctl", ...args], {
    env: {
      ...process.env,
      DEVELOPER_DIR: "/Applications/Xcode.app/Contents/Developer",
    },
    encoding: "utf8",
  });
  if (r.status && args[0] !== "terminate") throw Error(r.stderr);
};
const shots = [
  ["01-home", "?dev=top"],
  ["02-prayer-card", "?dev=bottom"],
  ["03-drawer", "?dev=drawer"],
  ["04-reader", "reader?book=muestra&dev=paper"],
  ["05-dictionary", "reader?book=muestra&dev=glossary"],
  ["06-selection", "reader?book=muestra&dev=selection"],
  ["07-themes", "reader?book=muestra&dev=themes"],
  [
    "08-contents",
    "reader?book=ramadan-frugalidad-agradecimiento&page=55&dev=toc",
  ],
  ["09-bookmarks", "marcadores"],
  ["10-prayer", "oracion"],
  ["11-glossary", "glosario"],
  ["12-quotes", "frases"],
  ["13-settings", "ajustes"],
  ["14-about", "acerca"],
  ["15-dark-reader", "reader?book=muestra&dev=dark"],
  ["16-dark-home", "?dev=dark"],
  ["17-dark-selection", "reader?book=muestra&dev=layout-on"],
  ["18-saved-page", "reader?book=ramadan-frugalidad-agradecimiento&page=55"],
  ["19-saved-reopen", "reader?book=ramadan-frugalidad-agradecimiento"],
  ["20-handles", "reader?book=muestra&dev=handles"],
  ["21-pinch", "reader?book=muestra&dev=pinch"],
];
for (const [name, route] of shots) {
  if (process.argv[3] && name !== process.argv[3]) continue;
  sim("terminate", device, "host.exp.Exponent");
  sim(
    "openurl",
    device,
    `exp://127.0.0.1:8083/--/${route}${route.includes("?") ? "&" : "?"}__expo_disable_fab=1&__expo_disable_onboarding=1&__expo_disable_auto_launch=1`,
  );
  await new Promise((r) => setTimeout(r, name === "01-home" ? 18000 : 6500));
  sim("io", device, "screenshot", `${dir}/${name}.png`);
  console.log(name);
}
