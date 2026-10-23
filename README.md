# Mantenimiento IPF

Trabajo práctico 3 · React Native II · Expo SDK 57 · TypeScript · Expo Router.

Aplicación para reportar desperfectos del instituto y seguir su resolución. Incluye las respuestas de las partes A–F en [RESPUESTAS.md](RESPUESTAS.md).

## Abrir el proyecto

Requisitos: Node.js compatible con SDK 57 (validado con Node 22.16), npm y un dispositivo con Expo Go compatible con SDK 57, o una development build propia.

```sh
cd mantenimiento-ipf
npm ci
npx expo start --go
```

Escanear el QR con Expo Go. La PC y el dispositivo deben poder conectarse por la red. Si Expo Go de la tienda usa otro SDK, usar la versión compatible o una development build; no cambiar la versión de Expo al azar.

El proyecto se creó con:

```sh
npx create-expo-app@latest mantenimiento-ipf --template blank-typescript@sdk-57 --yes
npx expo install expo-router react-native-safe-area-context react-native-screens expo-linking expo-constants expo-camera expo-location expo-image-picker expo-notifications expo-file-system @react-native-async-storage/async-storage expo-dev-client react-dom react-native-web
npx expo install react-native-reanimated react-native-worklets
```

Los módulos se instalaron con `expo install` para respetar las versiones de SDK 57. No se utiliza expo-permissions. La plantilla inicial era TypeScript; se cambió su entrada a `expo-router/entry` y se agregaron las rutas de la consigna.

## Cómo probar el circuito

1. Crear un reporte con título, descripción, aula/referencia y categoría. No se pide ningún permiso al abrir el formulario.
2. Escanear un QR que contenga `IPF:AULA:Aula 12` o simplemente `Aula 12`. Si se rechaza la cámara, escribir el aula a mano.
3. Adjuntar una foto desde el selector sin autorizar la galería, o tocar “Sacar foto” para pedir cámara. Después de habilitarla se toca nuevamente “Sacar foto”.
4. Tocar “Usar ubicación actual” para pedir ubicación en primer plano. Después de autorizar, tocar otra vez para obtenerla. Alternativa: escribir Patio, Pasillo o Estacionamiento y usar sector sin GPS.
5. Guardar el reporte y abrir su detalle. Se puede marcar “en curso”.
6. En “Configurar avisos”, activar el interruptor: solo esta acción inicia la solicitud de notificaciones. Android crea antes el canal `reportes`.
7. En el detalle, “Simular resolución” cambia el estado y guarda un aviso. Si la preferencia está activa y hay autorización, programa una notificación local con un intervalo de 10 segundos. La bandeja interna funciona siempre.
8. Revocar o conceder un permiso desde Ajustes y volver al panel: se consulta otra vez. Android puede reiniciar la app al revocar; se recuperan los datos persistidos.

Las notificaciones de Android pueden demorarse por ahorro de batería/Doze: se programa el intervalo solicitado, pero no se pide permiso especial de alarmas exactas para un aviso de mantenimiento.

## Árbol de rutas

Los grupos entre paréntesis organizan navegación y no aparecen en la URL.

```text
src/app/
├── _layout.tsx                  # Stack y StoreProvider
├── +not-found.tsx
├── (tabs)/
│   ├── _layout.tsx              # Reportes / Avisos / Permisos
│   ├── index.tsx                # /
│   ├── avisos.tsx               # /avisos
│   └── permisos.tsx             # /permisos
├── reporte/
│   ├── nuevo.tsx                # /reporte/nuevo
│   ├── escanear.tsx             # /reporte/escanear
│   ├── foto.tsx                 # /reporte/foto
│   ├── ubicacion.tsx            # /reporte/ubicacion
│   └── [id].tsx                 # /reporte/:id
├── permisos/
│   └── [recurso].tsx            # /permisos/:recurso (modal)
└── ajustes-app.tsx              # /ajustes-app
```

```text
src/components/   UI reutilizable y PermissionGate
src/hooks/        usePermiso y useRevisarAlVolver
src/lib/          clasificación, APIs de permisos, ubicación, avisos y almacenamiento
tests/            casos de clasificación de permisos y validación de recursos
evidencias/       guía de pruebas y capturas pendientes
```

## Diseño y decisiones

