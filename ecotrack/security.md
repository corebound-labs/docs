# Seguridad de EcoTrack

Resumen de las medidas de seguridad de la app, por qué están así y qué hay que tener en cuenta al tocarlas.
Las medidas salen de una auditoría previa a la beta; cada bloque indica dónde vive el código.

## Control de acceso y autenticación
- **Propiedad de los datos (IDOR):** los handlers comprueban que el usuario tiene acceso al recurso que recibe por
  id (participantes, saldados, cuentas, wallets…). Un id ajeno da un error de negocio, no datos.
- **Errores sin filtrar detalles:** `BaseController.HandlerError` muestra el mensaje solo de los errores de negocio
  (`InvalidOperationException`, `UnauthorizedAccessException`, `BaseException`); cualquier otra excepción se
  registra con su `CorrelationId` y el cliente recibe un 500 genérico con ese código.
- **Login:** mismo mensaje para "el correo no existe", "cuenta eliminada" y "contraseña incorrecta" (con usuario
  inexistente se calcula igualmente un hash, para que el tiempo no delate nada). El estado de la cuenta
  (bloqueada, correo sin validar) solo se revela **después** de acertar la contraseña.
- **Bloqueo por intentos:** 5 fallos → 15 minutos (`Lockout`). Contraseña nueva de mínimo 10 caracteres (las
  existentes siguen valiendo).
- **Google:** un login con Google nunca se enlaza a una cuenta local **sin confirmar** (pre-secuestro de cuenta:
  alguien registra el correo de otra persona con su propia contraseña); si ocurre, se confirma el correo, se
  elimina la contraseña precargada y se rota el sello de seguridad.
- **Reenvío del correo de confirmación:** respuesta siempre igual exista o no la cuenta, enfriamiento de 60 s por
  correo y límite `sensitive`. Solo cuentas sin confirmar y no eliminadas.
- **Cuentas eliminadas:** registrarse con su correo **no** cambia su contraseña ni su estado; envía un enlace de un
  solo uso (token con propósito propio) y solo quien abre el enlace desde su buzón elige la contraseña y la
  reactiva. El login con Google sí reactiva directamente (Google ya verificó el correo).
- **Invitaciones:** el token es un secreto criptográfico (`RandomNumberGenerator`) con caducidad embebida
  (`secreto.unixExpiry`, 7 días). Las invitaciones de formato antiguo se tratan como caducadas.
- **Sesiones abiertas:** rol y estado se leen de BD en cada petición (caché de 30 s invalidada al instante por las
  acciones del panel). Una cuenta bloqueada o eliminada pierde su sesión en la siguiente petición. Ver
  [Roles, planes y panel admin](roles-plans-admin.md).
- **Verificación en dos pasos:** ver [su guía](two-factor-authentication.md).

## Peticiones y navegador
- **CSRF:** `AutoValidateAntiforgeryToken` global (todo POST/PUT/DELETE). Los formularios Razor llevan el token solos;
  los `fetch` lo mandan en la cabecera `RequestVerificationToken` (`window.uiMetadataFetch`, definido en
  `_Layout.cshtml` a partir de `<meta name="csrf-token">`); los `<form method="POST">` que se crean por JS deben
  añadirlo con `appendCsrfToken(form)` (RCL Grid). **Un POST sin token da 400**: lo sufrió la navegación
  Cuentas → Detalles hasta que se corrigió.
- **CSP con nonce por petición** (middleware en `Program.cs`): `script-src 'self' 'nonce-…' cdnjs jsdelivr` y
  `script-src-attr 'none'`; sin `unsafe-inline` para scripts. Consecuencias para quien programe:
  - un `<script>` en línea recibe el nonce solo (`CspNonceTagHelper`, RCL Elements; requiere
    `@addTagHelper *, UiMetadata.Elements` en el `_ViewImports`);
  - los atributos `onclick=`/`onchange=` están **prohibidos**: se usa `data-ui-onclick`/`-onchange`/`-oninput`,
    que ejecuta un único despachador sin `eval` (solo `funcion(args)` con literales, `this`, `event`);
  - `style-src` conserva `'unsafe-inline'` a propósito (hay `style=` por todas las vistas y inyectar solo estilos
    es un riesgo mucho menor).
