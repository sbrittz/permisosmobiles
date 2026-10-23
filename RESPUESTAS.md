# TP3 · Permisos móviles — Partes A a F

Proyecto: **Mantenimiento IPF**. Fecha de consulta: 22/10/2026.

Las respuestas se basan en la consigna y documentación oficial. La presentación de clase mencionada no estaba adjunta; las cuatro razones de A1 se expresan con una clasificación propia equivalente. Los estados concretos pueden variar según versión, fabricante y recurso: siempre se lee la respuesta real del sistema.

## Parte A · Conceptos

### A1

a) Un permiso es una autorización controlada por el sistema para acceder a un recurso protegido. La app declara lo que necesita y lo solicita; Android/iOS comprueba la autorización y presenta el diálogo; la persona decide y puede revocarla.

b) La sandbox aísla los archivos y procesos de cada app. Sin permisos peligrosos puedo mostrar pantallas, calcular, validar un formulario y guardar datos en el espacio privado. No puedo leer libremente archivos de otras apps. Internet en Android requiere una declaración normal, pero no un diálogo de ejecución.

c) Cuatro razones:

| Razón | Ejemplo |
|---|---|
| Privacidad | Evitar que una app lea mis contactos sin consentimiento. |
| Seguridad | Impedir que una app active el micrófono para escucharme sin autorización. |
| Control y autonomía | Elegir ubicación aproximada o revocar la cámara desde Ajustes. |
| Transparencia y confianza | Saber que se usará la cámara para leer el QR de un aula antes de habilitarla. |

d) La visita es la app; el portero, el sistema operativo; el dueño, la persona. El portero recuerda la decisión: posteriores consultas devuelven el estado almacenado y no necesariamente vuelven a mostrar un diálogo. El permiso temporal, la revocación o el reinicio de permisos pueden modificarlo.

### A2 · Declarar y solicitar

| Pregunta | Declarar al compilar | Solicitar al ejecutar |
|---|---|---|
| Qué se hace | Se informa qué recurso puede necesitar el binario. | Se consulta o pide autorización para una acción concreta. |
| Android | `uses-permission` en AndroidManifest.xml. | API de permiso de ejecución para permisos peligrosos; los especiales usan sus flujos de Ajustes. |
| iOS | Claves de propósito en Info.plist y capacidades cuando correspondan. | API del recurso, que puede mostrar la alerta nativa. |
| Expo | Plugins, `android.permissions`, `android.blockedPermissions`, `ios.infoPlist`. | Funciones `request…PermissionsAsync` o hooks de cada módulo. |
| Si se omite | Puede denegarse la operación, fallar o cerrarse la app; también puede rechazarse la build. | Un permiso peligroso no autorizado impide acceder al recurso. Declarar no implica consentimiento. |

### A3 · Verdadero o falso

a) **F**. El diálogo lo dibuja el sistema; la explicación previa sí pertenece a React Native.

b) **V en proyectos Expo con generación nativa/CNG**: app config y plugins describen la configuración que se regenera. El manifiesto compilado es lo que finalmente aplica Android; en un proyecto nativo mantenido manualmente el contexto cambia.

c) **F**. Cambiar Info.plist requiere compilar e instalar otro binario. Una OTA cambia JS/assets compatibles, no el manifiesto nativo.

d) **F**. La declaración debe estar presente en el manifiesto final; pedirla en JS no la agrega.

e) **F**. Se usan los módulos específicos, como expo-camera y expo-location. expo-permissions está obsoleto.

f) **V**. Notificaciones tiene su API de autorización y no una clave de texto de propósito equivalente a NSCameraUsageDescription.

g) **V**, para la respuesta de fotos que informa autorización limitada: puede haber `granted` con `accessPrivileges: 'limited'`. No equivale a acceso total.

h) **F como garantía universal**. Reinstalar suele reiniciar permisos, pero no conviene asumirlo para todo recurso/dispositivo y restauración. En desarrollo se usan herramientas específicas y se consulta el estado; en simulador iOS, `simctl privacy reset`, y en Android, revocación y limpieza de flags. No se promete que reinstalar siempre resetee cada decisión de privacidad.

### A4 · Estados

Android: sin decidir → concedido o denegado preguntable → (nueva solicitud explícita) concedido o bloqueado. En Android 11+ los rechazos reiterados pueden impedir nuevos diálogos. Desde Ajustes se puede conceder/revocar; permisos temporales y auto-reset también cambian el estado.

