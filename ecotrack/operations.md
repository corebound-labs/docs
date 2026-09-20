# Operación y despliegue de EcoTrack

## Entornos y configuración
- **Secretos:** Infisical, con el entorno `dev` en Development y `prod` en cualquier otro (`environmentSlug` en
  `Program.cs`). Las credenciales de Infisical (`INFISICAL_CLIENT_ID` / `INFISICAL_CLIENT_SECRET`) son variables de
  entorno; el resto de secretos (cadena de conexión `sql-connectionstrings`, `googleauth-*`, la clave de cifrado de
  campos…) **no están en el repositorio**.
- **Consecuencia práctica:** las claves de Infisical se leen **después** de las variables de entorno y de la línea de
  comandos, así que no se puede redirigir la base de datos de una ejecución local con una variable. Arrancar la app
  en Development usa la base de desarrollo real, y **aplica ahí las migraciones**. Para probar contra otra base hay
  que montar un banco de pruebas aparte (así se probó el 2FA con Identity real).
- **`appsettings`:** `AllowedHosts` de Producción restringido a `ecotracks.app;www.ecotracks.app`; sección `Ads`
  (`ScriptUrl`, `ShowPlaceholders`); `ScheduledTransactions:PollingIntervalMinutes` (15 en producción, 1 en
  Development).

## Migraciones
La app ejecuta `Database.Migrate()` **en cada arranque, también en producción** (`ApplyMigrations`). Es cómodo, pero:
- una migración destructiva se aplica sola, sin revisión ni copia de seguridad;
- si una migración falla, la web no arranca;
- el usuario de la base necesita permisos DDL.

**Regla:** haz una **copia de seguridad de la base de datos antes de cada despliegue que traiga migraciones**
(panel de SmarterASP) y revisa el SQL nuevo (`dotnet ef migrations script <anterior> <nueva>`). Una alternativa
futura es un interruptor `Database:AutoMigrate` apagado en producción y aplicar el script a mano.

Para generar una migración con la app abierta hay que cerrarla (Visual Studio bloquea los `.dll`):
```bash
dotnet ef migrations add NombreDeLaMigracion --project EcoTrack.Persistence --startup-project EcoTrack --context EcoTrackDbContext
```
`migrations add` no toca ninguna base de datos; `database update` sí, y usaría la de Infisical: para probar una
migración sobre una base propia, pasa `--connection` (así se comprobaron las de esta versión sobre una LocalDB
temporal, incluido el `Down`).

## Despliegue
- Se publica desde **Visual Studio** (perfil Web Deploy o FTP; los `.pubxml` no van al repositorio). El workflow de
  GitHub Actions para SmarterASP no se usa.
- Antes: copia de seguridad si hay migraciones; después: la lista de abajo.
- **Versión visible** en el pie de la barra lateral y en las pantallas de acceso: sale de `git describe --tags`
  al compilar (`AppVersion`, con `EcoTrack.csproj`). Necesita `git` y las etiquetas en la máquina que publica; sin
  ellas cae a `v1.0.0`. En una rama con commits sobre la etiqueta se ve `v1.0.0-157+N` (N commits por delante).

## Lista tras desplegar
1. Abrir dos o tres páginas con la consola del navegador (F12): sin violaciones de CSP.
2. Ctrl+F5 (los ficheros estáticos de JS/CSS se cachean fuerte; llevan `?v=` que cambia con el contenido).
3. `curl -sI https://ecotracks.app/`: HSTS de 1 año, CSP con nonce, sin `Server` ni `X-Powered-By`
   (dependen de que el hosting respete el `web.config`).
4. Entrar con la cuenta de administrador y **activar su 2FA** (sin él no se abre el panel).
5. Probar un flujo con datos reales: crear una transacción (y comprobar el indicador de uso), abrir Detalles desde
   Cuentas, cambiar el tema en Perfil.

## Git y ramas
- `develop` es la rama de integración y `master` la de release. Cada trabajo en su rama, con PR a `develop`.
- **Crea las ramas sin upstream**: `git switch -c mi-rama --no-track origin/develop`. Con `git checkout -b mi-rama
  origin/develop` la rama queda **siguiendo a `origin/develop`**, y un push desde Visual Studio (Sync/Push) enviaría los
  commits directamente a `develop` sin PR. Comprueba con `git branch -vv` que no aparece `[origin/develop]`.
- Un commit por tema (el arreglo primero y lo demás aparte) facilita llevar un arreglo solo a `develop`.
- Los cambios de la RCL (`UiMetadata.*`) van con su README y su página en este sitio en el mismo trabajo.

## Cuándo mirar los registros
Los errores inesperados se registran con su `CorrelationId` (también en el 500 que ve el usuario): con ese código se
localiza el error en el log. Los errores de negocio que devuelve `HandlerError` (mensaje pensado para el usuario) no se registran como fallo.