- **Cabeceras:** `Strict-Transport-Security` de 1 año (sin `includeSubDomains`/`preload`, a propósito),
  `X-Content-Type-Options`, `X-Frame-Options: DENY`, `frame-ancestors 'none'`, `Referrer-Policy`,
  `Permissions-Policy`, `Cross-Origin-Opener-Policy`. `Server` y `X-Powered-By` se quitan con el `web.config`
  (medido: securityheaders.com A+, SSL Labs A).
- **Cookies:** `Secure` siempre fuera de Development (sesión, TempData, antiforgery, autenticación y la cookie
  temporal del segundo paso), `HttpOnly`, `SameSite=Lax`.
- **`AllowedHosts`** (Producción): `ecotracks.app;www.ecotracks.app`. Cualquier otro host recibe 400: si se añade un
  dominio o alias, hay que añadirlo aquí.
- **Límite de peticiones:** política `sensitive` (10/min por usuario, o por IP si no hay sesión) en login, registro,
  recuperación de contraseña, reenvíos, invitaciones y los pasos del 2FA.
- **XSS reflejado / codificación:** todo dato de usuario que va a un correo o a una página construida a mano se
  codifica (`HtmlEncode`); las vistas Razor codifican solas. La ficha del panel admin se renderiza en servidor
  precisamente por esto.

## Detrás de un proxy (Cloudflare)
La app lee la IP real de `CF-Connecting-IP` **solo cuando la conexión llega desde un rango oficial de
Cloudflare** (`ForwardedHeaders` con `KnownIPNetworks`); si no, cualquiera podría falsificar la cabecera y esquivar
el límite de peticiones. Hoy los DNS están en Cloudflare **sin proxy** (nube gris) y se decidió no activarlo: en
España los operadores bloquean rangos de Cloudflare durante los partidos y la web dejaba de cargar para los usuarios
(no es un fallo del servidor: la IP de origen respondía). Sin proxy no hay WAF ni protección DDoS de Cloudflare; el
código ya está preparado por si se reactiva.

## Dependencias y secretos
- **Dependabot** (`.github/dependabot.yml`): NuGet y GitHub Actions, semanal, contra `develop`.
- **Workflow `vulnerability-scan.yml`:** en cada PR, y semanalmente, ejecuta `dotnet list package --vulnerable
  --include-transitive` y falla si encuentra alguno (el comando por sí solo devuelve 0, el workflow mira la salida).
  Revisa cada PR de Dependabot antes de mergearlo: un bump puede romper la compilación (por ejemplo, borró la
  referencia a `Mapster.DependencyInjection`).
- **Secretos:** viven en Infisical (entorno `dev` en Development, `prod` en el resto), nunca en el repositorio.
  Cifrado de columnas sensibles (p. ej. los últimos 4 dígitos de una tarjeta) con `IFieldEncryptor`.

## Cómo comprobarlo desde fuera (gratis)
- Cabeceras: securityheaders.com sobre `https://ecotracks.app`.
- TLS: ssllabs.com/ssltest.
- `curl -sI https://ecotracks.app/` para ver HSTS, CSP y que no salen `Server` / `X-Powered-By`.
- Consola del navegador (F12) en dos o tres páginas tras cada despliegue: una violación de CSP aparece ahí.

## Límites conocidos
- `style-src 'unsafe-inline'` se mantiene.
- El enfriamiento de reenvíos (60 s) vive en memoria de cada instancia; con varias instancias se multiplica.
- Un alta con un correo de cuenta eliminada envía un correo aunque quien lo pidió no sea el dueño (el correo lo
  explica y no cambia nada hasta que el dueño abre el enlace).
- Migraciones automáticas al arrancar: ver [Operación y despliegue](operations.md).