iOS: sin decidir → concedido o denegado sin nueva alerta para muchos recursos. Después de denegar, normalmente se necesita Ajustes. Ubicación y fotos tienen flujos adicionales (una vez, aproximada, limitada, aumento a Always). La diferencia central es que iOS normalmente no ofrece una segunda alerta del mismo permiso después del rechazo; Android puede permitir otro intento.

| Estado | status | canAskAgain | ¿Diálogo? |
|---|---|---|---|
| Sin decidir | undetermined | true | Sí, al solicitar. |
| Concedido | granted | Normalmente true; consultar respuesta | No hace falta repetirlo. |
| Denegado preguntable | denied | true | Puede aparecer al solicitar otra vez. |
| Bloqueado | denied | false | No; se orienta a Ajustes. |

`canAskAgain` no es una orden de insistir ni garantiza que un permiso ya concedido muestre una alerta.

## Parte B · Android

### B1 · Clasificación

| Permiso | Tipo | Obtención |
|---|---|---|
| INTERNET | Instalación/normal | Declaración; concesión automática. |
| CAMERA | Ejecución/peligroso | Declaración + autorización en ejecución. |
| VIBRATE | Instalación/normal | Declaración; automático. |
| SYSTEM_ALERT_WINDOW | Especial | Declaración + pantalla de acceso especial para superponerse. |
| POST_NOTIFICATIONS | Ejecución desde API 33 | Declaración, canal y solicitud en Android 13+. |
| ACCESS_NETWORK_STATE | Instalación/normal | Declaración; automático. |
| READ_CONTACTS | Ejecución/peligroso | Declaración + solicitud, si el acceso amplio está justificado. |
| SCHEDULE_EXACT_ALARM | Especial | Declaración, comprobar autorización y flujo de Ajustes de alarmas exactas. No es un permiso peligroso normal. |
| RECORD_AUDIO | Ejecución/peligroso | Declaración + solicitud. |
| MANAGE_EXTERNAL_STORAGE | Especial | Acceso a todos los archivos mediante Ajustes y sujeto a restricciones de Play. |

### B2

a) Un grupo reúne permisos relacionados para presentar decisiones comprensibles. FINE y COARSE se piden juntos en **un diálogo de ubicación**, con elección de precisión en versiones compatibles. No se debe asumir que obtener un miembro concede automáticamente todos los del grupo.

b) Prefijo `android.permission.`. Cámara: `android.permission.CAMERA`.

c) Los de firma se conceden a apps firmadas con el certificado correspondiente al declarador (con variantes reservadas al sistema). Una app común no puede conseguirlos mostrando una alerta: no posee esa firma ni privilegios.

### B3 · Manifiesto

a) INTERNET es automático. CAMERA, COARSE/FINE y READ_EXTERNAL_STORAGE en las versiones donde aplica requieren autorización de ejecución. POST_NOTIFICATIONS se solicita desde API 33. RECORD_AUDIO está eliminado por la regla de fusión.

b) `maxSdkVersion="32"` limita esa declaración a Android 12L e inferiores. Android 13 divide el acceso amplio en READ_MEDIA_IMAGES, READ_MEDIA_VIDEO y READ_MEDIA_AUDIO. Android 14 añade selección parcial con READ_MEDIA_VISUAL_USER_SELECTED en los flujos correspondientes. Un selector de sistema evita solicitar acceso amplio.

c) `tools:node="remove"` elimina la declaración coincidente durante la fusión de manifiestos:

```json
{ "expo": { "android": { "blockedPermissions": ["android.permission.RECORD_AUDIO"] } } }
```

d) En `expo.android.permissions`:

```json
{ "expo": { "android": { "permissions": ["android.permission.SCHEDULE_EXACT_ALARM"] } } }
```

e) Prebuild puede regenerarlo y borrar cambios manuales. Se modifica app config/plugin. `blockedPermissions` no modifica el binario ya compilado de Expo Go; requiere una build propia.

### B4

a) No se escribe libremente dentro del diálogo nativo de Android. Se explica el beneficio en una pantalla previa y el sistema determina su texto.

b) “Mientras está en uso” autoriza bajo las condiciones de uso activo; “Solo esta vez” es temporal. Android 11 lo incorpora para ubicación, cámara y micrófono. El SO controla cuándo termina, por lo que hay que consultar antes de usar.

