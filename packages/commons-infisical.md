# Commons.Infisical

## Qué es

Cliente .NET estandarizado para el gestor de secretos Infisical.

## Cuándo usarlo

Cuando querés que el resto de la app consuma secretos vía
`config["clave"]`/`IOptions<T>` sin saber que el origen real es Infisical —
mismo contrato que tendría cualquier otro backend de configuración.

## Instalación

```xml
<ProjectReference Include="..\Commons\Commons.Infisical\Commons.Infisical.csproj" />
```

> Cuando exista feed NuGet: `dotnet add package Commons.Infisical`.

Configuración requerida:
- `appsettings.json`: `Infisical:ProjectId` (obligatorio), `Infisical:SiteUrl` (opcional, default cloud oficial).
- Variables de entorno de máquina (nunca en `appsettings.json`): `INFISICAL_CLIENT_ID`, `INFISICAL_CLIENT_SECRET`.

## Ejemplo mínimo de uso

```csharp
using Infisical.Extensions;

builder.Configuration.AddInfisical(
    environmentSlug: builder.Environment.IsDevelopment() ? "dev" : "prod",
    applicationName: "ecotrack");
```

```csharp
public class MyService(IConfiguration config)
{
    public void MyMethod()
    {
        string connectionString = config["sql-connectionstrings"];
    }
}
```

## Archivos a tocar/crear al integrarlo en un proyecto nuevo

1. `ProjectReference` al `.csproj` consumidor.
2. `Infisical:ProjectId`/`Infisical:SiteUrl` en `appsettings.json`.
3. `INFISICAL_CLIENT_ID`/`INFISICAL_CLIENT_SECRET` como variables de entorno de máquina (dev) o GitHub Actions Secrets (CI/CD) — nunca en `appsettings.json`.
4. `builder.Configuration.AddInfisical(...)` en `Program.cs`, antes de que el resto de la app lea configuración.

## Comportamiento

- Fail-fast al arrancar: credenciales inválidas o `ProjectId` inalcanzable tiran excepción antes de que la app termine de iniciar.
- Reload en background cada `ReloadInterval` (default 5 min) — valores nuevos visibles sin reiniciar el proceso.
- Si un reload falla, se mantiene la última configuración conocida — la app no se cae.
- `applicationName` filtra secretos por prefijo `"{applicationName}-"` y lo quita al derivar la key.
- Nombres con `--` se tratan como secciones anidadas (`Database--ConnectionString` → `config["Database:ConnectionString"]`).
- `keyMap` permite mapear un secreto a una key distinta a la regla por defecto.

## Dependencias

Ninguna de otro paquete `Commons.*`/`UiMetadata.*`.
