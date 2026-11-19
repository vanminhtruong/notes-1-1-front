import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.planthub.users',
  appName: 'PlantHub',
  webDir: 'dist',
  android: {
    allowMixedContent: false,
  },
};

export default config;