c) En el flujo habitual de Android 11+, dos rechazos hacen que ya no aparezca la alerta; `canAskAgain` pasa a false. Se lee el resultado real porque existen diferencias según historial y recurso.

d) La ubicación aproximada sirve para sugerir puntos de reciclaje de un barrio; no alcanza para navegación giro a giro o localizar una puerta específica. Los 3 km² son una referencia orientativa, no una precisión garantizada.

e) Android puede terminar/reiniciar el proceso al revocar un permiso de ejecución. No se puede confiar solo en el retorno a primer plano: se consulta al iniciar y se persiste el borrador para recuperarlo.

### B5 · Versiones

| Cambio | Versión/API | Implicación |
|---|---|---|
| Permisos de ejecución | Android 6 / 23 | Solicitar peligrosos además de declararlos. |
| Ubicación de fondo separada | Android 10 / 29 | ACCESS_BACKGROUND_LOCATION y autorización gradual si es imprescindible. |
| Rechazos reiterados bloquean | Android 11 / 30 | Leer canAskAgain; ofrecer Ajustes. |
| Precisa/aproximada | Android 12 / 31 | Soportar coarse y pedir COARSE/FINE juntas si se necesita la opción precisa. |
| Notificaciones | Android 13 / 33 | POST_NOTIFICATIONS en ejecución. |
| Fotos parciales | Android 14 / 34 | No interpretar granted como acceso a todas las fotos. |
| Red local | Android 17 / 37 | ACCESS_LOCAL_NETWORK para apps que apuntan a 37+, o selectores mediados por el sistema. Android 16 tuvo mecanismos de prueba opt-in. |

`targetSdkVersion` indica la API contra cuyo comportamiento se diseñó/probó la app; no es la versión mínima instalable. Expo SDK 57 apunta por defecto a API **36**, compila contra 36 y admite Android 7+. Desde el 31/08/2026, las apps nuevas y actualizaciones móviles de Google Play deben apuntar a Android 16/API 36 o superior; las existentes tienen un umbral distinto (API 35 para disponibilidad a nuevos usuarios), con excepciones por tipo de dispositivo. Fuentes: [tabla Expo](https://docs.expo.dev/versions/v57.0.0/) y [requisitos de Play](https://support.google.com/googleplay/android-developer/answer/11926878).

## Parte C · iOS

### C1 · Info.plist

| Recurso | Clave |
|---|---|
| Cámara | NSCameraUsageDescription |
| Micrófono | NSMicrophoneUsageDescription |
| Ubicación en uso | NSLocationWhenInUseUsageDescription |
| Ubicación siempre | NSLocationAlwaysAndWhenInUseUsageDescription, además de la de en uso; NSLocationAlwaysUsageDescription es heredada. |
| Fotos lectura | NSPhotoLibraryUsageDescription |
| Fotos solo guardar | NSPhotoLibraryAddUsageDescription |
| Contactos | NSContactsUsageDescription |
| Face ID | NSFaceIDUsageDescription |
| ATT | NSUserTrackingUsageDescription |
| Notificaciones | Sin clave de propósito; UNUserNotificationCenter/Expo Notifications. |

### C2

a) Acceder a cámara sin el propósito exigido puede terminar la app por privacidad. App Store Connect puede rechazar la build con **ITMS-90683**, “Missing purpose string in Info.plist”.

b) Normalmente una vez por autorización inicial de un recurso: después del rechazo la app ofrece una alternativa y acceso a Ajustes. No es una regla absoluta para ampliaciones de alcance como ubicación o fotos limitadas.

c) El sistema arma el encabezado, nombre de la app y opciones. El desarrollador escribe el motivo. En Expo se configura mediante opciones del plugin o `ios.infoPlist`.

d) El análisis de la build puede detectar referencias a APIs protegidas de una dependencia aunque el flujo propio no las invoque. Se elimina/actualiza esa dependencia o se desactiva la funcionalidad nativa; si el acceso es realmente necesario, se añade una descripción veraz y se recompila. No se inventa un propósito para encubrir una API innecesaria.

### C3 · Textos

