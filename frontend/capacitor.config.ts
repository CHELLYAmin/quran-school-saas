import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
    appId: 'com.quranschool.dashboard',
    appName: 'Quran School Dashboard',
    webDir: 'out',
    server: {
        androidScheme: 'https'
    }
};

export default config;
