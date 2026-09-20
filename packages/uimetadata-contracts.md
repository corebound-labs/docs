# UiMetadata.Contracts

## Qué es

Atributos y metadata en C# puro para decorar ViewModels que se renderizan
con `UiMetadata.Grid` (u otro consumidor futuro). Sin dependencia de
ASP.NET Core ni de ningún otro paquete `UiMetadata.*` — puro C#, es el
paquete base del que depende `UiMetadata.Grid`.

## Cuándo usarlo

Cuando necesitás que un ViewModel describa cómo debe verse su propia tabla/
modal (qué columnas ocultar, cuáles son obligatorias, cuáles son un
`<select>` de un enum, etc.) sin escribir esa lógica a mano en cada
controller — `UiMetadata.Grid` lee estos atributos por reflection.

## Instalación

```xml
<ProjectReference Include="..\Commons\UIMetadata\UiMetadata.Contracts\UiMetadata.Contracts.csproj" />
```

> Cuando exista feed NuGet: `<PackageReference Include="UiMetadata.Contracts" Version="..." />`.

## Ejemplo mínimo de uso

```csharp
using UiMetadata.Contracts.Attributes;

public class ProductViewModel
{
    [GridHidden][ModalHidden]
    public Guid Id { get; set; }

    [DisplayName("Nombre")]
    [RequiredField("El nombre es obligatorio")]
    public string Name { get; set; } = null!;
}
```

## Archivos a tocar/crear al integrarlo

1. `ProjectReference` desde el proyecto donde viven tus ViewModels.
2. Decorar el ViewModel con los atributos que necesites (tabla abajo).
3. Nada más — no requiere registro de DI, no tiene assets estáticos.

## Atributos disponibles

| Atributo | Qué hace | Contrato / advertencias |
|---|---|---|
| `[GridHidden]` | Oculta la propiedad como columna de la tabla. | Marcador puro, sin parámetros. |
| `[ModalHidden]` | Oculta la propiedad como input del modal. | Marcador puro, sin parámetros. |
| `[DisplayName(string)]` sobre una **propiedad** | Nombre a mostrar en vez del nombre de la propiedad. | El texto se usa tal cual, sin escapar aparte del que Razor ya hace. |
| `[DisplayName(string)]` sobre la **clase** | Título de la entidad — `GridConfigBuilder.Build<T>()` lo lee y autocompleta `GridConfig.EntityTitle`/`ModalTitle`, y `LoadGridPartial` autocompleta `ViewData["EntityTitle"]` con eso si el controller no lo seteó ya a mano. | Si no está presente, `EntityTitle` queda vacío y el controller debe seguir seteando `ViewData["EntityTitle"]`/`config.ModalTitle` a mano — es opt-in, no rompe nada existente. |
| `[RequiredField(string errorMessage = "Campo obligatorio")]` | Marca el campo como obligatorio en el modal; el mensaje se renderiza como `data-val-required`. | — |
| `[BadgeField]` | Pinta la columna como pill vía `UiMetadata.Elements` en vez de texto plano. | Requiere que el consumidor final tenga referenciado `UiMetadata.Elements` — si no, `UiMetadata.Grid` no encuentra la partial y el request falla. |
| `[EnumSource(Type enumType)]` | El campo se renderiza como `<select>` con las opciones del enum indicado (filtra valores marcados `[Browsable(false)]`). | `enumType` debe ser un `enum` de verdad — no se valida en tiempo de compilación. |
| `[SubgridEditable(object? DefaultValue = null, bool AllowPastDates = false)]` | El campo es editable inline desde el mini-modal de subgrid. | Solo tiene efecto en propiedades de un tipo usado como elemento de una lista (`List<T>`) marcada como subgrid — en el tipo raíz no hace nada. `AllowPastDates` solo aplica a campos de fecha: por defecto el mini-modal no deja elegir una fecha anterior a hoy; para un campo histórico (ej. fecha de nacimiento) hay que marcarlo `true` explícitamente. `DefaultValue` solo aplica a filas NUEVAS del subgrid: rellena el campo si viene vacío/`null`, nunca pisa un valor ya presente (una fila cargada desde la base de datos no lo activa) — ver página de `UiMetadata.Grid`. |
| `[DynamicSubgridOptionsAttribute(string optionsPropertyName)]` | El subgrid de esta lista se llena por JS (`fillModalForm`) leyendo `optionsPropertyName` en vez de una lista estática. | **Contrato por convención de nombre, no verificado en compilación**: `optionsPropertyName` debe ser el nombre exacto de otra propiedad `List<T>` del MISMO ViewModel. Si el nombre no existe o cambia sin actualizar el atributo, `_Grid.cshtml` simplemente no encuentra el dato (falla silenciosa, sin excepción). |
| `[SliderField(double min, double max, double step = 1, bool ShowValue = true)]` | El campo se renderiza como `<input type="range">` (vía `UiMetadata.Elements`) en vez del `<input type="number">` por defecto. | Solo tiene efecto en propiedades numéricas — en cualquier otro tipo se ignora silenciosamente. |
| `[TextAreaField(int Rows = 3)]` | El campo se renderiza como `<textarea>` (vía `UiMetadata.Elements`, `_TextAreaInput.cshtml`) en vez del `<input type="text">` por defecto. | Solo tiene efecto en propiedades `string` — en cualquier otro tipo se ignora silenciosamente. |
| `[CodeInputField(int length, bool Numeric = true)]` | El campo se renderiza como una fila de `length` casillas de un carácter (estilo código de verificación, `_CodeInput.cshtml` de `UiMetadata.Elements`) en vez del `<input type="text">` por defecto. El valor viaja como un único string. | Solo tiene efecto en propiedades `string` — en cualquier otro tipo se ignora silenciosamente, mismo criterio que `[SliderField]`. `Numeric` (default `true`) limita a dígitos y abre el teclado numérico en móvil. |
| `[CurrencyField(string Symbol = "€")]` | El `_NumberInput.cshtml` de esa propiedad muestra `Symbol` como prefijo visual dentro del input. | Solo visual, no cambia lo que viaja en el submit. Solo tiene efecto en propiedades numéricas; en cualquier otro tipo se ignora silenciosamente. |
| `[DefaultSort(bool Descending = false)]` | El grid arranca ordenado por esta columna en vez del orden del backend — mismo comparador que el click en un header ("como Excel"). | Si más de una propiedad lo declara, gana la primera que encuentre la reflection. |
| `[SignIndicatorField(string? signSourceProperty = null)]` | La columna muestra una flecha de signo (▲ verde positivo/cero, ▼ roja negativo) antes del valor. | `signSourceProperty` (nombre de otra propiedad del ViewModel) es necesario cuando la columna visible es un valor ya formateado; sin él, usa el valor de la propia columna (debe ser convertible a `decimal`). |
| `[GridPriority(int priority)]` | Ocultamiento progresivo de columnas en pantallas angostas (patrón FooTable): si las columnas no entran con un ancho legible (~90px), se ocultan primero las de **mayor** número y cada fila gana un botón ▸ que despliega los valores ocultos. | Opt-in: sin el atributo la columna es "core" y nunca se oculta. Las columnas de acción del RCL (editar/eliminar/acción custom) nunca son candidatas. Ver página de [UiMetadata.Grid](uimetadata-grid.md). |