| Texto | Evaluación | Mejora |
|---|---|---|
| Necesitamos tu ubicación. | Insuficiente. | Usamos tu ubicación para mostrarte puntos de reciclaje cercanos. |
| Para mejorar tu experiencia. | Vago. | Usamos tu ubicación para ordenar las farmacias por cercanía. |
| Usamos tu ubicación para mostrarte las farmacias de turno más cercanas. | Adecuado si describe el uso real. | No requiere cambio. |
| La app no funciona sin ubicación. | Coercitivo y sin beneficio concreto. | Usamos tu ubicación para sugerir la dirección de entrega; también podés escribirla. |
| Ubicación requerida por el sistema. | No explica el uso de la app. | Usamos tu ubicación para identificar el sector del instituto donde reportás un desperfecto. |

La aprobación final depende de que texto, funcionalidad y prácticas reales coincidan. [Apple: textos de propósito](https://developer.apple.com/help/app-review/guideline-reference/5-1-1-purpose-strings/).

### C4 · Acceso gradual

| Caso | Introducción | Detección/solicitud en Expo |
|---|---|---|
| Fotos limitadas | iOS 14 | `accessPrivileges === 'limited'` en respuesta de biblioteca; el picker comparte elementos elegidos sin lectura amplia. |
| Ubicación aproximada | iOS 14 | `permiso.ios?.accuracy === 'reduced'` frente a full. |
| Permitir una vez | iOS 13 | `requestForegroundPermissionsAsync`; no se distingue de When In Use en la respuesta inmediata. Se reconsulta posteriormente. |
| En uso → Siempre | Autorizaciones separadas desde iOS 8; flujo escalonado moderno desde iOS 13 | Primero foreground, luego `requestBackgroundPermissionsAsync`, con propósito y capacidad requeridos. |
| Notificaciones provisionales | iOS 12 | `requestPermissionsAsync({ ios: { allowProvisional: true } })`; `ios.status === IosAuthorizationStatus.PROVISIONAL`. |
| ATT | API en iOS 14; aplicación del requisito desde 14.5 | expo-tracking-transparency: `getTrackingPermissionsAsync` y `requestTrackingPermissionsAsync`. |

SDK 57 requiere **iOS 16.4+**. Todas esas versiones introductorias quedan por debajo del mínimo, pero igualmente se deben manejar los estados: no implica que la persona haya autorizado nada. [Referencia Expo](https://docs.expo.dev/versions/v57.0.0/).

### C5 · Comparación

| Aspecto | Android | iOS |
|---|---|---|
| Declaración | AndroidManifest.xml | Info.plist, capacidades cuando corresponda |
| Texto del diálogo | Lo decide Android | Sistema + texto de propósito propio |
| Intentos | Puede permitir repetir hasta bloqueo | Normalmente rechazo inicial → Ajustes |
| Una vez | Cámara, micrófono, ubicación desde Android 11 | Ubicación desde iOS 13 |
| Notificaciones | Permiso de ejecución desde Android 13; canales desde 8 | Autorización propia; opción provisional |
| Ubicación de fondo | Permiso separado; Android 11+ dirige a Ajustes | Always, primero en uso; capacidades para ejecución de fondo |
| Falta declaración | Denegación/error, según API | Acceso protegido puede cerrar la app y provocar rechazo en revisión |

## Parte D · Expo

### D1

| Necesidad | Módulo | Permiso |
|---|---|---|
| QR | expo-camera | useCameraPermissions |
| Video con sonido | expo-camera | useCameraPermissions + useMicrophonePermissions |
| Farmacias | expo-location | useForegroundPermissions / requestForegroundPermissionsAsync |
| Seguimiento de fondo | expo-location (+ task manager para tarea) | Foreground y después requestBackgroundPermissionsAsync |
| Recordatorio | expo-notifications | getPermissionsAsync / requestPermissionsAsync |
| Nota de voz | expo-audio | requestRecordingPermissionsAsync |
| Galería propia | expo-media-library | usePermissions / requestPermissionsAsync según API de la versión elegida |
| Publicidad entre apps | expo-tracking-transparency | useTrackingPermissions / requestTrackingPermissionsAsync |

Un tutorial que usa expo-permissions pertenece a una API antigua y necesita adaptación; no se instala ese paquete en este proyecto.

### D2

a) `get…` consulta sin mostrar alerta. `request…` puede mostrarla si el SO lo permite.

b) El hook retorna respuesta, función para pedir y función para consultar. En el primer render la respuesta puede ser null: se muestra carga sin acceder a `.status` de null ni activar la cámara.

c) Con canAskAgain false, request normalmente devuelve el estado denegado sin diálogo. Un bucle no lo desbloquea: genera trabajo/re-renders, mala UX y puede dejar una pantalla “pidiendo” eternamente.

