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

<style>
.dd-box { border: 1px solid #e5e7eb; border-radius: 10px; padding: 1.1rem 1.3rem; margin: 1rem 0 1.6rem; background: #fafafa; }
.dd-box code.dd-out { font-size: .82rem; color: #6b7280; }
/* Switch */
.dd-switch { position: relative; display: inline-block; width: 44px; height: 24px; vertical-align: middle; }
.dd-switch input { opacity: 0; width: 0; height: 0; }
.dd-switch .dd-slider { position: absolute; cursor: pointer; inset: 0; background-color: #d1d5db; border-radius: 24px; transition: background-color .2s; }
.dd-switch .dd-slider::before { content: ""; position: absolute; height: 18px; width: 18px; left: 3px; bottom: 3px; background: #fff; border-radius: 50%; transition: transform .2s; box-shadow: 0 1px 2px rgba(0,0,0,.3); }
.dd-switch input:checked + .dd-slider { background-color: #2563eb; }
.dd-switch input:checked + .dd-slider::before { transform: translateX(20px); }
/* ActionButton */
.dd-action-btn { display: inline-flex; align-items: center; justify-content: center; width: 34px; height: 34px; border: none; border-radius: 6px; cursor: pointer; color: #fff; font-size: 15px; margin-right: 8px; transition: filter .15s, transform .1s; }
.dd-action-btn:active { transform: scale(.93); }
.dd-action-btn:hover { filter: brightness(1.08); }
.dd-action-btn.dd-edit { background: linear-gradient(135deg,#60a5fa,#2563eb); }
.dd-action-btn.dd-delete { background: linear-gradient(135deg,#ff4d4d,#d32f2f); }
.dd-action-btn.dd-add { background: linear-gradient(135deg,#4ade80,#16a34a); }
/* Badge */
.dd-badge { display: inline-flex; align-items: center; padding: 3px 10px; border-radius: 999px; color: #fff; font-size: .78rem; font-weight: 600; margin-right: 8px; }
/* Tabs */
.dd-tabs-strip { display: flex; gap: 4px; border-bottom: 1px solid #e5e7eb; margin-bottom: .9rem; }
.dd-tab-btn { border: none; background: transparent; padding: 8px 14px; cursor: pointer; font-size: .88rem; color: #6b7280; border-bottom: 2px solid transparent; }
.dd-tab-btn.dd-active { color: #2563eb; border-bottom-color: #2563eb; font-weight: 600; }
.dd-tab-panel { display: none; }
.dd-tab-panel.dd-active { display: block; }
/* StatusCard / SettingsCard */
.dd-status-card { display: grid; gap: .6rem; padding: 1rem 1.2rem; border-radius: 10px; background: #fff; border: 1px solid #e5e7eb; }
.dd-status-card.dd-success { border-left: 4px solid #16a34a; }
.dd-status-card.dd-danger { border-left: 4px solid #dc2626; }
.dd-status-card h4 { margin: 0; }
.dd-status-card p { margin: 0; color: #6b7280; }
.dd-kicker { display: inline-flex; width: fit-content; padding: 3px 9px; border-radius: 999px; background: rgba(37,99,235,.12); color: #2563eb; font-size: .72rem; font-weight: 700; letter-spacing: .04em; text-transform: uppercase; }
.dd-btn-link { color: #2563eb; text-decoration: none; font-size: .85rem; cursor: pointer; background: none; border: 1px solid #2563eb; border-radius: 6px; padding: 5px 10px; }
/* Loader */
.dd-loader-demo-btn { padding: 7px 14px; border-radius: 6px; border: 1px solid #2563eb; color: #2563eb; background: #fff; cursor: pointer; }
.dd-loader-overlay { display: none; position: fixed; inset: 0; background: rgba(0,0,0,.75); z-index: 9999; align-items: center; justify-content: center; }
.dd-loader-overlay.dd-active { display: flex; }
.dd-loader-spinner { width: 54px; height: 54px; border: 5px solid rgba(255,255,255,.2); border-top-color: #7b2ff7; border-radius: 50%; animation: dd-spin .8s linear infinite; }
@keyframes dd-spin { to { transform: rotate(360deg); } }
</style>

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

**Demo en vivo** — click para togglear:

<div class="dd-box">
  <label class="dd-switch">
    <input type="checkbox" checked id="dd-switch-1" onchange="document.getElementById('dd-switch-1-label').textContent = this.checked ? 'Activo' : 'Inactivo'">
    <span class="dd-slider"></span>
  </label>
  <span id="dd-switch-1-label" style="margin-left:10px;">Activo</span>
</div>

## ActionButton

```csharp
@await Html.PartialAsync("~/Views/Shared/_ActionButton.cshtml", UiMetadata.Elements.Models.ActionButtonModel.Delete("myDeleteHandler(this)"))
```

Presets: `ActionButtonModel.Edit(onClick, extraCssClass?, title?)`,
`.Delete(...)`, `.Clone(...)`, `.Add(onClick, title?)`. Para un botón que no
encaja en ningún preset se sigue construyendo el modelo directamente.

Mismo componente desde JS (usado por subgrids que añaden filas dinámicas):

```js
const editBtn = createEditButton((btn) => editRow(btn.closest("tr")));
const deleteBtn = createDeleteButton((btn) => removeRow(btn));
const btn = createActionButton({ cssClass: "btn-action", text: "📥", onClick: (b) => doImport(b) });
```

**Demo en vivo** — los 3 presets:

<div class="dd-box">
  <button class="dd-action-btn dd-edit" title="Editar" onclick="document.getElementById('dd-action-out').textContent = 'Editar clickeado'">✏️</button>
  <button class="dd-action-btn dd-delete" title="Eliminar" onclick="document.getElementById('dd-action-out').textContent = 'Eliminar clickeado'">🗑️</button>
  <button class="dd-action-btn dd-add" title="Agregar" onclick="document.getElementById('dd-action-out').textContent = 'Agregar clickeado'">➕</button>
  <div style="margin-top:.6rem;"><code class="dd-out" id="dd-action-out">(click un botón)</code></div>
</div>

## Handlers declarativos (`data-ui-onclick`) y Content-Security-Policy

Con una CSP sin `'unsafe-inline'` en `script-src`, el navegador **bloquea todo
atributo `onclick="..."` / `onchange="..."` / `oninput="..."`** (y todo `<script>`
en línea sin nonce). Por eso los componentes del paquete ya no emiten atributos
`onXXX`: emiten `data-ui-onclick`, `data-ui-onchange` o `data-ui-oninput`, y un
único listener delegado en `elements.js` los ejecuta.

```html
<a data-ui-onclick="miHandler('id-1', 3, this)">…</a>
<input type="checkbox" data-ui-onchange="toggleAlgo('x', this.checked)" />
```

- El valor usa el **mismo formato de siempre**, `funcion(args)`: por eso
  `ActionButtonModel.OnClick`, `ModalActionsModel.CancelOnClick/SaveOnClick`,
  `ClearButtonOnClick` y `GridRowAction` siguen recibiendo el mismo string y **no
  hay que cambiar ningún call site**. La función tiene que ser global
  (`window.miHandler`), también con ruta (`App.ui.abrir(...)`).
- **No se usa `eval`** (tampoco lo permite la CSP): la expresión se interpreta con un
  mini-analizador que solo entiende `nombre(args)` con argumentos literales
  (`'texto'`, `"texto"`, `12`, `-1.5`, `true`, `false`, `null`) y las referencias
  `this` (el elemento con el atributo), `event` y sus propiedades (`this.checked`,
  `this.value`, `event.target`). Cualquier otra cosa (`if (...)`, `a.b().c()`,
  varias sentencias) se ignora con un `console.error`, no se ejecuta: hay que
  moverla a una función con nombre. Ej.: `closeChartModalOnBackdrop(event, this)` en
  vez de `if (event.target === event.currentTarget) closeChartModal()` (el listener
  delegado no tiene `currentTarget`, por eso `this` se pasa como argumento).
- Conserva la semántica del inline: se ejecutan también los de los ancestros (de
  adentro hacia afuera), y si un handler llama `event.stopPropagation()` no siguen ni
  los ancestros ni los demás listeners de `document` (ej. el clic de fila de
  `grid.js`), tal como pasaba con el `onclick` en línea.
- `button.onclick = fn` asignado **desde JS** no lo bloquea la CSP (solo los
  atributos); no hace falta migrarlo. Sí hay que migrar los `onclick="..."` dentro de
  strings HTML armados en JS (`innerHTML = \`<button onclick=…>\``).

### Nonce para `<script>` en línea: `CspNonceTagHelper`

`UiMetadata.Elements.TagHelpers.CspNonceTagHelper` agrega `nonce="..."` a todo
`<script>` en línea (sin `src`) de las vistas. El paquete **no genera el nonce ni la
cabecera CSP** (mismo criterio que `window.uiMetadataFetch`: el RCL da el punto de
extensión, la app decide la política): el consumidor genera un valor por petición y
lo deja en `HttpContext.Items[CspNonceTagHelper.HttpContextItemKey]`.

```csharp
// Program.cs — middleware, antes de UseStaticFiles
app.Use(async (context, next) =>
{
    var nonce = Convert.ToBase64String(RandomNumberGenerator.GetBytes(16));
    context.Items[CspNonceTagHelper.HttpContextItemKey] = nonce;
    context.Response.Headers["Content-Security-Policy"] =
        $"default-src 'self'; script-src 'self' 'nonce-{nonce}'; script-src-attr 'none'; …";
    await next();
});
```

```cshtml
@* _ViewImports.cshtml de la app y de cada RCL con <script> en línea (ej. UiMetadata.Grid) *@
@addTagHelper *, UiMetadata.Elements
```

Sin valor en `Items` (consumidor sin CSP) el helper no toca el tag: es inocuo si no se
usa. Un `<script src="...">` no lleva nonce (lo autoriza `'self'` o el CDN de la
política).

`syncSliderValue(targetId, source)` y `submitFormById(formId)` (`elements.js`)
son las dos funciones que reemplazan a los únicos `onclick`/`oninput` del paquete
que no eran una llamada simple.

## Inputs simples

```csharp
@await Html.PartialAsync("~/Views/Shared/_NumberInput.cshtml", new UiMetadata.Elements.Models.SimpleInputModel
{
    Id = "amount", Name = "amount", AllowDecimals = true
})
```

`_TextInput.cshtml` / `_NumberInput.cshtml` / `_DateInput.cshtml` /
`_TextAreaInput.cshtml`, todos sobre el mismo `SimpleInputModel`
(`_TextAreaInput` usa además `Rows`, default 3). Los tres primeros llevan
`autocomplete="off"` fijo.

### `_NumberInput.cshtml` — decimal regionalizado, no `<input type="number">` nativo

`type="number"` nativo siempre usa `.` como decimal sin importar el idioma
del navegador — un usuario en español no podía tipear `1931,25` ni pegar
`1.931,25 €` sin que se destrozara (`1.93125`). Ahora es
`<input type="text" class="ui-number-input">`; `initNumberInputs()`
(`elements.js`) muestra/acepta el valor en el formato de la región del
navegador (`Intl.NumberFormat`). El valor que viaja en el submit sigue
siendo invariante (`.` decimal) — se convierte al armar el `FormData`
(`grid.js`), así que el backend no cambia.

Al pegar, si aparecen `,` y `.`, el de más a la derecha es el decimal
(funciona con cualquier formato regional, pegue lo que pegue el usuario).
Con un solo separador, se compara contra el separador de miles real de la
región para no confundir "1.500" (mil quinientos) con "1,5". Para setear
el valor por JS, `syncNumberInputValue(field, invariantValue)` en vez de
`field.value = ...`.

**Símbolo de moneda opt-in** vía `[CurrencyField(Symbol = "€")]`
(`UiMetadata.Contracts`) — prefijo puramente visual dentro del input, superpuesto
con CSS (`.ui-number-input-wrapper`), nunca forma parte del valor que viaja
en el submit. Sin el atributo, el `<input>` se renderiza suelto como antes.

### `_TextAreaInput.cshtml` — opt-in vía `[TextAreaField]`

Cualquier propiedad `string` del ViewModel marcada `[TextAreaField(Rows = 5)]`
(`UiMetadata.Contracts`) se renderiza como `<textarea>` en vez de
`<input type="text">`. Sin el atributo, sigue siendo `_TextInput.cshtml`
como siempre; en un tipo que no sea `string` se ignora en silencio (mismo
criterio que `[SliderField]`).

### `_DateInput.cshtml` — flatpickr, no `<input type="date">` nativo

El picker nativo de `type="date"` no se puede tematizar (vive fuera del
DOM) — en dark mode queda un calendario blanco de fábrica. El input real es
`<input type="text" class="ui-date-input">`; `initDateInputs()`
(`elements.js`) le engancha [flatpickr](https://flatpickr.js.org/), tema
oscuro en `elements.css`.

Dependencia real de runtime (no opcional, a diferencia de
`UiMetadata.Charts`): flatpickr se carga global vía
`_UiMetadataStyles.cshtml`/`_UiMetadataScripts.cshtml` porque cualquier
grid con un campo de fecha lo usa. `altInput: true` mantiene el valor ISO
real (`Y-m-d`) en el input oculto que viaja en el submit, mostrando
`d/m/Y` al usuario en un input separado. Para setear el valor por JS sin
desincronizar ese alt input, usar `syncDateInputValue(field, isoValue)` en
vez de `field.value = ...` — es lo que usa `UiMetadata.Modal` en
`fillModalForm`/`clearModalForm`. `data-min-today="true"` en el input
equivale a `minDate: "today"`.

`allowInput: true` deja tipear/pegar directo en el input visible, no solo
elegir del calendario — `parseLocalizedDate` (`elements.js`) acepta ISO
(`2023-08-31`) además de `d/m/y` con `-`/`.`/`/`, más flexible que el
`altFormat` estricto que flatpickr reconoce solo. Un formato no válido
revierte al valor anterior con un `toastWarning`.

**Navegación rápida de mes y año**: el `<select>` nativo de mes tiene un popup
del sistema operativo que no se puede tematizar (en Chrome/Windows queda
blanco). Se usa `monthSelectorType: "static"` y `attachCustomMonthDropdown(fp)`
(`elements.js`) engancha menús propios: clic en el mes → los 12 meses, clic en
el año → lista de años (rango de `minDate`/`maxDate` si existen, si no −80/+10).
Sirve también para pickers con `showMonths > 1` (rango del dashboard). Además el
header queda centrado con texto blanco, y el calendario acompaña al campo cuando
se scrollea el modal (`onOpen`/`onClose` reposicionan con el scroll interno).

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

**Demo en vivo**:

<div class="dd-box">
  <input type="range" min="0" max="100" step="5" value="50" style="accent-color:#2563eb; vertical-align:middle;" oninput="document.getElementById('dd-slider-out').textContent = this.value">
  <span id="dd-slider-out" style="margin-left:10px; font-weight:600;">50</span>
</div>

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

**Demo en vivo** — elegir un país filtra las ciudades del segundo select
(la misma mecánica que resuelve `applyCascade` en `grid.js`):

<div class="dd-box">
  <select id="dd-country" style="padding:5px 8px; border-radius:6px; border:1px solid #d1d5db;" onchange="
    var city = document.getElementById('dd-city');
    var opts = { ar: ['Buenos Aires','Córdoba','Rosario'], es: ['Madrid','Barcelona','Valencia'], mx: ['CDMX','Guadalajara','Monterrey'] };
    city.innerHTML = opts[this.value].map(function(c){ return '<option>' + c + '</option>'; }).join('');
  ">
    <option value="ar">Argentina</option>
    <option value="es">España</option>
    <option value="mx">México</option>
  </select>
  <select id="dd-city" style="padding:5px 8px; border-radius:6px; border:1px solid #d1d5db; margin-left:8px;">
    <option>Buenos Aires</option>
    <option>Córdoba</option>
    <option>Rosario</option>
  </select>
</div>

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

**Demo en vivo** — colores puestos por el consumidor, no por el paquete:

<div class="dd-box">
  <span class="dd-badge" style="background:#2563eb;">Owner</span>
  <span class="dd-badge" style="background:#16a34a;">Edit</span>
  <span class="dd-badge" style="background:#6b7280;">Read-only</span>
</div>

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

**Demo en vivo**:

<div class="dd-box">
  <div class="dd-tabs-strip">
    <button class="dd-tab-btn dd-active" onclick="ddSwitchTab(this,'dd-tp-info')">ℹ️ Info</button>
    <button class="dd-tab-btn" onclick="ddSwitchTab(this,'dd-tp-hist')">🕒 Historial</button>
  </div>
  <div id="dd-tp-info" class="dd-tab-panel dd-active">Contenido del panel "Info" — cualquier partial estático.</div>
  <div id="dd-tp-hist" class="dd-tab-panel">Contenido del panel "Historial" — otro partial, sin relación con el primero.</div>
</div>

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

**Demo en vivo** — cambiá la variante:

<div class="dd-box">
  <div style="margin-bottom:.8rem;">
    <button class="dd-btn-link" onclick="ddSetStatusVariant('dd-status-card','')">Neutral</button>
    <button class="dd-btn-link" onclick="ddSetStatusVariant('dd-status-card','dd-success')">Success</button>
    <button class="dd-btn-link" onclick="ddSetStatusVariant('dd-status-card','dd-danger')">Danger</button>
  </div>
  <div id="dd-status-card" class="dd-status-card dd-success">
    <span class="dd-kicker">Estado de validación</span>
    <h4>Correo confirmado</h4>
    <p>Ya podés iniciar sesión con tu cuenta.</p>
    <div><a class="dd-btn-link" style="text-decoration:none;">Ir al login</a></div>
  </div>
</div>

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

**Demo en vivo**:

<div class="dd-box">
  <div class="dd-status-card" style="border-left:none;">
    <span class="dd-kicker">Preferencias</span>
    <h4>Divisa por defecto</h4>
    <p>Se usa para convertir tus gráficos y KPIs.</p>
    <div>
      <select style="padding:5px 8px; border-radius:6px; border:1px solid #d1d5db;">
        <option>EUR — Euro</option>
        <option>USD — Dólar</option>
      </select>
      <button class="dd-btn-link" style="margin-left:8px;">Guardar preferencias</button>
    </div>
  </div>
</div>

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

**Demo en vivo** (1.5s):

<div class="dd-box">
  <button class="dd-loader-demo-btn" onclick="
    var o = document.getElementById('dd-loader-overlay');
    o.classList.add('dd-active');
    setTimeout(function(){ o.classList.remove('dd-active'); }, 1500);
  ">Mostrar loader</button>
</div>
<div id="dd-loader-overlay" class="dd-loader-overlay"><div class="dd-loader-spinner"></div></div>

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

## ThemePicker (selector de tema con vista previa)

Una tarjeta por tema con una miniatura de la app pintada con los **colores reales** de ese
tema, y vista previa en vivo: al elegir una tarjeta se aplica el tema a toda la página sin
guardar. Guardar lo hace el formulario que contiene el picker (el id elegido viaja en un
`<input type="hidden">`).

```csharp
@await Html.PartialAsync("~/Views/Shared/_ThemePicker.cshtml", new ThemePickerModel
{
    Id = "themePicker",
    Name = "themeId",              // name del input hidden que se envía en el formulario
    SelectedId = "dark",           // el tema guardado
    Themes =
    [
        new() { Id = "dark",  Name = "Oscuro", Tag = "Oscuro", Description = "…", CssUrl = "/css/themes/theme-dark.css" },
        new() { Id = "light", Name = "Claro",  Tag = "Claro",  Description = "…", CssUrl = "/css/themes/theme-light.css" }
    ]
})
```

- **Cómo pinta las miniaturas:** `theme-picker.js` descarga el CSS de cada tema (`CssUrl`), lee
  sus variables (`--x: valor;`, resolviendo `var(--y)` contra el propio tema) y las copia a la
  tarjeta como `--tp-*`. No hay lista de colores duplicada: un tema nuevo aparece bien sin
  tocar el componente. `PreviewVariables` decide qué variable del tema alimenta cada color
  (por defecto `--page-bg`, `--bg-card`, `--sidebar-bg`, `--text-main`, `--color-primary`, …).
- **Vista previa en vivo** (`LivePreview`, por defecto `true`): sustituye el `<link>` del tema
  (`ThemeLinkId`, por defecto `app-theme-link`) esperando a que cargue el nuevo — sin
  parpadeo —, cambia el atributo de `<html>` (`ThemeAttribute`, por defecto `data-theme`) y el
  `<meta name="theme-color">`. Si eliges otro antes de que cargue el anterior, el pendiente se
  descarta. Aparece un aviso "vista previa, sin guardar" con botón *Deshacer*.
- **Accesibilidad:** `radiogroup` de tarjetas; las flechas del teclado mueven y seleccionan.
  Respeta `prefers-reduced-motion`.
- **CSP:** sin eval ni handlers inline; el click llega por `data-ui-onclick` (ver "Handlers
  declarativos"). El JS solo hace `fetch` de los CSS de tema (mismo origen).
- **Requisito de los CSS de tema:** todos definen las mismas variables bajo un selector del tipo
  `:root, html[data-theme="<id>"]`. Estilos de un tema fuera de su fichero rompen el cambio en vivo.
- Tokens: usa `--grid-*` de la página actual (con fallback) para las tarjetas; los colores de la
  miniatura salen del tema que representa.
- Archivos: `Views/Shared/_ThemePicker.cshtml`, `Models/ThemePickerModel.cs`,
  `wwwroot/js/theme-picker.js`, `wwwroot/css/theme-picker.css` (ya incluidos en los agregadores
  `_UiMetadataScripts`/`_UiMetadataStyles` de Grid).

## CodeInput (entrada de código, una casilla por carácter)

Fila de casillas para valores cortos de longitud fija — los últimos 4 dígitos de una tarjeta, un
código de verificación, un PIN. Se activa sobre una propiedad `string` con
`[CodeInputField(4)]` (ver `UiMetadata.Contracts`) y el modal del grid la renderiza sola; también
se puede usar directamente:

```csharp
@await Html.PartialAsync("~/Views/Shared/_CodeInput.cshtml", new CodeInputModel
{
    Id = "Last4Digits", Name = "Last4Digits",
    Length = 4,                  // número de casillas = longitud exacta del valor
    Numeric = true,              // solo dígitos + teclado numérico en móvil (default)
    AutoComplete = "off",        // "one-time-code" para un código de verificación (SMS)
    Label = "Últimos 4 dígitos"  // etiqueta accesible del grupo
})
```

- **El valor completo vive en un `<input>` real** con `name`/`id` (clase `.ui-code-value`): es el que
  viaja en el `FormData`, el que valida jQuery Validate y el que rellenan `fillModalForm` /
  `clearModalForm`. Va oculto sin `display:none` (jQuery Validate ignora los campos `:hidden`); las
  casillas (`.ui-code-box`, sin `name`) son solo presentación. Un error de validación sobre el input
  real se refleja en las casillas por CSS (`.input-validation-error ~ .ui-code-box`).
- **Comportamiento** (`code-input.js`, listeners delegados en `document`: sirve en HTML inyectado
  después, sin inicializar nada): escribir avanza; Backspace en una casilla vacía retrocede y borra la
  anterior; flechas/Inicio/Fin mueven el foco; enfocar selecciona el carácter (escribir lo reemplaza);
  pegar o el autocompletado de un código reparte los caracteres (un código completo desde la primera
  casilla, uno parcial desde la enfocada); en modo numérico se descartan las letras.
- **Integración con el modal** (`UiMetadata.Modal`): `fillModalForm` y `clearModalForm` re-sincronizan
  las casillas (`syncCodeInputValue`), y `lockField`/`unlockField` del grid bloquean también las casillas
  (`setCodeInputReadOnly`). `setModalFieldsDisabled` ya las cubre (deshabilita todos los `<input>`).
- **Validación:** el input real lleva `pattern="[0-9]{N}"` en modo numérico (una entrada parcial no
  pasa la validación nativa; vacío sí, para campos opcionales). La validación de verdad debe estar
  también en el servidor (p. ej. `SaveCardHandler`).
- Sin eval ni handlers inline: compatible con una CSP estricta.
- Tokens: `--grid-input-bg`, `--grid-border-input`, `--grid-input-border-focus`, `--grid-input-shadow-focus`,
  `--grid-text-main`, `--grid-radius-lg` y `--grid-btn-danger-bg` (error), todos con fallback literal en
  `code-input.css`. Ya incluidos en los agregadores `_UiMetadataScripts`/`_UiMetadataStyles` de Grid.

`AutoSubmit` (default `false`): al completarse todas las casillas se envía el formulario que contiene el campo
(código de verificación: no hace falta pulsar "Continuar"), una sola vez y nunca al rellenar el campo desde código.
`AutoFocus` (default `false`): la primera casilla recibe el foco al cargar la página. Con `AutoComplete =
"one-time-code"` el móvil ofrece rellenar el código desde el SMS.
