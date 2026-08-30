# UiMetadata.Contracts

## Qué es

Atributos y metadata en C# puro para decorar ViewModels que se renderizan
con `UiMetadata.Grid` (u otro consumidor futuro).

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

Sin dependencia de ASP.NET Core ni de ningún otro paquete `UiMetadata.*`.

## Ejemplo mínimo de uso

```csharp
using UiMetadata.Contracts.Attributes;

public class AccountViewModel
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

| Atributo | Qué hace |
|---|---|
| `[GridHidden]` | Oculta la propiedad como columna de la tabla. |
| `[ModalHidden]` | Oculta la propiedad como input del modal. |
| `[DisplayName(string)]` (propiedad) | Nombre a mostrar en vez del nombre de la propiedad. |
| `[DisplayName(string)]` (clase) | Título de la entidad — `GridConfigBuilder.Build<T>()` autocompleta `EntityTitle`/`ModalTitle`. |
| `[RequiredField(errorMessage?)]` | Campo obligatorio en el modal (`data-val-required`). |
| `[BadgeField]` | Columna como pill vía `UiMetadata.Elements` — requiere tenerlo referenciado. |
| `[EnumSource(Type enumType)]` | Campo como `<select>` con los valores del enum (filtra `[Browsable(false)]`). |
| `[SubgridEditable(DefaultValue?, AllowPastDates=false)]` | Campo editable inline en el mini-modal de subgrid. |
| `[DynamicSubgridOptionsAttribute(optionsPropertyName)]` | Subgrid que se llena por JS leyendo otra propiedad `List<T>` del mismo ViewModel. |
| `[SliderField(min, max, step=1, ShowValue=true)]` | Campo numérico como `<input type="range">`. |

## Flags leídos por convención de nombre (no son atributos)

| Nombre esperado | Tipo | Default | Efecto |
|---|---|---|---|
| `CanOpenModal` | `bool` | `true` | Oculta el botón/bloquea abrir modal en esa fila si es `false`. |
| `CanDeleteRow` | `bool` | `true` | Oculta el botón eliminar de esa fila. |
| `CanRowAction` | `bool` | `false` | Habilita el botón de `RowAction` custom. |
| `IsInactiveRow` | `bool` | `false` | Marca la fila como tachada y bloquea abrir modal/detalle. |

## Dependencias

Ninguna — es el paquete base del que depende `UiMetadata.Grid`.