- Los permisos no se guardan como verdad permanente. `usePermiso` consulta al enfocar y al volver a `active` con AppState. Devuelve estado, parcial, provisional, pedir y abrirAjustes, además de error/revisión.
- El escáner usa explícitamente `useCameraPermissions`, como pide la consigna. Comparte la clasificación pura del hook unificado. Solo monta `CameraView` estando enfocado y autorizado.
- La previa es un modal con un único botón, “Continuar” o “Abrir Ajustes”. Rechazar vuelve al contexto para usar la alternativa. No aparece de forma automática al iniciar ni por re-renderizar.
- El panel de fotos solo consulta: nunca pide acceso amplio. `accessPrivileges` informa un eventual acceso parcial ya existente, especialmente en Expo Go, cuyo binario tiene permisos propios.
- El panel de notificaciones dirige al interruptor de ajustes, para respetar la regla de pedir únicamente al activarlo.
- Reportes, avisos, preferencia y borrador se guardan con AsyncStorage. Las fotos se copian al directorio privado de documentos para no depender de una URI temporal del picker. No se solicita almacenamiento externo.
- La resolución siempre genera aviso interno; la notificación local es adicional. No se envían datos a un servidor ni se solicita token push.
- El alcance es una demostración local para un usuario/dispositivo. No incluye login, backend ni sincronización entre alumnos y personal: “Simular resolución” reproduce el evento pedido por el TP.
- Las coordenadas aproximadas no se muestran como exactas. El detalle dice “Ubicación aproximada”; los valores que devuelve el SO quedan únicamente en el almacenamiento privado, sin transmisión.

## Tabla de permisos

| Recurso | Módulo | Cuándo se pide | Alternativa |
|---|---|---|---|
| Cámara | expo-camera; captura con expo-image-picker | Al tocar la función y continuar en la previa | Aula manual; foto elegida con selector; reporte sin foto |
| Ubicación | expo-location | Al tocar “Usar ubicación actual” y continuar | Sector manual o sin GPS |
| Fotos | expo-image-picker | **No se pide** permiso de biblioteca | Selector del sistema comparte solo el elemento elegido |
| Notificaciones | expo-notifications | Al activar el interruptor de ajustes y continuar | Bandeja /avisos |

## Plugins comentados

Este bloque es explicativo (`jsonc`). El `app.json` real es JSON válido sin comentarios.

```jsonc
"plugins": [
  "expo-router", // Rutas, enlaces y navegación
  ["expo-camera", {
    "cameraPermission": "Usamos tu cámara para leer el QR del aula y fotografiar desperfectos.",
    "microphonePermission": false, // Sin clave de micrófono en iOS
    "recordAudioAndroid": false    // No grabamos sonido
  }],
  ["expo-location", {
    "locationWhenInUsePermission": "Usamos tu ubicación para indicar dónde está el desperfecto que reportás.",
    "locationAlwaysAndWhenInUsePermission": false,
    "locationAlwaysPermission": false,
    "motionUsagePermission": false, // No se usan funciones de movimiento/geocercas
    "isAndroidBackgroundLocationEnabled": false,
    "isAndroidForegroundServiceEnabled": false,
    "isIosBackgroundLocationEnabled": false
  }],
  ["expo-image-picker", {
    "cameraPermission": "Usamos tu cámara para adjuntar una foto del desperfecto.",
    "photosPermission": false,     // Selector, sin lectura amplia de la biblioteca
    "microphonePermission": false
  }],
  "expo-notifications"             // Canal Android y notificaciones locales
]
```

Cámara e ImagePicker configuran la misma clave iOS. En la introspección realizada, el texto efectivo es el de expo-camera, que contempla ambos usos. Los cambios nativos requieren nueva build.

### Permisos bloqueados y motivo

Todos llevan prefijo `android.permission.` en `android.blockedPermissions`.

| Nombre | Motivo |
|---|---|
| RECORD_AUDIO | No hay video con sonido ni notas de voz. |
| READ_MEDIA_IMAGES | La imagen se elige con selector del sistema. |
| READ_MEDIA_VIDEO | No se leen videos. |
| READ_MEDIA_AUDIO | No se leen archivos de audio. |
| READ_MEDIA_VISUAL_USER_SELECTED | No se implementa una biblioteca propia con acceso parcial persistente. |
| READ_EXTERNAL_STORAGE | No se lee almacenamiento compartido, incluso en versiones antiguas. |
| WRITE_EXTERNAL_STORAGE | Las fotos se guardan en almacenamiento privado. |
| ACCESS_BACKGROUND_LOCATION | Se obtiene una posición de primer plano, sin seguimiento. |
| SYSTEM_ALERT_WINDOW | No hay superposiciones sobre otras apps. |
| SCHEDULE_EXACT_ALARM | Un aviso de resolución no justifica alarmas exactas. |
| USE_EXACT_ALARM | La app no es un reloj/alarma/calendario que necesite esa capacidad. |

### Auditoría del manifiesto generado

Se ejecutó `npx expo prebuild --platform android --no-install`. El archivo generado se deja fuera de Git porque se reproduce con la configuración. No se ejecutó `--clean`: no existía un proyecto nativo previo que limpiar. Para regeneración completa, después de guardar cualquier cambio nativo:

```sh
npx expo prebuild --clean --platform android --no-install
```

La inspección de `android/app/src/main/AndroidManifest.xml` mostró:

| Declaración | Origen | Resultado |
|---|---|---|
| INTERNET | Plantilla Expo/React Native | Conservada, normal |
| VIBRATE | Plantilla y notificaciones | Conservada, normal |
| CAMERA | Plugin cámara/picker | Conservada, ejecución |
| ACCESS_COARSE_LOCATION | Plugin ubicación | Conservada; soporta aproximada |
| ACCESS_FINE_LOCATION | Plugin ubicación | Conservada; el usuario puede elegir precisión |
| Los 11 permisos de la tabla anterior | Reglas de blockedPermissions | Entradas `tools:node="remove"` |

El manifiesto de la dependencia `expo-notifications/android/src/main/AndroidManifest.xml` declara además **POST_NOTIFICATIONS** y **RECEIVE_BOOT_COMPLETED**, que Gradle incorpora durante la fusión. La primera permite solicitar avisos y la segunda restaurar programación tras reinicio. Este es un análisis del manifiesto generado y del módulo; **no se presenta como auditoría del manifiesto final de un APK**, que requiere compilación Android.

La introspección iOS confirmó los propósitos de cámara/ubicación y ausencia de micrófono y biblioteca. El cliente de desarrollo incorpora su propósito de red local para conectarse a Metro: pertenece al entorno de desarrollo.

## Development build

### Android local

Instalar Android Studio/SDK y JDK compatibles con SDK 57, configurar ANDROID_HOME/JAVA_HOME y conectar un Android con depuración USB o iniciar emulador.

```sh
npx expo run:android
npx expo start --dev-client
```

### Android con EAS

Requiere cuenta Expo y configurar el proyecto; no se creó una cuenta ni se inició una compilación remota paga automáticamente.

```sh
npx eas-cli login
npx eas-cli build:configure
npx eas-cli build --profile development --platform android
npx expo start --dev-client
```

Instalar el APK generado y abrir el proyecto desde ese cliente. `eas.json` ya incluye el perfil development.

### iOS

Con Mac y Xcode compatible: `npx expo run:ios`; para dispositivo físico se requiere firma. También se puede compilar con EAS y credenciales de Apple. Las pruebas de hardware deben hacerse en un dispositivo que tenga cámara.

**Expo Go no permite validar los textos ni los permisos bloqueados de esta app.** Para capturar un diálogo del sistema con texto de propósito propio, usar una build **iOS**: Android no admite insertar libremente ese texto en su diálogo. En Android se puede capturar la previa propia y luego el diálogo nativo con el nombre de la app.

## Verificación y evidencia

```sh
npm run typecheck
npm test
npx expo install --check
npx expo config --type introspect
npx expo export --platform android --output-dir dist-android
```

- TypeScript: comprobado sin errores.
- Pruebas de clasificación: 4 casos aprobados (incluyen estados, parcial, provisional y validación de recursos).
- Compatibilidad de dependencias: `expo install --check` informó “Dependencies are up to date”.
- Prebuild Android: generado correctamente.
- Exportación Android: aprobada, 1351 módulos y bundle Hermes generado. Valida JS/Hermes; no equivale a instalar y ejecutar un APK.
- **Pendiente para completar la entrega académica:** ejecutar el circuito en Expo Go y una development build y tomar las capturas reales descritas en [evidencias/PRUEBAS.md](evidencias/PRUEBAS.md). Este entorno no tiene Android SDK/adb configurados ni un dispositivo de prueba. No se inventaron capturas ni resultados de hardware.

La carpeta local `node_modules` es necesaria para ejecutar las verificaciones, pero está ignorada y no se incluye en el ZIP de entrega. Tampoco se incluyen cachés, bundles exportados ni directorios nativos generados. El lockfile conserva las versiones usadas.

## Límites conocidos

- La galería, cámara, ubicación y avisos deben validarse en Android/iOS; web solo sirve como apoyo de UI y no reemplaza esos ensayos.
- No hay sincronización remota ni un servidor que resuelva reportes reales.
- Los permisos de Expo Go pertenecen a Expo Go y pueden reflejar decisiones tomadas en otros proyectos.
- Las pruebas unitarias comprueban decisiones de estado, no el comportamiento nativo del SO.
- La instalación reportó avisos de auditoría en el árbol de dependencias. No se aplicó `npm audit fix --force`, que puede romper la compatibilidad exigida con SDK 57. Antes de publicar fuera del TP se debe revisar el árbol y actualizar con versiones compatibles.
