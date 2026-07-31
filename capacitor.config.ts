import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.mateu.neonswitch",
  appName: "Block Bloom",
  webDir: "dist",
  backgroundColor: "#eee9ff",
  loggingBehavior: "debug",
  android: {
    backgroundColor: "#eee9ff",
  },
};

export default config;
