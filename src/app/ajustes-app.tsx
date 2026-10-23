import { Switch } from 'react-native';
import { router } from 'expo-router';
import { Body, Button, Card, Heading, Notice, Screen } from '../components/UI';
import { useStore } from '../lib/store';
import { usePermiso } from '../hooks/usePermiso';
import * as Notifications from 'expo-notifications';
export default function Ajustes() {
  const { notificar, setNotificar } = useStore(); const permiso = usePermiso('notificaciones');
  async function cambiar(value: boolean) {
    if (!value) { setNotificar(false); try { await Notifications.cancelAllScheduledNotificationsAsync(); } catch { /* La preferencia sigue desactivada. */ } return; }
    if (permiso.estado === 'concedido') setNotificar(true);
    else router.push({ pathname: '/permisos/[recurso]', params: { recurso: 'notificaciones', origen: 'interruptor' } });
  }
  return <Screen title="Avisos a tu manera" subtitle="Elegí cómo enterarte de las novedades.">
    <Card><Heading>Avisarme cuando se resuelva mi reporte</Heading><Switch accessibilityLabel="Avisarme cuando se resuelva mi reporte" value={notificar && permiso.estado === 'concedido'} disabled={permiso.estado === 'cargando'} onValueChange={cambiar} />
      <Body>Podés desactivar los avisos cuando quieras. La bandeja dentro de la app siempre estará disponible.</Body></Card>
    {permiso.error && <Notice>{permiso.error}</Notice>}<Button secondary title="Ver bandeja de avisos" onPress={() => router.push('/avisos')} />
  </Screen>;
}