### D3

| Respuesta | Acción |
|---|---|
| null | Mostrar carga; consultar. |
| granted | Habilitar el recurso autorizado. |
| undetermined, canAskAgain true | Explicar y solicitar al tocar la función. |
| denied, canAskAgain true | Dar alternativa; reintentar solo por acción explícita. |
| denied, canAskAgain false | Explicar bloqueo, ofrecer Ajustes y alternativa. |
| granted, limited | Trabajar solo con fotos compartidas; indicar acceso parcial. |
| granted, coarse | Adaptarse a aproximación; no presentar falsa precisión. |

Los campos centrales son **granted/status** (“¿puedo usarlo?”) y **canAskAgain** (“¿puedo volver a solicitarlo dentro de la app?”). Accuracy, accessPrivileges e ios.status agregan matices.

### D4

| Paso Android 14 | status | canAskAgain | Diálogo |
|---|---|---|---|
| 1 Consulta inicial | undetermined | true | No |
| 2 Primer rechazo | denied | true | Sí |
| 3 Segundo rechazo | denied | false | Sí, en ese intento |
| 4 Nuevo request | denied | false | No |
| 5 Ajustes permite; reconsulta | granted | normalmente true | No diálogo de request; se cambió en Ajustes |
| 6 No reconsulta | El estado local puede seguir denied | Puede seguir false en memoria | La UI muestra datos obsoletos, aunque el SO ya concedió |

En iOS: paso 1 undetermined/true/sin diálogo; paso 2 denied/false/con diálogo; pasos 3 y 4 denied/false/sin diálogo. Cambia desde el primer rechazo. Con “Permitir una vez”, la concesión es temporal y al terminar la sesión podrá requerir autorización otra vez. No se guarda granted como verdad permanente ni se asume que todo cierre momentáneo invalida inmediatamente el permiso.

### D5 · Configuración QR y reciclaje

```json
{
  "expo": {
    "plugins": [
      ["expo-camera", {
        "cameraPermission": "Usamos tu cámara para leer el QR del punto de reciclaje.",
        "microphonePermission": false,
        "recordAudioAndroid": false
      }],
      ["expo-location", {
        "locationWhenInUsePermission": "Usamos tu ubicación para mostrarte puntos de reciclaje cercanos.",
        "locationAlwaysAndWhenInUsePermission": false,
        "locationAlwaysPermission": false,
        "isIosBackgroundLocationEnabled": false,
        "isAndroidBackgroundLocationEnabled": false,
        "isAndroidForegroundServiceEnabled": false
      }]
    ],
    "android": {
      "blockedPermissions": [
        "android.permission.RECORD_AUDIO",
        "android.permission.SYSTEM_ALERT_WINDOW",
        "android.permission.ACCESS_BACKGROUND_LOCATION"
      ]
    }
  }
}
```

expo-camera soporta video con audio y su configuración predeterminada puede añadir el micrófono. No analiza si cada app va a grabar; por eso se desactiva explícitamente y se verifica el manifiesto fusionado.

### D6

a) Expo Go tiene su propio manifiesto, Info.plist y textos compilados. Los plugins de mi proyecto no recompilan Expo Go.

b) Se prueban UI, flujos disponibles de cámara, picker, ubicación de primer plano y notificaciones locales compatibles. Push remoto en Android no está disponible en Expo Go desde SDK 53; requiere development build. Ubicación de fondo requiere una build propia y configuración nativa. Los textos y permisos eliminados se comprueban con binario propio.

c) Generación e instalación local Android:

```sh
npx expo prebuild --platform android
npx expo run:android
# Alternativa remota, previa configuración de cuenta/proyecto:
npx eas-cli build --profile development --platform android
```

d) Reinicio de cámara en desarrollo (reemplazar el identificador si cambia):

```sh
adb shell pm revoke ar.edu.ipf.mantenimiento android.permission.CAMERA
adb shell pm clear-permission-flags ar.edu.ipf.mantenimiento android.permission.CAMERA user-set user-fixed
xcrun simctl privacy booted reset camera ar.edu.ipf.mantenimiento
# Todos los servicios de privacidad del simulador:
xcrun simctl privacy booted reset all ar.edu.ipf.mantenimiento
```

No usar `pm clear` sin advertir que también borra los reportes y demás datos de la app.

