import { DefaultTheme, ThemeProvider } from 'expo-router';
import { SQLiteProvider } from 'expo-sqlite';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { Suspense, useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import AppTabs from '@/components/app-tabs';
import { AppText } from '@/components/ui/text';
import { Brand } from '@/constants/theme';
import { DeviceLocationProvider } from '@/context/device-location';
import { migrateDbIfNeeded } from '@/db/schema';
import '@/lib/web-alert';

// Mantém a splash nativa visível até o primeiro render.
SplashScreen.preventAutoHideAsync();

/** Tema de navegação alinhado à identidade do Orbis. */
const OrbisTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: Brand.green,
    background: Brand.cream,
    card: Brand.cream,
    text: Brand.text,
    border: Brand.border,
    notification: Brand.amber,
  },
};

export default function RootLayout() {
  useEffect(() => {
    // Esconde a splash assim que o layout montou.
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  return (
    <ThemeProvider value={OrbisTheme}>
      <StatusBar style="dark" />
      <Suspense fallback={<DatabaseFallback />}>
        <SQLiteProvider
          databaseName="orbis.db"
          onInit={migrateDbIfNeeded}
          useSuspense>
          <DeviceLocationProvider>
            <AppTabs />
          </DeviceLocationProvider>
        </SQLiteProvider>
      </Suspense>
    </ThemeProvider>
  );
}

/** Mostrado enquanto o banco local é aberto e migrado. */
function DatabaseFallback() {
  return (
    <View style={styles.loading}>
      <ActivityIndicator size="large" color={Brand.green} />
      <AppText variant="caption" tone="secondary">
        Preparando seus dados locais...
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: Brand.cream,
  },
});
