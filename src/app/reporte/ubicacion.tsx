import { useState } from 'react';
import { router } from 'expo-router';
import { Body, Button, Card, Field, Notice, Screen } from '../../components/UI';
import { usePermiso } from '../../hooks/usePermiso';
import { useStore } from '../../lib/store';
import { obtenerUbicacion } from '../../lib/ubicacion';
export default function Ubicacion() {
  const permiso = usePermiso('ubicacion'); const { borrador, editar } = useStore();
  const [sector, setSector] = useState(borrador.sector); const [ocupado, setOcupado] = useState(false); const [error, setError] = useState('');
  async function localizar() {
    if (permiso.estado !== 'concedido') { router.push('/permisos/ubicacion'); return; }
    setOcupado(true); setError('');
    try { const ubicacion = await obtenerUbicacion(); if (!ubicacion) { setError('No hay permiso. Elegí un sector a mano.'); return; } editar({ ubicacion, sector: sector.trim() }); router.back(); }
    catch (e) { setError((e as Error).message || 'No pudimos ubicarte. Elegí un sector a mano.'); }
    finally { setOcupado(false); }
  }
  return <Screen title="¿Dónde está el problema?" subtitle="La ubicación se usa solo mientras estás usando esta función.">
    <Card><Body>{permiso.parcial ? 'Ubicación aproximada. No mostraremos coordenadas exactas.' : 'Podés agregar tu ubicación actual o escribir el sector.'}</Body>
      <Button title={ocupado ? 'Buscando ubicación…' : 'Usar ubicación actual'} disabled={ocupado || permiso.estado === 'cargando'} onPress={localizar} />
      <Body>Después de habilitar el permiso, tocá otra vez el botón para obtener la ubicación.</Body></Card>
    {(error || permiso.error) && <Notice>{error || permiso.error}</Notice>}
    <Field label="Sector manual" placeholder="Patio, estacionamiento, pasillo…" maxLength={100} value={sector} onChangeText={setSector} />
    <Button title="Usar sector sin GPS" disabled={!sector.trim()} onPress={() => { editar({ sector: sector.trim(), ubicacion: undefined }); router.back(); }} />
    <Button secondary title="Continuar sin ubicación" onPress={() => { editar({ ubicacion: undefined }); router.back(); }} />
  </Screen>;
}
