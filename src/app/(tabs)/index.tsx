import { router } from 'expo-router';
import { Badge, Body, Button, Card, Heading, Loading, Notice, Screen } from '../../components/UI';
import { useStore } from '../../lib/store';
export default function Inicio() {
  const { reportes, cargando, error } = useStore();
  return <Screen title="Cuidemos el instituto." subtitle="Reportá un problema. Seguí su solución.">
    {error && <Notice>{error}</Notice>}<Button title="+ Nuevo reporte" disabled={cargando} onPress={() => router.push('/reporte/nuevo')} />
    <Heading>Mis reportes · {reportes.length}</Heading>
    {cargando ? <Loading /> : reportes.length === 0 ? <Card><Heading>Todo empieza con un aviso</Heading><Body>Todavía no tenés reportes. Si ves una luz quemada, una pérdida de agua o un equipo roto, contanos.</Body></Card> : reportes.map(r => <Card key={r.id}><Badge text={r.estado} /><Heading>{r.titulo}</Heading><Body>{r.aula} · {r.categoria}</Body><Button secondary title="Ver reporte" onPress={() => router.push(`/reporte/${r.id}`)} /></Card>)}
    <Button secondary title="Configurar avisos" onPress={() => router.push('/ajustes-app')} />
  </Screen>;
}
