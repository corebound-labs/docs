# Commons.AuditableLogging

## Qué es

`SaveChangesInterceptor` de EF Core que sella automáticamente quién/cuándo
insertó o actualizó una fila, aplica soft-delete, y — para entidades que
además opten por auditoría completa — escribe una fila de `AuditLog` por
cada columna que cambió. Ningún Handler necesita llamar nada a mano; basta
con que la entidad implemente la interfaz correcta.

> Nota de namespace: las interfaces `IHasInsertUser`/`IHasInsertDate`/
> `IHasUpdateUser`/`IHasUpdateDate`/`IHasLastUpdate`/`IHasInsertAudit`/
> `IHasUpdateAudit`/`IHasUpsertAudit` viven físicamente en este paquete
> (`Interfaces/`) pero bajo el namespace `Commons.CrudOrm.Entities.Functionality`
> — un artefacto histórico, no una dependencia real a `Commons.CrudOrm` (el
> `.csproj` no lo referencia, compila standalone — verificado).

## Cuándo usarlo

Cuando necesitás trazabilidad de quién/cuándo creó o modificó cada fila (y
opcionalmente un historial columna por columna de qué cambió) sin repetir
esa lógica a mano en cada Handler de guardado.

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

`AddAuditableLogging<TDbContext>` registra `IHttpContextAccessor`,
`IIdentityService → IdentityService` (Scoped), el
`AuditBackgroundService<TDbContext>` (hosted service), el interceptor en
sí (Scoped), un `AuditableDbContext` propio sobre la misma connection
string, y — de forma síncrona al arrancar — crea la tabla `LOG__Audit` si
no existe (vía `ExecuteSqlRaw`).

## Ejemplo mínimo de uso

Sellos de auditoría sin log de columnas:

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
columnas en `LOG__Audit`:

```csharp
public class Transaction : BaseEntity<Guid>, IHasUpsertAudit, IAuditable { ... }
```

Ninguna de las dos requiere código adicional en el Handler.

## Archivos a tocar/crear al integrarlo en un proyecto nuevo

1. `ProjectReference` al proyecto de persistencia.
2. `services.AddAuditableLogging<TDbContext>(connectionString)` + `options.AddAuditableInterceptor<TDbContext>(sp)` en el registro de `AddDbContext`.
3. Las entidades a auditar implementan `IHasInsertAudit`/`IHasUpdateAudit`/`IHasUpsertAudit` (agregando las propiedades correspondientes); `ISoftDeleteable` para soft-delete (`bool IsDeleted`); `IAuditable` para log completo de cambios (marcador vacío, sin propiedades).
4. Nada más — `IHttpContextAccessor`/`IIdentityService` quedan registrados automáticamente.

## Interfaces y helpers

| Interfaz | Propósito |
|---|---|
| `IAuditable` | Marcador vacío — opta al log completo de columnas en `LOG__Audit`. |
| `ISoftDeleteable` | `bool IsDeleted` — un `Delete` se convierte en `Modified` + `IsDeleted=true` en vez de borrar la fila. |
| `IHasInsertUser`/`IHasInsertDate`/`IHasInsertAudit` | Sellos de creación (el tercero combina los dos primeros). |
| `IHasUpdateUser`/`IHasUpdateDate`/`IHasUpdateAudit` | Sellos de modificación. |
| `IHasUpsertAudit` | `IHasInsertAudit` + `IHasUpdateAudit` combinados. |
| `IIdentityService` | `GetName()` (username/email de display), `GetId()` (NameIdentifier, el Id real) — resuelve el usuario actual desde `HttpContext`. `AuditInterceptor` sella `InsertUser`/`UpdateUser` con `GetId()`, no `GetName()` — ver sección abajo. |

Extension methods (`AuditExtensions`) para setear estos campos a mano
cuando hace falta fuera del interceptor: `SetInsertUser(username)`,
`SetInsertDate()`, `SetInsertAudit(username)`, `SetUpdateUser(username)`,
`SetUpdateDate()`, `SetUpdateAudit(username)`, `SetUpsertAudit(username)`,
`SetLastUpdate()`.

`AuditInterceptor<TDbContext>` actúa en `SavingChangesAsync` (setea sellos,
aplica soft-delete, encola `AuditLog` en una `ConcurrentQueue` estática por
cada columna cambiada de una entidad `IAuditable`) y en `SavedChangesAsync`
(resuelve las claves primarias reales de filas recién insertadas antes de
encolarlas). `AuditBackgroundService<TDbContext>` drena esa cola cada 5
segundos y persiste los `AuditLog` en batch — el guardado real de la
entidad no espera a que se escriba el log de auditoría.

## `InsertUser`/`UpdateUser` guardan el Id real del usuario, no un username

`AuditInterceptor` sella estos campos con `GetId()` (el Id real, vía
`ClaimTypes.NameIdentifier`) — no `GetName()` (`Identity.Name`, username/
email de display). Es la única fuente de "quién hizo esto" comparable
contra un `userId` real de dominio (ej. `Participant.UserId`).

Antes de este fix usaban `GetName()`, un string de otro dominio no
comparable — lo que llevó a que algunas entidades de EcoTrack (`Card`,
`Transaction`, `ScheduledTransaction`) agregaran su propio
`CreatedByUserId: string` en paralelo, duplicando lo que `InsertUser` ya
debería haber cubierto. Ya no hace falta: `InsertUser` se fija una sola vez
al insertar y nunca se reescribe en updates, así que sirve directamente
como "quién es el dueño/creador de esta fila" para lógica de permisos.

**Testeando contra `Commons.Testing.InMemoryCommonRepository`**: el fake no
simula el interceptor (no tiene noción de "usuario actual") — un test que
crea una entidad nueva a través de un Handler no puede aserir el
`InsertUser` resultante; esa responsabilidad es del interceptor real.

## Dependencias

Ninguna real de otro paquete `Commons.*`/`UiMetadata.*` (ver nota de
namespace arriba).
