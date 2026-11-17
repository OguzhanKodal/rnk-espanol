// Reuses Metro on 8081 and the booted Expo Go simulator. Never starts a server.
import { spawnSync } from "node:child_process";
const env = {
  ...process.env,
  DEVELOPER_DIR: "/Applications/Xcode.app/Contents/Developer",
};
const sim = (...args) => {
  const r = spawnSync("xcrun", ["simctl", ...args], { env, encoding: "utf8" });
  if (r.status) throw Error(r.stderr);
};
const shots = [
  [
    "01-selection-off",
    "book=ramadan-frugalidad-agradecimiento&block=s3-b13&dev=paper",
  ],
  [
    "02-selection-on",
    "book=ramadan-frugalidad-agradecimiento&block=s3-b13&dev=layout-on",
  ],
  [
    "03-handle-moved",
    "book=ramadan-frugalidad-agradecimiento&block=s3-b13&dev=handles",
  ],
  [
    "04-mid-book-bars-paper",
    "book=ramadan-frugalidad-agradecimiento&block=s3-b13&dev=paper",
  ],
  [
    "05-natural-wrapping-oscuro",
    "book=ramadan-frugalidad-agradecimiento&block=s3-b13&dev=dark",
  ],
];
for (const [name, query] of shots) {
  sim("terminate", "booted", "host.exp.Exponent");
  sim(
    "openurl",
    "booted",
    `exp://127.0.0.1:8081/--/reader?${query}&__expo_disable_fab=1&__expo_disable_onboarding=1`,
  );
  await new Promise((r) => setTimeout(r, 8000));
  sim("io", "booted", "screenshot", `docs/ekran/v5/${name}.png`);
  console.log(name);
}

const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const open = (dev) => {
  sim("terminate", "booted", "host.exp.Exponent");
  sim(
    "openurl",
    "booted",
    `exp://127.0.0.1:8081/--/reader?book=ramadan-frugalidad-agradecimiento&block=s3-b13&dev=${dev}&__expo_disable_fab=1&__expo_disable_onboarding=1`,
  );
};
open("bars-scroll");
await wait(8000);
sim("io", "booted", "screenshot", "docs/ekran/v5/04-mid-scroll-bars.png");
open("paper");
await wait(6000);
open("layout-cycle");
await wait(8000);
sim("io", "booted", "screenshot", "docs/ekran/v5/06-cycle-on.png");
await wait(14000);
sim("io", "booted", "screenshot", "docs/ekran/v5/07-cycle-cleared.png");

const fixture = (dev) => {
  sim("terminate", "booted", "host.exp.Exponent");
  sim(
    "openurl",
    "booted",
    `exp://127.0.0.1:8081/--/reader?book=muestra&block=s1-b2&dev=${dev}&__expo_disable_fab=1&__expo_disable_onboarding=1`,
  );
};
fixture("paper");
await wait(8000);
sim("io", "booted", "screenshot", "docs/ekran/v5/08-fixture-off.png");
fixture("layout-cycle");
await wait(8000);
sim("io", "booted", "screenshot", "docs/ekran/v5/09-fixture-on.png");
await wait(14000);
sim("io", "booted", "screenshot", "docs/ekran/v5/10-fixture-cleared.png");
