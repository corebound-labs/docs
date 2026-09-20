# Commons.Testing

## Qué es

Helpers de testing reutilizables entre proyectos: un fake completo de
`ICommonRepository` en memoria, infraestructura para tests de integración
contra SQL Server real en Testcontainers, y un builder genérico de datos de
prueba. Sin runner de xUnit propio (`xunit.v3.extensibility.core`, sin
`Microsoft.Testing.Platform`) — es infraestructura reutilizable, no un
proyecto de tests ejecutable en sí mismo; el runner (`xunit.runner.visualstudio`
+ `Microsoft.NET.Test.Sdk`) lo trae cada proyecto de test consumidor.

## Cuándo usarlo

Para tests unitarios de Handlers que dependen de `ICommonRepository` sin
mockear cada método a mano, o para tests de integración contra una base de
datos real de un solo uso (contenedor Docker efímero).

## Instalación

```xml
<ProjectReference Include="..\Commons\Commons.Testing\Commons.Testing.csproj" />
```

## Ejemplo mínimo de uso — unitario

```csharp
[Fact]
public async Task Cancel_marks_order_cancelled()
{
    var repo = new InMemoryCommonRepository();
    repo.Seed(new Order { Id = orderId, Status = OrderStatus.Open });

    var handler = new CancelOrderHandler(repo);
    await handler.HandleAsync(new CancelOrderCommand(orderId));

    Assert.Equal(OrderStatus.Cancelled, repo.Query<Order>().Single().Status);
}
```

## Ejemplo mínimo de uso — integración

```csharp
[CollectionDefinition("Database collection")]
public class DatabaseCollection : ICollectionFixture<SqlServerTestContainerFixture> { }

[Collection("Database collection")]
public class OrderFlowTests(SqlServerTestContainerFixture container)
{
    [Fact]
    public async Task ...() { /* usa container.ConnectionString */ }
}
```

Requiere Docker — no corre en un entorno sin Docker disponible (correr en
la máquina del usuario o en CI).

## `TestDataBuilder<T>`

```csharp
var product = TestDataBuilder<Product>.Create()
    .With(p => p.Name = "Test")
    .With(p => p.Enabled = true)
    .Build();
```

Object mother/builder genérico y agnóstico de dominio — sin conocimiento de
ninguna entidad concreta, para reducir el ruido de `new T { A = ..., B = ...
}` repetido entre tests.

## Archivos a tocar/crear al integrarlo en un proyecto nuevo

1. `ProjectReference` desde el proyecto de tests (unitarios y/o de integración).
2. Unitarios: `new InMemoryCommonRepository()` + `Seed(...)`.
3. Integración: `[CollectionDefinition("Database collection")]` **propio** en el assembly de test — xUnit solo descubre ese atributo dentro del propio assembly que lo usa, no en assemblies referenciados, así que hay que redeclararlo copiando el bloque de arriba — más `[Collection("Database collection")]` en cada clase de test.
4. Docker disponible en la máquina/CI donde corran los tests de integración.

## Componentes

| Componente | Notas |
|---|---|
| `InMemoryCommonRepository` | Fake completo de `ICommonRepository` sobre un `Dictionary<Type, List<object>>`; `Seed<T>(params T[])` para poblar, `Query<T>()` para inspeccionar. Los parámetros `includes` se ignoran siempre (no hay navegación real que cargar en memoria); `UpsertEntity` reemplaza la entidad completa por Id en vez del merge fino de `CopyPropertiesFrom` del repositorio real. Sí simula el filtro global de soft-delete (`!IsDeleted` para `ISoftDeleteable`), honrando `ignoreQueryFilters` igual que EF Core. |
| `SqlServerTestContainerFixture` | Un contenedor real (`mcr.microsoft.com/mssql/server:2022-latest`) compartido por toda la colección de tests (no uno por test — levantar el contenedor es lo lento), efímero, se tira al terminar la colección. |
| `IntegrationTestBase` | Base abstracta opcional (`BuildOptions<TContext>()`) — deliberadamente sin ninguna referencia al `DbContext` concreto del consumidor. El fixture también se puede tomar directo por constructor primario en vez de heredar. |
| `TestDataBuilder<T>` | Ver arriba. |

## Dependencias

`Commons.CrudOrm` (implementa `ICommonRepository`), `Commons.AuditableLogging`
(el fake respeta `ISoftDeleteable`).
