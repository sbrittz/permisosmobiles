import { useCallback, useRef, useState } from 'react';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { router, useFocusEffect } from 'expo-router';
import { View } from 'react-native';
import { Body, Button, Field, Notice, Screen } from '../../components/UI';
import { PermissionGate } from '../../components/PermissionGate';
import { clasificar } from '../../lib/permission-state';
import { useRevisarAlVolver } from '../../hooks/useRevisarAlVolver';
import { useStore } from '../../lib/store';
export default function Escanear() {
  const [permiso, , consultarPermiso] = useCameraPermissions();
  const { editar } = useStore(); const [codigo, setCodigo] = useState(''); const [error, setError] = useState('');
  const leido = useRef(false); const [enfocado, setEnfocado] = useState(false);
  const revisar = useCallback(() => { void consultarPermiso().catch(() => setError('No se pudo consultar la cámara. Escribí el código a mano.')); }, [consultarPermiso]);
  useFocusEffect(useCallback(() => { leido.current = false; setEnfocado(true); revisar(); return () => setEnfocado(false); }, [revisar]));
  useRevisarAlVolver(revisar);
  function guardar(value: string) {
    const aula = value.replace(/^IPF:AULA:/i, '').trim();
    if (!aula || aula.length > 80 || /[\r\n<>]/.test(aula)) { setError('El QR debe contener un aula de hasta 80 caracteres.'); return; }
    if (leido.current) return; leido.current = true; editar({ aula }); router.back();
  }
  return <Screen title="Escanear aula" subtitle="Apuntá al QR de la puerta. También podés escribir el código.">
    <PermissionGate recurso="camara" estado={clasificar(permiso)} error={error} />
    {permiso?.granted && enfocado && <View style={{ height: 310, borderRadius: 22, overflow: 'hidden' }}><CameraView style={{ flex: 1 }} facing="back" barcodeScannerSettings={{ barcodeTypes: ['qr'] }} onBarcodeScanned={({ data }) => guardar(data)} onMountError={() => setError('La cámara no está disponible. Ingresá el aula a mano.')} /></View>}
    <Body>Alternativa sin cámara</Body><Field label="Código del aula" value={codigo} onChangeText={setCodigo} placeholder="Ej. Aula 12" maxLength={80} />
    <Button title="Usar este código" disabled={!codigo.trim()} onPress={() => guardar(codigo)} />
    {error && <Notice>{error}</Notice>}
  </Screen>;
}
