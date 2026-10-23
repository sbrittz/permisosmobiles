import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { Image } from 'react-native';
import { Body, Button, Card, Notice, Screen } from '../../components/UI';
import { usePermiso } from '../../hooks/usePermiso';
import { useStore } from '../../lib/store';
export default function Foto() {
  const permiso = usePermiso('camara'); const { guardarFoto, borrador, editar } = useStore();
  const [ocupado, setOcupado] = useState(false); const [error, setError] = useState('');
  async function elegir(camara: boolean) {
    if (ocupado) return;
    if (camara && permiso.estado !== 'concedido') { router.push('/permisos/camara'); return; }
    setOcupado(true); setError('');
    try {
      const opciones: ImagePicker.ImagePickerOptions = { mediaTypes: ['images'], quality: 0.8, allowsEditing: false };
      // Sin requestMediaLibraryPermissionsAsync: el sistema comparte solo el archivo elegido.
      const resultado = camara ? await ImagePicker.launchCameraAsync(opciones) : await ImagePicker.launchImageLibraryAsync(opciones);
      if (!resultado.canceled && resultado.assets[0]) { await guardarFoto(resultado.assets[0].uri); router.back(); }
    } catch { setError('No pudimos adjuntar la foto. Probá con el selector o continuá sin foto.'); }
    finally { setOcupado(false); }
  }
  return <Screen title="Una foto ayuda" subtitle="Adjuntá una imagen del desperfecto. Es opcional.">
    {borrador.foto && <Image source={{ uri: borrador.foto }} style={{ height: 260, borderRadius: 20 }} />}
    <Card><Body>Para sacar una foto necesitamos la cámara. Después de habilitarla, tocá nuevamente “Sacar foto”.</Body><Button title="Sacar foto" disabled={ocupado || permiso.estado === 'cargando'} onPress={() => elegir(true)} /></Card>
    <Card><Body>Elegí una sola imagen con el selector del sistema, sin compartir tu galería completa.</Body><Button secondary title="Elegir de la galería" disabled={ocupado} onPress={() => elegir(false)} /></Card>
    {borrador.foto && <Button secondary title="Quitar foto" onPress={() => editar({ foto: undefined })} />}
    {(error || permiso.error) && <Notice>{error || permiso.error}</Notice>}
    <Button secondary title="Volver al reporte" onPress={() => router.back()} />
  </Screen>;
}
