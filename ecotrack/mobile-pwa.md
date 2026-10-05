# Móvil y PWA

EcoTrack se usa desde el teléfono como una **PWA instalable**: un icono en la pantalla de inicio, a pantalla completa y sin
la barra del navegador.

## Instalar

**iPhone (Safari)** — tiene que ser Safari; otros navegadores no ofrecen la opción:

1. Abre EcoTrack en Safari.
2. Pulsa **Compartir** (el cuadrado con la flecha hacia arriba).
3. **Añadir a pantalla de inicio** → **Añadir**.

**Android (Chrome):** menú de tres puntos → **Instalar aplicación** (o *Añadir a pantalla de inicio*).

## Qué hace y qué no hace sin conexión

El *service worker* (`wwwroot/sw.js`) es deliberadamente mínimo: si una navegación falla por falta de red muestra
`/offline.html` en vez del error del navegador. **No guarda páginas, datos ni JSON** (son datos financieros, también de otras
personas en cuentas compartidas) ni intercepta peticiones que no sean navegaciones GET del propio sitio.

## Notch, barra de inicio y teclado

- `viewport-fit=cover` y `env(safe-area-inset-*)`: el contenido respeta el notch y la barra inferior del iPhone.
- Alturas con `100dvh` (con `100vh` de respaldo): siguen la parte visible cuando la barra del navegador se esconde.
- **Importes negativos**: el teclado numérico de iOS no tiene la tecla "-". Los campos numéricos que admiten negativos
  (importe de una transacción, "Saldo actual") llevan un botón **±** al lado que invierte el signo. Ver
  [UiMetadata.Elements](/packages/uimetadata-elements.md).
- Los campos de texto miden al menos **16 px**, para que iOS no haga zoom al enfocarlos; los botones principales, al menos
  **44 px** de alto.

## Aviso de "hay una versión nueva"

Un teléfono o la PWA instalada pueden seguir mostrando una versión vieja tras un despliegue. La página lleva la versión con
la que se renderizó (`<meta name="app-version">`) y la compara con `GET /health` al cargar, al volver a primer plano y cada
10 minutos (como mucho una vez cada 30 s). Si difieren aparece un aviso abajo, sin bloquear nada:

- **Actualizar** pide al service worker que se actualice y recarga la página.
- **×** lo oculta para esa versión (en `sessionStorage`; una versión posterior lo vuelve a mostrar).

Sin red, o con cualquier error, no se muestra nada.

### `GET /health`

Anónimo, sin datos y con `Cache-Control: no-store`: `{"status":"ok","version":"v1.311.0-10042"}`. La misma versión que
muestra el pie. Ver [Versiones](/ecotrack/versioning.md).

## Pruebas móviles automáticas (CI)

El workflow **Mobile tests** corre en cada PR y en cada push a `develop`/`master`: compila EcoTrack, lo arranca contra un SQL
Server efímero y ejecuta, con un teléfono emulado (iPhone SE y Pixel 7):

- **Playwright** (`EcoTrack.MobileTests`), en `/Auth/Login` y `/Auth/Register`: sin scroll horizontal, campos de al menos 16 px,
  botones de envío de al menos 44 px, `viewport-fit=cover`, sin violaciones de CSP, manifest e iconos, service worker,
  página offline, que no se cachee HTML, `/health` y el aviso de versión nueva.
- **Lighthouse** (móvil) con mínimos: rendimiento 60, accesibilidad 85, buenas prácticas 80.

Para la CI la app arranca con `Infisical__Disabled=true`, una clave de cifrado y credenciales de Google falsas: nada de eso
llega a producción (`Infisical:Disabled` es `false` por defecto).

### Leer un fallo sin descargar logs

Los errores salen como **anotaciones** del job: los fallos de Playwright, la comprobación inicial de las páginas (estado HTTP y
principio del HTML) y, si la app devuelve 500, las últimas excepciones de la tabla `LOG__ErrorLogs`. Los informes completos
(HTML de Playwright y de Lighthouse) se suben como artefacto `mobile-reports`.

Pendiente: pruebas con sesión iniciada ([EcoTrack#149](https://github.com/corebound-labs/EcoTrack/issues/149)).
