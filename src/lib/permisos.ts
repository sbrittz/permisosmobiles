import { Camera } from 'expo-camera';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { Recurso, Respuesta } from './permission-state';

export async function crearCanal() {
  if (Platform.OS === 'android') await Notifications.setNotificationChannelAsync('reportes', {
    name: 'Resolución de reportes', importance: Notifications.AndroidImportance.DEFAULT,
    description: 'Avisos sobre los desperfectos que reportaste.',
  });
}
export function esProvisional(p: Respuesta | null) {
  return p?.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL;
}
export async function consultar(recurso: Recurso): Promise<Respuesta> {
  switch (recurso) {
    case 'camara': return Camera.getCameraPermissionsAsync();
    case 'ubicacion': return Location.getForegroundPermissionsAsync();
    case 'fotos': return ImagePicker.getMediaLibraryPermissionsAsync();
    case 'notificaciones': return Notifications.getPermissionsAsync();
  }
}
export async function solicitar(recurso: Recurso): Promise<Respuesta> {
  const actual = await consultar(recurso);
  // Fotos usa el selector del sistema: jamás solicita acceso a toda la biblioteca.
  if (recurso === 'fotos' || actual.granted || esProvisional(actual) || !actual.canAskAgain) return actual;
  switch (recurso) {
    case 'camara': return Camera.requestCameraPermissionsAsync();
    case 'ubicacion': return Location.requestForegroundPermissionsAsync();
    case 'notificaciones':
      await crearCanal();
      return Notifications.requestPermissionsAsync({ ios: { allowAlert: true, allowBadge: true, allowSound: true } });
  }
}
