import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StoreProvider } from '../lib/store';
import { colors } from '../components/UI';
import '../lib/notificaciones';
export default function Layout() {
  return <StoreProvider><StatusBar style="dark" /><Stack screenOptions={{ headerTintColor: colors.ink, headerShadowVisible: false, headerTitle: 'Mantenimiento IPF', contentStyle: { backgroundColor: colors.bg } }}>
    <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    <Stack.Screen name="permisos/[recurso]" options={{ presentation: 'modal', headerShown: false, gestureEnabled: false }} />
  </Stack></StoreProvider>;
}
