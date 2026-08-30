# UiMetadata.Elements

## Qué es

Elementos de UI atómicos, sin dependencias entre sí: Switch, ActionButton,
inputs simples (texto/número/fecha), Select unificado (FK/enum + subgrid,
con cascada opcional), Badge/pill, Tabs, StatusCard, SettingsCard y el
Loader (overlay de carga global).

## Cuándo usarlo

Para cualquier control visual pequeño y genérico (sin lógica de negocio)
que se repetiría igual en otro proyecto — un toggle, un botón de
acción con ícono, una tarjeta de "resultado de una acción" o de "sección de
ajustes".

## Instalación

```xml
<ProjectReference Include="..\Commons\UIMetadata\UiMetadata.Elements\UiMetadata.Elements.csproj" />
```

```csharp
builder.Services.AddControllersWithViews()
    .AddUiMetadataElements();
```

```html
<link rel="stylesheet" href="~/_content/UiMetadata.Elements/css/elements.css" />
<link rel="stylesheet" href="~/_content/UiMetadata.Elements/css/tabs.css" />
<link rel="stylesheet" href="~/_content/UiMetadata.Elements/css/loader.css" />
<script src="~/_content/UiMetadata.Elements/js/elements.js"></script>
<script src="~/_content/UiMetadata.Elements/js/tabs.js"></script>
<script src="~/_content/UiMetadata.Elements/js/loader.js"></script>
```

(Si usás `UiMetadata.Grid`, `_UiMetadataStyles.cshtml`/`_UiMetadataScripts.cshtml` ya incluyen todo esto.)

## Ejemplo mínimo de uso

```csharp
@await Html.PartialAsync("~/Views/Shared/_Switch.cshtml", new UiMetadata.Elements.Models.SwitchModel
{
    Id = "myToggle", Name = "myToggle", Checked = true, Label = "Activo"
})
```

```csharp
@await Html.PartialAsync("~/Views/Shared/_StatusCard.cshtml", new UiMetadata.Elements.Models.StatusCardModel
{
    Kicker = "Estado", Title = "Correo confirmado", Message = "Ya podés iniciar sesión.",
    Variant = "success",
    Actions = [ new() { Text = "Ir al login", Href = Url.Action("Login", "Auth")! } ]
})
```

## Archivos a tocar/crear al integrarlo en un proyecto nuevo

1. `ProjectReference` + `.AddUiMetadataElements()`.
2. `elements.css`/`tabs.css`/`loader.css` + `elements.js`/`tabs.js`/`loader.js` en el layout.
3. `showLoader()`/`hideLoader()` (loader.js) esperan un `<div id="app-loader">` — incluir `_Loader.cshtml` una vez en el `<body>`.
4. Elegir el partial/`ViewComponent` del control que necesites (ver tabla de componentes en el README completo del paquete).

## Componentes incluidos

| Componente | Tipo | Notas |
|---|---|---|
| Switch | Partial | `Disabled` solo decora el label, no el input (paridad con markup anterior). |
| ActionButton | Partial + helper JS | Presets `.Edit()`/`.Delete()`/`.Add()`; también construible desde JS (`createActionButton`). |
| TextInput/NumberInput/DateInput | Partial | Todos sobre `SimpleInputModel`. |
| Slider | Partial | Range input con valor visible opcional. |
| Select | Partial | Con o sin cascada (`IsCascadeParent`) — el filtrado en sí lo resuelve `grid.js`. |
| Badge | Partial | `<span data-badge-value="...">` — el color por valor lo define el consumidor vía CSS. |
| Tabs | ViewComponent / Partial | Dos modos: contenido resuelto en render vs. paneles llenados por JS. |
| StatusCard | Partial | Kicker + h2 + p + acciones. |
| SettingsCard | Partial | Kicker + h2 + p + contenido (template delegate). |
| Loader | Partial | Overlay de carga global, `showLoader()`/`hideLoader()`. |

## Design tokens

| Token | Default | Usado por |
|---|---|---|
| `--grid-switch-width` / `-height` / `-thumb-size` | `44px` / `24px` / `18px` | Switch |
| `--grid-switch-off` / `-on` / `-thumb` | `#d1d5db` / `#2563eb` / `#ffffff` | Switch |
| `--grid-radius-sm` | `6px` | Botones de acción |
| `--grid-btn-primary-bg` / `--grid-btn-danger-bg-full` | ver Modal | Hover de `.btn-add`/`.btn-delete` |
| `--grid-tab-hover-bg` | `rgba(0,0,0,.04)` | Hover de pestaña inactiva |
| `--ui-status-card` (h2/p/is-success/is-danger) | tokens `--text-*`/`--color-*` de tema | StatusCard |
| `--ui-settings-card` (header/kicker) | tokens `--glass-*`/`--interactive-accent-*` de tema | SettingsCard |
| `--ui-loader-overlay-bg` / `-z-index` / `-size` / `-thickness` / `-track` / `-color` / `-speed` | `rgba(0,0,0,.8)` / `9999` / `64px` / `6px` / `rgba(255,255,255,.15)` / `var(--color-primary, #7b2ff7)` / `0.8s` | Loader |

## Dependencias

Ninguna de otro paquete `UiMetadata.*` — es de los paquetes base, junto con
`UiMetadata.Contracts`, del que dependen `UiMetadata.Grid`/`UiMetadata.Charts`.
