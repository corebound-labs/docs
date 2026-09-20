# Notificaciones

Avisos dentro de la app (campana en la barra superior) y, más adelante, por otros canales. La infraestructura es genérica
([Commons.Notifications](../packages/commons-notifications.md) + [UiMetadata.Notifications](../packages/uimetadata-notifications.md));
esta página describe **lo que hace EcoTrack con ella**: qué avisos existen, cuándo se emiten y qué reglas siguen.

## Qué ve el usuario
- Una **campana** en la barra superior con el contador de no leídos. Al pulsarla, un panel con los últimos avisos (marcar como
  leído al abrir uno, marcar todos, eliminar) y "Ver todas" lleva a la bandeja completa (`/notifications`).
- Cuando llega un aviso con la app abierta aparece un **toast** y el contador sube al instante (SignalR; si el hosting no admite
  WebSockets, SignalR cae a SSE/long-polling y, como último respaldo, la campana consulta cada 60 s).
- Los avisos leídos se borran solos a los 30 días y los caducados en cuanto pasa su fecha. Al eliminar la cuenta se borran todos.

## Avisos que emite la app

| Tipo (clave estable) | Cuándo | A quién | Severidad |
|---|---|---|---|
| `import.finished` | Termina una [importación en segundo plano](importing-transactions.md) | Quien la lanzó | éxito (aviso si hubo filas que no se guardaron o no se importó nada) |
| `import.failed` | La importación falla o se interrumpe por un reinicio del servidor | Quien la lanzó | error |
| `settlement.payment_reported` | Alguien te marca un pago (`MarkAsPaid`) | La contraparte, si tiene cuenta | info |
| `settlement.payment_confirmed` | La contraparte confirma el pago | Quien lo marcó | éxito |
| `settlement.payment_discarded` | La contraparte lo descarta | Quien lo marcó | aviso |
| `transaction.shared` | Se guarda una transacción con un participante explícito **nuevo** | Ese participante (con su parte en %) | info |
| `wallet.shared` | Se guarda una billetera con un participante explícito **nuevo** | Ese participante (con su permiso) | info |

Los textos se redactan en `EcoTrack.Application` (`SettlementNotificationService`, `SharingNotificationService`,
`ProcessImportJobHandler`); el paquete solo transporta mensajes ya escritos.

## Reglas
- **Nunca rompen la operación de negocio.** Un fallo al notificar se registra y se ignora: el saldado, el guardado o la
  importación ya están hechos.
- **Sin ruido.** No avisan las importaciones masivas (`HandleNewBatchAsync` nunca notifica a participantes), las plantillas
  programadas (`SaveTransactionCommand.NotifyParticipants = false`), el reparto residual automático a cotitulares ni a quien ya
  participaba al editar. Nadie recibe avisos de sus propias acciones.
- **`PendingSettlementNotice` sigue siendo el estado accionable** del saldado (el banner de confirmar/descartar en Transacciones):
  crea la transacción espejo al confirmar y se borra al resolverse. La notificación es solo el aviso; conviven a propósito.
- **Preferencias:** el almacén ya soporta usuario × tipo × canal (todo activado por defecto), pero **aún no hay pantalla** para
  cambiarlas: con un solo canal (in-app) no aporta valor hasta que exista otro.
- **Seguridad:** título y cuerpo se pintan con `textContent`; los enlaces solo pueden ser rutas internas o http(s).

## Cómo se emite un aviso nuevo
1. Elegir una **clave de tipo** estable (`dominio.evento`) y dónde vive el texto (un servicio en `EcoTrack.Application`).
2. Inyectar `INotificationDispatcher` y llamar a `NotifyAsync(userId, new NotificationMessage(...))` dentro de un `try/catch` que
   registre y no propague. Usar `DedupKey` si el aviso puede repetirse mientras no se lea.
3. Si la página debe reaccionar (p. ej. refrescar una grilla), escuchar el evento `uinotification` en `document`.
4. Documentar el tipo en la tabla de arriba.

## Datos
Migración `AddNotifications`: tablas `Notifications` y `NotificationPreferences` (sin clave foránea a `AspNetUsers`: el paquete no conoce el modelo de
identidad, así que `DeactivateUserAccountsHandler` las limpia al eliminar la cuenta). `ImportJob` (migración `AddImportJobs`) guarda el estado de las importaciones.

## Pendiente
- Pantalla de **preferencias** por tipo y canal (y canales externos: Telegram, push/Firebase, email).
- Avisar también al **compartir una cuenta** (Account); hoy solo transacción y billetera.
- Agrupar avisos repetidos y resumen por email.
- Si se despliega en varias instancias, un backplane (Redis) para SignalR.
- El JS de la campana vive en `_content/UiMetadata.Notifications/`: si el workflow de ofuscación de JS solo cubre `wwwroot/js`, este no se ofusca.
