import { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Stack } from "expo-router";
import { onAuthChange } from "../lib/session";
import { useFonts } from "expo-font";
import { Vazirmatn_400Regular } from "@expo-google-fonts/vazirmatn";
import { CormorantGaramond_400Regular } from "@expo-google-fonts/cormorant-garamond";
import { Inter_400Regular } from "@expo-google-fonts/inter";
import { ThemeProvider } from "../lib/theme-context";

export default function RootLayout() {
  const [user, setUser] = useState<any>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const { data } = onAuthChange((sessionUser) => {
      setUser(sessionUser);
      setCheckingAuth(false);
    });

    return () => {
      data.subscription.unsubscribe();
    };
  }, []);

  const [fontsLoaded] = useFonts({
    Vazirmatn_400Regular,
    CormorantGaramond_400Regular,
    Inter_400Regular
  });

  if (!fontsLoaded || checkingAuth) return null;

  return (
    <ThemeProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Stack screenOptions={{ headerShown: false }}>
          {user ? (
            <Stack.Screen name="(tabs)" />
          ) : (
            <Stack.Screen name="auth" />
          )}
        </Stack>
      </GestureHandlerRootView>
    </ThemeProvider>
  );
}
