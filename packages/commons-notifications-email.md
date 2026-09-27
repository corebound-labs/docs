# Commons.Notifications.Email

Canal "email" para [Commons.Notifications](/packages/commons-notifications.md): reenvía cada aviso por
[Commons.Email](/packages/commons-email.md) (`IAppEmailSender`) con un cuerpo HTML mínimo (título, cuerpo, enlace).
No conoce el modelo de identidad del consumidor — el email del usuario lo resuelve `IEmailAddressResolver`, que cada
app implementa según el suyo.

## Cuándo usarlo

Cualquier consumidor de `Commons.Notifications` que además quiera que ciertos avisos lleguen por email (no solo a la
bandeja in-app), sin acoplar el core de notificaciones a un modelo de identidad concreto.

## Instalación

```xml
<ProjectReference Include="..\Commons\Commons.Notifications.Email\Commons.Notifications.Email.csproj" />
```

Requiere `Commons.Notifications` y `Commons.Email` ya registrados.

## Uso

1. Implementar `IEmailAddressResolver` según el modelo de identidad del consumidor:

```csharp
public class AppUserEmailResolver(AppDbContext db) : IEmailAddressResolver
{
    public async Task<string?> GetEmailAsync(string userId, CancellationToken cancellationToken = default)
        => await db.Users.Where(u => u.Id == userId).Select(u => u.Email).FirstOrDefaultAsync(cancellationToken);
}
```

2. Registrar el canal junto al resto de `Commons.Notifications`:

```csharp
builder.Services.AddNotifications()
    .AddInAppChannel<AppDbContext>()
    .AddEmailChannel<AppUserEmailResolver>();
```

## Piezas

| Tipo | Qué hace |
|---|---|
| `EmailNotificationChannel` | Implementa `INotificationChannel` (`Name = "email"`). Resuelve el email con `IEmailAddressResolver`, arma un HTML mínimo (título + cuerpo + enlace, escapado con `WebUtility.HtmlEncode`) y lo envía con `IAppEmailSender` |
| `IEmailAddressResolver` | Punto de extensión: cada app resuelve el email de un `userId` según su propio modelo de identidad. `null`/vacío → el canal devuelve `Skipped`, no error |
| `AddEmailChannel<TResolver>()` | Registra `TResolver` como `IEmailAddressResolver` (scoped) y añade el canal al `NotificationsBuilder` |

## Decisiones y límites

- **Sin usuario con email → `Skipped`, no error.** Se registra en debug y el dispatcher lo refleja en el
  `DispatchResult` del canal, igual que cualquier otro canal que no pueda entregar.
- **HTML mínimo, sin plantilla propia.** Un consumidor que quiera una plantilla con marca implementa su propio canal
  (sigue siendo `INotificationChannel`) y reemplaza este; no hay punto de extensión para el HTML dentro de este
  paquete.
- **No reintenta.** Un fallo de `IAppEmailSender` (SMTP caído, etc.) se propaga como cualquier otro fallo de canal:
  reintentos con backoff no están cubiertos (mismo límite que el resto de `Commons.Notifications`).
