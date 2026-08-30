# Commons.CrudOrm

## Qué es

Wrapper genérico de CRUD sobre EF Core: `ICommonRepository<TDbContext>`
(Add/Update/Delete/Find/GetList/Upsert tipados contra cualquier `DbContext`),
más un `BaseEntity<TId>` común y cifrado de campos en reposo (AES-256-GCM).
No abstrae EF Core — usa sus tipos directamente, es un wrapper genérico, no
una capa de persistencia agnóstica.

## Cuándo usarlo

Como capa de acceso a datos de cualquier app .NET con EF Core, cuando
querés Handlers/Services que inyectan un repositorio genérico en vez de
`DbSet<T>`/`DbContext` directo, sin escribir un repositorio a medida por
entidad.

## Instalación

```xml
<ProjectReference Include="..\Commons\Commons.CrudOrm\Commons.CrudOrm.csproj" />
```

```csharp
services.AddCommonRepositoryCrud<EcoTrackDbContext>();
```

## Ejemplo mínimo de uso

```csharp
public class GetAccountByIdHandler(ICommonRepository repo)
{
    public async Task<Account?> HandleAsync(Guid id) =>
        await repo.FindAsync<Account>(a => a.Id == id, nameof(Account.AccountParticipants));
}
```

Patrón usado por ~30+ Handlers de `EcoTrack.Application` — inyección
directa, sin capa intermedia.

## Archivos a tocar/crear al integrarlo en un proyecto nuevo

1. `ProjectReference` al proyecto de persistencia.
2. `services.AddCommonRepositoryCrud<TDbContext>()` en el registro de DI.
3. Entidades heredando `BaseEntity<TId>`.
4. Opcional: `IFieldEncryptor`/`AesFieldEncryptor` + `EncryptedStringConverter` para campos a cifrar en reposo (ver README completo del paquete para el ejemplo de `OnModelCreating`).

## API principal

`ICommonRepository`: `SaveChangesAsync`, `AddEntity`/`AddEntities`,
`UpdateEntity`/`UpdateEntities`, `DeleteEntity`/`DeleteEntity<T,TKey>(id)`,
`LoadAsync`, `FindAsync` (con `FindAsync<T,TKey>(id)`), `GetListAsync` (con
`ignoreQueryFilters`), `UpsertEntity<T,TKey>(entity, includes)` — busca por
Id, mergea propiedad por propiedad si existe (diff de colecciones hijas
incluido), agrega si no.

`ICommonService`/`CommonService` (façade DTO-aware sobre `ICommonRepository`
+ Mapster) también existen en el paquete pero no tienen consumidores hoy en
EcoTrack — todos los Handlers usan `ICommonRepository` directo.

## Dependencias

Ninguna — es el paquete base del que dependen `Commons.Testing` (implementa
`ICommonRepository` como fake en memoria) y, por convención de namespace
únicamente (sin `ProjectReference` real), `Commons.AuditableLogging`.
