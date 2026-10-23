import * as Notifications from 'expo-notifications';
import { crearCanal, esProvisional } from './permisos';
Notifications.setNotificationHandler({ handleNotification: async () => ({
  shouldShowBanner: true, shouldShowList: true, shouldPlaySound: true, shouldSetBadge: false,
}) });
export async function avisarResolucion(id: string, titulo: string) {
  const p = await Notifications.getPermissionsAsync();
  if (!p.granted && !esProvisional(p)) return false;
  await crearCanal();
  await Notifications.scheduleNotificationAsync({
    content: { title: '¡Reporte resuelto!', body: titulo, data: { reporteId: id }, sound: 'default' },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: 10, channelId: 'reportes' },
  });
  return true;
}
