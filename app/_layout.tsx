import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import 'react-native-reanimated';
import { useColorScheme } from '../components/useColorScheme';
import { Colors } from '../src/constants/Colors';
import { DataProvider, useData } from '../src/context/DataContext';
import '../src/i18n/config';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  // `useData` çağrısı artık doğrudan burada olmayacak.
  const colorScheme = useColorScheme();

  return (
    <DataProvider>
      {/* useData hook'u ThemeApplier içinde çağrılacak */}
      <ThemeApplier colorScheme={colorScheme} />
    </DataProvider>
  );
}

// ThemeApplier bileşeni, DataProvider'ın bir çocuğu olarak kullanılacak
function ThemeApplier({ colorScheme }: { colorScheme: any }) {
  const { teacher, loading, settings } = useData();
  const { i18n } = useTranslation();

  useEffect(() => {
    if (settings.language && i18n.language !== settings.language) {
      i18n.changeLanguage(settings.language);
    }
  }, [settings.language]);

  if (loading) {
    return <View style={styles.loadingContainer} />;
  }

  const themeBackgroundColor = teacher?.themeColor || Colors.background;

  const currentTheme = colorScheme === 'dark' ? DarkTheme : DefaultTheme;
  const navigationTheme = {
    ...currentTheme,
    colors: {
      ...currentTheme.colors,
      background: themeBackgroundColor,
    },
  };

  return (
    <View style={[styles.rootContainer, { backgroundColor: themeBackgroundColor }]}>
      <ThemeProvider value={navigationTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="add-student" options={{ presentation: 'modal', headerShown: false }} />
          <Stack.Screen name="add-group" options={{ presentation: 'modal', headerShown: false }} />
          <Stack.Screen name="lesson-attendance" options={{ presentation: 'modal', headerShown: false }} />
          <Stack.Screen name="weekly-schedule" options={{ headerShown: false }} />
          <Stack.Screen name="student/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="group/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="edit-student/[id]" options={{ presentation: 'modal', headerShown: false }} />
        </Stack>
      </ThemeProvider>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: Colors.background, // Yüklenirken varsayılan arka plan
  },
  rootContainer: {
    flex: 1,
  },
});
