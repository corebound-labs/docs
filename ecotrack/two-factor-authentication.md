# Verificación en dos pasos (2FA)

Segunda capa opcional para el acceso **con contraseña**: además de la contraseña, se pide un código de 6
dígitos (TOTP) de una app autenticadora — Google Authenticator, Microsoft Authenticator, Authy…
Está construida sobre ASP.NET Identity (TOTP, códigos de recuperación, bloqueo por intentos); lo propio de
EcoTrack es el flujo y las pantallas.

## Para el usuario
- **Activar** (Perfil → *Seguridad*, o directamente `/TwoFactor/Setup`): escanear el QR (o teclear la clave),
  confirmar con un código de 6 dígitos y guardar los **10 códigos de recuperación**, que se muestran **una sola
  vez**. Activarla cierra las *otras* sesiones abiertas (la actual se renueva).
- **Iniciar sesión:** contraseña → pantalla "Introduce tu código". El código se envía solo al completar las 6
  casillas. Alternativa: "Usar un código de recuperación" (cada uno sirve una vez).
- **Desactivar / regenerar códigos** (Perfil): se confirma con un código vigente de la app (desactivar también
  acepta uno de recuperación). Al desactivar se descarta la clave y se avisa por correo.
- **Acceso con Google:** no pide este código (Google tiene su propia verificación).

## Para administradores
- **Es obligatoria para acceder al panel:** la política `AdminOnly` exige el claim `ecotrack:2fa = true`. Un
  administrador sin 2FA que navega a `/Admin/...` es llevado a `/TwoFactor/Setup?adminRequired=true`
  (`UserAccessCookieEvents.HandleAccessDenied`); para peticiones que no son navegación (fetch, POST) sigue siendo
  un 403.
- **Restablecer el 2FA de otro usuario** (ficha del usuario → *Restablecer verificación en dos pasos*): para quien
  perdió el móvil y los códigos. Lo desactiva, cambia su sello de seguridad (cierra sus sesiones) y queda en el
  historial (`AdminActionType.ResetTwoFactor`). No se permite sobre uno mismo (se hace desde el Perfil).

## Decisiones de seguridad (por qué está hecho así)
- **Sin sesión hasta el código.** Tras acertar la contraseña solo existe una cookie temporal
  (`IdentityConstants.TwoFactorUserIdScheme`, 5 min, con la política *Secure* fuera de Development). Login la crea a
  mano (`StorePendingTwoFactorAsync`) porque comprueba la contraseña sin `PasswordSignInAsync` (para no revelar qué
  correos existen); es el mismo formato que usa `SignInManager`.
- **El contador de intentos fallidos no se reinicia al acertar la contraseña** si hay 2FA (`AuthController.Login`).
  Si se reiniciara, quien conozca la contraseña podría probar códigos de 6 dígitos sin acumular fallos. El reinicio
  llega al completar el segundo paso; 5 fallos bloquean la cuenta 15 minutos. Los endpoints llevan además el
  límite de peticiones `sensitive`.
- **Desactivar y regenerar cuentan fallos** igual que el login (`TwoFactorController.VerifyAsync`): una sesión
  abierta en un móvil desbloqueado no basta para quitar la protección ni para probar códigos sin freno.
- **Clave nueva en cada alta.** Abrir `/TwoFactor/Setup` siempre genera una clave nueva y desactivar la descarta:
  una clave vieja (o de un restablecimiento) nunca se reutiliza. Un código incorrecto en el alta NO cambia la clave;
  recargar la página sí (hay que escanear de nuevo).
- **Códigos de recuperación:** Identity los genera de 10 caracteres alfanuméricos en mayúsculas con un guion en medio
  (`T5KXX-JPWTB`) y los compara tal cual. `AuthenticatorUri.NormalizeRecoveryCode` acepta cómo los teclee el usuario
  (minúsculas, sin guion, con espacio) y los devuelve en ese formato. (Un primer intento quitaba el guion y **ningún
  código habría funcionado**; lo detectó la prueba con Identity real.)
- **Las claves y los códigos de recuperación** se guardan en `AspNetUserTokens` (provider `[AspNetUserStore]`);
  `AspNetUsers.TwoFactorEnabled` es el interruptor. No hay migración: las columnas y tablas ya existían.

## Piezas
| Qué | Dónde |
|---|---|
| Segundo paso del login | `AuthController.LoginWith2fa` / `LoginWithRecoveryCode`, vistas `Auth/LoginWith2fa`, `Auth/LoginWithRecoveryCode` |
| Alta, baja, códigos | `TwoFactorController`, vistas `TwoFactor/Setup`, `TwoFactor/RecoveryCodes`, tarjeta *Seguridad* de `Profile/Index` |
| QR | `QRCoder` (MIT), SVG en línea negro sobre blanco; URI `otpauth://` en `AuthenticatorUri` (Application) |
| Claim `ecotrack:2fa` | `UserAccessSnapshot.TwoFactorEnabled` → `UserAccessCookieEvents` (leído de BD en cada petición) |
| Restablecer desde el panel | `IUserAdminService.ResetTwoFactorAsync`, `AdminController.ResetTwoFactor`, `admin.js` |
| Casillas del código | componente `CodeInput` de `UiMetadata.Elements` (`AutoComplete = "one-time-code"`, `AutoSubmit`) |

## Límites conocidos
- **Google:** un administrador que entra con Google no recibe este código (Google gestiona su verificación); el
  requisito del panel se cumple con tener el 2FA de EcoTrack activado, aunque ese acceso no lo use.
- No hay "recordar este dispositivo" (a propósito, para la primera versión).
- Los códigos TOTP dependen de la hora del móvil: si es incorrecta, los códigos no coincidirán (el alta lo avisa).
- Si un usuario pierde el móvil y los códigos de recuperación, solo un administrador puede restablecerle el 2FA.
