# 📦 Paquetes (NuGet)

> Esta sección documenta **librerías reutilizables**. No sabe nada de EcoTrack ni de
> ningún otro proyecto: los ejemplos son genéricos (Product, Order, Customer…) y
> sirven para copiar a cualquier app .NET.
> ¿Buscás cómo los usa EcoTrack? → [🏠 Proyecto EcoTrack](../ecotrack/uso-de-paquetes.md)

Hay dos familias:

- **`Commons.*`** — Class Libraries de backend, sin UI:
  [CrudOrm](commons-crudorm.md), [Infisical](commons-infisical.md), [AuditableLogging](commons-auditablelogging.md), [ExceptionHandler](commons-exceptionhandler.md), [Email](commons-email.md), [Testing](commons-testing.md), [BackgroundJobs](commons-backgroundjobs.md), [Logging](commons-logging.md), [Importing](commons-importing.md).
- **`UiMetadata.*`** — Razor Class Libraries de UI:
  [Contracts](uimetadata-contracts.md), [Grid](uimetadata-grid.md), [Modal](uimetadata-modal.md), [Elements](uimetadata-elements.md), [Sidebar](uimetadata-sidebar.md), [Charts](uimetadata-charts.md).

Cada página sigue la misma estructura: qué es, cuándo usarlo, instalación,
ejemplo mínimo, archivos a tocar y dependencias.

## Mapa de dependencias

```mermaid
graph TD
    subgraph "UiMetadata.* (UI)"
        Contracts[Contracts]
        Elements[Elements]
        Modal[Modal]
        Grid[Grid]
        Sidebar[Sidebar]
        Charts[Charts]
    end
    subgraph "Commons.* (backend)"
        CrudOrm[CrudOrm]
        Infisical[Infisical]
        Audit[AuditableLogging]
        ExcHandler[ExceptionHandler]
        Email[Email]
        Testing[Testing]
        Jobs[BackgroundJobs]
        Logging[Logging]
    end

    Grid --> Contracts
    Grid --> Elements
    Grid --> Modal
    Charts --> Modal
    Testing --> CrudOrm
    Testing -.->|"solo namespace, sin ProjectReference"| Audit
    Logging --> Jobs
    Logging -.->|"por convención de clave, sin ProjectReference"| ExcHandler

    click Contracts "#/packages/uimetadata-contracts"
    click Elements "#/packages/uimetadata-elements"
    click Modal "#/packages/uimetadata-modal"
    click Grid "#/packages/uimetadata-grid"
    click Sidebar "#/packages/uimetadata-sidebar"
    click Charts "#/packages/uimetadata-charts"
    click CrudOrm "#/packages/commons-crudorm"
    click Infisical "#/packages/commons-infisical"
    click Audit "#/packages/commons-auditablelogging"
    click ExcHandler "#/packages/commons-exceptionhandler"
    click Email "#/packages/commons-email"
    click Testing "#/packages/commons-testing"
    click Jobs "#/packages/commons-backgroundjobs"
    click Logging "#/packages/commons-logging"
```

Sin flecha entrante = paquete base, sin dependencias de otro `Commons.*`/
`UiMetadata.*` de este catálogo (`Contracts`, `Elements`, `Modal`,
`Sidebar`, `CrudOrm`, `Infisical`, `ExceptionHandler`, `Email`,
`BackgroundJobs`). Click en cualquier nodo para ir a su página.

## Fuente de verdad

Cada página consolida el `README.md` real de su paquete (dentro de
`EcoTrack/Commons/...`). Si algo queda desactualizado respecto al código, el
`README.md` del paquete manda.
