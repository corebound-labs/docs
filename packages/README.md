# 📦 Paquetes (NuGet)

> Esta sección documenta **librerías reutilizables**. No sabe nada de EcoTrack ni de
> ningún otro proyecto: los ejemplos son genéricos (Product, Order, Customer…) y
> sirven para copiar a cualquier app .NET.
> ¿Buscás cómo los usa EcoTrack? → [🏠 Proyecto EcoTrack](/ecotrack/uso-de-paquetes.md)

Hay dos familias:

- **`Commons.*`** — Class Libraries de backend, sin UI:
  [CrudOrm](/packages/commons-crudorm.md), [Infisical](/packages/commons-infisical.md), [AuditableLogging](/packages/commons-auditablelogging.md), [ExceptionHandler](/packages/commons-exceptionhandler.md), [Email](/packages/commons-email.md), [Testing](/packages/commons-testing.md), [BackgroundJobs](/packages/commons-backgroundjobs.md), [Logging](/packages/commons-logging.md), [Importing](/packages/commons-importing.md).
- **`UiMetadata.*`** — Razor Class Libraries de UI:
  [Contracts](/packages/uimetadata-contracts.md), [Grid](/packages/uimetadata-grid.md), [Modal](/packages/uimetadata-modal.md), [Elements](/packages/uimetadata-elements.md), [Sidebar](/packages/uimetadata-sidebar.md), [Charts](/packages/uimetadata-charts.md).

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
        Importing[Importing]
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
    click Importing "#/packages/commons-importing"
```

Sin flecha entrante = paquete base, sin dependencias de otro `Commons.*`/
`UiMetadata.*` de este catálogo (`Contracts`, `Elements`, `Modal`,
`Sidebar`, `CrudOrm`, `Infisical`, `ExceptionHandler`, `Email`,
`BackgroundJobs`, `Importing`). Click en cualquier nodo para ir a su página.

## Fuente de verdad

Cada página consolida el `README.md` real de su paquete (dentro de
`EcoTrack/Commons/...`). Si algo queda desactualizado respecto al código, el
`README.md` del paquete manda.

## Galería

Capturas de las demos en vivo de cada paquete (clic en el paquete para ver el detalle y la demo interactiva).

| [UiMetadata.Elements](/packages/uimetadata-elements.md) | [UiMetadata.Modal](/packages/uimetadata-modal.md) | [UiMetadata.Charts](/packages/uimetadata-charts.md) |
|---|---|---|
| ![StatusCard](img/elements-statuscard.png ":size=260") | ![Confirm](img/modal-confirm.png ":size=260") | ![Chart de área](img/charts-area.png ":size=260") |
| ![Botones](img/elements-actionbutton.png ":size=260") | ![Toasts](img/modal-toasts.png ":size=260") | ![KPI](img/charts-kpi.png ":size=260") |
