# Commons.CrudOrm

## Qué es

Wrapper genérico de CRUD sobre EF Core: `ICommonRepository` (Add/Update/
Delete/Find/GetList/Upsert tipados contra cualquier `DbContext`), más un
`BaseEntity<TId>` común y cifrado de campos en reposo (AES-256-GCM). No
abstrae EF Core — usa sus tipos directamente (`DbSet<T>`, `IQueryable<T>`,
`.Include(string)`, `AsTracking()`/`AsNoTracking()`), es un wrapper
genérico de CRUD sobre EF, no una capa de persistencia agnóstica.

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

Registra `ICommonRepository → CommonRepository<TDbContext>` (Scoped) e
`ICommonService → CommonService` (Scoped).

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
4. Opcional: `IFieldEncryptor`/`AesFieldEncryptor` + `EncryptedStringConverter` para campos a cifrar en reposo.

## `ICommonRepository` — API completa

| Método | Qué hace |
|---|---|
| `SaveChangesAsync()` | Persiste los cambios trackeados. |
| `AddEntity<T>` / `AddEntities<T>` | Agrega una o varias entidades. |
| `UpdateEntity<T>` / `UpdateEntities<T>` | Marca una o varias como modificadas. |
| `DeleteEntity<T>` | Elimina una entidad ya trackeada. |
| `DeleteEntity<T,TKey>(TKey id)` | Busca por Id y elimina — lanza `KeyNotFoundException` si no existe. |
| `LoadAsync<T>` (3 sobrecargas) | Ejecuta la query (`.Load()` de EF) sin materializar resultados — útil para forzar carga de relaciones. |
| `FindAsync<T>` (4 sobrecargas, incl. `FindAsync<T,TKey>(id)`) | Trae una sola entidad por predicado o por Id, con `Include` de navegación por string y `TrackingMode` opcional. |
| `GetListAsync<T>` (4 sobrecargas, incl. una con `ignoreQueryFilters`) | Trae una lista filtrada. |
| `UpsertEntity<T,TKey>(T entity, params string[] includes)` | Busca por Id; si no existe, `Add()`; si existe, mergea propiedad por propiedad vía `CopyPropertiesFrom` (incluye diff add/update/delete de colecciones hijas por `IsSameEntry`). |

`ICommonService`/`CommonService` (façade DTO-aware sobre `ICommonRepository`
+ Mapster, con overloads `GetById<T,TKey,TDto>`/`GetAll<T,TDto>`/
`UpsertEntity<T,TKey,TDto>`) también existen en el paquete, pero **no
tienen ningún consumidor en el repo actual** de EcoTrack — todos los
Handlers usan `ICommonRepository` directo.

## `splitQuery` (opcional, default `false`)

Las sobrecargas de `LoadAsync`/`FindAsync`/`GetListAsync` que reciben
`TrackingMode` (y la de `GetListAsync` con `ignoreQueryFilters`) aceptan
también `bool splitQuery = false`, justo antes de `includes`:

```csharp
await repo.GetListAsync<Transaction>(
    t => relevantIds.Contains(t.Id),
    TrackingMode.Tracking,
    splitQuery: true,
    $"{nameof(Transaction.TransactionParticipants)}.{nameof(TransactionParticipant.Participant)}",
    $"{nameof(Transaction.Wallet)}.{nameof(Wallet.WalletParticipants)}");
```

Traduce a `AsSplitQuery()` de EF Core: cada `Include` de colección se
resuelve como una query `SELECT` separada en vez de un único `JOIN`. Sin
esto, incluir más de una colección a la vez (como el ejemplo — dos
colecciones distintas, `TransactionParticipants` y `Wallet.WalletParticipants`)
produce el producto cartesiano de ambas por cada fila raíz — EF Core lo
loguea como warning (`MultipleCollectionIncludeWarning`).

Con un solo `Include` de colección (o ninguno) no cambia nada — `false` es
siempre seguro como default. Activarlo cambia un roundtrip por varios, así
que solo conviene cuando ese warning aparece en los logs o el perfil de la
query lo justifica.

Requiere el paquete `Microsoft.EntityFrameworkCore.Relational` (agregado
como dependencia de `Commons.CrudOrm`) — `AsSplitQuery()` es un concepto de
proveedores relacionales, no vive en el core de EF.

## `BaseEntity<TId>`

Base abstracta con `Id` (marcado `[CrudOrmPrimaryKey]`), `GetId()`/
`SetId(TId)`, `IsSameEntry(object)` (compara tipo + Id, `false` si algún Id
es el valor por defecto), método estático `Is(entity)` (expression builder),
y `Clone<T>()` vía `MemberwiseClone`. Atributos relacionados: `[CompositeKey]`,
`[IgnoreCopy]` (excluye una propiedad de `CopyPropertiesFrom`).

Otras interfaces/enums del paquete: `IHasId<TId>`, `IEntryComparable`,
`IAvailabilityRange` (`DateFrom`/`DateTo?`, con `OverlapsWith`/`IsInRange`
como extension methods EF-traducibles vía `Expression<Func<...>>`),
`TrackingMode` (`Tracking`/`NoTracking`/`NoTrackingWithIdentityResolution`).

## Cifrado de campos (`IFieldEncryptor`)

```csharp
services.AddSingleton<IFieldEncryptor>(sp =>
{
    var config = sp.GetRequiredService<IConfiguration>();
    var key = config["database-encryptionkey"] ?? config["Encryption:FieldEncryptionKey"];
    return new AesFieldEncryptor(key);
});
```

`AesFieldEncryptor` — AES-256-GCM autenticado (una manipulación del
ciphertext hace fallar el descifrado en vez de devolver basura en
silencio). No determinístico a propósito: cada `Encrypt()` del mismo valor
da un resultado distinto porque el nonce es aleatorio por operación —
correcto porque estos campos nunca se buscan por `WHERE`. Formato del
payload: `[nonce(12)][tag(16)][ciphertext]`, base64.

`EncryptedStringConverter : ValueConverter<string,string>` — cifra/
descifra de forma transparente en cada INSERT/UPDATE/SELECT, ningún
Handler/ViewModel sabe que el campo está cifrado. Se instancia a mano en
`OnModelCreating` del `DbContext` consumidor:

```csharp
var converter = new EncryptedStringConverter(_fieldEncryptor);
modelBuilder.Entity<Card>().Property(c => c.Last4Digits).HasConversion(converter);
```

Tipado como no-nullable a propósito — EF Core nunca invoca el converter
para un valor CLR `null` en una propiedad `string?`, así que el mismo
converter sirve tanto para campos nullable como no-nullable. En EcoTrack se
usa en `Card.Last4Digits`/`Transaction.Description`.

## Dependencias

Ninguna — es el paquete base del que dependen `Commons.Testing` (implementa
`ICommonRepository` como fake en memoria) y, por convención de namespace
únicamente (sin `ProjectReference` real), `Commons.AuditableLogging`.
