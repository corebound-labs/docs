# UiMetadata.Sidebar

## Qué es

Sidebar de navegación colapsable + drawer mobile: chrome visual y mecánica
(colapsar/expandir en desktop, abrir/cerrar como drawer en mobile con
overlay, persistencia del estado colapsado, resaltado de link activo).
Ningún contenido de negocio vive acá — marca, links y acciones de footer
los define el consumidor.

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

```csharp
@using UiMetadata.Sidebar.Models
@{
    var sidebarModel = new SidebarModel
    {
        Brand = new SidebarBrandModel { Controller = "Home", Action = "Index", Mark = "E", Title = "MiApp", Subtitle = "..." },
        NavItems = [ new() { Controller = "Home", Action = "Index", Title = "Inicio", Subtitle = "...", IconSvg = "<svg viewBox='0 0 24 24'>...</svg>" } ],
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

## Archivos a tocar/crear al integrarlo en un proyecto nuevo

1. `ProjectReference` + `.AddUiMetadataSidebar()`.
2. `sidebar.css`/`sidebar.js` en el layout.
3. El `.app-shell`/`.app-main-shell`/topbar del layout — el paquete no lo genera, solo el `<div>` del sidebar en sí.
4. Un botón con `id="appSidebarToggle"` en algún lugar del DOM (típicamente el topbar) — `sidebar.js` lo busca por ese id.
5. `IconSvg` de cada `NavItem`/`FooterAction` — el paquete no trae ningún set de íconos propio, se pasa markup SVG completo (se renderiza con `Html.Raw`).
6. Opcional: `sidebarModel.StorageKey` si ya tenías una clave de `localStorage` propia y no querés perder el estado colapsado de usuarios existentes.

## Design tokens

28 tokens de color con fallback (`--glass-bg`, `--glass-border`, etc.) más
tokens de espaciado/radio/ícono/tipografía propios
(`--sidebar-radius-sm/-md/-lg/-pill`, `--sidebar-icon-size`,
`--sidebar-btn-size`, `--sidebar-gap-xs/-md`, `--sidebar-font-size-xs/-sm`)
— todos con fallback al valor que EcoTrack ya tenía en `theme-dark.css`, así
un consumidor nuevo sin tema propio obtiene un sidebar con estilo completo.
Ver `wwwroot/css/sidebar.css` para la lista completa.

## Dependencias

Ninguna de otro paquete `UiMetadata.*` — dos tokens de espaciado
(`--grid-gap-md`/`--grid-gap-xs`) se reusan de `grid.css` por coincidir
exacto, pero no es una dependencia real (son solo nombres de variable, con
fallback propio si `grid.css` no está cargado).
