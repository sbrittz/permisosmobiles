import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { Linking } from 'react-native';
import { clasificar, esParcial, Recurso, Respuesta } from '../lib/permission-state';
import { consultar, esProvisional, solicitar } from '../lib/permisos';
import { useRevisarAlVolver } from './useRevisarAlVolver';

export function usePermiso(recurso: Recurso) {
  const [respuesta, setRespuesta] = useState<Respuesta | null>(null);
  const [error, setError] = useState('');
  const [ocupado, setOcupado] = useState(false);
  const revisar = useCallback(async () => {
    try { setRespuesta(await consultar(recurso)); setError(''); }
    catch { setError('No pudimos consultar este permiso. Podés continuar con la alternativa manual.'); }
  }, [recurso]);
  useFocusEffect(useCallback(() => { void revisar(); }, [revisar]));
  useRevisarAlVolver(revisar);
  const pedir = useCallback(async () => {
    setOcupado(true);
    try { const p = await solicitar(recurso); setRespuesta(p); setError(''); return p; }
    catch { setError('No pudimos solicitar el permiso. Intentá nuevamente o usá la alternativa.'); return null; }
    finally { setOcupado(false); }
  }, [recurso]);
  const abrirAjustes = useCallback(async () => {
    try { await Linking.openSettings(); }
    catch { setError('Abrí Ajustes del dispositivo y buscá Mantenimiento IPF.'); }
  }, []);
  return { estado: clasificar(respuesta, esProvisional(respuesta)), parcial: esParcial(respuesta),
    provisional: esProvisional(respuesta), respuesta, error, ocupado, revisar, pedir, abrirAjustes };
}
