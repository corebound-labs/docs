# Commons.BackgroundJobs

## Qué es

Base para jobs periódicos que corren DENTRO del mismo proceso ASP.NET
(`PeriodicTimer`), sin depender de un scheduler externo (Hangfire/Quartz/
tarea de Windows) — pensada para hosting compartido donde no se puede asumir
un proceso persistente separado (ej. SmarterASP.NET, donde el app pool se
recicla por inactividad y una tarea de SO no sobrevive el reciclado).

## Cuándo usarlo

Cuando necesitás un job que corra cada N minutos dentro de la misma app web
(sin infraestructura extra), y que además:
- Corra una vez de inmediato al arrancar (no esperar el primer intervalo
  completo) — útil para recuperar lo que se perdió mientras el proceso
  estaba dormido/reciclado.
- Tenga su propio scope de DI por corrida, para resolver Handlers/servicios
  `Scoped` (el job en sí es `Singleton`, como todo `IHostedService`).
- Nunca tumbe el host si una corrida falla — se loguea y se reintenta en el
  próximo tick, sin `try/catch` manual en cada job.

No es un reemplazo de Hangfire/Quartz si necesitás reintentos con backoff,
colas o un dashboard de jobs fallidos — es deliberadamente más simple, para
"una tarea de mantenimiento periódica, sin infraestructura adicional".

## Instalación

```xml
<ProjectReference Include="..\Commons\Commons.BackgroundJobs\Commons.BackgroundJobs.csproj" />
```

Sin método de extensión `Add...` — no hay nada que registrar del lado del
paquete; cada consumidor registra su propia subclase como `IHostedService`.

## Ejemplo mínimo de uso

```csharp
public class MyJob(
    IServiceScopeFactory scopeFactory,
    ILogger<MyJob> logger)
    : PollingBackgroundService(scopeFactory, logger, TimeSpan.FromMinutes(5))
{
    protected override async Task RunOnceAsync(IServiceProvider scopedServices, CancellationToken stoppingToken)
    {
        var handler = scopedServices.GetRequiredService<IMyScopedHandler>();
        await handler.HandleAsync();
    }
}
```

```csharp
services.AddHostedService<MyJob>();
```

Solo hace falta implementar `RunOnceAsync` — el `PeriodicTimer`, la corrida
inmediata al arrancar, el scope por corrida y el manejo de excepciones ya
están resueltos en la clase base. `interval` tiene un piso de 1 minuto — un
valor menor se redondea a `TimeSpan.FromMinutes(1)`.

## Cuándo conviene

Sirve para tareas periódicas que viven en el mismo proceso de la app
(procesar plantillas recurrentes, purgar logs, sincronizar datos). Por qué no
una tarea externa de SO: en hosting compartido el app pool se recicla por
inactividad. La corrida inmediata al arrancar cubre el hueco tras un
reinicio, así que el job debe ser idempotente y, si acumula trabajo
atrasado, ponerse un tope de seguridad para no procesarlo todo de golpe.

## Dependencias

Ninguna de otro paquete `Commons.*`/`UiMetadata.*` — solo
`Microsoft.Extensions.Hosting`/`DependencyInjection`/`Logging`.
