# UiMetadata.Sidebar

## Qué es

Sidebar de navegación colapsable + drawer mobile: chrome visual y mecánica
(colapsar/expandir en desktop, abrir/cerrar como drawer en mobile con
overlay, persistencia del estado colapsado, resaltado de link activo).
Ningún contenido de negocio vive acá — marca, links y acciones de footer
los define el consumidor.

Es su propio paquete (no vive en `UiMetadata.Elements`) por el mismo motivo
que `UiMetadata.Modal`: es un sistema con su propia mecánica de
interacción, no un control atómico.

## Cuándo usarlo

Cuando tu app tiene un shell con sidebar de navegación lateral y no querés
reescribir la mecánica de colapsar/mobile-drawer/persistencia de estado por
cada proyecto — solo tu propia lista de links/marca cambia entre apps.

## Instalación

```xml
<ProjectReference Include="..\Commons\UIMetadata\UiMetadata.Sidebar\UiMetadata.Sidebar.csproj" />
```

```csharp
builder.Services.AddControllersWithViews()
    .AddUiMetadataSidebar();
```

```html
<link rel="stylesheet" href="~/_content/UiMetadata.Sidebar/css/sidebar.css" />
<script src="~/_content/UiMetadata.Sidebar/js/sidebar.js"></script>
```

## Ejemplo mínimo de uso

En el `_Layout.cshtml` del consumidor, dentro del `.app-shell` (el propio
layout sigue siendo dueño de esa estructura, de `.app-main-shell`, el
topbar, y de `@RenderBody()`):

```csharp
@using UiMetadata.Sidebar.Models
@{
    var sidebarModel = new SidebarModel
    {
        Brand = new SidebarBrandModel { Controller = "Home", Action = "Index", Mark = "E", Title = "MiApp", Subtitle = "..." },
        NavItems =
        [
            new() { Controller = "Home", Action = "Index", Title = "Inicio", Subtitle = "...", IconSvg = "<svg viewBox='0 0 24 24'>...</svg>" }
        ],
        FooterActions =
        [
            new() { Title = "Perfil", Controller = "Profile", Action = "Index", IconSvg = "<svg ...>" },
            new() { Title = "Cerrar sesión", PostController = "Auth", PostAction = "Logout", IconSvg = "<svg ...>" }
        ],
        FooterNoteLabel = "Vista actual",
        FooterNoteValue = pageTitle
    };
}
<div class="app-shell">
    @await Html.PartialAsync("~/Views/Shared/_Sidebar.cshtml", sidebarModel)
    <div class="app-main-shell">
        <header class="app-topbar">
            <button class="app-sidebar-toggle" id="appSidebarToggle" type="button" aria-label="Abrir menu">
                <span></span><span></span><span></span>
            </button>
        </header>
        <main role="main" class="app-main-content">@RenderBody()</main>
    </div>
</div>
```

- `IconSvg` es markup SVG completo, no un nombre de ícono de ningún set —
  el paquete no trae ninguno propio, cada consumidor pega el suyo
  (renderizado con `Html.Raw`).
- El **estado activo** (`.is-active`) se resuelve adentro de
  `_Sidebar.cshtml` leyendo `ViewContext.RouteData` directamente — el
  consumidor no pasa el controller/action actual ni escribe su propio
  `NavClass`.
- `FooterActions`: cada ítem es un link GET (`Controller`/`Action`) o un
  `<form>` POST con antiforgery (`PostController`/`PostAction`, ej.
  logout) — mutuamente excluyentes, el POST gana si ambos están seteados.
- `id="appSidebarToggle"` (botón hamburguesa del topbar) es lo único que el
  layout consumidor declara por fuera de la partial — `sidebar.js` lo
  busca por ese id donde sea que esté en el DOM.

## `StorageKey`

```csharp
sidebarModel.StorageKey = "miApp.sidebar.collapsed"; // default: "uiMetadataSidebar.collapsed"
```

Clave de `localStorage` donde se persiste si el sidebar quedó colapsado.
Un consumidor que ya tenía la suya (ej. EcoTrack: `"ecotrack.sidebar.collapsed"`)
puede seguirla usando acá, para no perder el estado ya guardado de usuarios
existentes al migrar.

## Archivos a tocar/crear al integrarlo en un proyecto nuevo

1. `ProjectReference` + `.AddUiMetadataSidebar()`.
2. `sidebar.css`/`sidebar.js` en el layout.
3. El `.app-shell`/`.app-main-shell`/topbar del layout — el paquete no lo genera, solo el `<div>` del sidebar en sí.
4. Un botón con `id="appSidebarToggle"` en algún lugar del DOM (típicamente el topbar).
5. `IconSvg` de cada `NavItem`/`FooterAction`.
6. Opcional: `sidebarModel.StorageKey` si ya tenías una clave de `localStorage` propia.

## De dónde salió esto (contexto de migración)

Extraído de `_Layout.cshtml` (markup + JS inline) y de `common.css` (todo
lo `.app-sidebar*`/`.app-nav*`/`.app-topbar*`/`.app-shell`/
`.app-main-shell`/`.app-overlay`/`body.sidebar-open`/`body.sidebar-collapsed`).
El CSS se movió tal cual (mismos selectores/variables) y en una ronda
posterior se le agregó fallback a los 28 tokens de color, con el valor que
el consumidor original ya tenía definido — así un consumidor nuevo sin
tema propio obtiene un sidebar con estilo completo en vez de sin fondo/
sombra/bordes.

Lo que **no** se movió, y queda en cada proyecto consumidor: el propio
`_Layout.cshtml` (head, scripts, `@RenderBody()`), el sistema de temas
(claro/oscuro), el topbar (título de página, ícono hamburguesa — solo
necesita `id="appSidebarToggle"`), y todo el contenido real (marca, links,
acciones de footer).

## Design tokens

28 tokens de color con fallback (`--glass-bg`, `--glass-border`, etc.) más
tokens de espaciado/radio/ícono/tipografía propios:

| Token | Uso |
|---|---|
| `--sidebar-radius-sm`/`-md`/`-lg`/`-pill` | Radios de esquina de items/botones |
| `--sidebar-icon-size` | Tamaño de los íconos SVG de nav |
| `--sidebar-btn-size` | Tamaño del botón hamburguesa/toggle |
| `--sidebar-icon-svg-size` | Tamaño interno del SVG dentro del ícono |
| `--sidebar-gap-xs`/`-md` | Espaciado interno |
| `--sidebar-font-size-xs`/`-sm` | Tipografía de subtítulos/labels |

Dos casos (`--grid-gap-md`/`--grid-gap-xs`) reusan tokens de `grid.css` por
coincidir exacto — no es una dependencia real, son solo nombres de
variable, con fallback propio si `grid.css` no está cargado.

## Dependencias

Ninguna de otro paquete `UiMetadata.*`.
