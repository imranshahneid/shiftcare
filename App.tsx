import 'react-native-gesture-handler';
import { useMemo } from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClientProvider } from '@tanstack/react-query';
import { RootNavigator } from '@/navigation/RootNavigator';
import { createQueryClient } from '@/api/queryClient';
import { LoadingState } from '@/components/LoadingState';
import { useBookingsStore } from '@/store/bookingsStore';

export default function App() {
  const queryClient = useMemo(() => createQueryClient(), []);
  const hasHydrated = useBookingsStore((s) => s.hasHydrated);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          {hasHydrated ? <RootNavigator /> : <LoadingState message="Loading bookings…" />}
          <StatusBar style="auto" />
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
