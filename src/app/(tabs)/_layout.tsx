import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import { colors } from '../../components/UI';
export default function Layout() { return <Tabs screenOptions={{ tabBarActiveTintColor: colors.blue, headerTitle: 'Mantenimiento IPF', headerShadowVisible: false, tabBarStyle: { height: 68, paddingBottom: 10, paddingTop: 7 } }}>
  <Tabs.Screen name="index" options={{ title: 'Reportes', tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 22 }}>▤</Text> }} />
  <Tabs.Screen name="avisos" options={{ title: 'Avisos', tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 22 }}>◉</Text> }} />
  <Tabs.Screen name="permisos" options={{ title: 'Permisos', tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 22 }}>◇</Text> }} />
</Tabs>; }
