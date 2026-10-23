import { useState } from 'react';
import { Image, View } from 'react-native';
import { router } from 'expo-router';
import { Body, Button, Card, Field, Heading, Loading, Notice, Screen } from '../../components/UI';
import { categorias, useStore } from '../../lib/store';
export default function Nuevo() {
  const { borrador: b, editar, crear, cargando } = useStore();
  const [error, setError] = useState(''); const [guardando, setGuardando] = useState(false);
  async function enviar() { if (guardando) return; setGuardando(true); try { const id = await crear(); router.replace(`/reporte/${id}`); } catch (e) { setError((e as Error).message); } finally { setGuardando(false); } }
  return <Screen title="Nuevo reporte" subtitle="Contanos qué pasó. La foto y la ubicación son opcionales.">
    {cargando ? <Loading /> : <>
      <Field label="Título *" placeholder="Ej. La luz del aula no enciende" maxLength={100} value={b.titulo} onChangeText={titulo => editar({ titulo })} />
      <Field label="Descripción *" placeholder="¿Qué problema encontraste?" multiline maxLength={1500} value={b.descripcion} onChangeText={descripcion => editar({ descripcion })} />
      <Field label="Aula o referencia *" placeholder="Ej. Aula 12 o Patio" maxLength={80} value={b.aula} onChangeText={aula => editar({ aula })} />
      <Button secondary title="Escanear QR del aula" onPress={() => router.push('/reporte/escanear')} />
      <Heading>Categoría</Heading><View style={{ gap: 8 }}>{categorias.map(c => <Button key={c} title={`${b.categoria === c ? '✓ ' : ''}${c}`} secondary={b.categoria !== c} onPress={() => editar({ categoria: c })} />)}</View>
      <Card><Heading>Sumá detalles</Heading>{b.foto && <Image source={{ uri: b.foto }} style={{ height: 180, borderRadius: 12 }} accessibilityLabel="Foto adjunta del desperfecto" />}
        <Button secondary title={b.foto ? 'Cambiar foto' : 'Adjuntar foto'} onPress={() => router.push('/reporte/foto')} />
        <Body>{b.ubicacion ? b.ubicacion.aproximada ? 'Ubicación aproximada' : 'Ubicación agregada' : b.sector ? `Sector: ${b.sector}` : 'Sin ubicación. Podés indicar el sector a mano.'}</Body>
        <Button secondary title="Marcar ubicación o elegir sector" onPress={() => router.push('/reporte/ubicacion')} />
      </Card>{error && <Notice>{error}</Notice>}<Button title={guardando ? 'Guardando…' : 'Crear reporte'} disabled={guardando} onPress={enviar} />
    </>}
  </Screen>;
}
