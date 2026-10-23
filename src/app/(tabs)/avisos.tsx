import { router } from 'expo-router';
import { Body, Button, Card, Heading, Screen } from '../../components/UI';
import { useStore } from '../../lib/store';
export default function Avisos() { const { avisos } = useStore(); return <Screen title="Tus avisos" subtitle="Las novedades quedan acá, aunque no actives las notificaciones.">
  {!avisos.length && <Card><Heading>Sin novedades por ahora</Heading><Body>Cuando un reporte se resuelva, vas a encontrar el aviso en esta bandeja.</Body></Card>}
  {avisos.map(a => <Card key={a.id}><Heading>{a.texto}</Heading><Body>{new Date(a.fecha).toLocaleString('es-AR')}</Body><Button secondary title="Ver reporte" onPress={() => router.push(`/reporte/${a.reporteId}`)} /></Card>)}
</Screen>; }
