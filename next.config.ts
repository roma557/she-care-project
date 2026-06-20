import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname),
  // Allow LAN access during dev (phone on same Wi‑Fi / hotspot).
  allowedDevOrigins: ["172.*.*.*", "192.168.*.*", "10.*.*.*"],
};

export default nextConfig;
