# Roles, planes y panel de administración

Tres ejes **independientes** por usuario: **rol** (User / Admin), **estado** (Active / Blocked / …) y **plan**
(Basic / Complimentary / los que se añadan). "Friendly" no es un rol (es un plan), "test" no es un rol (es una
marca) y "bloqueado" es un estado.

## Modelo (`AspNetUsers` + tablas nuevas)
| Campo / tabla | Detalle |
|---|---|
| `Role` (`UserRole`) | `User = 0`, `Admin = 1` (`Support = 2` reservado) |
| `Status` (`UserStatus`) | `Active`, `Blocked`, `PendingVerification` (sin usar: la verificación de correo sigue en Identity), `Deleted` (sincronizado con el `IsDeleted` de siempre) |
| `PlanId`, `PlanAssignedAt`, `PlanExpiresAt` | plan actual (FK a `Plans`); **la caducidad no se aplica sola** (no hay job que degrade a Basic) |
| `IsTestAccount` | marca de cuenta de test; se guarda y se ve en el panel, pero **todavía no excluye a nadie** de métricas o notificaciones (no hay puntos donde aplicarlo) |
| `BlockedAt`, `BlockedReason`, `BlockedByUserId`, `LastLoginAt` | datos del bloqueo y último acceso |
| `TimeZoneId` | zona IANA del usuario (por defecto `Europe/Madrid`, sin interfaz): define dónde empieza "el día" del límite diario |
| `ThemeId` | tema visual ([guía](adding-a-theme.md)) |
| `Plans` | `Code` único (`basic`, `complimentary`), `IsBillable`, `IsActive`, `SortOrder`, `ShowAds`, `MaxDailyTransactions`, `MaxWallets`, `MaxAccounts` (`null` = ilimitado). Ids fijos en `PlanIds` |
| `AdminActionLog` | solo se añade (nunca se edita ni se borra): quién, sobre quién, acción, detalle, fecha |
| `UserDailyUsage` | contador de transacciones manuales por usuario y día (ver abajo) |

## Límites de plan (`IPlanLimitService`)
Seed: **Basic** = 4 transacciones nuevas al día, 2 wallets, 2 cuentas, con anuncios. **Complimentary** = sin límites
ni anuncios (admins y usuarios a quienes no se cobra).

- **Bloquean la creación, nunca borran ni modifican:** un usuario que ya supera un límite (p. ej. de la beta)
  conserva todo y solo no puede crear más.
- **Transacciones/día:** cuenta las creadas **a mano** por el usuario. No consumen cupo las programadas ni los
  saldados de deuda. El "día" se calcula en la zona horaria del usuario. **Eliminar una transacción no devuelve
  cupo** — las transacciones se borran de verdad, así que el cupo vive en `UserDailyUsage` (una fila por usuario y
  día), no en contar filas.
- **Wallets / cuentas:** límite global por usuario sobre las que **él creó** (`InsertUser`) y siguen activas.
  Ser cotitular de una ajena no gasta cupo; las eliminadas no cuentan.
- **Dónde se aplica:** en `CommonController.Save` (único camino de creación manual) y no dentro de los handlers,
  porque estos los reutilizan flujos que no deben gastar cupo (programadas, saldados). Se comprueba **antes** de
  crear y se anota **después** de crear con éxito.
- **Respuesta al alcanzar el límite:** HTTP 403 con `{ success:false, error, code:"PlanLimitReached", limitType,
  limit, current, planCode }`; el modal muestra `error` (el grid lee `errors`, `message` o `error`).
- **Indicadores** ("Cuentas: 1 de 2", "Wallets", "Transacciones hoy"): `ViewComponent PlanUsage` + `GET /Plan/Usage`;
  se refrescan solos tras crear o borrar en una tabla.
- **Limitación conocida:** comprobar y anotar son dos pasos; dos peticiones simultáneas del mismo usuario podrían
  pasar las dos con 3 usadas y llegar a 5. Ventana muy pequeña; se cierra con una actualización atómica si importa.

## Bloqueo y sesiones
Una cuenta `Blocked`/`Deleted` no puede entrar, y **una sesión ya abierta se corta en la siguiente petición**:
`UserAccessCookieEvents` consulta rol, estado, tema y 2FA en cada petición (`IUserAccessCache`, 30 s, invalidada al
instante por las acciones del panel) y añade `ecotrack:role`, `ecotrack:status`, `ecotrack:theme` y `ecotrack:2fa`
como claims **de esa petición** (no se guardan en la cookie). Quien es bloqueado ve un aviso en el login (sin el
motivo) y `uiMetadataFetch` navega al login si una llamada pierde la sesión.

## Panel de administración (`/Admin/Users`)
- **Política `AdminOnly`:** rol Admin **y** cuenta Active **y** 2FA activo. Se comprueba en servidor en todos los
  endpoints; ocultar el enlace no es seguridad. Sin permiso: 403 (a un administrador sin 2FA que navega se le lleva a
  activarlo).
- **Listado:** filtros por rol, plan (se rellena desde `Plans`, así que un plan nuevo aparece solo), estado y test;
  la búsqueda de texto es la del grid. Filtros con la barra genérica del RCL ([Grid](packages/uimetadata-grid.md)).
- **Ficha** (HTML renderizado en servidor, todo codificado): datos de cuenta, datos del bloqueo, **solo recuentos**
  de uso frente a los límites e historial de acciones. **Nunca** transacciones, saldos ni wallets.
- **Acciones** (`IUserAdminService`): bloquear (pide motivo, ≤ 500) / desbloquear, cambiar plan, marcar/desmarcar
  test, restablecer 2FA. El servicio también admite cambiar de rol (sin botón en la v1).
- **Reglas:** nadie puede bloquearse, ni cambiarse rol o plan; nunca puede quedar la app sin un admin activo; un admin
  debe tener el plan Complimentary (al promover a alguien se le asigna); cada acción y su fila de `AdminActionLog` se
  guardan en **un único `SaveChanges`** (atómico).

## Publicidad
- `_AdSlot` (un hueco al final de cada página de la app) solo existe en el HTML si el plan del usuario tiene
  `ShowAds`. `_AdsScripts` solo carga un script si el plan muestra anuncios **y** hay una URL https en `Ads:ScriptUrl`.
- Configuración (`Ads`): `ScriptUrl` (vacío = ningún script) y `ShowPlaceholders` (recuadro visible en cada hueco;
  `true` en Development, `false` en Producción).
- **Antes de activar anuncios reales:** elegir la red, permitir su dominio en la CSP (`Program.cs`) y poner antes el
  **banner de consentimiento RGPD/cookies**.

## Cómo añadir un plan
1. Añadir la fila en `PlanSeedData` (con un `Id` fijo y una constante en `PlanIds`) y generar la migración.
2. Nada más: el filtro y el selector del panel salen de la tabla. Los límites son datos, no código.

## Migraciones de esta feature
`AddRolesPlansAndAdminLog` (columnas, `Plans` con su seed y `AdminActionLog`; deja a los usuarios existentes como
User / Active / Basic, marca como `Deleted` a los ya eliminados y **promueve a Admin + Complimentary al propietario,
localizado por email dentro de la migración: hay que comprobar que coincide con la cuenta de producción**),
`AddUserDailyUsage` y `AddUserTheme`. Ver [Operación y despliegue](operations.md).
