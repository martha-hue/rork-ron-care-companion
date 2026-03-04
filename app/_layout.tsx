import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { CarerProvider, useCarer } from "@/providers/CarerProvider";
import { CareProvider } from "@/providers/CareProvider";
import Colors from "@/constants/colors";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  const { isOnboarded, isLoading } = useCarer();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (isLoading || isOnboarded === null) return;

    const inOnboarding =
      segments[0] === 'welcome' ||
      segments[0] === 'signup' ||
      segments[0] === 'your-details' ||
      segments[0] === 'patient-details' ||
      segments[0] === 'invite-team' ||
      segments[0] === 'join-complete';

    if (!isOnboarded && !inOnboarding) {
      router.replace('/welcome');
    }
  }, [isOnboarded, isLoading, segments]);

  return (
    <Stack
      screenOptions={{
        headerBackTitle: "Back",
        contentStyle: { backgroundColor: Colors.cream },
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="welcome"
        options={{
          headerShown: false,
          gestureEnabled: false,
        }}
      />
      <Stack.Screen
        name="signup"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="your-details"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="patient-details"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="invite-team"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="join-complete"
        options={{
          headerShown: false,
          gestureEnabled: false,
        }}
      />
      <Stack.Screen
        name="add-shift"
        options={{
          presentation: "modal",
          title: "Add Shift",
          headerStyle: { backgroundColor: Colors.cream },
          headerTintColor: Colors.primary,
          headerTitleStyle: { color: Colors.text, fontSize: 18, fontWeight: '600' as const },
        }}
      />
      <Stack.Screen
        name="add-log"
        options={{
          presentation: "modal",
          title: "Add Log Entry",
          headerStyle: { backgroundColor: Colors.cream },
          headerTintColor: Colors.primary,
          headerTitleStyle: { color: Colors.text, fontSize: 18, fontWeight: '600' as const },
        }}
      />
      <Stack.Screen
        name="add-note"
        options={{
          presentation: "modal",
          title: "Add Note",
          headerStyle: { backgroundColor: Colors.cream },
          headerTintColor: Colors.primary,
          headerTitleStyle: { color: Colors.text, fontSize: 18, fontWeight: '600' as const },
        }}
      />
      <Stack.Screen
        name="weekly-review"
        options={{
          presentation: "modal",
          title: "Weekly Review",
          headerStyle: { backgroundColor: Colors.cream },
          headerTintColor: Colors.primary,
          headerTitleStyle: { color: Colors.text, fontSize: 18, fontWeight: '600' as const },
        }}
      />
      <Stack.Screen
        name="login"
        options={{
          headerShown: false,
          presentation: "modal",
        }}
      />
      <Stack.Screen
        name="profile"
        options={{
          presentation: "modal",
          title: "My Profile",
          headerStyle: { backgroundColor: Colors.cream },
          headerTintColor: Colors.primary,
          headerTitleStyle: { color: Colors.text, fontSize: 18, fontWeight: '600' as const },
        }}
      />
      <Stack.Screen
        name="long-term-calendar"
        options={{
          headerShown: false,
          presentation: "modal",
        }}
      />
      <Stack.Screen
        name="history"
        options={{
          presentation: "modal",
          title: "History",
          headerStyle: { backgroundColor: Colors.cream },
          headerTintColor: Colors.primary,
          headerTitleStyle: { color: Colors.text, fontSize: 18, fontWeight: '600' as const },
        }}
      />
      <Stack.Screen
        name="carer-history"
        options={{
          presentation: "modal",
          title: "Carer History",
          headerStyle: { backgroundColor: Colors.cream },
          headerTintColor: Colors.primary,
          headerTitleStyle: { color: Colors.text, fontSize: 18, fontWeight: '600' as const },
        }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <CarerProvider>
          <CareProvider>
            <RootLayoutNav />
          </CareProvider>
        </CarerProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}
