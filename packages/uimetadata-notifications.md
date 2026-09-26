# UiMetadata.Notifications

Interfaz de notificaciones para [`Commons.Notifications`](/packages/commons-notifications.md): campana con contador, panel
desplegable, página de bandeja y tiempo real por SignalR. Sin contenido de negocio: los avisos los crea quien use el
dispatcher; este paquete solo los muestra.

## Qué incluye

| Pieza | Qué hace |
|---|---|
| `NotificationsController` (`/notifications`) | JSON de la bandeja del usuario autenticado: `GET list`, `GET count`, `POST {id}/read`, `POST read-all`, `POST {id}/delete`, y la página `GET /notifications`. Nunca acepta un `userId` del cliente |
| `NotificationsHub` (`/hubs/notifications`) | Hub de SignalR solo de salida, autenticado con la cookie de la app; enruta por `NameIdentifier` |
| `SignalRNotificationRealtime` | Implementa `INotificationRealtime`: empuja `(notification, unreadCount)` al usuario |
| `_NotificationBell.cshtml` | Campana + panel. Se configura con `NotificationBellModel` (URLs y textos) |
| `notifications.js` / `notifications.css` | Montaje, hub con respaldo por consulta, toast opcional y estilos con las variables del tema |
| `wwwroot/lib/signalr/signalr.min.js` | Cliente de SignalR (`@microsoft/signalr`, MIT) para no depender de la carpeta `lib` del host |

## Instalación

```xml
<ProjectReference Include="..\Commons\UIMetadata\UiMetadata.Notifications\UiMetadata.Notifications.csproj" />
```

```csharp
// Program.cs
builder.Services.AddNotifications()                  // Commons.Notifications
    .AddInAppChannel<AppDbContext>();

builder.Services.AddControllersWithViews()
    .AddUiMetadataNotifications();                   // controlador, vistas, SignalR y realtime

app.UseAuthentication();
app.UseAuthorization();
app.MapNotificationsHub();                           // "/hubs/notifications" (configurable)
```

En el layout, dentro de la barra superior, y antes del cierre del `<body>`:

```html
@await Html.PartialAsync("~/Views/Shared/_NotificationBell.cshtml", new UiMetadata.Notifications.Models.NotificationBellModel())

<link rel="stylesheet" href="~/_content/UiMetadata.Notifications/css/notifications.css" asp-append-version="true" />
<script src="~/_content/UiMetadata.Notifications/lib/signalr/signalr.min.js"></script>
<script src="~/_content/UiMetadata.Notifications/js/notifications.js" asp-append-version="true"></script>
```

La página de bandeja (`/notifications`) usa el layout del consumidor y necesita los mismos `<script>`.

## Comportamiento

- **Tiempo real:** si `window.signalR` está cargado, la campana conecta al hub; un aviso nuevo actualiza el contador al
  instante, lanza un toast (si existe `window.showToast`, de `UiMetadata.Modal`) y recarga el panel si está abierto. Si el
  hosting no admite WebSockets, SignalR cae solo a Server-Sent Events o long-polling.
- **Respaldo:** mientras el hub no esté conectado, consulta el contador cada `PollSeconds` (60 por defecto) y al volver
  a la pestaña. Al reconectar el hub recupera lo perdido con una consulta.
- **Evento `uinotification`:** cada aviso recibido por el hub se emite como `CustomEvent` en `document` (`detail` = el aviso). Una página
  puede reaccionar a tipos concretos sin acoplarse al script; p. ej. EcoTrack refresca la grilla de transacciones con `import.finished`:
  `document.addEventListener("uinotification", e => { if (e.detail.type === "import.finished") refrescar(); })`.
- **Varias campanas / bandeja en la misma página** comparten el contador.
- **Antiforgery:** las acciones de escritura son POST, así que heredan el filtro global de la app. El JS las envía con
  `window.uiMetadataFetch` (el punto de extensión común de los paquetes `UiMetadata.*`, donde el host añade el token antiforgery en
  la cabecera); **el host debe definirlo antes de cargar `notifications.js`**, o el servidor rechazará con 400 marcar como leído,
  marcar todas y eliminar. Sin él cae a `fetch` a secas (solo válido si el host no exige token).
- **Marcar como leído al abrir un aviso:** es optimista (contador y fila al instante) y va con `keepalive`, porque el mismo clic
  suele navegar a otra página y una petición normal se abortaría antes de llegar al servidor.
- **Icono por severidad:** `severityIcon()` pinta un SVG de línea (no emoji) según `info`/`success`/`warning`/`error`, con fondo
  tintado (`color-mix` sobre el color del tema) y color `currentColor`. Se centra verticalmente contra toda la tarjeta
  (título + cuerpo + hora), no solo contra la primera línea, para que un cuerpo de varias líneas no lo deje "alto". El punto de
  no leído es un marcador independiente, anclado a la esquina superior derecha de la tarjeta.

## Seguridad
- Título y cuerpo se pintan siempre con `textContent`.
- Los enlaces solo se aceptan si son rutas internas (`/x`, no `//x`) o `http(s)`. Se sanea en servidor
  (`NotificationDto.SafeLink`) y otra vez en cliente (`safeLink`); un `javascript:` o `data:` nunca llega a un `href`.
- Todas las acciones están acotadas al usuario de la sesión; borrar o marcar la de otro usuario devuelve 404.

## Personalizar
`NotificationBellModel` permite cambiar URLs, cantidad de avisos del panel (`PanelSize`), el intervalo de respaldo y los
textos (`Texts`, en castellano por defecto). Los colores salen de las variables del tema (`--bg-card`, `--border-soft`,
`--text-main`, `--color-primary`…) y pueden sobrescribirse con los tokens `--notif-*` de `notifications.css`.

## JS y ofuscación
`notifications.js` es un script plano (sin bundler, sin `eval`, sin handlers inline). El único símbolo global es
`window.UiNotifications` (`init`, `refresh`); el resto va en una IIFE y se configura por `data-*`, así que sobrevive a un
ofuscador que renombre variables. Como vive en `_content/UiMetadata.Notifications/`, un paso de ofuscación limitado a
`wwwroot/js` de la app **no lo cubre**: hay que incluir esta ruta si se quiere ofuscar. Pruebas: `npm install && npm test`.

## Límites
- No incluye preferencias de usuario en pantalla (el almacén ya las soporta; falta la UI).
- El hub empuja por usuario en un solo servidor; con varias instancias hace falta un backplane (Redis).
- El texto de la bandeja no está localizado más allá de `Texts`.
