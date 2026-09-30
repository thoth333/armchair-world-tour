import type { NextConfig } from "next";

// Capacitor 用ビルド (`npm run build:cap`) のときだけ静的エクスポートする
const isCapacitor = process.env.BUILD_TARGET === "capacitor";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["*.trycloudflare.com"],
  ...(isCapacitor && {
    output: "export",
    images: { unoptimized: true },
  }),
};

export default nextConfig;
