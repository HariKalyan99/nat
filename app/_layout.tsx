import InitialLayout from "@/components/InitialLayout";
import { COLORS } from "@/constants/theme";
import ClerkAndConvexProvider from "@/providers/ClerkAndConvexProvider";
import { useFonts } from 'expo-font';
import { SplashScreen } from "expo-router";
import { useCallback } from "react";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

export default function RootLayout() {

  const [fontsLoaded] = useFonts({
    "JetBrainsMonoNL-Medium": require("../assets/fonts/JetBrainsMonoNL-Medium.ttf")
  })

  const onLayoutRootView = useCallback(async () => {
    if(fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded])
  return (
    <ClerkAndConvexProvider>
        <SafeAreaProvider>
          <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }} onLayout={onLayoutRootView}>
            <InitialLayout />
          </SafeAreaView>
        </SafeAreaProvider>
    </ClerkAndConvexProvider>
  );
}
