# Commons.Testing

## Qué es

Helpers de testing reutilizables entre proyectos: un fake completo de
`ICommonRepository` en memoria, infraestructura para tests de integración
contra SQL Server real en Testcontainers, y un builder genérico de datos de
prueba. Sin runner de xUnit propio — es infraestructura, no un proyecto de
tests ejecutable.

## Cuándo usarlo

Para tests unitarios de Handlers que dependen de `ICommonRepository` sin
mockear cada método a mano, o para tests de integración contra una base de
datos real de un solo uso (contenedor Docker).

## Instalación

```xml
<ProjectReference Include="..\Commons\Commons.Testing\Commons.Testing.csproj" />
```

## Ejemplo mínimo de uso — unitario

```csharp
[Fact]
public async Task Leave_revokes_link()
{
    var repo = new InMemoryCommonRepository();
    repo.Seed(new AccountParticipant { AccountId = accountId, Participant = coOwner, ... });

    var handler = new LeaveAccountHandler(repo, recalculationService);
    await handler.HandleAsync(new LeaveAccountCommand(accountId, "user-b"));
}
```

## Ejemplo mínimo de uso — integración

```csharp
[CollectionDefinition("Database collection")]
public class DatabaseCollection : ICollectionFixture<SqlServerTestContainerFixture> { }

[Collection("Database collection")]
public class AccountFlowTests(SqlServerTestContainerFixture container)
{
    [Fact]
    public async Task ...() { /* usa container.ConnectionString */ }
}
```

Requiere Docker — no corre en un entorno sin Docker disponible.

## Archivos a tocar/crear al integrarlo en un proyecto nuevo

1. `ProjectReference` desde el proyecto de tests.
2. Unitarios: `new InMemoryCommonRepository()` + `Seed(...)`.
3. Integración: `[CollectionDefinition("Database collection")]` **propio** en el assembly de test (xUnit no lo descubre en assemblies referenciados, hay que redeclararlo) + `[Collection("Database collection")]` por clase de test.
4. Docker disponible en la máquina/CI.

## Componentes

| Componente | Notas |
|---|---|
| `InMemoryCommonRepository` | Fake completo de `ICommonRepository`; `includes` se ignora siempre, `UpsertEntity` reemplaza la entidad completa (no hace el diff fino de `CopyPropertiesFrom`); sí simula el filtro global de soft-delete. |
| `SqlServerTestContainerFixture` | Un contenedor real de SQL Server compartido por colección de tests, efímero. |
| `IntegrationTestBase` | Base abstracta opcional — sin consumidores todavía en EcoTrack. |
| `TestDataBuilder<T>` | Object mother/builder genérico — sin consumidores todavía en EcoTrack. |

## Dependencias

`Commons.CrudOrm` (implementa `ICommonRepository`), `Commons.AuditableLogging`
(el fake respeta `ISoftDeleteable`).