## Parte E · Corrección de código

### E1 · Cámara

Errores: acceso a permiso.status cuando todavía es null; no distingue denegado preguntable de bloqueado; insiste con “Permitir” aunque no pueda mostrar alerta; no actualiza al volver de Ajustes. También conviene desmontar la cámara si la pantalla pierde foco y dar entrada manual.

Versión breve con cuatro estados (la implementación completa con QR y fallback está en `src/app/reporte/escanear.tsx`):

```tsx
import { useCallback } from 'react';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { ActivityIndicator, Button, Linking, Text, View } from 'react-native';
import { useRevisarAlVolver } from '../../hooks/useRevisarAlVolver';

export default function Escanear() {
  const [permiso, pedir, consultar] = useCameraPermissions();
  const revisar = useCallback(() => { void consultar(); }, [consultar]);
  useRevisarAlVolver(revisar);
  if (!permiso) return <ActivityIndicator />;
  if (permiso.granted) return <CameraView style={{ flex: 1 }} facing="back" />;
  if (!permiso.canAskAgain) return <View>
    <Text>Habilitá la cámara en Ajustes o escribí el aula a mano.</Text>
    <Button title="Abrir Ajustes" onPress={() => { void Linking.openSettings(); }} />
  </View>;
  return <View>
    <Text>Usamos tu cámara para leer el QR del aula. Podés cambiarlo en Ajustes.</Text>
    <Button title="Continuar" onPress={() => { void pedir(); }} />
  </View>;
}
```

### E2 · Ubicación

a) Pide fondo antes de en uso. iOS requiere autorización de primer plano para aumentar el alcance; “Permitir una vez” puede impedir conceder fondo durante esa sesión. Android 11+ requiere pedir en uso primero y explicar que el permiso de fondo se habilita mediante Ajustes. No se deben pedir ambos simultáneamente.

b) Función didáctica, invocada **después** de las explicaciones previas correspondientes:

```ts
import * as Location from 'expo-location';
export async function activarSeguimiento() {
  try {
    let enUso = await Location.getForegroundPermissionsAsync();
    if (!enUso.granted && enUso.canAskAgain)
      enUso = await Location.requestForegroundPermissionsAsync();
    if (!enUso.granted) return false;
    let siempre = await Location.getBackgroundPermissionsAsync();
    if (!siempre.granted && siempre.canAskAgain)
      siempre = await Location.requestBackgroundPermissionsAsync();
    return siempre.granted;
  } catch { return false; }
}
```

c) Obtener coordenadas tras solicitud en contexto; ante rechazo devuelve null:

```ts
import * as Location from 'expo-location';
export async function obtenerUbicacion() {
  try {
    let p = await Location.getForegroundPermissionsAsync();
    if (!p.granted && p.canAskAgain)
      p = await Location.requestForegroundPermissionsAsync();
    if (!p.granted) return null;
    const r = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
    return {
      latitude: r.coords.latitude,
      longitude: r.coords.longitude,
      aproximada: p.android?.accuracy === 'coarse' || p.ios?.accuracy === 'reduced'
    };
  } catch { return null; }
}
```

En el sistema entregado la solicitud está separada en el modal; `src/lib/ubicacion.ts` solo consulta y obtiene, evitando un diálogo imprevisto. También distingue servicios GPS desactivados de permiso denegado.

d) Farmacias cercanas no necesita fondo. Google Play exige que el acceso de fondo sea esencial para una funcionalidad principal, declaración/revisión, divulgación destacada previa y política de privacidad, entre otros requisitos. No se pide para una simple consulta de cercanía. [Política de ubicación](https://support.google.com/googleplay/android-developer/answer/9799150).

### E3

a) En Android 13+ una causa frecuente es no haber creado un canal. Primero `setNotificationChannelAsync('reportes', …)` y después `requestPermissionsAsync()`. También se comprueba manifiesto, target e historial de denegaciones: no es la única causa posible.

b) Android 12 o anterior no tiene el diálogo POST_NOTIFICATIONS, aunque la persona puede deshabilitar notificaciones/canales en Ajustes.

c) iOS admite `allowProvisional: true`. Se detecta `respuesta.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL`; puede recibir avisos silenciosos sin la autorización plena para alertas.

d) Buen momento: activar “Avisarme cuando se resuelva mi reporte”. Mal momento: solicitarlo automáticamente al abrir por primera vez, sin haber explicado ni creado un reporte.

