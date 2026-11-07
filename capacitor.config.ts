import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.fasteraim.rent',
  appName: 'Mr. Rent',
  webDir: 'cap-www',
  server: {
    url: 'https://rent.fasteraim.com',
    cleartext: false,
  },
};

export default config;