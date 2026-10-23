import { useCallback, useRef } from 'react';
import { Platform } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Body, Button, Card, Loading, Notice, Screen } from '../../components/UI';
import { usePermiso } from '../../hooks/usePermiso';
import { beneficios, esRecurso, Recurso } from '../../lib/permission-state';
import { useStore } from '../../lib/store';
import { esProvisional } from '../../lib/permisos';
import { useRevisarAlVolver } from '../../hooks/useRevisarAlVolver';
function Previa({ recurso, origen }: { recurso: Recurso; origen?: string }) {
  const p = usePermiso(recurso); const { setNotificar } = useStore();
  const enAjustes = useRef(false);
  const volver = useCallback(() => { if (router.canGoBack()) router.back(); else router.replace('/'); }, []);
  // Regresar de Ajustes siempre devuelve al contexto, incluso si mantuvo la denegación.
  useRevisarAlVolver(useCallback(() => { if (enAjustes.current) { enAjustes.current = false; volver(); } }, [volver]));
  async function continuar() {
    if (recurso === 'fotos') { volver(); return; }
    if (recurso === 'notificaciones' && origen !== 'interruptor') { router.replace('/ajustes-app'); return; }
    if (p.estado === 'bloqueado') { enAjustes.current = true; await p.abrirAjustes(); return; }
    const respuesta = await p.pedir();
    if (recurso === 'notificaciones' && respuesta) setNotificar(respuesta.granted || esProvisional(respuesta));
    // La denegación vuelve al formulario, donde sigue disponible la alternativa.
    if (respuesta) volver();
  }
  return <Screen title={p.estado === 'bloqueado' ? 'Habilitalo desde Ajustes' : 'Antes de continuar'}>
    <Card><Body>{beneficios[recurso]}</Body>
      {p.estado === 'bloqueado' && <Body>{Platform.OS === 'ios' ? 'Ajustes > Apps > Mantenimiento IPF. Habilitá el recurso que querés usar.' : 'Ajustes > Apps > Mantenimiento IPF > Permisos (o Notificaciones). Habilitá el acceso.'}</Body>}
      <Body>Podés cambiar tu decisión en Ajustes. Si no habilitás el acceso, podrás continuar con la alternativa manual.</Body>
      {p.estado === 'cargando' && !p.error ? <Loading /> : <Button title={p.estado === 'bloqueado' ? 'Abrir Ajustes' : 'Continuar'} disabled={p.ocupado} onPress={continuar} />}
      {p.error && <Notice>{p.error}</Notice>}
    </Card>
  </Screen>;
}
export default function ModalPermiso() { const { recurso, origen } = useLocalSearchParams<{ recurso: string; origen?: string }>();
  if (!esRecurso(recurso)) return <Screen title="Recurso no válido"><Body>Este permiso no forma parte de la aplicación.</Body><Button title="Continuar" onPress={() => router.replace('/permisos')} /></Screen>;
  return <Previa recurso={recurso} origen={origen} />;
}
