# Pruebas y capturas reales pendientes

Este documento es un protocolo, **no una afirmación de pruebas realizadas en un teléfono**. Registrar modelo, versión del SO, Expo Go/development build y fecha al ejecutar cada caso.

| Archivo sugerido | Preparación y acción | Resultado esperado | Estado |
|---|---|---|---|
| 01-escaner-cargando.png | Abrir escáner y capturar al consultar (puede ser muy breve; usar video) | Indicador de carga, cámara todavía desmontada | Pendiente |
| 02-escaner-concedido.png | Continuar en previa y autorizar | Cámara y lectura de QR; aula completa al regresar | Pendiente |
| 03-escaner-preguntable.png | Instalación/permiso sin decidir o primer rechazo Android | Explicación y Continuar; entrada manual visible | Pendiente |
| 04-escaner-bloqueado.png | Rechazar hasta canAskAgain false | Explicación de bloqueo y Ajustes; entrada manual utilizable | Pendiente |
| 05-ubicacion-concedida.png | Autorizar ubicación y volver a tocar obtener | Ubicación guardada; probar precisa y aproximada | Pendiente |
| 06-ubicacion-denegada.png | Rechazar y escribir Patio | Reporte se guarda con sector, sin GPS | Pendiente |
| 07-selector-foto.png | Elegir de la galería sin autorización amplia | Selector del SO; elegir, cancelar y volver sin errores | Pendiente |
| 08-notificacion.png | Activar avisos, autorizar, resolver y esperar al menos 10 s | Notificación local y aviso interno | Pendiente |
| 09-panel-antes.png | Abrir panel con cámara denegada | Muestra el estado actual del SO | Pendiente |
| 10-panel-despues.png | Permitir cámara en Ajustes y volver | Estado actualizado sin reiniciar manualmente | Pendiente |
| 11-proposito-ios.png | Build propia iOS, permiso cámara sin decidir | Alerta nativa con propósito propio | Pendiente |

## Casos adicionales de aceptación

- Denegar todos los permisos y crear un reporte con aula manual, selector opcional y sector: debe funcionar.
- Mantener notificaciones denegadas y simular resolución: el aviso debe aparecer en /avisos.
- Desactivar el interruptor después de programar: se cancelan las notificaciones locales pendientes.
- Reiniciar la app: reportes, fotos, avisos, borrador y preferencia deben persistir.
- Probar permiso de ubicación concedido con servicios GPS apagados: mensaje y alternativa manual.
- Dar ubicación aproximada: nunca mostrar coordenadas numéricas en el detalle.
- Abrir /reporte/no-existe y /permisos/no-existe: mostrar error controlado.
- Escanear varias veces el mismo QR: volver una sola vez y no duplicar navegación.
- Cancelar el picker: conservar borrador y foto anterior.
- Volver de Ajustes sin conceder: no volver a pedir automáticamente.
- Rotar o cambiar de app mientras se escanea: comprobar que no queden dos cámaras activas.
- Probar ambas plataformas cuando estén disponibles; al menos una development build es obligatoria según la consigna.

## Restablecer cámara sin borrar reportes

```sh
adb shell pm revoke ar.edu.ipf.mantenimiento android.permission.CAMERA
adb shell pm clear-permission-flags ar.edu.ipf.mantenimiento android.permission.CAMERA user-set user-fixed
xcrun simctl privacy booted reset camera ar.edu.ipf.mantenimiento
```

Los comandos corresponden a la app propia, no a Expo Go. Si se prueba en Expo Go, los permisos pertenecen al paquete del cliente y afectan otros proyectos abiertos con él.

## Registro a completar después de las pruebas

| Entorno | Modelo/SO | Fecha | Resultado y observaciones |
|---|---|---|---|
| Expo Go SDK 57 | Pendiente | Pendiente | No ejecutado en este entorno |
| Development build | Pendiente | Pendiente | No ejecutado en este entorno |

Agregar las capturas a esta carpeta y enlazarlas en README cuando existan. No usar imágenes de maquetas como prueba de diálogos nativos.
