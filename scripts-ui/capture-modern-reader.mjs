import { spawnSync } from "node:child_process";
const root = process.cwd();
const env = {
  ...process.env,
  DEVELOPER_DIR: "/Applications/Xcode.app/Contents/Developer",
};
const udid =
  process.env.DESIGN_SIMULATOR ?? "A2F277D6-C87D-407E-B49D-4C552FF41517";
const sim = (...a) => {
  const r = spawnSync("xcrun", ["simctl", ...a], { env, encoding: "utf8" });
  if (r.status && a[0] !== "terminate") throw Error(r.stderr);
};
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const open = (dev) => {
  sim("terminate", udid, "host.exp.Exponent");
  sim(
    "openurl",
    udid,
    `exp://127.0.0.1:8083/--/reader?book=ramadan-frugalidad-agradecimiento&block=s3-b13&dev=${dev}&__expo_disable_fab=1&__expo_disable_onboarding=1&__expo_disable_auto_launch=1`,
  );
};
const shot = (name) =>
  sim("io", udid, "screenshot", `${root}/docs/ekran/modern/after/${name}.png`);
open("paper");
await wait(7000);
open("layout-cycle");
await wait(7000);
shot("22-cycle-selected");
await wait(14000);
shot("23-cycle-cleared");
open("handles");
await wait(7000);
shot("24-cycle-handle-moved");
open("dark");
await wait(7000);
open("layout-on");
await wait(7000);
shot("25-dark-real-selection");
open("toc");
await wait(7000);
shot("26-dark-contents");
const route = async (name, path) => {
  sim("terminate", udid, "host.exp.Exponent");
  sim(
    "openurl",
    udid,
    `exp://127.0.0.1:8083/--/${path}${path.includes("?") ? "&" : "?"}__expo_disable_fab=1&__expo_disable_onboarding=1&__expo_disable_auto_launch=1`,
  );
  await wait(7000);
  shot(name);
};
await route("04-reader", "reader?book=muestra&block=s1-b2&dev=paper");
await route("05-dictionary", "reader?book=muestra&block=s1-b2&dev=glossary");
await route("06-selection", "reader?book=muestra&block=s1-b2&dev=selection");
await route(
  "27-fixture-selected",
  "reader?book=muestra&block=s1-b2&dev=layout-cycle",
);
await wait(14000);
shot("28-fixture-cleared");
await route("15-dark-reader", "reader?book=muestra&block=s1-b2&dev=dark");
await route(
  "17-dark-selection",
  "reader?book=muestra&block=s1-b2&dev=layout-on",
);
await route("03-drawer", "?dev=drawer");
