export type Recurso = 'camara' | 'ubicacion' | 'fotos' | 'notificaciones';
export type EstadoPermiso = 'cargando' | 'concedido' | 'preguntable' | 'bloqueado';
export type Respuesta = {
  status: string; granted: boolean; canAskAgain: boolean;
  accessPrivileges?: string;
  android?: { accuracy?: string; importance?: number; interruptionFilter?: number };
  ios?: { accuracy?: string; status?: number };
};
export function clasificar(p: Respuesta | null, provisional = false): EstadoPermiso {
  if (!p) return 'cargando';
  if (p.granted || provisional) return 'concedido';
  return p.canAskAgain ? 'preguntable' : 'bloqueado';
}
export function esParcial(p: Respuesta | null) {
  return p?.accessPrivileges === 'limited' || p?.android?.accuracy === 'coarse' || p?.ios?.accuracy === 'reduced';
}
export function esRecurso(value: unknown): value is Recurso {
  return typeof value === 'string' && ['camara', 'ubicacion', 'fotos', 'notificaciones'].includes(value);
}
export const beneficios: Record<Recurso, string> = {
  camara: 'Usamos tu cámara para leer el QR del aula o fotografiar el desperfecto.',
  ubicacion: 'Usamos tu ubicación para indicar dónde está el desperfecto que reportás.',
  fotos: 'El selector del sistema te permite compartir únicamente la foto que elegís.',
  notificaciones: 'Usamos las notificaciones para avisarte cuando se resuelve tu reporte.',
};
