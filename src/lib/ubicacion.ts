import * as Location from 'expo-location';
import { esParcial } from './permission-state';
export type Ubicacion = { latitude: number; longitude: number; aproximada: boolean };
// Solo consulta: la solicitud se hace desde la pantalla previa, por acción de la persona.
export async function obtenerUbicacion(): Promise<Ubicacion | null> {
  const permiso = await Location.getForegroundPermissionsAsync();
  if (!permiso.granted) return null;
  if (!(await Location.hasServicesEnabledAsync())) throw new Error('Activá la ubicación del dispositivo o elegí un sector.');
  const posicion = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
  const aproximada = esParcial(permiso);
  return { latitude: posicion.coords.latitude, longitude: posicion.coords.longitude, aproximada };
}
