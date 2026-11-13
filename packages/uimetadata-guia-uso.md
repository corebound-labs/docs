# Guía de uso de UiMetadata

Cómo aplicar cada pieza de la familia `UiMetadata.*` en una pantalla nueva o al cambiar una existente. Cada apartado trae un ejemplo mínimo. Está pensada para que quien escriba una pantalla no tenga que leer el código de los paquetes. El detalle de cada paquete está en su propio `README.md`.

> Esta guía vive en el repo `docs` (guía entre paquetes); el detalle de cada paquete está en su página y, como fuente de verdad, en el `README.md` del paquete en `Commons`. Origen: esta guía y los componentes `ui-modal`, `ui-card`, `ui-section`, `ui-segmented`, `ui-banner`, `ui-avatar`, `ui-slider`, `ui-autocomplete`, `ui-popover` y los tokens `--ui-*` se desarrollaron primero en AIMOD y se trajeron aquí. Los tests que los protegen están en `UiMetadata.Tests`.

## 1. Principios

1. **Se describe con datos, no con HTML ni JavaScript.** Si algo se puede expresar como campos, secciones, tarjetas u opciones, va en un modelo o en atributos de un ViewModel y la librería lo pinta.
2. **JavaScript propio solo para lo que no se describe con datos**: el comportamiento específico de la aplicación. Una excepción que solo usa una aplicación va en la aplicación, no en la librería.
3. **Los colores salen de variables (tokens)**, nunca literales. La aplicación cambia el aspecto redefiniendo tokens.
4. **Un elemento, una forma de pintarlo.** Si el mismo bloque se necesita en servidor y en el navegador, hay un parcial o tag helper (servidor) y una función `Ui*.create` (navegador) que generan el mismo marcado.

## 2. Qué paquete da qué

| Paquete | Contenido |
|---|---|
| `UiMetadata.Contracts` | Atributos para los ViewModels (`[GridHidden]`, `[SliderField]`...), `GridConfig` y `GridConfigBuilder`. Sin interfaz. |
| `UiMetadata.Elements` | Controles (`_Select`, `_Slider`, `_SliderField`, `_Switch`, entradas, insignias, barras, pestañas), tag helpers (`<ui-card>`, `<ui-section>`, `<ui-segmented>`, `<ui-banner>`, `<ui-avatar>`) y sus scripts. |
| `UiMetadata.Modal` | `<ui-modal>`, `UiModal`, avisos (`showToast`) y confirmaciones (`confirmDialog`). |
| `UiMetadata.Grid` | Tabla con búsqueda, orden, paginación y modal de edición, generada desde un ViewModel. |
| `UiMetadata.Sidebar` | Barra lateral con marca, enlaces, secciones plegables, pie y colapso. Depende de `UiMetadata.Elements`. |
| `UiMetadata.Charts` | Gráficas, opcional por página. |
| `UiMetadata.Notifications` | Campana de notificaciones. |

## 3. Cómo cargarla

- **Aplicación que usa todo**: `@await Html.PartialAsync("~/Views/Shared/_UiMetadataStyles.cshtml")` en el `<head>` y `_UiMetadataScripts.cshtml` antes de `</body>` (jQuery y jQuery Validate antes). Ambos parciales vienen en `UiMetadata.Grid` y ya enlazan los ficheros nuevos (tokens, `ui-modal`, `ui-card`, `ui-slider`, `ui-switch`, `ui-segmented`, `ui-autocomplete`, `ui-popover`...).
- **Aplicación que usa piezas sueltas**: enlazar solo los CSS/JS que se usan. Cada pieza autónoma (`ui-modal`, `ui-card`, `ui-slider`, `ui-segmented`, `ui-autocomplete`, `ui-switch`) se carga sola.
- Un puente de temas propio de la aplicación va **después** de `uimetadata.tokens.css`.

## 4. Controles de formulario (parciales con modelo)

Se llaman con `Html.PartialAsync("_Nombre", modelo)`; el modelo vive en `UiMetadata.Elements.Models`.

