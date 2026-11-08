import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.fasteraim.rent',
  appName: 'Mr. Rent',
  webDir: 'cap-www',
  server: {
    url: 'https://rent.fasteraim.com',
    cleartext: false,
    allowNavigation: ['rent.fasteraim.com', '*.supabase.co'],
  },
};

export default config;