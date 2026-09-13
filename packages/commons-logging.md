# Commons.Logging

## Qué es

Serilog para apps en hosting compartido con espacio de base de datos caro
(SmarterASP.NET, plan de SQL Server desde 1 GB): el log de alto volumen vive
en disco (fichero rotativo), la base de datos solo guarda errores críticos
(`Error`+), con purga automática. Incluye un middleware de `CorrelationId`
para correlacionar todas las líneas de log de un mismo request, en ambos
sinks.

```mermaid
graph LR
    Logging[Commons.Logging] --> BackgroundJobs[Commons.BackgroundJobs]
```

## Cuándo usarlo

Cuando necesitás logs útiles para reproducir bugs en producción sin que el
volumen de logging compita por espacio con los datos de negocio — la
decisión de diseño es esa separación: fichero para todo, SQL solo para lo
crítico.

## Instalación

```xml
<ProjectReference Include="..\Commons\Commons.Logging\Commons.Logging.csproj" />
```

```csharp
var connectionString = builder.Configuration["sql-connectionstrings"]
    ?? builder.Configuration.GetConnectionString("EcoTrackConnection")!;

builder.Host.UseCommonsSerilog(builder.Configuration, connectionString);
// ...
builder.Services.AddErrorLogPurgeJob(builder.Configuration, connectionString);
```

```csharp
var app = builder.Build();

app.UseCorrelationId(); // temprano — antes de cualquier middleware que loguee
app.UseExceptionHandling(); // Commons.ExceptionHandler, si está
```

`connectionString` se pasa explícito (mismo patrón que
`Commons.AuditableLogging.AddAuditableLogging<TDbContext>(connectionString)`)
— cada consumidor puede tener su propia convención para resolverlo
(Infisical, appsettings, secretos de entorno).

## Los dos sinks

| Sink | Contenido | Nivel mínimo | Retención |
|---|---|---|---|
| Fichero (`logs/log-.txt`) | Todo — fuente principal para reproducir bugs. Texto plano (no JSON), pensado para leerse por FTP/notepad sin herramientas. Rota diario, tope 10 MB/fichero. | `Information` | `Logging:FileRetentionDays` (default 14) |
| `LOG__ErrorLogs` (SQL) | Solo `Error`+ — tabla chica de alertas críticas, nunca reemplaza al fichero. Columna `Properties` guarda el `LogEvent` completo como JSON. | `Error` | `Logging:ErrorLogRetentionDays` (default 30, vía `ErrorLogPurgeService`) |

`LOG__ErrorLogs` se crea sola (`AutoCreateSqlTable`) recién con el primer
`Error` real. Nombre `LOG__` (no `ErrorLogs` a secas) para alinear con las
otras dos tablas de log del repo: `LOG__Audit`
([Commons.AuditableLogging](commons-auditablelogging.md)) y
`LOG__LogExceptionHandler`
([Commons.ExceptionHandler](commons-exceptionhandler.md), sin usar hoy en
EcoTrack).

## `appsettings.json`

Ambas claves viven bajo la misma sección `"Logging"` que ya usa ASP.NET
Core para `LogLevel` — conviven sin conflicto:

```json
{
  "Logging": {
    "LogLevel": { "Default": "Information", "Microsoft.AspNetCore": "Warning" },
    "FileRetentionDays": 14,
    "ErrorLogRetentionDays": 30
  }
}
```

## `CorrelationId`

`UseCorrelationId()` toma `X-Correlation-Id` del request si ya viene, o
genera uno nuevo. Lo expone en `LogContext` (todas las líneas del request
lo llevan, en cualquier sink), `HttpContext.Items["CorrelationId"]` (para
que otro middleware lo lea sin `ProjectReference` real — duck-typing por
convención de clave) y el header de respuesta (para reportarlo a soporte).
Debe cargarse antes de cualquier middleware que pueda loguear algo del
request.

## Integración con `Commons.ExceptionHandler`

Sin dependencia real de paquete en ninguna dirección — es por convención:
`ExceptionHandlingMiddleware` lee `HttpContext.Items["CorrelationId"]` (con
fallback a `TraceIdentifier` si este paquete no está cargado) y lo devuelve
en la respuesta. Con ambos activos, un 500 devuelve mensaje genérico +
`CorrelationId` — nunca el detalle interno — mientras el stack trace
completo va al log.

## Job de purga (`ErrorLogPurgeService`)

Reusa `Commons.BackgroundJobs.PollingBackgroundService` (mismo patrón que
`ScheduledTransactionProcessor`) en vez de un scheduler cron-driven — corre
en el mismo proceso, sin infraestructura adicional, con catch-up automático
si el proceso estuvo dormido. Frecuencia fija de 24hs, no una hora exacta
— `PeriodicTimer` no da esa precisión; no se consideró necesario un
scheduler cron real solo para esto. Logea a `Information` (fichero), nunca
`Error` — no debe generar ruido en la tabla que purga.

## Dependencias

`Commons.BackgroundJobs` (para `PollingBackgroundService`). Ninguna otra
`Commons.*`/`UiMetadata.*` — la integración con `Commons.ExceptionHandler`
es por convención, no por `ProjectReference`.