## Flags leídos por convención de nombre (no son atributos, son propiedades)

`UiMetadata.Grid` lee estas propiedades del ViewModel por reflection si
existen, con un valor por defecto si no existen. No hace falta declarar
nada especial — basta con que la propiedad exista con el nombre y tipo
`bool` exactos:

| Nombre esperado | Tipo | Default si falta | Efecto |
|---|---|---|---|
| `CanOpenModal` | `bool` | `true` | Oculta el botón de esa fila si es `false` **y** bloquea abrir el modal si se clickea la fila directamente (cuando `RowClickAction = "Modal"`). |
| `CanDeleteRow` | `bool` | `true` | Oculta el botón eliminar de esa fila si es `false`. |
| `CanRowAction` | `bool` | `false` | Habilita el botón de `RowAction` custom para esa fila. |
| `IsInactiveRow` | `bool` | `false` | Marca la fila con la clase `row-deleted` (tachado) y bloquea abrir modal/detalle al hacer click. |

## `RowClickAction` / `DetailsButtonAction` (config, no por fila)

Dos propiedades de `GridConfig`, independientes entre sí, que definen qué
pasa con la fila:

| Propiedad | Valores | Default | Efecto |
|---|---|---|---|
| `RowClickAction` | `"Modal"` / `"Details"` / `"None"` | `"Modal"` | Qué hace clickear la fila (fuera de los botones). |
| `DetailsButtonAction` | `"Modal"` / `"Details"` / `"None"` | `"Details"` | Qué hace el botón de la fila (junto al de eliminar) — su ícono/título cambia según el valor: ✏️ "Editar" para `"Modal"`, 🔍 para `"Details"`. |

Ejemplo (los subgrids de reseñas y variantes se abren en modal, pero clickear la fila de
un Product navega a `Product/Details`):

```csharp
config.RowClickAction = "Details";
config.DetailsButtonAction = "Modal";
```

## Menos config en los controllers

Dos cosas que antes había que repetir a mano en cada `[HttpPost]` de cada
controller y ahora se resuelven solas:

1. **`ViewData["EntityTypeName"]`**: `LoadGridPartial<T>` lo autocompleta siempre como `typeof(T).Name` — nunca hace falta setearlo.
2. **`ViewData["EntityTitle"]` / `config.ModalTitle`**: decorá la clase del ViewModel con `[DisplayName("producto")]` una sola vez y `GridConfigBuilder.Build<T>()` completa ambos. Si igual se setean a mano antes de `LoadPartial`, esas siguen ganando (el auto-fill solo entra si están vacías).

`UiMetadata.Contracts.Builders.FkOptionsBuilder` tiene una sobrecarga con
selectores (`Build(items, x => x.Id, x => x.Name)`) además de la de
reflection por nombre de propiedad — necesaria para listas de tuplas con
nombre (`List<(Guid Id, string Name)>`, común en los `Result` de los
Handlers/Services de la capa de aplicación) donde la reflection por nombre falla
porque `Id`/`Name` no son propiedades reales del `ValueTuple` en runtime.

## Dependencias

Ninguna — es el paquete base del que depende `UiMetadata.Grid`.
