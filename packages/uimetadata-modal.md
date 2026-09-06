# UiMetadata.Modal

## Qué es

Chrome visual **y ciclo de vida** del sistema de modal único del proyecto:
el overlay/contenedor (`.ui-modal`/`.ui-modal-content`), las dos piezas de
markup repetidas en el modal principal y en el mini-modal de subgrid
(cabecera + acciones), `openModal`/`closeModal` (genéricos, para
**cualquier** modal de contenido libre) y `openFormModal`/`closeFormModal`/
`clearModalForm`/`fillModalForm` (el caso de crear/editar una entidad con
un `<form>`). También incluye **Toast** y **Confirm**, agrupados aquí
porque los tres son overlays de feedback/interacción, cada uno demasiado
chico para su propio `.csproj`.

## Cuándo usarlo

Para cualquier modal (de contenido libre o de formulario crear/editar),
notificaciones toast, o diálogos de confirmación — sin reinventar overlay/
animación/accesibilidad de teclado por cada caso.

<style>
.dd-m-overlay { display: none; position: fixed; inset: 0; background: rgba(0,0,0,.5); z-index: 9998; align-items: center; justify-content: center; }
.dd-m-overlay.dd-active { display: flex; }
.dd-m-content { background: #fff; border-radius: 12px; box-shadow: 0 8px 25px rgba(0,0,0,.25); width: 90%; max-width: 420px; padding: 1.3rem 1.4rem; }
.dd-m-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: .8rem; }
.dd-m-header h4 { margin: 0; }
.dd-m-close { border: none; background: none; font-size: 1.1rem; cursor: pointer; color: #6b7280; }
.dd-m-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 1.1rem; }
.dd-m-btn { padding: 7px 14px; border-radius: 6px; border: 1px solid #d1d5db; background: #fff; cursor: pointer; font-size: .85rem; }
.dd-m-btn.dd-primary { background: linear-gradient(135deg,#60a5fa,#2563eb); color: #fff; border: none; }
.dd-m-btn.dd-danger { background: linear-gradient(135deg,#ff4d4d,#d32f2f); color: #fff; border: none; }
.dd-toast-container { position: fixed; bottom: 20px; right: 20px; z-index: 9999; display: flex; flex-direction: column; gap: 8px; }
.dd-toast { min-width: 240px; padding: 10px 14px; border-radius: 8px; background: #fff; box-shadow: 0 4px 14px rgba(0,0,0,.18); border-left: 4px solid #2563eb; font-size: .85rem; opacity: 0; transform: translateX(20px); transition: all .25s; }
.dd-toast.dd-show { opacity: 1; transform: translateX(0); }
.dd-toast.dd-success { border-left-color: #16a34a; }
.dd-toast.dd-error { border-left-color: #dc2626; }
.dd-toast.dd-warning { border-left-color: #f59e0b; }
</style>
<div id="dd-confirm-overlay" class="dd-m-overlay">
  <div class="dd-m-content" style="max-width:360px;">
    <p id="dd-confirm-msg" style="margin:0 0 1rem;"></p>
    <div class="dd-m-actions">
      <button class="dd-m-btn" onclick="ddCloseModal('dd-confirm-overlay')">Cancelar</button>
      <button id="dd-confirm-yes" class="dd-m-btn dd-primary">Confirmar</button>
    </div>
  </div>
</div>

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

Los tres scripts son autosuficientes: cada uno define sus propios defaults
de `uiMetadataFetch`/`showLoader`/`hideLoader` si no existen, así que
funciona sin `UiMetadata.Grid`/`UiMetadata.Elements` cargados. Una sola vez
en el layout, el contenedor de toasts:

```csharp
@await Html.PartialAsync("~/Views/Shared/_ToastContainer.cshtml")
```

## Modal genérico (contenido libre) — uso mínimo

```csharp
<div id="myModal" class="ui-modal">
    <div class="ui-modal-content">
        @await Html.PartialAsync("~/Views/Shared/_ModalHeader.cshtml", new UiMetadata.Modal.Models.ModalHeaderModel { HeaderId = "myModalTitle", TitleText = "Lo que quieras" })
        <!-- contenido propio: texto, imagen, widget, lo que sea -->
        @await Html.PartialAsync("~/Views/Shared/_ModalActions.cshtml", new UiMetadata.Modal.Models.ModalActionsModel { CancelOnClick = "closeModal('myModal')", SaveOnClick = "saveMyThing()" })
    </div>
</div>
```

```js
openModal("myModal");
closeModal("myModal");
```

`_ModalActions.cshtml` es opcional — si tu modal no necesita cancelar/
guardar (ej. un visor de imagen), no lo incluyas.

**Demo en vivo**:

<button class="dd-loader-demo-btn" style="padding:7px 14px;border-radius:6px;border:1px solid #2563eb;color:#2563eb;background:#fff;cursor:pointer;" onclick="ddOpenModal('dd-demo-modal')">Abrir modal</button>
<div id="dd-demo-modal" class="dd-m-overlay" onclick="if(event.target===event.currentTarget) ddCloseModal('dd-demo-modal')">
  <div class="dd-m-content">
    <div class="dd-m-header">
      <h4>Lo que quieras</h4>
      <button class="dd-m-close" onclick="ddCloseModal('dd-demo-modal')">✕</button>
    </div>
    <p style="color:#6b7280;">Contenido propio acá — texto, una imagen, un widget, lo que sea.</p>
    <div class="dd-m-actions">
      <button class="dd-m-btn" onclick="ddCloseModal('dd-demo-modal')">Cancelar</button>
      <button class="dd-m-btn dd-primary" onclick="ddCloseModal('dd-demo-modal'); ddToast('success','Guardado (demo)')">Guardar</button>
    </div>
  </div>
</div>

## Modal en una sola llamada (`ViewComponent`)

```csharp
@await Component.InvokeAsync("Modal", new UiMetadata.Modal.Models.ModalModel
{
    ModalId = "myModal",
    Header = new UiMetadata.Modal.Models.ModalHeaderModel { HeaderId = "myModalTitle", TitleText = "Lo que quieras" },
    BodyPartialView = "~/Views/Participant/_ParticipantCard.cshtml", // de OTRO feature, sin relación con el "tema" del modal
    BodyModel = participantVm,
    Actions = new UiMetadata.Modal.Models.ModalActionsModel { CancelOnClick = "closeModal('myModal')", SaveOnClick = "saveMyThing()" }
})
```

`BodyPartialView` se resuelve igual que un `Html.PartialAsync` — puede vivir
en cualquier feature del proyecto consumidor o en cualquier otra RCL, no
hay ninguna noción de "tema" que limite qué contenido entra. `Actions = null`
omite la barra de acciones. Internamente hace exactamente lo mismo que el
ejemplo manual de arriba — conveniencia de una sola llamada, no un
mecanismo nuevo.

## Modal de entidad/formulario — uso mínimo

`openFormModal`/`fillModalForm` asumen la convención de ids
`dynamicModal_{Tipo}`/`modalForm_{Tipo}`/`modalTitle_{Tipo}` — es lo que
usa `UiMetadata.Grid` internamente, pero se puede usar suelto:

```js
openFormModal("MyEntity", null, /* isEdit */ false); // crear
closeFormModal("MyEntity");
fillModalForm("MyEntity", { Name: "...", Amount: 42 }); // llenar para editar
```

`openFormModal`/`fillModalForm` llaman opcionalmente a funciones de
Subgrid/cascada (`initCascadeListeners`, `addSubObjectRow`, etc.) **solo si
existen** — un modal simple sin subgrids ni selects en cascada funciona
perfecto sin `UiMetadata.Grid` cargado en absoluto.

## Fetch propio: `openEntityModal` (opt-in, sin cambios de backend requeridos)

El flujo por defecto lee los datos ya embebidos en `data-entity` — cero
cambios de comportamiento. `openEntityModal` es una alternativa opt-in que
hace su **propio fetch** con `uiMetadataFetch`, pidiendo solo la entidad
que se va a editar en el momento en que se abre el modal:

```js
await openEntityModal("Account", accountId, gridContainerId);
```

El beneficio no es de UX (hay latencia de un fetch extra) sino de **carga
de DB/payload**: el endpoint de listado puede proyectar solo lo que se
muestra en la tabla, y el modal trae el resto bajo demanda, en vez de traer
TODOS los campos de edición para TODAS las filas siempre.

Requiere que el consumidor:

1. Defina `window.getEntityUrl` con placeholders `"Dummy"` (tipo) y `"__ID__"` (id).
2. Tenga un endpoint que devuelva el JSON de la entidad en el mismo shape que hoy viaja en `data-entity`.

**Definir `window.getEntityUrl` también cambia el clic en una fila del
grid**: `UiMetadata.Grid` lo detecta y hace que el handler de "clic en fila
para editar" pida el registro al backend en vez de reusar el `data-entity`
ya embebido, sin llamar `openEntityModal` a mano.

Sin (1), `openEntityModal` solo hace un `console.warn` y no reemplaza el
flujo por defecto, que no requiere ningún endpoint nuevo.

### Las 5 entidades de EcoTrack ya lo implementan (referencia real)

| Entidad | Controller | Filtro de acceso |
|---|---|---|
| `Account` | `AccountController.GetAccountById` | `AccountParticipants.Any(ap => ap.Participant.UserId == userId && ap.Participant.IsActive)` |
| `Wallet` | `AccountController.GetWalletById` | `IVisibilityService.ResolvePermissionAsync` (Account→Wallet resuelto) |
| `Card` | `AccountController.GetCardById` | `CreatedByUserId == userId` (Card nunca se comparte) |
| `Transaction` | `TransactionController.GetById` | acceso a la Wallet, o una fila `TransactionParticipant` explícita propia |
| `Participant` | `ParticipantController.GetById` | `OwnerId == userId` (catálogo propio) |

`Wallet`/`Card` comparten convención con placeholder de tipo
(`"/Account/GetDummyById/__ID__"`); `Transaction`/`Participant` tienen una
sola entidad por página, así que apuntan directo a su único `GetById`.

### Dos bugs reales encontrados al integrar esto (ya corregidos, útiles como advertencia)

1. **`entityType` sin strip de `"ViewModel"` en la URL** — `data-entity-type` es el nombre completo de la clase (`"WalletViewModel"`), correcto para los ids del form pero no para la acción del controller (`GetWalletById`, sin sufijo). Sin el strip, la URL armada era `/Account/GetWalletViewModelById/...` → 404. Fix: `entityType.replace(/ViewModel$/, "")` **solo** al armar la URL.
2. **`Json(vm)` camelCasea los nombres de propiedad por default en ASP.NET Core**, pero `fillModalForm` busca campos por `name="Wallet_Id"` (PascalCase). El fetch llegaba 200 OK pero ningún campo coincidía — modal siempre vacío, sin error visible. Fix: los 5 `GetById` devuelven `new JsonResult(vm, new System.Text.Json.JsonSerializerOptions())` en vez de `Json(vm)`.

## Toast — uso mínimo

```js
toastSuccess("Se guardó correctamente");
toastError("No se pudo guardar: " + err.message);
toastWarning("Revisá los campos marcados");
toastInfo("3 elementos actualizados");

// forma general, para ícono/duración custom:
showToast({ type: "success", icon: "🎉", text: "Listo", durationMs: 6000 });
```

`durationMs: 0` deja el toast visible hasta que el usuario lo cierra con ×.

**Demo en vivo**:

<div class="dd-box" style="border:1px solid #e5e7eb;border-radius:10px;padding:1rem 1.2rem;margin:1rem 0;">
  <button class="dd-m-btn dd-primary" onclick="ddToast('success','Se guardó correctamente')">Success</button>
  <button class="dd-m-btn dd-danger" onclick="ddToast('error','No se pudo guardar')">Error</button>
  <button class="dd-m-btn" onclick="ddToast('warning','Revisá los campos marcados')">Warning</button>
</div>

## Confirm — uso mínimo

Reemplaza `window.confirm()` (bloqueante, sin estilo) por una versión
asíncrona con el chrome visual del resto del sistema:

```js
const confirmed = await confirmDialog({
    message: "¿Estás seguro de que deseas eliminar este registro?",
    confirmText: "Eliminar",
    danger: true // tiñe el botón de confirmar en rojo
});
if (!confirmed) return;
```

Se resuelve `true`/`false` — nunca rechaza la promesa. Cierra con Escape,
Enter (confirma), o clic fuera del modal (cancela).

**Demo en vivo**:

<div class="dd-box" style="border:1px solid #e5e7eb;border-radius:10px;padding:1rem 1.2rem;margin:1rem 0;">
  <button class="dd-m-btn dd-danger" onclick="ddConfirm('¿Estás seguro de que deseas eliminar este registro?', true, function(){ ddToast('success','Eliminado (demo)'); })">Eliminar registro</button>
</div>

## Archivos a tocar/crear al integrarlo en un proyecto nuevo

1. `ProjectReference` + `.AddUiMetadataModal()`.
2. `modal.css`/`toast.css` + `toast.js`/`confirm.js`/`modal.js` en el layout.
3. `_ToastContainer.cshtml` una sola vez en el layout.
4. Si vas a usar el modal de entidad/formulario, seguir la convención de ids `dynamicModal_{Tipo}`/`modalForm_{Tipo}`/`modalTitle_{Tipo}`.
5. Opcional — fetch propio al editar: `window.getEntityUrl` + endpoint `GetById` que devuelva `new JsonResult(vm, new JsonSerializerOptions())`.

## Design tokens

| Token | Default | Uso |
|---|---|---|
| `--grid-modal-overlay` | `rgba(0,0,0,.5)` | Fondo oscuro del overlay. |
| `--grid-modal-surface` | `#ffffff` | Fondo de `.ui-modal-content` y del toast. |
| `--grid-modal-width` / `-max-h` | `500px` / `95%` | Tamaño del modal (`.ui-modal-content-sm`=320px, `.ui-modal-content-lg`=90vw/1500px para contenido ancho, ej. el modal de "expandir chart" de `UiMetadata.Charts`). |
| `--grid-modal-shadow` | `0 8px 25px rgba(0,0,0,.15)` | Sombra del modal y del toast. |
| `--grid-btn-primary-bg` / `--grid-btn-secondary-bg` / `-hover` | ver `UiMetadata.Elements` | Botones Guardar/Cancelar. |
| `--grid-radius-lg` / `-pill` / `-sm` | `12px` / `50px` / `6px` | Radios de esquina del contenedor y los botones. |
| `--color-success` / `--color-danger` / `--color-primary` | `#16a34a` / `#dc2626` / `#2563eb` | Borde izquierdo del toast según `type` (warning usa `#f59e0b` fijo, sin token de host). |
| `--grid-btn-danger-bg-full` | `linear-gradient(135deg,#ff4d4d,#d32f2f)` | Fondo de `.confirm-danger-btn` cuando `confirmDialog({ danger: true })`. |

## Dependencias

Ninguna de otro paquete `UiMetadata.*` (funciona standalone), aunque
`UiMetadata.Grid`/`UiMetadata.Charts` lo consumen como dependencia dura.
