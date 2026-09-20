# Commons.ExceptionHandler

## Qué es

Middleware global de manejo de excepciones: `BaseException` (definida en
este paquete) → 400, cualquier otra `Exception` → 500, respuesta JSON
`{StatusCode, Message, Detailed, CorrelationId}`. `Detailed` (mensaje +
cadena de `InnerException`) solo se devuelve en el 400 — un 500 no expone su
mensaje interno, `Message` es un texto genérico y `Detailed` viene `null`;
el detalle completo con stack trace va al log (`_logger.LogError`), y el
cliente solo recibe `CorrelationId` para reportarlo a soporte. Opcionalmente
también acumula errores no fatales por request (`IErrorResponseService`),
los procesa en background vía un `IAlertService` que implementa el
consumidor, y puede loguear cada llamada a un endpoint en BD.

## Cuándo usarlo

Para no repetir `try/catch` → mapeo a código HTTP en cada controller — se
registra una vez y captura todo el pipeline.

## Instalación

```xml
<ProjectReference Include="..\Commons\Commons.ExceptionHandler\Commons.ExceptionHandler.csproj" />
```

```csharp
app.UseExceptionHandling();
```

Esta única línea es lo mínimo necesario — el resto (alertas,
logging de llamadas a BD) es opcional.

## Ejemplo mínimo de uso

```csharp
public class SaveProductHandler
{
    public async Task HandleAsync(SaveProductCommand command)
    {
        if (command.Name is null)
            throw new BaseException("El nombre es obligatorio."); // → 400, no 500
    }
}
```

Cualquier excepción no controlada que llegue al middleware se convierte en
500 automáticamente.

## Archivos a tocar/crear al integrarlo en un proyecto nuevo

1. `ProjectReference` al proyecto web.
2. `app.UseExceptionHandling();` en el pipeline de `Program.cs` (temprano, antes de los endpoints).
3. Usar `throw new BaseException("mensaje")` (o una subclase) para cualquier error de negocio esperado que deba responder 400 en vez de 500.
4. Opcional — acumular errores no fatales sin abortar el request: `services.AddErrorResponseHandling()` + inyectar `IErrorResponseService` y llamar `AddError(ex)`.
5. Opcional — procesarlos en background: `services.AddAlertProcessing<TuIAlertServiceImpl>()`.
6. Opcional — loguear cada llamada a un endpoint en BD: `services.AddErrorResponseDbLogging(connectionString, opts => opts.LogEveryCall = true)`, o marcar endpoints puntuales con `[CallLogAttribute]`/`[IgnoreCallLogAttribute]`.

## `BaseException`

```csharp
public class BaseException : Exception
{
    public string ExtendedMessage { get; } // arma el mensaje recorriendo InnerException
}
```

Es la única señal que el middleware usa para decidir 400 vs 500 — cualquier
excepción de negocio visible al usuario debe ser (o heredar de)
`BaseException`; todo lo demás cae a 500 genérico.

## Errores no fatales / alertas (opcional)

```csharp
public class SlackAlertService : IAlertService
{
    public Task ProcessErrors(List<ErrorResponse> errors, CancellationToken ct) => ...;
}

services.AddAlertProcessing<SlackAlertService>();
services.AddErrorResponseHandling();
```

Con esto registrado, si un request acumula errores no fatales
(`IErrorResponseService.AddError(...)`) pero termina en 200, el middleware
reescribe el status a `222` (`CustomHttpStatusCodes.OkWithErrors`) y
procesa los errores en background (`AlertBackgroundService`, un
`Channel<List<ErrorResponse>>` sin límite) sin bloquear la respuesta.

## Logging de llamadas en BD (opcional)

```csharp
services.AddErrorResponseDbLogging(connectionString, opts =>
{
    opts.LogEveryCall = true; // o dejar en false y marcar endpoints puntuales
});
```

```csharp
[CallLogAttribute]       // fuerza el log de este endpoint aunque LogEveryCall sea false
[IgnoreCallLogAttribute] // lo excluye aunque LogEveryCall sea true
public IActionResult MyAction() { ... }
```

Cada llamada queda en `LOG__LogExceptionHandler` (`Id, CallTime, Endpoint,
StatusCode, IsNotified`) — la tabla se crea sola al arrancar si no existe.
Este branch del middleware se salta en silencio si no hay ningún
`ExceptionHandlerDbContext` registrado (el caso por defecto).

## `CorrelationId` (integración opcional con `Commons.Logging`)

El middleware lee `HttpContext.Items["CorrelationId"]` — sin
`ProjectReference` real a `Commons.Logging`, por convención de clave. Si su
`UseCorrelationId()` está cargado antes en el pipeline, ese id (generado o
tomado del header `X-Correlation-Id`) aparece en la respuesta; si no, cae al
`TraceIdentifier` nativo de ASP.NET Core. Ver
[Commons.Logging](commons-logging.md) para el detalle completo.

## Dependencias

Ninguna de otro paquete `Commons.*`/`UiMetadata.*` (la integración con
`Commons.Logging` es por convención, no por `ProjectReference`).
