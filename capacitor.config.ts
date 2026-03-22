import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.sweatybeasts.app',
  appName: 'Sweaty Beasts',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
};

export default config;
