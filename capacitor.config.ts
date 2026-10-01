import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "dev.thwth.world_tour",
  appName: "脳内世界旅行",
  webDir: "out",
  backgroundColor: "#ffffff",
  // ライブリロード用: CAP_DEV_URL を設定して cap sync したときだけ開発サーバーを参照する
  server: process.env.CAP_DEV_URL
    ? { url: process.env.CAP_DEV_URL, cleartext: true }
    : undefined,
};

export default config;
