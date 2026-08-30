# UiMetadata.Modal

## Qué es

Chrome visual y ciclo de vida del sistema de modal único del proyecto
(`.ui-modal`/`.ui-modal-content`), más **Toast** (feedback no bloqueante) y
**Confirm** (reemplazo async de `window.confirm()`) — agrupados en un solo
paquete porque los tres son overlays de feedback/interacción, cada uno
demasiado chico para justificar su propio `.csproj`.

## Cuándo usarlo

Para cualquier modal (de contenido libre o de formulario crear/editar),
notificaciones toast, o diálogos de confirmación — sin reinventar overlay/
animación/accesibilidad de teclado por cada caso.

## Instalación

```xml
<ProjectReference Include="..\Commons\UIMetadata\UiMetadata.Modal\UiMetadata.Modal.csproj" />
```

```csharp
builder.Services.AddControllersWithViews()
    .AddUiMetadataModal();
```

```html
<link rel="stylesheet" href="~/_content/UiMetadata.Modal/css/modal.css" />
<link rel="stylesheet" href="~/_content/UiMetadata.Modal/css/toast.css" />
<script src="~/_content/UiMetadata.Modal/js/toast.js"></script>
<script src="~/_content/UiMetadata.Modal/js/confirm.js"></script>
<script src="~/_content/UiMetadata.Modal/js/modal.js"></script>
```

Autosuficiente — funciona sin `UiMetadata.Grid`/`Elements` cargados (cada
script define sus propios defaults de `uiMetadataFetch`/`showLoader`/
`hideLoader` si no existen). Una sola vez en el layout, el contenedor de
toasts:

```csharp
@await Html.PartialAsync("~/Views/Shared/_ToastContainer.cshtml")
```

## Ejemplo mínimo de uso

Modal de contenido libre, abierto/cerrado por id:

```csharp
<div id="myModal" class="ui-modal">
    <div class="ui-modal-content">
        @await Html.PartialAsync("~/Views/Shared/_ModalHeader.cshtml", new UiMetadata.Modal.Models.ModalHeaderModel { HeaderId = "myModalTitle", TitleText = "Lo que quieras" })
        <!-- contenido propio -->
        @await Html.PartialAsync("~/Views/Shared/_ModalActions.cshtml", new UiMetadata.Modal.Models.ModalActionsModel { CancelOnClick = "closeModal('myModal')", SaveOnClick = "saveMyThing()" })
    </div>
</div>
```

```js
openModal("myModal");
closeModal("myModal");
```

O en una sola invocación vía `ViewComponent`:

```csharp
@await Component.InvokeAsync("Modal", new UiMetadata.Modal.Models.ModalModel
{
    ModalId = "myModal",
    Header = new() { HeaderId = "myModalTitle", TitleText = "Lo que quieras" },
    BodyPartialView = "~/Views/Participant/_ParticipantCard.cshtml",
    BodyModel = participantVm,
    Actions = new() { CancelOnClick = "closeModal('myModal')", SaveOnClick = "saveMyThing()" }
})
```

Toast:

```js
toastSuccess("Se guardó correctamente");
toastError("No se pudo guardar: " + err.message);
toastWarning("Revisá los campos marcados");
toastInfo("3 elementos actualizados");
```

Confirm:

```js
const confirmed = await confirmDialog({ message: "¿Eliminar este registro?", confirmText: "Eliminar", danger: true });
if (!confirmed) return;
```

## Archivos a tocar/crear al integrarlo en un proyecto nuevo

1. `ProjectReference` + `.AddUiMetadataModal()`.
2. `modal.css`/`toast.css` + `toast.js`/`confirm.js`/`modal.js` en el layout.
3. `_ToastContainer.cshtml` una sola vez en el layout.
4. Si vas a usar el modal de entidad/formulario (`openFormModal`/`fillModalForm`), seguir la convención de ids `dynamicModal_{Tipo}`/`modalForm_{Tipo}`/`modalTitle_{Tipo}`.
5. Opcional — fetch propio al editar (`openEntityModal`): definir `window.getEntityUrl` con placeholders `"Dummy"`/`"__ID__"`, y un endpoint que devuelva el JSON de la entidad con `new JsonResult(vm, new JsonSerializerOptions())` (no `Json(vm)` — camelCasea y `fillModalForm` busca por PascalCase).

## Design tokens

| Token | Default | Uso |
|---|---|---|
| `--grid-modal-overlay` | `rgba(0,0,0,.5)` | Fondo oscuro del overlay. |
| `--grid-modal-surface` | `#ffffff` | Fondo de `.ui-modal-content` y del toast. |
| `--grid-modal-width` / `-max-h` | `500px` / `95%` | Tamaño del modal (`.ui-modal-content-sm`=320px, `.ui-modal-content-lg`=90vw/1500px). |
| `--grid-modal-shadow` | `0 8px 25px rgba(0,0,0,.15)` | Sombra del modal y del toast. |
| `--color-success` / `--color-danger` / `--color-primary` | `#16a34a` / `#dc2626` / `#2563eb` | Borde izquierdo del toast según `type`. |
| `--grid-btn-danger-bg-full` | `linear-gradient(135deg,#ff4d4d,#d32f2f)` | Fondo de `.confirm-danger-btn`. |

## Dependencias

Ninguna de otro paquete `UiMetadata.*` (funciona standalone), aunque
`UiMetadata.Grid`/`UiMetadata.Charts` lo consumen como dependencia dura.
