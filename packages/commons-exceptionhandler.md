# Commons.ExceptionHandler

## Qué es

Middleware global de manejo de excepciones: `BaseException` (definida en
este paquete) → 400, cualquier otra `Exception` → 500, respuesta JSON
uniforme. Opcionalmente acumula errores no fatales por request, los procesa
en background vía un `IAlertService` propio del consumidor, y puede loguear
cada llamada a un endpoint en BD.

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

Esta línea es todo lo que EcoTrack usa hoy — el resto (alertas, logging de
llamadas en BD) es opcional.

## Ejemplo mínimo de uso

```csharp
public class SaveAccountHandler
{
    public async Task HandleAsync(SaveAccountCommand command)
    {
        if (command.Name is null)
            throw new BaseException("El nombre es obligatorio."); // → 400, no 500
    }
}
```

## Archivos a tocar/crear al integrarlo en un proyecto nuevo

1. `ProjectReference` al proyecto web.
2. `app.UseExceptionHandling();` temprano en el pipeline de `Program.cs`.
3. `throw new BaseException("mensaje")` para cualquier error de negocio esperado (→ 400); todo lo demás cae a 500 genérico.
4. Opcional: `services.AddErrorResponseHandling()` + `IErrorResponseService.AddError(ex)` para acumular errores no fatales sin abortar el request.
5. Opcional: `services.AddAlertProcessing<TuIAlertServiceImpl>()` para procesarlos en background.
6. Opcional: `services.AddErrorResponseDbLogging(connectionString, opts => opts.LogEveryCall = true)` (o `[CallLogAttribute]`/`[IgnoreCallLogAttribute]` por endpoint) para loguear llamadas en BD.

## `BaseException`

Única señal que el middleware usa para decidir 400 vs 500 — cualquier
excepción de negocio visible al usuario debe ser (o heredar de)
`BaseException`.

## Dependencias

Ninguna de otro paquete `Commons.*`/`UiMetadata.*`.
