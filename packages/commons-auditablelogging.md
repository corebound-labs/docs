# Commons.AuditableLogging

## Qué es

`SaveChangesInterceptor` de EF Core que sella automáticamente quién/cuándo
insertó o actualizó una fila, aplica soft-delete, y — para entidades que
opten por auditoría completa — escribe una fila de `AuditLog` por cada
columna que cambió. Todo por convención de interfaces, sin código adicional
en los Handlers.

## Cuándo usarlo

Cuando necesitás trazabilidad de quién/cuándo creó o modificó cada fila
(y opcionalmente un historial columna por columna de qué cambió) sin
repetir esa lógica a mano en cada Handler de guardado.

## Instalación

```xml
<ProjectReference Include="..\Commons\Commons.AuditableLogging\Commons.AuditableLogging.csproj" />
```

```csharp
services.AddAuditableLogging<EcoTrackDbContext>(connectionString);

services.AddDbContext<EcoTrackDbContext>((sp, options) =>
{
    options.UseSqlServer(connectionString);
    options.AddAuditableInterceptor<EcoTrackDbContext>(sp);
});
```

## Ejemplo mínimo de uso

```csharp
public class Account : BaseEntity<Guid>, IHasUpsertAudit, ISoftDeleteable
{
    public string? InsertUser { get; set; }
    public DateTime? InsertDate { get; set; }
    public string? UpdateUser { get; set; }
    public DateTime? UpdateDate { get; set; }
    public bool IsDeleted { get; set; }
}
```

Agregando además `IAuditable` (marcador vacío) se activa el log completo de
columnas en `LOG__Audit`.

## Archivos a tocar/crear al integrarlo en un proyecto nuevo

1. `ProjectReference` al proyecto de persistencia.
2. `services.AddAuditableLogging<TDbContext>(connectionString)` + `options.AddAuditableInterceptor<TDbContext>(sp)`.
3. Las entidades a auditar implementan `IHasInsertAudit`/`IHasUpdateAudit`/`IHasUpsertAudit` (agregando las propiedades correspondientes); `ISoftDeleteable` para soft-delete; `IAuditable` para log columna por columna.
4. Nada más — `IHttpContextAccessor`/`IIdentityService` quedan registrados automáticamente.

## Interfaces principales

| Interfaz | Propósito |
|---|---|
| `IAuditable` | Marcador vacío — log completo de columnas en `LOG__Audit`. |
| `ISoftDeleteable` | `bool IsDeleted` — un `Delete` se convierte en `Modified` + `IsDeleted=true`. |
| `IHasInsertAudit` / `IHasUpdateAudit` / `IHasUpsertAudit` | Sellos de creación/modificación (usuario + fecha). |
| `IIdentityService` | `GetName()`/`GetId()` — resuelve el usuario actual desde `HttpContext`. |

> Nota: estas interfaces viven físicamente en este paquete pero bajo el
> namespace `Commons.CrudOrm.Entities.Functionality` (artefacto histórico)
> — no representan una dependencia real a `Commons.CrudOrm`.

`AuditBackgroundService` drena en batch cada 5 segundos una cola en memoria
encolada por el interceptor — el guardado de la entidad no espera a que se
escriba el log.

## Dependencias

Ninguna real de otro paquete `Commons.*`/`UiMetadata.*` (ver nota de
namespace).