```csharp
// Interruptor
@await Html.PartialAsync("_Switch", new SwitchModel { Id = "activo", Name = "activo", Checked = true, Label = "Activo" })

// Lista desplegable (SelectedValue preselecciona; ShowPlaceholder = false quita la opción vacía)
@await Html.PartialAsync("_Select", new SelectModel {
    Id = "rol", Name = "rol", SelectedValue = "2",
    Options = [ new SelectOption { Id = "1", Name = "Lectura" }, new SelectOption { Id = "2", Name = "Edición" } ] })

// Texto largo con contador
@await Html.PartialAsync("_TextAreaInput", new SimpleInputModel { Id = "prompt", Name = "prompt", Rows = 4, MaxLength = 2000, ShowCounter = true })

// Etiqueta + deslizador con valor numérico editable
@await Html.PartialAsync("_SliderField", new SliderFieldModel {
    Label = "Temperatura", ErrorFor = "temperature",
    Slider = new SliderModel { Id = "temperature", Name = "temperature", Min = 0, Max = 1, Step = 0.01, Value = "0.7", ShowInput = true } })
```

Otros: `_TextInput`, `_NumberInput`, `_DateInput`, `_Badge`, `_ProgressBar`, `_ActionButton`, `_SettingsCard`, `_StatusCard`, `_TabsStrip`, `_ThemePicker`, `_Loader`, `_LoaderPanel`.

`ExtraAttributesRaw` admite atributos propios (`data-*`, manejadores) cuando un control los necesita; ya debe venir escapado por quien lo pasa.

## 5. Tag helpers (marcado en la vista)

```html
<!-- Modal: el cuerpo es libre; el pie se declara aparte -->
<ui-modal id="rolesModal" title="Roles" subtitle="opcional, bajo el título" size="lg" close-on-overlay="false" close-on-escape="false" show-close="false">
    ...contenido...
    <ui-modal-footer>
        <button type="button" data-ui-modal-close>Cerrar</button>
    </ui-modal-footer>
</ui-modal>

<!-- Tarjeta con acciones en la cabecera -->
<ui-card title="Proveedor" css-class="mi-tarjeta">
    <ui-card-actions>...interruptor...</ui-card-actions>
    ...cuerpo...
</ui-card>

<!-- Sección plegable -->
<ui-section title="Seguridad" open="true">...</ui-section>

<!-- Selector de una opción -->
<ui-segmented id="tipo" value="user" label="Tipo de destinatario">
    <ui-segment value="user" icon-class="bi bi-person">Usuario</ui-segment>
    <ui-segment value="group" icon-class="bi bi-people">Grupo</ui-segment>
</ui-segmented>

<ui-banner type="warning" title="Entorno de pruebas">Texto del aviso</ui-banner>
<ui-avatar name="Marta López" size="md" />
```

Los atributos `css-class`, `header-class`, `title-class`, `actions-class`, `body-class` y `content-class` existen para conservar clases de CSS o JavaScript ya existentes; en pantallas nuevas no hacen falta. Para registrar un icono propio en `UiIcons` (lo usan también los botones predefinidos), llama una vez al arrancar a `UiIcons.Register("nombre", "<paths del svg>")`.

## 6. Piezas en el navegador (JavaScript)

Producen el mismo marcado que los tag helpers. Se usan cuando el contenido aparece tras una acción del usuario.

```js
// Modal creado por código (devuelve open() y close())
const modal = UiModal.create({ title: "Selecciona una opción", body: nodo, size: "sm", closeOnOverlay: false });
modal.open();
UiModal.open("rolesModal");      // modal declarado en la vista
UiModal.close("rolesModal");
// eventos: ui-modal:open, ui-modal:close

// Tarjeta
const card = UiCard.create({ title: "Mi tarjeta", cssClass: "mi-tarjeta", actions: [boton], body: nodo });

// Búsqueda con desplegable de resultados
const ac = UiAutocomplete.attach(input, {
    search: async texto => (await fetch(...)).json(),
    getLabel: item => item.name,
    renderItem: item => { const d = document.createElement("div"); d.textContent = item.name; return d; },
    onSelect: item => { ... }
});

// Popover anclado a un elemento
UiPopover.show({ anchor: boton, content: nodo, placement: "bottom" });

showToast({ type: "success", text: "Guardado correctamente" });   // o toastSuccess / toastError / toastWarning / toastInfo
confirmDialog({ ... });                                            // ver el README de UiMetadata.Modal
```

