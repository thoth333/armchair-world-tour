// ライブリロード用 (USB 接続の Android 実機): adb reverse で実機の localhost:3000 を PC に転送し、
// 開発サーバーの URL を埋め込んで同期し、Android Studio を開く
// 使い方: npm run dev (別ターミナル) → npm run cap:live
import { spawnSync } from "node:child_process";

const PORT = 3000;

// PATH に adb が無ければ Android SDK の標準位置を使う
const sdk = process.env.ANDROID_HOME ?? `${process.env.LOCALAPPDATA}/Android/Sdk`;
const adb =
  spawnSync("adb", ["version"], { shell: true }).status === 0
    ? "adb"
    : `"${sdk}/platform-tools/adb.exe"`;

const reverse = spawnSync(adb, ["reverse", `tcp:${PORT}`, `tcp:${PORT}`], { stdio: "inherit", shell: true });
if (reverse.status !== 0) {
  console.error("adb reverse に失敗しました。USB デバッグを有効にして接続してください。");
  process.exit(1);
}

const env = { ...process.env, CAP_DEV_URL: `http://localhost:${PORT}` };
for (const args of [["sync", "android"], ["open", "android"]]) {
  const r = spawnSync("npx", ["cap", ...args], { stdio: "inherit", env, shell: true });
  if (r.status !== 0) process.exit(r.status ?? 1);
}
