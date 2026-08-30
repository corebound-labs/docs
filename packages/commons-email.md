# Commons.Email

## Qué es

Envío de emails transaccionales, desacoplado del proveedor. Interfaz
genérica (`to`/`subject`/`htmlBody`) + una implementación sobre Resend, sin
ninguna plantilla ni texto de negocio dentro.

## Cuándo usarlo

Cualquier app .NET que necesite mandar emails transaccionales (confirmación
de cuenta, invitaciones, notificaciones) y quiera poder cambiar de proveedor
sin tocar el código que arma el contenido del email.

## Instalación

```xml
<ProjectReference Include="..\Commons\Commons.Email\Commons.Email.csproj" />
```

> Cuando exista feed NuGet: `dotnet add package Commons.Email`.

```csharp
using Commons.Email;
using Commons.Email.Providers.Resend;

builder.Services.Configure<ResendEmailOptions>(builder.Configuration.GetSection("Email:Resend"));
builder.Services.AddHttpClient<IAppEmailSender, ResendEmailSender>((sp, client) =>
{
    var options = sp.GetRequiredService<IOptions<ResendEmailOptions>>().Value;
    ResendEmailSender.ConfigureHttpClient(client, options);
});
```

```json
{ "Email": { "Resend": { "FromEmail": "no-reply@tudominio.com", "FromName": "Tu App" } } }
```

`FromName` no tiene default de marca — el paquete es genérico, cada
consumidor lo fija.

## Ejemplo mínimo de uso

```csharp
public class InviteParticipantHandler(IAppEmailSender emailSender)
{
    public async Task HandleAsync(...)
    {
        await emailSender.SendAsync(
            toEmail: "usuario@ejemplo.com",
            subject: "Te han invitado",
            htmlBody: "<p>Alguien te ha invitado a...</p>");
    }
}
```

## Archivos a tocar/crear al integrarlo en un proyecto nuevo

1. `ProjectReference` al `.csproj` consumidor.
2. Sección `Email:Resend` en `appsettings.json` (`FromEmail`/`FromName`).
3. `ApiKey`/`BaseUrl` — desde donde el proyecto gestione secretos (Infisical, Key Vault, variables de entorno).
4. El registro de DI (`Configure<ResendEmailOptions>` + `AddHttpClient<IAppEmailSender, ResendEmailSender>`) en el `AddInfrastructure`/equivalente del proyecto.

## Añadir otro proveedor

`IAppEmailSender` es el único contrato que el resto de la app conoce — un
proveedor nuevo (SendGrid, SMTP genérico) es una clase más bajo
`Providers/{Nombre}/` implementando `SendAsync`, sin tocar ningún consumidor
existente.

## Dependencias

Ninguna de otro paquete `Commons.*`/`UiMetadata.*`.
