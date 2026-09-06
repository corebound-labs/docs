# UiMetadata.Elements

## Qué es

Elementos de UI atómicos, sin dependencias entre sí: **Switch**,
**ActionButton**, inputs simples de **texto/número/fecha**, **Slider**,
**Select** unificado (FK/enum + subgrid, con cascada opcional), **Badge**/
pill, **Tabs**, **StatusCard**, **SettingsCard** y **Loader** (overlay de
carga global).

Están consolidados en un único paquete a propósito. Cada uno
individualmente es demasiado pequeño (un archivo, sin dependencias entre
sí) para justificar su propio `.csproj` — la regla de decisión de esta
familia es *"¿alguien razonablemente querría A sin B?"*, y nadie pide
"Switch sin Badge". `Modal` y `Grid` sí quedan aparte porque son sistemas
con mecánica propia, no controles atómicos.

## Cuándo usarlo

Para cualquier control visual pequeño y genérico (sin lógica de negocio)
que se repetiría igual en otro proyecto.

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

(Si usás `UiMetadata.Grid`, `_UiMetadataStyles.cshtml`/
`_UiMetadataScripts.cshtml` ya incluyen todo esto.)

## Switch

```csharp
@await Html.PartialAsync("~/Views/Shared/_Switch.cshtml", new UiMetadata.Elements.Models.SwitchModel
{
    Id = "myToggle", Name = "myToggle", Checked = true, Label = "Activo"
})
```

> Nota de paridad: `Disabled` solo decora el `<label class="switch">`,
> nunca añade `disabled` al `<input>` real — réplica intencional del
> markup previo a la extracción.

## ActionButton

```csharp
@await Html.PartialAsync("~/Views/Shared/_ActionButton.cshtml", UiMetadata.Elements.Models.ActionButtonModel.Delete("myDeleteHandler(this)"))
```

Presets: `ActionButtonModel.Edit(onClick, extraCssClass?, title?)`,
`.Delete(...)`, `.Add(onClick, title?)`. Para un botón que no encaja en
ningún preset se sigue construyendo el modelo directamente.

Mismo componente desde JS (usado por subgrids que añaden filas dinámicas):

```js
const editBtn = createEditButton((btn) => editRow(btn.closest("tr")));
const deleteBtn = createDeleteButton((btn) => removeRow(btn));
const btn = createActionButton({ cssClass: "btn-action", text: "📥", onClick: (b) => doImport(b) });
```

## Inputs simples

```csharp
@await Html.PartialAsync("~/Views/Shared/_NumberInput.cshtml", new UiMetadata.Elements.Models.SimpleInputModel
{
    Id = "amount", Name = "amount", AllowDecimals = true
})
```

`_TextInput.cshtml` / `_NumberInput.cshtml` / `_DateInput.cshtml`, todos
sobre el mismo `SimpleInputModel`.

## Slider (range input)

```csharp
@await Html.PartialAsync("~/Views/Shared/_Slider.cshtml", new UiMetadata.Elements.Models.SliderModel
{
    Id = "volume", Name = "volume", Min = 0, Max = 100, Step = 5, Value = "50"
})
```

`ShowValue = true` (default) muestra el valor actual junto al slider,
actualizado en vivo con un `oninput` simple. En `UiMetadata.Grid` se activa
por reflection con `[SliderField(min, max, step)]` (`UiMetadata.Contracts`)
en vez de usarse manualmente.

## Select

Caso simple (sin cascada, sin subgrid):

```csharp
@await Html.PartialAsync("~/Views/Shared/_Select.cshtml", new UiMetadata.Elements.Models.SelectModel
{
    Id = "country", Name = "country",
    Options = countries.Select(c => new UiMetadata.Elements.Models.SelectOption { Id = c.Id, Name = c.Name }).ToList()
})
```

Con cascada (el campo padre necesita `IsCascadeParent = true` para que
`grid.js` — `initCascadeListeners`/`applyCascade` — le añada el listener;
el filtrado en sí sigue viviendo en `grid.js`, no en este paquete):