Regla: si el contenido se puede pintar desde el servidor, pídelo al servidor y solo insértalo.

## 7. Tablas (grid)

El ViewModel se decora y el grid se genera solo.

```csharp
public class ProductViewModel
{
    [GridHidden] public Guid Id { get; set; }
    [DisplayName("Nombre")] [RequiredField] public string Name { get; set; } = "";
    [BadgeField] public string Estado { get; set; } = "";
    [SliderField(0, 100, 5)] public int Prioridad { get; set; }
}

var config = GridConfigBuilder.Build<ProductViewModel>();
return this.LoadGridPartial(items, config);  // UiMetadata.Grid.Extensions
```

La acción de fila personalizada (`GridRowAction`) admite `IconClass` (icono de fuente, con prioridad sobre `Icon`) y `HeaderTitle` (título en la cabecera; la columna se ensancha sola). Para que las peticiones del grid pasen por la autenticación de la aplicación, define antes de cargar `grid.js`:

```html
<script>window.uiMetadataFetch = function () { return window.authFetch.apply(null, arguments); };</script>
```

El README de `UiMetadata.Grid` detalla cada opción de `GridConfig`.

## 8. Temas y tokens

Tres niveles, de lo general a lo particular:

1. **Semánticos `--ui-*`** (`uimetadata.tokens.css`): superficie, texto, borde, acento, éxito, peligro. Cambiar aquí cambia toda la librería. Tienen valores para el tema claro y para `[data-theme="dark"]`.
2. **De componente** (`--grid-*`, `--slider-*`, `--sidebar-*`): se calculan desde los del host si existen (`--text-main`, `--bg-card`, `--color-primary`...) y, si no, desde los semánticos.
3. **De la aplicación**: la aplicación define su paleta propia y la librería la toma sin duplicar colores. Una aplicación que ya define `--text-main`, `--bg-card`, `--border-soft`, `--color-primary`... no ve ningún cambio al actualizar: los `--ui-*` solo actúan de respaldo.

Regla: ningún color literal fuera de `uimetadata.tokens.css`, salvo como respaldo `var(--x, #fff)`. La comprueba `CssTokensTests` (en `UiMetadata.Tests`).

## 9. Compatibilidad al actualizar desde versiones anteriores

- Los interruptores pasan de `.switch`/`.slider` a `.ui-switch`/`.ui-switch__slider` (y `.switch-wrapper` a `.ui-switch-wrapper`). Los parciales y el CSS cambian a la vez; solo afecta a una aplicación que use esas clases en su propio HTML, CSS o JavaScript.
- `syncSliderValue` desaparece de `elements.js`: el valor del slider lo actualiza `ui-slider.js` (atributos `data-ui-slider-text` / `data-ui-slider-link`).
- Un `showLoader()`/`hideLoader()` manual se oculta solo a los 30 s si no se llama a `hideLoader()`.
- `SwitchModel.Id/Name`, `SelectModel.Id/Name` y `SidebarItem.IconSvg` dejan de ser obligatorios; el resto de cambios en modelos son propiedades nuevas opcionales.

## 10. Lista de comprobación para una pantalla nueva

1. ¿Es una lista de entidades? ViewModel con atributos + `LoadGridPartial`.
2. ¿Es un formulario? Parciales de la sección 4; sin `<input>` a mano salvo casos con comportamiento propio.
3. ¿Agrupa contenido? `<ui-section>`, `<ui-card>`, `<ui-modal>`.
4. ¿Aparece contenido tras una acción? Pídelo al servidor; si no, `Ui*.create`.
5. ¿Colores? Solo variables. Pasa la suite `UiMetadata.Tests`.
