import { useRef, useState } from 'react';
import { Image } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Badge, Body, Button, Card, Heading, Loading, Notice, Screen } from '../../components/UI';
import { useStore } from '../../lib/store';
import { avisarResolucion } from '../../lib/notificaciones';
export default function Detalle() {
  const { id } = useLocalSearchParams<{ id: string }>(); const { reportes, cargando, cambiarEstado, notificar } = useStore();
  const [mensaje, setMensaje] = useState(''); const [ocupado, setOcupado] = useState(false); const enviando = useRef(false);
  const r = typeof id === 'string' && /^[a-z0-9]+$/.test(id) ? reportes.find(r => r.id === id) : undefined;
  async function resolver() {
    if (!r || enviando.current || r.estado === 'resuelto') return;
    enviando.current = true; setOcupado(true); cambiarEstado(r.id, 'resuelto');
    try { const programado = notificar && await avisarResolucion(r.id, r.titulo); setMensaje(programado ? 'Aviso guardado. La notificación se programó para dentro de 10 segundos.' : 'El aviso está disponible en la bandeja de Avisos.'); }
    catch { setMensaje('No se pudo programar la notificación. El aviso está guardado en la bandeja.'); }
    finally { setOcupado(false); }
  }
  if (cargando) return <Screen title="Reporte"><Loading /></Screen>;
  if (!r) return <Screen title="Reporte no encontrado"><Body>El identificador no es válido o el reporte no existe en este dispositivo.</Body><Button title="Ir a reportes" onPress={() => router.replace('/')} /></Screen>;
  return <Screen title={r.titulo} subtitle={`Creado el ${new Date(r.fecha).toLocaleDateString('es-AR')}`}>
    <Badge text={r.estado} /><Card><Heading>{r.aula}</Heading><Body>{r.categoria}</Body><Body>{r.descripcion}</Body></Card>
    {r.foto && <Image source={{ uri: r.foto }} style={{ height: 280, borderRadius: 20 }} accessibilityLabel="Foto del desperfecto" />}
    <Card><Heading>Ubicación</Heading><Body>{r.sector || 'Sin sector manual'}</Body><Body>{!r.ubicacion ? 'Sin ubicación GPS' : r.ubicacion.aproximada ? 'Ubicación aproximada' : `${r.ubicacion.latitude.toFixed(5)}, ${r.ubicacion.longitude.toFixed(5)}`}</Body></Card>
    {r.estado === 'pendiente' && <Button secondary title="Marcar en curso" onPress={() => cambiarEstado(r.id, 'en curso')} />}
    {r.estado !== 'resuelto' && <Button title="Simular resolución" disabled={ocupado} onPress={resolver} />}
    {mensaje && <Notice>{mensaje}</Notice>}<Button secondary title="Volver a mis reportes" onPress={() => router.replace('/')} />
  </Screen>;
}
