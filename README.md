# Corebound Labs — Documentación de paquetes

Documentación de los paquetes reutilizables (`Commons.*`/`UiMetadata.*`)
usados por los proyectos de Corebound Labs — hoy, principalmente EcoTrack.

Este sitio documenta **los paquetes**, no las apps que los consumen. Para
lógica de negocio de EcoTrack (controllers, Handlers), ver el repo de
EcoTrack directamente.

## Empezar

- **Paquetes `Commons.*`** — lógica de backend pura, sin UI: [CrudOrm](packages/commons-crudorm.md), [Infisical](packages/commons-infisical.md), [AuditableLogging](packages/commons-auditablelogging.md), [ExceptionHandler](packages/commons-exceptionhandler.md), [Email](packages/commons-email.md), [Testing](packages/commons-testing.md), [BackgroundJobs](packages/commons-backgroundjobs.md).
- **Paquetes `UiMetadata.*`** — Razor Class Libraries de UI: [Contracts](packages/uimetadata-contracts.md), [Grid](packages/uimetadata-grid.md), [Modal](packages/uimetadata-modal.md), [Elements](packages/uimetadata-elements.md), [Sidebar](packages/uimetadata-sidebar.md), [Charts](packages/uimetadata-charts.md).

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
    end

    Grid --> Contracts
    Grid --> Elements
    Grid --> Modal
    Charts --> Modal
    Testing --> CrudOrm
    Testing -.->|"solo namespace, sin ProjectReference"| Audit

    click Contracts "packages/uimetadata-contracts.md"
    click Elements "packages/uimetadata-elements.md"
    click Modal "packages/uimetadata-modal.md"
    click Grid "packages/uimetadata-grid.md"
    click Sidebar "packages/uimetadata-sidebar.md"
    click Charts "packages/uimetadata-charts.md"
    click CrudOrm "packages/commons-crudorm.md"
    click Infisical "packages/commons-infisical.md"
    click Audit "packages/commons-auditablelogging.md"
    click ExcHandler "packages/commons-exceptionhandler.md"
    click Email "packages/commons-email.md"
    click Testing "packages/commons-testing.md"
    click Jobs "packages/commons-backgroundjobs.md"
```

Sin flecha entrante = paquete base, sin dependencias de otro `Commons.*`/
`UiMetadata.*` de este catálogo (`Contracts`, `Elements`, `Modal`,
`Sidebar`, `CrudOrm`, `Infisical`, `ExceptionHandler`, `Email`,
`BackgroundJobs`). Click en cualquier nodo para ir a su página.

## Cómo está organizado este sitio

Cada página de paquete consolida el contenido real de su propio
`README.md` (dentro del repo del paquete) — este sitio no inventa
contenido nuevo, solo lo presenta con navegación, búsqueda y resaltado de
sintaxis. Si algo acá queda desactualizado respecto al código, el
`README.md` del paquete es la fuente de verdad.
