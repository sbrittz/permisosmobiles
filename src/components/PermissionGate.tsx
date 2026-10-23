import { Platform } from 'react-native';
import { router } from 'expo-router';
import { beneficios, EstadoPermiso, Recurso } from '../lib/permission-state';
import { Body, Button, Card, Loading, Notice } from './UI';
export function PermissionGate({ estado, recurso, error }: { estado: EstadoPermiso; recurso: Recurso; error?: string }) {
  if (error) return <Notice>{error}</Notice>;
  if (estado === 'cargando') return <Loading />;
  if (estado === 'concedido') return null;
  return <Card><Body>{estado === 'bloqueado'
    ? `El acceso está bloqueado. ${Platform.OS === 'ios' ? 'Abrí Ajustes > Apps > Mantenimiento IPF.' : 'Abrí Ajustes > Apps > Mantenimiento IPF > Permisos.'}`
    : beneficios[recurso]}</Body><Button title={estado === 'bloqueado' ? 'Abrir Ajustes' : 'Continuar'} onPress={() => router.push(`/permisos/${recurso}`)} /></Card>;
}
