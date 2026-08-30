# UiMetadata.Grid

## Qué es

Tabla/listado con paginación y búsqueda, más el modal de crear/editar y el
subgrid con mini-modal de edición inline. Renderiza vía reflection sobre un
ViewModel decorado con `UiMetadata.Contracts`, delegando el chrome de
controles atómicos en `UiMetadata.Elements`/`UiMetadata.Modal`.

## Cuándo usarlo

Cuando necesitás un CRUD tabular completo (listar, buscar, paginar, crear,
editar, borrar, subgrids anidados) sin escribir el HTML/JS de la tabla a
mano por cada entidad — el ViewModel + sus atributos de `UiMetadata.Contracts`
son suficientes para que el sistema genere todo.

## Instalación

```xml
<ProjectReference Include="..\Commons\UIMetadata\UiMetadata.Grid\UiMetadata.Grid.csproj" />
```

```csharp
builder.Services.AddControllersWithViews()
    .AddUiMetadataGrid(); // registra también Elements y Modal en cascada
```

```html
<head>
    @await Html.PartialAsync("~/Views/Shared/_UiMetadataStyles.cshtml")
</head>
<body>
    <script src="jquery..."></script>
    <script src="jquery-validate..."></script>
    <script src="jquery-validate-unobtrusive..."></script>
    @await Html.PartialAsync("~/Views/Shared/_UiMetadataScripts.cshtml")
</body>
```

> **Dependencia dura**: `grid.js` llama directo a `toastWarning`/`toastError`/
> `confirmDialog` de `UiMetadata.Modal` — sin `_UiMetadataScripts.cshtml`
> (que incluye toast/confirm en el orden correcto) esas llamadas lanzan
> `ReferenceError` en runtime.

## Ejemplo mínimo de uso

```csharp
using UiMetadata.Contracts.Grid;
using UiMetadata.Grid.Extensions;

var config = GridConfigBuilder.Build<AccountViewModel>();
return this.LoadGridPartial(accounts, config);
```

## Archivos a tocar/crear al integrarlo en un proyecto nuevo

1. `ProjectReference` + `.AddUiMetadataGrid()` en el `.csproj`/`Program.cs` consumidor.
2. `_UiMetadataStyles.cshtml`/`_UiMetadataScripts.cshtml` en `_Layout.cshtml` (después de jQuery/jquery-validate).
3. Definir los 2 globals JS obligatorios en cada vista que use el grid — `loadEntityUrl`/`saveEntityUrl` (ver tabla completa abajo), idealmente vía `_GridEntityConfig.cshtml` en vez de a mano.
4. El ViewModel de cada entidad decorado con atributos de `UiMetadata.Contracts`.
5. Un controller con una acción que llame `GridConfigBuilder.Build<T>()` + `LoadGridPartial`.

### Globals de JavaScript que el consumidor debe definir

| Global | Obligatorio | Firma |
|---|---|---|
| `loadEntityUrl` | Sí | string con placeholder `"Dummy"`, ej. `"/Account/Dummy"`. |
| `saveEntityUrl` | Sí | URL de POST para guardar. |
| `showLoader` / `hideLoader` | No (default no-op) | `function(): void`. |
| `loadEntityAction` | No (default: nombre del tipo sin `ViewModel`) | Nombre de la acción a pasar a `loadEntity`. |
| `openEntityView` | No | `function(entity): boolean` — si devuelve `true`, el grid no abre su propio modal. |
| `openNewView` | No (solo si `RowClickAction`/`DetailsButtonAction` = `"Details"`) | URL de navegación a detalle. |
| `openImportModal` | No (solo si `ShowImportButton = true`) | `function(): void`. |
| `getEntityUrl` | No | string con placeholders `"Dummy"`/`"__ID__"` — habilita fetch propio al editar una fila. |
| `uiMetadataFetch` | No (default: `window.fetch`) | `function(url, options): Promise<Response>` — redefinir para enrutar toda la RCL por tu propia lógica de auth. |

Generar los 4 primeros (`loadEntityUrl`/`saveEntityUrl`/`window.getEntityUrl`/
`loadEntityAction`) con el partial `_GridEntityConfig.cshtml` en vez de a
mano evita el riesgo de typo de copiar/pegar el bloque en cada vista:

```csharp
@await Html.PartialAsync("~/Views/Shared/_GridEntityConfig.cshtml", new UiMetadata.Grid.Models.GridEntityConfigModel
{
    Controller = "Account",
    LoadEntityAction = "Account" // solo si tu tipo no sigue la convención por defecto
})
```

## Design tokens (`--grid-*`, `wwwroot/css/grid.css`)

| Token | Default |
|---|---|
| `--grid-radius-sm` / `-md` / `-lg` / `-pill` | `6px` / `8px` / `12px` / `50px` |
| `--grid-gap-xs` / `-sm` / `-md` | `0.4rem` / `0.5rem` / `1rem` |
| `--grid-font-size-sm` / `-md` / `-base` / `-lg` / `-h2` | `0.875rem` / `0.92rem` / `0.95rem` / `1.3rem` / `1.8rem` |
| `--grid-surface` / `-alt` | `var(--bg-card, #fff)` / `var(--bg-elevated, #f9fafb)` |
| `--grid-border` / `-input` | `var(--border-soft, #e5e7eb)` / `var(--border-strong, #d1d5db)` |
| `--grid-table-header-bg` | `var(--table-header-bg, linear-gradient(135deg,#2563eb,#1d4ed8))` |
| `--grid-table-row-hover` | `var(--table-row-hover, #e0f2fe)` |
| `--grid-modal-overlay` | `rgba(0,0,0,.5)` |

~90 tokens en total — todos los paquetes `UiMetadata.*` reutilizan los mismos
nombres con su propio fallback, así que sobreescribir uno en el tema del
consumidor basta para todos. Ver el archivo completo para la lista exhaustiva.

## Dependencias

`UiMetadata.Contracts` (atributos), `UiMetadata.Elements` y `UiMetadata.Modal`
(chrome de controles atómicos y ciclo de vida del modal) — las tres se
registran en cascada con `.AddUiMetadataGrid()`.
