# 🏠 Proyecto EcoTrack

> Esta sección documenta **la aplicación EcoTrack**, no las librerías.
> Para las librerías reutilizables ver la pestaña [📦 Paquetes](../packages/).

EcoTrack es una aplicación web de gestión financiera personal **y compartida**:
cuentas, tarjetas, wallets y transacciones, con acceso compartido entre personas
mediante permisos y titularidad granulares. ASP.NET Core MVC (.NET 10), capas +
Vertical Slice.

Para arquitectura, modelo de dominio, puesta en marcha y flujo de ramas, el
documento de referencia es el `README.md` del repo de EcoTrack. Aquí viven las
**guías transversales** de la aplicación.


## Arquitectura de un vistazo

Capas más Vertical Slice dentro de Application: cada acción de negocio es un slice
(`Command`/`Query` + `Handler`) que se resuelve por DI, sin MediatR.

```mermaid
graph TD
    Web["EcoTrack (web)<br/>Controllers · Views · ViewModels · Mapster"]
    App["EcoTrack.Application<br/>Features/{Entidad}/{Acción} · Handlers"]
    Core["EcoTrack.Core<br/>Entidades y enums"]
    Pers["EcoTrack.Persistence<br/>DbContext · migraciones"]
    Infra["EcoTrack.Infrastructure<br/>CoinGecko · Resend · jobs"]
    Pkgs[["Commons.* / UiMetadata.*<br/>(paquetes reutilizables)"]]

    Web -->|invoca Handlers| App
    App --> Core
    Pers --> Core
    Infra -.->|implementa interfaces de| App
    Web -.->|registra por DI| Pers
    Web -.->|registra por DI| Infra
    Web --> Pkgs
    App --> Pkgs
    Pers --> Pkgs

    click Pkgs "#/packages/"
```

Una petición típica: `Controller → Handler → ICommonRepository → DbContext → SQL Server`.

## Guías

- [Seguridad](security.md)
- [Roles, planes y panel admin](roles-plans-admin.md)
- [Verificación en dos pasos](two-factor-authentication.md)
- [Importación de transacciones](importing-transactions.md)
- [Añadir un tema](adding-a-theme.md)
- [Operación y despliegue](operations.md)

## Relación con los paquetes

EcoTrack **consume** los paquetes `Commons.*` / `UiMetadata.*`; los paquetes no
conocen a EcoTrack. Qué paquete se usa dónde y con qué configuración está en
[Qué paquetes usa EcoTrack](uso-de-paquetes.md).