### E4 · Fotos

| Necesidad | Herramienta | Permiso |
|---|---|---|
| Foto de perfil | launchImageLibraryAsync | Sin lectura amplia de galería. |
| Sacar foto ahora | Cámara / launchCameraAsync | Cámara, sin micrófono para una foto. |
| Editor de toda la galería | expo-media-library | Lectura de biblioteca con acceso parcial/total según SO y consentimiento. |
| Comprobante | launchImageLibraryAsync | Solo archivo elegido; sin permiso amplio. |

Google Play restringe READ_MEDIA_IMAGES/VIDEO porque exponen muchas imágenes privadas; solo el uso principal y frecuente puede justificar acceso amplio. Las declaraciones empezaron el 18/09/2024; la fecha de cumplimiento inicial fue 22/01/2025, con prórroga hasta 28/05/2025. “El mejor permiso” es el que no hace falta pedir: usar el selector si alcanza. [Política de fotos y videos](https://support.google.com/googleplay/android-developer/answer/14115180).

### E5 · Volver de Ajustes

```ts
import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';
export function useRevisarAlVolver(revisar: () => void) {
  const anterior = useRef(AppState.currentState);
  useEffect(() => {
    const sub = AppState.addEventListener('change', nuevo => {
      const estabaAfuera = anterior.current === 'background' || anterior.current === 'inactive';
      if (estabaAfuera && nuevo === 'active') revisar();
      anterior.current = nuevo;
    });
    return () => sub.remove();
  }, [revisar]);
}
```

a) La respuesta del hook es una instantánea; el cambio externo no garantiza un evento que actualice automáticamente ese estado de React.

b) Se pasa la tercera función, `consultarPermiso`, envuelta en un callback estable si hace falta.

c) El sistema es la fuente de verdad; la persona puede revocar, conceder o limitar y también vencen permisos temporales. Un store permanente queda obsoleto. El proyecto guarda reportes y preferencias, pero consulta de nuevo las autorizaciones.

## Parte F · Buenas prácticas

### F1 · Contexto y alternativas

| App/recurso | Momento | Alternativa |
|---|---|---|
| Delivery/ubicación | Tocar “Usar mi ubicación” para dirección | Escribir dirección. |
| Billetera/cámara | Tocar “Escanear QR” | Ingresar alias/código. |
| Red social/contactos | Elegir buscar conocidos | Buscar usuario o compartir invitación. |
| Mensajería/micrófono | Iniciar nota de voz | Escribir texto. |
| Turnos/notificaciones | Activar recordatorio de turno | Ver turnos/avisos dentro de la app. |
| Editor/galería | Abrir exploración de toda la biblioteca | Selector de una o varias imágenes. |

Cuatro alertas al arrancar aparecen sin beneficio claro, interrumpen y acostumbran a rechazar sin leer; también impiden entender qué función necesita cada recurso.

### F2 · Pantalla previa

a) Beneficio específico en una frase, un único botón neutral para continuar al diálogo y explicación de que la decisión puede modificarse en Ajustes. Sin manipular la elección.

b) “Continuar” es correcto porque ese botón abre la solicitud; quien concede es el sistema con la decisión de la persona.

c) La pauta 5.1.1(iv) protege el consentimiento y las alternativas. La indicación concreta de un solo botón “Continue/Next” y de no incluir “Cancel/Close” en una vista previa está desarrollada en las **Human Interface Guidelines de privacidad**; no conviene atribuir literalmente toda esa redacción a 5.1.1(iv). La persona rechaza en la alerta del sistema y la app ofrece alternativas fuera de la previa. [Apple HIG: privacidad](https://developer.apple.com/design/human-interface-guidelines/privacy).

d) Si ya está bloqueado, no se promete otro diálogo: se indica el camino de Ajustes y el botón dice “Abrir Ajustes”. El resto de la app sigue disponible.

### F3 · Mínimo privilegio

a) Aproximada para puntos de reciclaje del barrio: no se necesita identificar un domicilio exacto.

b) Depende de ejecución, no de estar físicamente en un bolsillo: si se sigue registrando con pantalla bloqueada/app fuera de primer plano, hacen falta capacidades de ejecución de fondo. En iOS puede ser viable una sesión iniciada en primer plano con When In Use y modo de ubicación de fondo; en Android puede usarse un foreground service iniciado en uso. Se elige esa opción mínima si alcanza; “Siempre”/background se justifica solo si el seguimiento realmente requiere acceso adicional fuera de esas condiciones. No se pide Always automáticamente por la palabra “bolsillo”.

