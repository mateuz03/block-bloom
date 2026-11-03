import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "block.example",
  appName: "Block Bloom",
  webDir: "dist",
  backgroundColor: "#eee9ff",
  loggingBehavior: "debug",
  android: {
    backgroundColor: "#eee9ff",
  },
};

export default config;