```csharp
new SelectModel
{
    Id = "Wallet_Id", Name = "Wallet_Id",
    Options = wallets, // cada SelectOption.ParentVal = Account_Id de esa wallet
    PlaceholderValue = "defaultOption",
    CascadeParentField = "Account_Id",
    CascadeForeignKeyInChild = "Account_Id",
}
```

## Badge

```csharp
@await Html.PartialAsync("~/Views/Shared/_Badge.cshtml", new UiMetadata.Elements.Models.BadgeModel { Value = "Owner" })
```

Renderiza `<span class="table-badge" data-badge-value="owner">Owner</span>`.
No trae colores por valor — eso lo decide el consumidor:

```css
[data-badge-value="owner"] { background-color: #2563eb; }
[data-badge-value="edit"]  { background-color: #16a34a; }
```

## Tabs

Pestañas estilo navegador — un strip de botones que muestra un panel a la
vez. Dos formas de usarlo, según de dónde salga el contenido de cada panel:

**Caso 1 — contenido ya resuelto en el render** (partials estáticos, con o
sin modelo), una sola llamada vía `ViewComponent`:

```csharp
@await Component.InvokeAsync("Tabs", new UiMetadata.Elements.Models.TabsPanelsModel
{
    TabsId = "myTabs",
    Tabs =
    [
        new() { Id = "info", Label = "Info", Icon = "ℹ️", BodyPartialView = "~/Views/Shared/_InfoPanel.cshtml", BodyModel = infoVm },
        new() { Id = "history", Label = "Historial", Icon = "🕒", BodyPartialView = "~/Views/Shared/_HistoryPanel.cshtml", BodyModel = historyVm }
    ]
})
```

`BodyPartialView` puede vivir en cualquier feature del proyecto consumidor.
La primera pestaña de la lista queda activa por defecto (`ActiveTabId` para
elegir otra).

**Caso 2 — contenido llenado por JS después del render** (ej. un grid que
carga vía `loadEntity`): usá solo el strip y armá los paneles a mano, con
el mismo prefijo de id que espera `switchTab`:

```csharp
@await Html.PartialAsync("~/Views/Shared/_TabsStrip.cshtml", new UiMetadata.Elements.Models.TabsStripModel
{
    TabsId = "accountDetails",
    Tabs = [ new() { Id = "wallets", Label = "Billeteras", Icon = "💰" }, new() { Id = "cards", Label = "Tarjetas", Icon = "💳" } ]
})

<div id="tabPanel_accountDetails_wallets" class="tab-panel active">
    <div id="wallets-grid" class="partial-container"></div>
</div>
<div id="tabPanel_accountDetails_cards" class="tab-panel">
    <div id="cards-grid" class="partial-container"></div>
</div>
```

El id de cada panel es siempre `tabPanel_{TabsId}_{TabId}` — `switchTab`
busca por ese prefijo en todo el documento, sin exigir un wrapper
particular. `.tab-panel`/`.active` es lo único que toca; no toca contenido.

## StatusCard

Kicker + `<h2>` + `<p>` + acciones — pantalla de "resultado de una acción"
(confirmación de email, reset de password, etc.).

```csharp
@await Html.PartialAsync("~/Views/Shared/_StatusCard.cshtml", new UiMetadata.Elements.Models.StatusCardModel
{
    Kicker = "Estado de validación",
    Title = "Correo confirmado",
    Message = "Ya podés iniciar sesión con tu cuenta.",
    Variant = "success", // null (neutral) | "success" | "danger"
    Actions = [ new() { Text = "Ir al login", Href = Url.Action("Login", "Auth")! } ]
})
```

`Message` se renderiza como HTML de confianza (`Html.Raw`) — pensado para
contenido siempre autor/dev (nunca input de usuario final sin sanitizar);
algunos call sites originales embeben markup simple (`<strong>`) dentro del
mensaje. Cada `Actions[i].CssClass` es libre (default `auth-secondary-link`)
— las clases de botón en sí siguen viviendo en el `auth.css` de la app
consumidora, no son parte de este componente.

## SettingsCard

Kicker + `<h2>` + `<p>` + contenido — envoltorio visual de una tarjeta de
ajustes; el contenido interno (típicamente un `<form>`) lo sigue armando el
consumidor, pasado como template delegate de Razor:

```csharp
@await Html.PartialAsync("~/Views/Shared/_SettingsCard.cshtml", new UiMetadata.Elements.Models.SettingsCardModel
{
    Kicker = "Preferencias",
    Title = "Divisa por defecto",
    Description = "Se usa para convertir tus gráficos y KPIs.",
    Content = @<text>
        <form method="post" asp-action="UpdatePreferences" class="profile-form">
            @* ... *@
        </form>
    </text>
})
```

`Variant = "danger"` (para una "zona de peligro") agrega `is-danger` a la
tarjeta y a su kicker.

## Loader (overlay de carga global)

```csharp
@await Html.PartialAsync("~/Views/Shared/_Loader.cshtml") @* una sola vez, en el <body> del layout *@
```

```js
showLoader(); // antes de un fetch
hideLoader(); // al terminar (éxito o error)
```

Overlay CSS puro (sin GIF) — `showLoader`/`hideLoader` mantienen el mismo
nombre/firma que cualquier implementación anterior basada en imagen, son
parte del contrato que ya invocan `grid.js` y el JS de la app (togglean la
clase `.is-active` sobre `#app-loader`).

## Archivos a tocar/crear al integrarlo en un proyecto nuevo

1. `ProjectReference` + `.AddUiMetadataElements()`.
2. `elements.css`/`tabs.css`/`loader.css` + `elements.js`/`tabs.js`/`loader.js` en el layout.
3. `showLoader()`/`hideLoader()` esperan un `<div id="app-loader">` — incluir `_Loader.cshtml` una vez en el `<body>`.
4. Elegir el partial/`ViewComponent` del control que necesites.

## Design tokens

| Token | Default | Usado por |
|---|---|---|
| `--grid-switch-width` / `-height` / `-thumb-size` | `44px` / `24px` / `18px` | Switch |
| `--grid-switch-off` / `-on` / `-thumb` | `#d1d5db` / `#2563eb` / `#ffffff` | Switch |
| `--grid-radius-sm` | `6px` | Botones de acción |
| `--grid-btn-primary-bg` | `linear-gradient(135deg,#60a5fa,#2563eb)` | Hover de `.btn-add` |
| `--grid-btn-danger-bg-full` | `linear-gradient(135deg,#ff4d4d,#d32f2f)` | Hover de `.btn-delete` |
| `--grid-text-on-btn` | `#ffffff` | Texto sobre botones de color |
| `--grid-table-border-badge` | `1px solid #6b7280` | Borde por defecto del Badge |
| `--grid-switch-on` | `#2563eb` | `accent-color` del Slider |
| `--grid-font-size-sm` | `0.875rem` | Valor mostrado junto al Slider |
| `--grid-border` | `#e5e7eb` | Línea inferior del strip de Tabs |
| `--color-primary` | `#2563eb` | Color de la pestaña activa |
| `--grid-tab-hover-bg` | `rgba(0,0,0,.04)` | Hover de pestaña inactiva |
| `--ui-status-card` (h2/p/is-success/is-danger) | tokens `--text-*`/`--color-*` del tema | StatusCard |
| `--ui-settings-card`/`-header`/`-kicker` | tokens `--glass-*`/`--interactive-accent-*` del tema | SettingsCard |
| `--ui-loader-overlay-bg` | `rgba(0,0,0,.8)` | Loader |
| `--ui-loader-z-index` | `9999` | Loader |
| `--ui-loader-size` / `-thickness` | `64px` / `6px` | Loader |
| `--ui-loader-track` | `rgba(255,255,255,.15)` | Loader |
| `--ui-loader-color` | `var(--color-primary, #7b2ff7)` | Loader |
| `--ui-loader-speed` | `0.8s` | Loader |

**Nota de alcance**: el estilo visual del `<select>` en sí (borde, flecha,
fondo de `<option>`) todavía vive en `UiMetadata.Grid/wwwroot/css/grid.css`
compartido con los inputs — no se separó por el riesgo de tocar un selector
compartido sin poder probarlo en un navegador real. Pendiente para una
limpieza posterior.

## Dependencias

Ninguna de otro paquete `UiMetadata.*` — es de los paquetes base, junto con
`UiMetadata.Contracts`, del que dependen `UiMetadata.Grid`/`UiMetadata.Charts`.
