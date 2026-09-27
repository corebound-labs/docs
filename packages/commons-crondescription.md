# Commons.CronDescription

Traduce una expresión cron de 5 campos (formato estándar) a texto legible en varios idiomas, y detecta un caso concreto
de mal uso: fijar un día de mes ≥29 que no existe todos los meses. Sin dependencia de EF Core ni de ningún dominio —
no sabe nada de EcoTrack.

## Cuándo usarlo

Cualquier app .NET que deje al usuario configurar un cron (jobs programados, recordatorios...) y quiera mostrarle qué
significa en texto plano, además de avisarle ANTES de guardar si el patrón que eligió va a saltarse meses enteros.

## Por qué existe

Cron estándar, al procesar un patrón como `día-de-mes = 31` con `mes = *`, **salta enteros** los meses que no tienen
ese día (febrero, abril, junio, septiembre, noviembre) — no cae al último día del mes ni se corre al mes siguiente.
Un usuario que configura "el día 31 de cada mes" esperando que dispare todos los meses se lleva una sorpresa
silenciosa (7 ocurrencias al año en vez de 12). Este paquete no cambia ese comportamiento (es el estándar de cron,
no un bug) — solo lo hace visible.

## Instalación

```xml
<ProjectReference Include="..\Commons\Commons.CronDescription\Commons.CronDescription.csproj" />
```

## Uso mínimo

```csharp
using Commons.CronDescription;

var result = CronDescriptionService.Describe("3 9 31 * *"); // locale: "es" por defecto

result.IsValid;            // true (Cronos pudo parsearla)
result.Description;        // "A las 09:03, el día 31 del mes"
result.ErrorMessage;       // null (solo se llena si IsValid es false)
result.DayOfMonthWarning;  // "El día 31 no existe en: febrero, abril, junio,
                           //  septiembre, noviembre — esos meses no
                           //  generarán ninguna ocurrencia."
```

Una expresión inválida no lanza excepción — `IsValid` queda en `false` y `ErrorMessage` trae el detalle (delegado en
el mensaje de `Cronos.CronFormatException`).

## `DayOfMonthWarning` — qué cubre y qué no

Cubre a propósito **solo** el caso claro: el campo día-de-mes es un único número literal (`29`, `30` o `31`, sin
listas ni rangos ni `step`). El campo mes sí se interpreta (`*`, número, lista o rango) — si el patrón ya restringe
el día 31 a meses que lo tienen, no avisa. Un patrón con lista/rango en el día de mes no se analiza: se prefiere no
avisar (falso negativo) antes que arriesgar un falso positivo.

## `Description` — de dónde sale

Vía [`CronExpressionDescriptor`](https://www.nuget.org/packages/CronExpressionDescriptor) (puerto de `cronstrue`),
que soporta varios `locale` (`es` por defecto). Si esa librería no puede describir una expresión que `Cronos` sí
validó, `Description` cae a la expresión cruda tal cual — nunca bloquea nada por esto.

## Dependencias

`Cronos` (parseo/validación) y `CronExpressionDescriptor` (texto legible). Ninguna de otro paquete
`Commons.*`/`UiMetadata.*`.