c) Selector del sistema: la foto del DNI es un archivo seleccionado, no justifica leer toda la biblioteca.

d) Cámara sin micrófono. Leer QR no utiliza sonido.

### F4 · Tiendas

a) Google Play: (1) permisos sensibles limitados a funciones justificadas y cumplir políticas específicas; (2) política de privacidad y ficha Data safety coherentes con recolección/compartición real. App Store: (1) propósitos concretos y consentimiento sin forzar recursos innecesarios; (2) declaración de privacidad y manifiestos/razones de APIs requeridas correctos.

b) PrivacyInfo.xcprivacy describe prácticas de datos, tracking y razones aprobadas para APIs sujetas a declaración. No concede permisos ni reemplaza Info.plist. Expo permite configurarlo en `ios.privacyManifests`; hay que revisar además los manifiestos aportados por dependencias. [Expo: privacy manifests](https://docs.expo.dev/guides/apple-privacy/).

c) Android 17 incorpora un selector de contactos para compartir solo contactos/campos elegidos. Desde el 27/01/2027, la política de Play restringe el acceso amplio: las funciones ocasionales deben migrar al selector (en los dispositivos/targets compatibles), quitar READ_CONTACTS cuando no sea necesario, y los casos que necesitan lectura amplia y persistente deben justificarla mediante declaración en Play Console. No significa que absolutamente toda app de contactos pierda automáticamente el permiso. [Anuncio oficial de políticas](https://android-developers.googleblog.com/2026/04/giving-users-clearer-choice-and-everyone-a-safer-more-trusted-app-ecosystem.html).

### F5 · Diagnóstico

a) Falta una clave de propósito en Info.plist. Agregar texto veraz por plugin/configuración y recompilar; una OTA no modifica esa clave.

b) Revisar si CAMERA se eliminó o no se declaró en el manifiesto final, si el permiso quedó bloqueado y si se instaló una build vieja. Expo Go tiene otra configuración. Corregir app.json, consultar canAskAgain y generar otra build si cambió configuración nativa.

c) La UI conserva una respuesta vieja. Reconsultar con AppState al volver a active y al iniciar/enfocar pantalla.

d) Efecto secundario en render: request dispara actualizaciones y vuelve a ejecutarse. Pedir desde una interacción, con control de solicitud en curso, y terminar carga en finally. Los renders solo describen UI.

e) Las notificaciones no son necesarias para entrar a una app de turnos. Mantener consulta/gestión de turnos y bandeja interna; ofrecer activación contextual sin bloquear la app.

## Fuentes oficiales complementarias

- [Expo Camera SDK 57](https://docs.expo.dev/versions/v57.0.0/sdk/camera/)
- [Expo Location SDK 57](https://docs.expo.dev/versions/v57.0.0/sdk/location/)
- [Expo ImagePicker SDK 57](https://docs.expo.dev/versions/v57.0.0/sdk/imagepicker/)
- [Expo Notifications SDK 57](https://docs.expo.dev/versions/v57.0.0/sdk/notifications/)
- [Expo: configuración de permisos](https://docs.expo.dev/guides/permissions/)
- [Android: solicitudes de permisos](https://developer.android.com/training/permissions/requesting)
- [Android: permiso de red local](https://developer.android.com/privacy-and-security/local-network-permission)
- [Apple: reglas de revisión](https://developer.apple.com/app-store/review/guidelines/)

## Guion de defensa oral (G6)

1. `canAskAgain` decide si se puede solicitar otra vez; `granted` y el matiz provisional se evalúan antes. Ver `src/lib/permission-state.ts` y `src/app/permisos/[recurso].tsx`.
2. Android puede terminar el proceso al revocar. El borrador se persiste; al reiniciar y al regresar se consulta al SO con el hook/AppState.
3. El selector comparte un archivo elegido. Tomar una foto accede a la cámara, un recurso protegido.
4. Con aproximación la UI muestra “Ubicación aproximada”, sin coordenadas. Con rechazo se puede guardar un sector manual o continuar sin GPS.
5. Expo Go muestra textos de su propio binario; los textos de esta app se verifican en development build.
6. Agregar audio implica módulo/configuración nativa y micrófono: requiere nueva build, no alcanza con OTA.
