import { Platform } from 'react-native';
import { router } from 'expo-router';
import { Badge, Body, Button, Card, Heading, Notice, Screen } from '../../components/UI';
import { usePermiso } from '../../hooks/usePermiso';
import { Recurso } from '../../lib/permission-state';
function Fila({ recurso, nombre }: { recurso: Recurso; nombre: string }) {
  const p = usePermiso(recurso);
  return <Card><Heading>{nombre}</Heading><Badge text={p.parcial ? `${p.estado} · parcial` : p.provisional ? 'concedido · provisional' : p.estado} />
    <Body>Plataforma: {Platform.OS}</Body>
    {p.respuesta?.accessPrivileges && <Body>accessPrivileges: {p.respuesta.accessPrivileges}</Body>}
    {(p.respuesta?.android?.accuracy || p.respuesta?.ios?.accuracy) && <Body>accuracy: {p.respuesta.android?.accuracy || p.respuesta.ios?.accuracy}</Body>}
    {p.error && <Notice>{p.error}</Notice>}
    {recurso === 'fotos' ? <Body>No necesitamos acceso a la galería. Usamos el selector del sistema; este estado es solo informativo.</Body>
      : recurso === 'notificaciones' ? <Button secondary title="Configurar avisos" onPress={() => router.push('/ajustes-app')} />
      : <Button secondary disabled={p.estado === 'cargando' && !p.error} title={p.estado === 'concedido' ? 'Abrir Ajustes' : p.estado === 'bloqueado' ? 'Revisar bloqueo' : 'Solicitar acceso'} onPress={() => p.estado === 'concedido' ? void p.abrirAjustes() : router.push(`/permisos/${recurso}`)} />}
  </Card>;
}
export default function Permisos() { return <Screen title="Vos tenés el control" subtitle="Consultamos el estado del sistema al volver de Ajustes. Denegar un permiso no impide crear reportes.">
  <Fila recurso="camara" nombre="Cámara" /><Fila recurso="ubicacion" nombre="Ubicación" /><Fila recurso="fotos" nombre="Fotos" /><Fila recurso="notificaciones" nombre="Notificaciones" />
</Screen>; }
